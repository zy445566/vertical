const Client = require('../lib/Client');
const Common = require('../lib/Common');
const test = require('ava');

let client = new Client();

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
    await client.connection('127.0.0.1', 5234);
});

test('#ping',t => {
	return client.ping().then((res)=>{
        t.is(true,res);
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

test.after.cb('#disConnection',t => {
        client.disConnection();
        t.end();
});