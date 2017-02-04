class VerticalBinServerSocket
{
	constructor(socket)
	{
		this.socket = socket;
	}

	getServerSocket()
	{
		return this.socket;
	}

	startServerSocket()
	{
		this.socket.on('data',(buffer)=>{
			
		});
		this.socket.on('error',(error)=>{
			console.log(error);
		});
		this.socket.on('close',(had_error)=>{
			console.log('close:'+had_error);
		});

	}

	writeData(operid,err,res)
	{
		var resData = {};
		resData.operid = operid;
		resData.err = err;
		resData.res = res;
		this.socket.write(JSON.stringify(resData));
	}

	stopServerSocket(force=false)
	{
		if (force)
		{
			this.socket.destroy();
		} else {
			this.socket.end();
		}
		
	}
}
module.exports = VerticalBinServerSocket;