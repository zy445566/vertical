const net = require('net');
const CommonBin = require('./CommonBin');
var VerticalServer = require('../lib/VerticalServer');
var VerticalBinServerSocket = require('./VerticalBinServerSocket');
var verticalConfig = require('../conf/verticalConfig');

class VerticalBinServer
{
	constructor(config)
	{
		this.server = net.createServer();
		this.sockPath = CommonBin.getSocketPath();
		this.config = config;
		this.verticalServer = new VerticalServer(config);
	}

	startEvent()
	{
		this.server.on('connection',(socket)=>{
			var vbss = new VerticalBinServerSocket(this,socket);
			vbss.startServerSocket();
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
	}

	start()
	{
		return new Promise((resolve,reject)=>{
			this.startEvent();
			this.server.listen(this.sockPath,()=>{
				this.verticalServer.startServer()
				.then((res)=>{
					resolve('local:'+this.server.address()+'  server:'+res);
				})
				.catch((err)=>{
					reject(err);
				});
			});
		});
	}

	stop()
	{
		return new Promise((resolve,reject)=>{
			this.server.close(()=>{
				this.verticalServer
				.stopServer()
				.then((res)=>{
					resolve(res);
				})
				.catch((err)=>{
					reject(err);
				});
			});
		});
	}

	restart()
	{
		return new Promise((resolve,reject)=>{
			this.stop()
			.then((res)=>{
				return this.start();
			})
			.then((res)=>{
				resolve(res);
			})
			.catch((err)=>{
				reject(err);
			});
		});
	}

	ping()
	{
		return new Promise((resolve,reject)=>{
			resolve(true);
		});
	}

	sync(host,db)
	{
		return this.verticalServer.syncServer(host,db);
	}
}


var verticalBinServer = new VerticalBinServer(verticalConfig);

verticalBinServer
.start()
.then((res)=>{
	console.log(res);
	// verticalBinServer.stop();
})
.catch((err)=>{
	throw err;
});


