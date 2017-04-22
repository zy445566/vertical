const Client = require('../lib/Client');
const Common = require('../lib/Common');
const test = require('ava');

let client = new Client();


test.before('#connection',async t => {
    await client.connection('127.0.0.1', 5234);
});

test('#ping',t => {
	return client.ping().then((res)=>{
        t.is(true,res);
    });
});

test('#insertRow',t => {
	return client.insertRow('888','user',{name:'zs',age:20},null,'tmp').then((res)=>{
        return client.getRow('888','user',res,'tmp');
    }).then((res)=>{
        t.deepEqual({name:'zs',age:20},res);
    });
});

test('#updateRow',t => {
    let timestamp = Common.genTimestamp();
	return client.updateRow('888','user',{name:'zs',age:21},timestamp,'tmp').then((res)=>{
        return client.getRow('888','user',timestamp,'tmp');
    }).then((res)=>{
        t.deepEqual({name:'zs',age:21},res);
    });
});

test('#delRow',t => {
    let timestamp = Common.genTimestamp();
	return client.delRow('888','user',timestamp,'tmp').then((res)=>{
        return client.getRow('888','user',timestamp,'tmp');
    }).then((res)=>{
        t.deepEqual({},res);
    });
});


test('#getColumn',t => {
	return client.getColumn('888','user','tmp',3).then((res)=>{
        t.pass();
    });
});

test.after.cb('#disConnection',t => {
        client.disConnection();
        t.end();
});