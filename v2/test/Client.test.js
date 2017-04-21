const Client = require('../lib/Client');
const Common = require('../lib/Common');
const test = require('ava');

let client = new Client();
let timestamp = Common.genTimestamp();

test.before('#connection',async t => {
    await client.connection('127.0.0.1', 5234);
});

test('#ping',t => {
	return client.ping().then((res)=>{
        t.is(true,res);
    });
});

test('#insertRow',t => {
	return client.insertRow('888','user',{name:'zs',age:20},timestamp,'tmp').then((res)=>{
        t.pass();
    });
});

// test('#updateRow',t => {
// 	return client.updateRow('888','user',{name:'zs',age:21},timestamp,'tmp').then((res)=>{
//         t.pass();
//     });
// });

// test('#getRow',t => {
// 	return client.getRow('888','user',timestamp,'tmp').then((res)=>{
//         t.deepEqual({name:'zs',age:21},res);
//     });
// });

test.after.cb('#disConnection',t => {
        client.disConnection();
        t.end();
});