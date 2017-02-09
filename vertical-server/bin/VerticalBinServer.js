const path = require('path');
const net = require('net');
// var VerticalServer = require('../lib/VerticalServer');
var VerticalBinServerSocket = require('./VerticalBinServerSocket');
const CommonBin = require('./CommonBin');

class VerticalBinServer
{
	constructor()
	{
		this.server = net.createServer();
		this.sockPath = CommonBin.getSocketPath();
		// this.verticalServer = new VerticalServer();
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
				resolve(this.server.address());
			});
		});
	}

	stop()
	{
		return new Promise((resolve,reject)=>{
			this.server.close(()=>{
				resolve(true);
			});
		});
	}

	restart()
	{
		return new Promise((resolve,reject)=>{
			this.server.close(()=>{
				// this.startEvent();
				this.server.listen(this.sockPath,()=>{
					resolve(this.server.address());
				});
			});
		});
	}

	sync(host,db)
	{
		
	}
}

var verticalBinServer = new VerticalBinServer();

verticalBinServer
.start()
.then((res)=>{
	console.log(res);
	// verticalBinServer.stop();
})
.catch((err)=>{
	throw err;
});


