var net = require('net');
var crypto = require('crypto');

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
		// this.socket.on('timeout',()=>{
		// 	this.socket.end();
		// 	console.log('timeoutEvent');
		// });
		// this.socket.on('close',(had_error)=>{
		// 	console.log('close:'+had_error);
		// });
		
		this.socket.on('error',(error)=>{
			console.log(error);
		});
		return new Promise((resolve,reject)=>{
			this.socket.connect(this.config.port, this.config.host, 
			()=>{
				resolve(this.socket.address());
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



	writeData(method,params,db=null,listener=null,stream=null)
	{
		var nowtime = Date.now();
		var pass = this.getPass(nowtime);
		var nano = process.hrtime();
		var operid = method+nano[0]+nano[1];
		if (listener==null)
		{
			return new Promise((resolve,reject)=>{
				this.socket.write(JSON.stringify({
				nowtime:nowtime,
				pass:pass,
				operid:operid,
				method:method,
				params:params,
				db:db,
				stream:stream,
				islistener:false,
				})+',');
				this.recData(operid,resolve,reject);
			});
		} else {
			this.socket.write(JSON.stringify({
				nowtime:nowtime,
				pass:pass,
				operid:operid,
				method:method,
				params:params,
				db:db,
				stream:stream,
				islistener:true,
			})+',');
			this.recData(operid,listener,listener);
		}
		
	}


	recData(operid,succ,fail)
	{
		var listener = (buffer)=>
		{
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
					if (!recData.islistener)
					{
						this.socket.removeListener('data', listener);
					}
				}
			}
		};
		this.socket.on('data',listener);
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