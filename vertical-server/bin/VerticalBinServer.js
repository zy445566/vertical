const path = require('path');
var net = require('net');
// var VerticalServer = require('../lib/VerticalServer');
var VerticalBinServerSocket = require('./VerticalBinServerSocket');

class VerticalBinServer
{
	constructor()
	{
		this.server = null;
		this.sockPath = './vertical.sock';
		// this.verticalServer = new VerticalServer();
	}

	startServer()
	{
		this.server = net.createServer();
		this.server.on('connection',(socket)=>{
			var vbss = new VerticalBinServerSocket(socket);
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

		return new Promise((resolve,reject)=>{
			this.server.listen(this.sockPath,()=>{
				resolve(this.server.address());
			});
		});
	}

	stopServer()
	{
		return new Promise((resolve,reject)=>{
			this.server.close((res)=>{
				resolve(res);
			});
		});
	}
}

var verticalBinServer = new VerticalBinServer();

verticalBinServer
.startServer()
.then((res)=>{
	console.log(res);
	// verticalBinServer.stopServer();
})
.catch((err)=>{
	console.log(err);
});


