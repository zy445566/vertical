const Vertical = require('../index');
const Client = Vertical.Client;
const Common = Vertical.Common;
const test = require('ava');
const jwt = require('jsonwebtoken');

let client = new Client('127.0.0.1', 5234);

let table ='test';

function getList4GetColumn(res)
{
    let valueList =[];
    for(let index in res)
    {
        valueList.push(res[index]);
    }
    return valueList;
}

test.before('#connection',async t => {
    await client.connection();
});

test('#ping',t => {
    let startTime = new Date().getTime();
	return client.ping().then((res)=>{
        t.is(true,res);
        let endTime = new Date().getTime();
        // console.log('PingTime:'+(endTime-startTime));
        // console.log('NetSpeed:'+(64/(endTime-startTime))+'b/ms');
    });
});

var readKey = '';
var writeKey = '';
test('#getToken',t => {
	return client.getToken(readKey,false).then((res)=>{
        t.plan(2);
        if (readKey == ''){readKey = 'noKey';}
        // console.log(jwt.verify(res, readKey).is_write);
        t.is(false,jwt.verify(res, readKey).is_write);
        return client.getToken(writeKey,true);
    }).then((res)=>{
        t.plan(2);
        if (writeKey == ''){writeKey = 'noKey';}
        // console.log(jwt.verify(res, writeKey).is_write);
        t.is(true,jwt.verify(res, writeKey).is_write);
    });
});

test('#getRow',t => {
    let timestamp = Common.genTimestamp();
	return client.insertRow('111','user',{name:'zs',age:20},timestamp,table).then((res)=>{
        return client.getRow('111','user',res,table);
    }).then((res)=>{
        t.deepEqual({name:'zs',age:20},res);
    }).then((res)=>{
        return client.delRow('111','user',timestamp,table);
    });
});

test('#insertRow',t => {
    let timestamp = null;
	return client.insertRow('111','user',{name:'zs',age:20},timestamp,table).then((res)=>{
        timestamp = res;
        return client.getRow('111','user',res,table);
    }).then((res)=>{
        t.deepEqual({name:'zs',age:20},res);
    }).then((res)=>{
        return client.delRow('111','user',timestamp,table);
    });
});

test('#updateRow',t => {
    let timestamp = Common.genTimestamp();
    return client.insertRow('111','user',{name:'zs',age:20},timestamp,table)
    .then((res)=>{
        return client.updateRow('111','user',{name:'zs',age:21},timestamp,table)
    })
	.then((res)=>{
        return client.getRow('111','user',timestamp,table);
    }).then((res)=>{
        t.deepEqual({name:'zs',age:21},res);
    }).then((res)=>{
        return client.delRow('111','user',timestamp,table);
    });
});

test('#delRow',t => {
    let timestamp = Common.genTimestamp();
    return client.insertRow('111','user',{name:'zs',age:20},null,table)
    .then((res)=>{
        return client.delRow('111','user',timestamp,table);
    }).then((res)=>{
        return client.getRow('111','user',timestamp,table);
    }).then((res)=>{
        t.deepEqual({},res);
    });
});

test('#getColumn',t => {
	return client.insertColum('222','user',[{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],table)
    .then((res)=>{
        return client.getColumn('222','user',table,-1,false,false);
    }).then((res)=>{
        t.deepEqual([{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],getList4GetColumn(res));
    }).then((res)=>{
        return client.delColumn('222','user',table,-1,false,false);
    });
});

test('#delColumn',t => {
    return client.insertColum('333','user',[{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],table)
    .then((res)=>{
        return client.delColumn('333','user',table,-1,false,false);
    }).then((res)=>{
        return client.getColumn('333','user',table,-1,false,false);
    }).then((res)=>{
        t.deepEqual({},res);
    });
});

test('#updateColum',t => {
    return client.insertColum('444','user',[{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],table)
    .then((res)=>{
        return client.updateColum('444','user',{name:'zs',age:22},table,-1,false,false)
    }).then((res)=>{
        return client.getColumn('444','user',table,-1,false,false);
    })
	.then((res)=>{
        t.deepEqual([{name:'zs',age:22},{name:'zs',age:22},{name:'zs',age:22},],getList4GetColumn(res));
    }).then((res)=>{
        return client.delColumn('444','user',table,-1,false,false);
    });
});


test('#insertColum',t => {
	return client.insertColum('555','user',[{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],table)
    .then((res)=>{
        return client.getColumn('555','user',table,-1,false,false);
    }).then((res)=>{
        t.deepEqual([{name:'zs',age:23},{name:'ls',age:22},{name:'ww',age:21}],getList4GetColumn(res));
    }).then((res)=>{
        return client.delColumn('555','user',table,-1,false,false);
    });
});

test('#isSync',t => {
    let timestamp = Common.genTimestamp();
	return client.isSync('test',timestamp)
    .then((res)=>{
        t.is('0',res);
    });
});

test('#writeSyncData',t => {
	return client.writeSyncData(JSON.stringify({
        table:table,
        syncTime:"3001",
        serverSign:"test2",
        data:[{type:"put",key:Common.getDataKey('666','user','8888'),value:'{"name":"ww","age":21}'}]
    })).then((res)=>{
        return client.isSync('test2',"9999")
    }).then((res)=>{
        t.plan(2);
        t.is('3001',res);
        return client.getRow('666','user','8888',table);
    }).then((res)=>{
        t.plan(2);
        t.deepEqual({"name":"ww","age":21},res);
    });
});

test.after.cb('#disConnection',t => {
        client.disConnection();
        t.end();
});