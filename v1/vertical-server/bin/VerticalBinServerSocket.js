class VerticalBinServerSocket
{
	constructor(vbs,socket)
	{
		this.vbs = vbs;
		this.socket = socket;
	}

	getServerSocket()
	{
		return this.socket;
	}

	startServerSocket()
	{
		this.socket.on('data',(buffer)=>{
			this.runServerSocket(buffer);
		});
		this.socket.on('error',(error)=>{
			console.log(error);
		});
		this.socket.on('close',(had_error)=>{
			console.log('close:'+had_error);
		});
	}

	runServerSocket(buffer)
	{
		var jsonStr = buffer.toString();
		var json = JSON.parse(jsonStr);
		this.vbs[json.instruct](...json.param)
		.then((res)=>{
			var endList = {
				'start':1,
				'stop':1,
				'restart':1,
			};
			if (endList[json.instruct]!=1)
			{
				this.writeData(json.operid,0,res);
			}
		})
		.catch((err)=>{
			this.writeData(json.operid,1,err.stack);
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