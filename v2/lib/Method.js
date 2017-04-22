const level = require("level");
const path = require("path");
const config = require("../config");
const Common = require('./Common');
const VerticalTypes = require('../thrift/gen-nodejs/Vertical_types');

var db = {};
var syncData = {};
var serverSign = null;

class Method
{
    static useTable (table='tmp')
    {
        if (db.hasOwnProperty(table))
        {
            return db[table];
        }
        syncData[table] = [];
        db[table] = level(path.join(config.dataDir,table));
        return db[table];
    }

    static getRow(row_key,column_key,timestamp,table='tmp')
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.getDataKey(row_key,column_key,timestamp);
            let db = Method.useTable(table);
            db.get(dataKey,(err, value)=>{
                if(err)reslove('{}');
                reslove(value);
            })
        });
    }


    static updateRow(row_key,column_key,row_value,timestamp,table='tmp')
    {
        return this.putRow(row_key,column_key,row_value,timestamp,table);
    }

    static insertRow(row_key,column_key,row_value,timestamp=null,table='tmp')
    {
        if (timestamp==null)
        {
            timestamp = Common.genTimestamp();
        }
        return this.putRow(row_key,column_key,row_value,timestamp,table);
    }

    static putRow(row_key,column_key,row_value,timestamp,table)
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.genDataKey(row_key,column_key,timestamp);
            let db = Method.useTable(table);
            syncData[table].push({type:'put',key:dataKey,value:row_value});
            db.put(dataKey,row_value,(err)=>{
                if(err)reject(err);
                reslove(timestamp);
            });
        });
    }

    static delRow(row_key,column_key,timestamp,table='tmp')
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.getDataKey(row_key,column_key,timestamp);
            let db = Method.useTable(table);
            syncData[table].push({type:'del',key:dataKey});
            db.del(dataKey,(err)=>{
                if(err)reject(err);
                reslove(true);
            });
        });
    }

    static getColumn(row_key,column_key,table='tmp',limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let rowList =[];
            let start = Common.getDataKey(row_key,column_key);
            let db = Method.useTable(table);
            db.createReadStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache,valueEncoding:'json'})
            .on('data', function (data) {
                let row = {};
                row[data.key] = data.value;
                rowList.push(row);
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

    static delColumn(row_key,column_key,table='tmp',limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let start = Common.getDataKey(row_key,column_key);
            let batch = this.db.batch();
            let delCount = 0;
            let db = Method.useTable(table);
            db.createKeyStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache})
            .on('data', function (dataKey) {
                batch.del(dataKey);
                syncData[table].push({type:'del',key:dataKey});
                delCount++;
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function () {
                batch.write(()=> {
                    reslove(delCount);
                })
                
            });
        });
    }

    static updateColum(row_key,column_key,row_value,limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let start = Common.getDataKey(row_key,column_key);
            let batch = this.db.batch();
            let updateCount = 0;
            let db = Method.useTable(table);
            db.createKeyStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache})
            .on('data', function (dataKey) {
                syncData[table].push({type:'put',key:dataKey,value:row_value});
                batch.put(dataKey,row_value);
                updateCount++;
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function () {
                batch.write(()=> {
                    reslove(updateCount);
                })
                
            });
        });
    }

    static insertColum(row_key,column_key,row_value_list,table='tmp')
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(table);
            let batch = db.batch();
            let insertCount = 0;
            for(let row_value of row_value_list)
            {
                let dataKey = Common.genDataKey(row_key,column_key,timestamp);
                syncData[table].push({type:'put',key:dataKey,value:row_value});
                batch.put(dataKey,row_value);
                insertCount++;
            }
            batch.write(()=> {
                reslove(insertCount);
            });
        }); 
    }

    static InitServer()
    {
        //生成服务器唯一标识
        let db = Method.useTable(config.sysTable);
        let serverSignKey = Common.getServerSignKey();
        db.get(serverSignKey,(err, value)=>{
            if (err)
            {
                serverSign = Common.genServerSign();
                db.put(serverSignKey,serverSign);
            } else {
                serverSign = value;
            }
            console.log(serverSign);
        });
    }

    static addSyncData()
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(config.sysTable);
            for (let table in syncData)
            {
                if (syncData[table].length>0)
                {
                    let syncKey = Common.genSyncKey();
                    let syncTime = Common.genTimestamp();
                    let syncIP = Common.getHostIP();
                    db.put(syncKey,
                    {
                        table:table,
                        syncTime:syncTime,
                        syncIP:syncIP,
                        data:syncData[table]
                    },
                    {valueEncoding:'json'},
                    (err)=>{
                        if(err)reject(err);
                        syncData[table] = [];
                    });
                }  
            }
            let syncSelfTime = Common.genTimestamp();
            db.put(Common.getSyncSelfTime(),syncSelfTime,(err)=>{
                if(err)reject(err);
                reslove(syncSelfTime);
            });
        }); 
    }

    static getSyncSelfTime()
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(config.sysTable);
            db.get(Common.getSyncSelfTime(),(err, value)=>{
                if(err)reslove(0);
                reslove(value)
            });
        });
    }

    static isSync(serverSign,timestamp)
    {
        Method.getSyncTime(serverSign);
    }

    static getSyncTime(serverSign)
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(config.sysTable);
            let syncTimeKey = Common.getSyncTimeKey(serverSign);
            db.get(syncTimeKey,(err, value)=>{
                if(err)reslove(0);
                reslove(value)
            });
        });
    }

    static readSyncData(syncTime)
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(config.sysTable);
            let syncKey = Common.genSyncKey(syncTime);
            db.createReadStream({start:syncKey,reverse:false,fillCache:false})
            .on('data', function (data) {
                //同步数据到丛库
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function () {
                reslove(true);
            });
        });
    }

    static writeSyncData(syncWriteData)
    {
        return new Promise((reslove,reject)=>{
            let db = Method.useTable(syncWriteData.table);
            let syncTimeKey = Common.getSyncTimeKey(syncWriteData.syncIP);
            syncWriteData.data.push({type: 'put', key: syncTimeKey, value: syncWriteData.syncTime});
            db.batch(syncWriteData.data, function (err) {
                if(err)reject(err);
                reslove(syncWriteData.data.length);
            });
        }); 
    }

    static getResult(result,promiseFunc=null)
    {
        if (promiseFunc==null)
        {
            result(null);
        } else {
            promiseFunc
            .then((res)=>{
                result(null,res);
            }).catch((err)=>{
                result(new VerticalTypes.VerticalError({message:err.stack}));
            });
        }
    }
}

module.exports = Method;