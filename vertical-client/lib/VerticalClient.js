var net = require('net');
var VerticalClientSocket = require('./VerticalClientSocket');
var VerticalClientDB = require('./VerticalClientDB');
class VerticalClient
{
	constructor(config)
	{
		this.config = config;
		this.client = null;
		this.socket = new VerticalClientSocket(config);
		this.dbList = {};
	}

	startVerticalClient()
	{
		return this.socket.startVerticalClientSocket();
	}

	stopVerticalClient(force=false)
	{
		return this.socket.stopServerSocket(force);
	}

	level(location)
	{

		return new Promise((resolve,reject)=>{
			this.socket.writeData('level',[location])
			.then((res)=>{
				resolve(new VerticalClientDB(this.socket,res));
			})
			.catch((err)=>{
				reject(err);
			});
		});

		
	}

	destroy(location)
	{
		return this.socket.writeData('destroy',[location]);
	}

	repair(location)
	{
		return this.socket.writeData('repair',[location]);
	}
}


var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	vcdb.createReadStream({'start':'a', 'end':'b'})
	.on('data', function (data) {
    console.log(data.key, '=', data.value)
  	});
})
.then((res)=>{
	// return vcdb.get('a');
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});