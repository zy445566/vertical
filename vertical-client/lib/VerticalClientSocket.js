var net = require('net');
class VerticalClientSocket
{
	constructor(config)
	{
		this.config = config;
		this.socket = new net.Socket();
		this.socket.setTimeout(this.config.timeout);
	}

	startVerticalClientSocket()
	{
		this.socket.on('timeout',()=>{
			this.socket.end();
			console.log('timeoutEvent');
		});
		this.socket.on('error',(error)=>{
			console.log(error);
		});
		this.socket.on('close',(had_error)=>{
			console.log('close:'+had_error);
		});
		return new Promise((resolve,reject)=>{
			this.socket.connect(this.config.port, this.config.host, 
			()=>{
				resolve(this.socket.address());
			});
		});
	}

	writeData(method,params,db=null,listener=null)
	{
		var nano = process.hrtime();
		var operid = method+nano[0]+nano[1];
		if (listener==null)
		{
			return new Promise((resolve,reject)=>{
				this.socket.write(JSON.stringify({
				operid:operid,
				method:method,
				params:params,
				db:db,
				})+',');
				this.recData(operid,resolve,reject);
			});
		} else {
			this.socket.write(JSON.stringify({
				operid:operid,
				method:method,
				params:params,
				db:db,
			})+',');
			this.recData(operid,listener,listener);
		}
		
	}


	recData(operid,succ,fail)
	{
		this.socket.on('data',(buffer)=>{
			var buf = buffer.slice(0,buffer.length-1);
			var jsonStr = '['+buf.toString()+']';
			var jsonArr = JSON.parse(jsonStr);
			while (jsonArr.length)
			{
				var recData = jsonArr.shift();
				if (recData.operid==operid)
				{
					if (recData.err==0)
					{
						succ(...recData.res);
					} else {
						fail(...recData.res);
					}
					
				}
			}
		});		
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
module.exports = VerticalClientSocket;