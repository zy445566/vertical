var net = require('net');
var crypto = require('crypto');
class VerticalServerSync
{
	constructor(syncData,config)
	{
		//Note : syncData must be Memory address
		this.syncData = syncData;
		this.config = config;
	}

	getConnect()
	{
		var socket = new net.Socket();
		socket.on('error',(error)=>{
			console.log(error);
		});
		return new Promise((resolve,reject)=>{
			socket.connect(this.config.port,this.config.host,()=>{
				resolve(socket);
			});
		});
	}

	getPass(nowtime)
	{
		if (!this.config.hasOwnProperty("auth"))
		{
			this.config.auth = '';
		}
		var md5 = crypto.createHash('md5');
		md5.update(this.config.auth+nowtime);
	    return md5.digest('hex');
	}

	sendSync()
	{
		var nowtime = Date.now();
		var pass = this.getPass(nowtime);
		var nano = process.hrtime();
		var operid = method+nano[0]+nano[1];
		var sendData ={
			'openid':operid,
			'pass':pass,
			'method':'sync',
			'syncData':this.syncData,
		};
		this.socket.write(JSON.stringify(sendData);
	}

	sync(host)
	{
		this.getConnect()
		.then((connent)=>{
			this.sendSync();
		})
		.catch((err)=>{
			console.log(err);
		});
	}

	syncAll()
	{
		for (var host of this.serverList) {
			this.sync(host);
		};
	}
}
module.exports = VerticalServerSync;