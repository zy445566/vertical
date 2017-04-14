const config = require('../config');
const Common = require('./Common');

class Method
{
    constructor(db)
    {
        this.db = db;
        this.syncData = [];
    }

    getRow(row_key,column_key,timestamp)
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.getDataKey(row_key,column_key,timestamp);
            this.db.get(dataKey,(err, value)=>{
                if(err)reject(err);
                reslove(value);
            })
        });
    }

    updateRow(row_key,column_key,row_value,timestamp)
    {
        return this.putRow(row_key,column_key,row_value,timestamp);
    }

    insertRow(row_key,column_key,row_value,timestamp=null)
    {
        if (timestamp==null)
        {
            timestamp = Common.genTimestamp();
        }
        return this.putRow(row_key,column_key,row_value,timestamp);
    }

    putRow(row_key,column_key,row_value,timestamp)
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.genDataKey(row_key,column_key,timestamp);
            this.syncData.push({type:'put',key:dataKey,value:row_value});
            this.db.put(dataKey,row_value,(err)=>{
                if(err)reject(err);
                reslove(timestamp);
            });
        });
    }

    delRow(row_key,column_key,timestamp)
    {
        return new Promise((reslove,reject)=>{
            let dataKey = Common.getDataKey(row_key,column_key,timestamp);
            this.syncData.push({type:'del',key:dataKey});
            this.db.del(dataKey,(err)=>{
                if(err)reject(err);
                reslove(true);
            });
        });
    }

    getColumn(row_key,column_key,limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let rowList =[];
            let start = Common.getDataKey(row_key,column_key);
            db.createReadStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache})
            .on('data', function (data) {
                let row = {};
                row[data.key] = data.value;
                rowList.push(row);
            })
            .on('error', function (err) {
                reject(err);
            })
            .on('end', function () {
                reslove(rowList);
            });
            // .on('close', function () {
            //     console.log('Stream closed')
            // })
        });
    }

    delColumn(row_key,column_key,limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let start = Common.getDataKey(row_key,column_key);
            let batch = this.db.batch();
            let delCount = 0;
            db.createKeyStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache})
            .on('data', function (dataKey) {
                batch.del(dataKey);
                this.syncData.push({type:'del',key:dataKey});
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

    updateColum(row_key,column_key,row_value,limit=1,reverse=false,fillCache=false)
    {
        return new Promise((reslove,reject)=>{
            let start = Common.getDataKey(row_key,column_key);
            let batch = this.db.batch();
            let updateCount = 0;
            db.createKeyStream({start:start,limit:limit,reverse:reverse,fillCache:fillCache})
            .on('data', function (dataKey) {
                this.syncData.push({type:'put',key:dataKey,value:row_value});
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

    insertColum(row_key,column_key,row_value_list)
    {
        return new Promise((reslove,reject)=>{
            let batch = this.db.batch();
            let insertCount = 0;
            for(let row_value of row_value_list)
            {
                let dataKey = Common.genDataKey(row_key,column_key,timestamp);
                this.syncData.push({type:'put',key:dataKey,value:row_value});
                batch.put(dataKey,row_value);
                insertCount++;
            }
            batch.write(()=> {
                reslove(insertCount);
            });
        }); 
    }

    addSyncData()
    {
        return new Promise((reslove,reject)=>{
            let syncKey = Common.genSyncKey();
            this.db.put(syncKey,this.syncData,{valueEncoding:'json'},(err)=>{
                if(err)reject(err);
                reslove(syncKey);
                this.syncData = [];
            });
        }); 
    }
}

module.exports = Method;