var net = require('net');
var path = require('path');
var crypto = require('crypto');
var VerticalServerSocket = require('./VerticalServerSocket');
var VerticalServerSync = require('./VerticalServerSync');
var VerticalServerLevel = require('./VerticalServerLevel');

class VerticalServer
{
	constructor(config)
	{
		// var config = {host:'127.0.0.1',port:5234,timeout:3000};
		this.config = config;
		this.server = null;
		this.dbList = {};
		this.config.dbList = this.dbList;
		this.config.vsl = new VerticalServerLevel();
	}

	getServer()
	{
		return this.server;
	}


	startServer()
	{
		this.server = net.createServer();
		this.server.on('connection',(socket)=>{
			var vss = new VerticalServerSocket(socket,this.config);
			vss.startServerSocket();
		});
		this.server.on('listening',()=>{
			console.log('listeningEvent');
		});
		this.server.on('error',(error)=>{
			console.log(error);
		});
		this.server.on('close',()=>{
			console.log('closeEvent');
		});

		return new Promise((resolve,reject)=>{
			var options = {
			host:this.config.host,
			port:this.config.port
			};
			this.server.listen(options,()=>{
				resolve(this.server.address());
			});
		});
	}

	syncServer(host,syncPath)
	{
		var md5 = crypto.createHash('md5');
		var dbPath = path.join(this.config.dataPath,syncPath);
		var db = md5.update(JSON.stringify(dbPath)).digest('hex');
		if (!this.config.dbList.hasOwnProperty(db))
		{
			var dbSyncFunc =  this.config.vsl.level(dbPath)
			.then((res)=>{
				this.config.dbList[db] = res;
			});
		} else {
			var dbSyncFunc = new Promise((resolve,reject)=>{
				resolve(true);
			})
			.then((res)=>{});
		}

		var syncData = {'path':dbPath,'data':[]};
		var syncDataNum = 0;

		return dbSyncFunc
		.then((res)=>{
			this.config.dbList[db].createReadStream()
				.on('data', function (data) {
					var onePut = { type: 'put', key: data.key, value: data.value };
				    syncData.data.push(onePut);
				    syncDataNum++;
				    if (syncDataNum>1000)
				    {
				    	console.log(syncData,host);
				    	var vsSync = new VerticalServerSync(syncData,this.config);
				    	vsSync.sync(host);
				    	syncData = {'path':dbPath,'data':[]};
				    	syncDataNum = 0;
				    }
				});
				return true;
		})
		.catch((err)=>{
			console.log(err);
		});

	}

	stopServer()
	{
		return new Promise((resolve,reject)=>{
			this.server.close(()=>{
				resolve(true);
			});
		});
	}

}

// const verticalConfig = require('../conf/verticalConfig');

// var vs = new VerticalServer(verticalConfig);
// vs.startServer().then((res)=>{
// 	console.log(res);
// 	// vs.stopServer();
// })
// .catch((error)=>{
// 	console.log(error);
// });

module.exports = VerticalServer;