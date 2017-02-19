var VerticalServerRun = require('./VerticalServerRun');
var VerticalServerSync = require('./VerticalServerSync');
class VerticalServerSocket
{
	constructor(socket,config)
	{
		this.socket = socket;
		this.socket.setTimeout(config.timeout);
		this.config = config;
		this.eventList = {};
		this.streamList = {};
		this.syncData  = {};
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
			var streamId;
			for (streamId in this.streamList)
			{
				this.streamList[streamId].destroy();
				console.log('streamId:'+streamId);
				delete this.streamList[streamId];
			}
			for (var syncDataIndex in this.syncData)
			{
				var vsSync = new VerticalServerSync(this.syncData[syncDataIndex],this.config);
				vsSync.syncAll();
			}
			console.log('close:'+had_error);
		});

	}

	writeData(operid,err,res,islistener=false)
	{
		var resData = {};
		resData.operid = operid;
		resData.err = err;
		resData.res = res;
		resData.islistener = islistener;
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