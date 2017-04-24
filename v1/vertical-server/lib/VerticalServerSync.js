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

	getConnect(host)
	{
		var socket = new net.Socket();
		socket.on('error',(error)=>{
			console.log(error);
		});
		return new Promise((resolve,reject)=>{
			socket.connect(this.config.port,host,()=>{
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

	sendSync(socket)
	{
		var method = 'sync';
		var nowtime = Date.now();
		var pass = this.getPass(nowtime);
		var nano = process.hrtime();
		var operid = method+nano[0]+nano[1];
		var sendData ={
			'openid':operid,
			'nowtime':nowtime,
			'pass':pass,
			'method':method,
			'syncData':this.syncData,
		};
		socket.write(JSON.stringify(sendData)+',');
	}

	sync(host)
	{
		this.getConnect(host)
		.then((socket)=>{
			this.sendSync(socket);
		})
		.catch((err)=>{
			console.log(err);
		});
	}

	syncAll()
	{
		for (var hostIndex in this.config.serverList) {
			this.sync(this.config.serverList[hostIndex]);
		};
	}
}
module.exports = VerticalServerSync;