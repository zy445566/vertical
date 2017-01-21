var net = require('net');
var VerticalServerRun = require('./VerticalServerRun');
class VerticalServerSocket
{
	constructor(socket,config)
	{
		this.socket = socket;
		this.socket.setTimeout(config.timeout);
		this.eventList = {};
		config.eventList = this.eventList;
		this.vsr = new VerticalServerRun(this,config);
	}

	getServerSocket()
	{
		return this.socket;
	}

	startServerSocket()
	{
		this.socket.on('data',(buffer)=>{
			var buf = buffer.slice(0,buffer.length-1);
			var jsonStr = '['+buf.toString()+']';
			var jsonArr = JSON.parse(jsonStr);
			while (jsonArr.length)
			{
				var operData = jsonArr.shift();
				this.vsr.run(operData);
			}
		});
		this.socket.on('timeout',()=>{
			this.socket.end();
			console.log('timeoutEvent');
		});
		this.socket.on('error',(error)=>{
			console.log(error);
		});
		this.socket.on('close',(had_error)=>{
			var operId;
			for (operId in this.eventList)
			{
				var db = this.eventList[operId]['db'];
				db.removeListener(this.eventList[operId]['event'],this.eventList[operId]['listener']);
				console.log('event:'+this.eventList[operId]['event']+',removeListener:'+operId);
				delete this.eventList[operId];
			}
			console.log('close:'+had_error);
		});

	}

	writeData(operid,err,res)
	{
		var resData = {};
		resData.operid = operid;
		resData.err = err;
		resData.res = res;
		this.socket.write(JSON.stringify(resData)+',');
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
module.exports = VerticalServerSocket;