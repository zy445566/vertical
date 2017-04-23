const level = require("level");
const path = require("path");
const config = require("../config");
const Common = require('./Common');
const Client = require('./Client');
const VerticalTypes = require('../thrift/gen-nodejs/Vertical_types');

var db = {};
var syncData = {};
var serverSign = null;
var serverSyncSelfTime = null;
var ClientList = {};

class Method {
    static useTable(table = 'tmp') {
        if (db.hasOwnProperty(table)) {
            return db[table];
        }
        syncData[table] = [];
        db[table] = level(path.join(config.dataDir, table));
        return db[table];
    }

    static getServerSign() {
        return serverSign;
    }

    static getServerSyncSelfTime() {
        return serverSyncSelfTime;
    }

    static getRow(row_key, column_key, timestamp, table = 'tmp') {
        return new Promise((reslove, reject) => {
            let dataKey = Common.getDataKey(row_key, column_key, timestamp);
            let db = Method.useTable(table);
            db.get(dataKey, (err, value) => {
                if (err) reslove('{}');
                reslove(value);
            })
        });
    }


    static updateRow(row_key, column_key, row_value, timestamp, table = 'tmp') {
        return this.putRow(row_key, column_key, row_value, timestamp, table);
    }

    static insertRow(row_key, column_key, row_value, timestamp = null, table = 'tmp') {
        if (timestamp == null) {
            timestamp = Common.genTimestamp();
        }
        return this.putRow(row_key, column_key, row_value, timestamp, table);
    }

    static putRow(row_key, column_key, row_value, timestamp, table) {
        return new Promise((reslove, reject) => {
            let dataKey = Common.genDataKey(row_key, column_key, timestamp);
            let db = Method.useTable(table);
            syncData[table].push({ type: 'put', key: dataKey, value: row_value });
            db.put(dataKey, row_value, (err) => {
                if (err) reject(err);
                reslove(timestamp);
            });
        });
    }

    static delRow(row_key, column_key, timestamp, table = 'tmp') {
        return new Promise((reslove, reject) => {
            let dataKey = Common.getDataKey(row_key, column_key, timestamp);
            let db = Method.useTable(table);
            syncData[table].push({ type: 'del', key: dataKey });
            db.del(dataKey, (err) => {
                if (err) reject(err);
                reslove(true);
            });
        });
    }

    static getColumn(row_key, column_key, table = 'tmp', limit = 1, reverse = false, fillCache = false) {
        return new Promise((reslove, reject) => {
            let rowList = {};
            let start = Common.getDataKey(row_key, column_key);
            let end = Common.getDataKey(row_key, column_key, 'G');
            let db = Method.useTable(table);
            db.createReadStream({ start: start, end: end, limit: limit, reverse: reverse, fillCache: fillCache, valueEncoding: 'json' })
                .on('data', function (data) {
                    rowList[data.key] = data.value;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('end', function () {
                    reslove(JSON.stringify(rowList));
                });
            // .on('close', function () {
            //     console.log('Stream closed')
            // })
        });
    }

    static delColumn(row_key, column_key, table = 'tmp', limit = 1, reverse = false, fillCache = false) {
        return new Promise((reslove, reject) => {
            let start = Common.getDataKey(row_key, column_key);
            let end = Common.getDataKey(row_key, column_key, 'G');
            let delCount = 0;
            let db = Method.useTable(table);
            let batch = db.batch();
            db.createKeyStream({ start: start, end: end, limit: limit, reverse: reverse, fillCache: fillCache })
                .on('data', function (dataKey) {
                    batch.del(dataKey);
                    syncData[table].push({ type: 'del', key: dataKey });
                    delCount++;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('end', function () {
                    batch.write(() => {
                        reslove(delCount);
                    })

                });
        });
    }

    static updateColum(row_key, column_key, row_value, table = 'tmp', limit = 1, reverse = false, fillCache = false) {
        return new Promise((reslove, reject) => {
            let start = Common.getDataKey(row_key, column_key);
            let end = Common.getDataKey(row_key, column_key, 'G');
            let updateCount = 0;
            let db = Method.useTable(table);
            let batch = db.batch();
            db.createKeyStream({ start: start, end: end, limit: limit, reverse: reverse, fillCache: fillCache })
                .on('data', function (dataKey) {
                    syncData[table].push({ type: 'put', key: dataKey, value: row_value });
                    batch.put(dataKey, row_value);
                    updateCount++;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('end', function () {
                    batch.write(() => {
                        reslove(updateCount);
                    })

                });
        });
    }

    static insertColum(row_key, column_key, row_value_list_str, table = 'tmp') {
        let row_value_list = JSON.parse(row_value_list_str);
        return new Promise((reslove, reject) => {
            let db = Method.useTable(table);
            let batch = db.batch();
            let insertCount = 0;
            for (let row_value of row_value_list) {
                let dataKey = Common.genDataKey(row_key, column_key, Common.genTimestamp());
                syncData[table].push({ type: 'put', key: dataKey, value: row_value,valueEncoding:'json'});
                batch.put(dataKey, row_value,{valueEncoding:'json'});
                // console.log(dataKey, row_value);
                insertCount++;
            }
            batch.write(() => {
                reslove(insertCount);
            });
        });
    }

    static InitServer() {
        //生成服务器唯一标识
        let db = Method.useTable(config.sysTable);
        let serverSignKey = Common.getServerSignKey();
        db.get(serverSignKey, (err, value) => {
            if (err) {
                serverSign = Common.genServerSign();
                db.put(serverSignKey, serverSign);
            } else {
                serverSign = value;
            }
            console.log('server-Sign:' + serverSign);
        });
        Method.getSyncSelfTime().then((res) => {
            serverSyncSelfTime = res;
        });
        setInterval(Method.addSyncData, config.syncFrequence);
    }

    static addSyncData() {
        return new Promise((reslove, reject) => {
            let db = Method.useTable(config.sysTable);
            for (let table in syncData) {
                if (syncData[table].length > 0) {
                    let syncKey = Common.genSyncKey();
                    let syncTime = Common.genTimestamp();
                    db.put(syncKey,
                        {
                            table: table,
                            syncTime: syncTime,
                            serverSign: serverSign,
                            data: syncData[table]
                        },
                        { valueEncoding: 'json' },
                        (err) => {
                            if (err) reject(err);
                            syncData[table] = [];
                        });
                }
            }
            let syncSelfTime = Common.genTimestamp();
            db.put(Common.getSyncSelfTime(), syncSelfTime, (err) => {
                if (err) reject(err);
                serverSyncSelfTime = syncSelfTime;
                reslove(syncSelfTime);
            });
            Method.startSync();
        });
    }

    static getSyncSelfTime() {
        return new Promise((reslove, reject) => {
            let db = Method.useTable(config.sysTable);
            db.get(Common.getSyncSelfTime(), (err, value) => {
                if (err) reslove(0);
                reslove(value)
            });
        });
    }

    static isSync(serverSign, timestamp) {
        return Method.getSyncTime(serverSign)
            .then((res) => {
                if (res < timestamp) {
                    return res;
                } else {
                    return '-1';
                }
            })
    }

    static getSyncTime(serverSign) {
        return new Promise((reslove, reject) => {
            let db = Method.useTable(config.sysTable);
            let syncTimeKey = Common.getSyncTimeKey(serverSign);
            db.get(syncTimeKey, (err, value) => {
                if (err) reslove('0');
                reslove(value)
            });
        });
    }

    static readSyncData(syncTime, client) {
        return new Promise((reslove, reject) => {
            let db = Method.useTable(config.sysTable);
            let syncStartKey = Common.genSyncKey(syncTime);
            let syncEndKey = Common.genSyncKey('G');
            let dbRS = db.createReadStream({ start: syncStartKey, end: syncEndKey, reverse: false, fillCache: false });
            let syncCount = 0;
            dbRS.on('data', function (data) {
                //同步数据到丛库
                client.writeSyncData(data.value)
                    .then((res) => {
                        syncCount += res;
                        // console.log('syncCount:'+syncCount);
                    })
                    .catch((err) => {
                        console.log(err);
                        dbRS.destroy();
                    })
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('cloase', function () {
                    reslove(syncCount);
                });
        });
    }

    static writeSyncData(syncWriteDataStr) {
        let syncWriteData = JSON.parse(syncWriteDataStr);
        return new Promise((reslove, reject) => {
            let db = Method.useTable(syncWriteData.table);
            let sysdb = Method.useTable(config.sysTable);
            let syncTimeKey = Common.getSyncTimeKey(syncWriteData.serverSign)
            sysdb.put(syncTimeKey, syncWriteData.syncTime);
            db.batch(syncWriteData.data, function (err) {
                if (err) reject(err);
                reslove(syncWriteData.data.length);
            });
        });
    }

    static getClient(ip) {
        if (ClientList.hasOwnProperty(ip)) {
            return ClientList[ip];
        }
        ClientList[ip] = new Client(ip, config.serverPort);
        return ClientList[ip];
    }

    static startSync() {
        for (let server of config.servers) {
            let client = Method.getClient(server);
            client.connection()
                .then((res) => {
                    return client.isSync(Method.getServerSign(), Method.getServerSyncSelfTime());
                }).then((res) => {
                    if (res != '-1') {
                        return Method.readSyncData(res, client).then((res) => {
                                console.log('SyncCount:' + res);
                        });
                    }
                    return false;
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    static getResult(result, promiseFunc = null) {
        if (promiseFunc == null) {
            result(null);
        } else {
            promiseFunc
                .then((res) => {
                    result(null, res);
                }).catch((err) => {
                    result(new VerticalTypes.VerticalError({ message: err.stack }));
                });
        }
    }
}

module.exports = Method;