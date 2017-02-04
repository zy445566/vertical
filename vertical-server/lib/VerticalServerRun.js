var crypto = require('crypto');
var VerticalServerLevel = require('./VerticalServerLevel');
class VerticalServerRun
{
	constructor(socket,config)
	{
		this.socket = socket;
		this.vsl = new VerticalServerLevel();
		this.dbList = config.dbList;
		this.eventList = config.eventList;
		this.streamList = config.streamList;
	}

	runServerLevel(operData)
	{
		switch (operData.method) {
			case 'level':
				var md5 = crypto.createHash('md5');
				var db = md5.update(JSON.stringify(operData.params)).digest('hex');
				if (this.dbList.hasOwnProperty(db))
				{
					this.socket.writeData(operData.operid,0,[db]);
					return;
				}
				var runFunc = this.genFunc(this.vsl,operData);
				if(runFunc == '[runFunc Error]'){return;}
				return  runFunc.then((res)=>{
					this.dbList[db] = res;
					this.socket.writeData(operData.operid,0,[db]);
				});
			break;
			case 'destroy':
				var runFunc = this.genFunc(this.vsl,operData);
				if(runFunc == '[runFunc Error]'){return;}
				return  runFunc.then((res)=>{
					var md5 = crypto.createHash('md5');
					db = md5.update(JSON.stringify(operData.params)).digest('hex');
					if (this.dbList.hasOwnProperty(db))
					{
						delete this.dbList[db];
					}
					this.socket.writeData(operData.operid,0,[res]);
				});
			break;
			default:
				var runFunc = this.genFunc(this.vsl,operData);
				if(runFunc == '[runFunc Error]'){return;}
				return  runFunc.then((res)=>{
					this.socket.writeData(operData.operid,0,[res]);
				});
			break;
		}
	}

	runServerDB(operData)
	{
		switch (operData.method) {
			case 'isOpen':
			case 'isClosed':
			case 'getProperty':
				var runFunc = this.genFunc(this.dbList[operData.db],operData);
				if(runFunc == '[runFunc Error]'){return;}
				this.socket.writeData(operData.operid,0,[runFunc]);
				return;
			break;
			case 'on':
				var runEmit = this.genEmit(this.dbList[operData.db],operData);
				if(runEmit == '[runEmit Error]'){return;}
				break;
			default:
				var runFunc = this.genFunc(this.dbList[operData.db],operData);
				if(runFunc == '[runFunc Error]'){return;}
				return runFunc.then((res)=>{
					this.socket.writeData(operData.operid,0,[res]);
				});
			break;
		}	
	}

	runServerStream(operData)
	{
		if (!this.streamList.hasOwnProperty(operData.stream.streamId))
		{
			this.streamList[operData.stream.streamId] = this.genFunc(this.dbList[operData.db],operData.stream);
		}
		var stream = this.streamList[operData.stream.streamId];
		switch (operData.method) {
			case 'destroy':
				var runFunc = this.genFunc(stream,operData);
				if(runFunc == '[runFunc Error]'){return;}
				delete this.streamList[operData.stream.streamId];
				this.socket.writeData(operData.operid,0,[runFunc]);
				return;
			break;
			case 'on':
				var runEmit = this.genEmit(stream,operData);
				if(runEmit == '[runEmit Error]'){return;}
				break;
			default:
				var runFunc = this.genFunc(stream,operData);
				if(runFunc == '[runFunc Error]'){return;}
				this.socket.writeData(operData.operid,0,[runFunc]);
				return;
			break;
		}
	}



	genEmit(obj,operData)
	{
		this.eventList[operData.operid] ={
			db:obj,
			event:operData.params,
			listener:(...res)=>{
				this.socket.writeData(operData.operid,0,res,true);
			}
		};
		try{
			obj[operData.method](this.eventList[operData.operid]['event'],this.eventList[operData.operid]['listener']);
		} catch (err){
			this.socket.writeData(operData.operid,1,[err.stack]);
			return '[runEmit Error]';
		}
	}

	genFunc(obj,operData)
	{
		try{
			var runFunc = obj[operData.method](...operData.params);
		} catch (err){
			this.socket.writeData(operData.operid,1,[err.stack]);
			return '[runFunc Error]';
		}
		return runFunc;
	}

	catchError(myPromise,operData)
	{
		myPromise.catch((err)=>{
			this.socket.writeData(operData.operid,1,[err.stack]);
		});
	}

	run(operData)
	{
		if (operData.db==null)
		{
			var myPromise = this.runServerLevel(operData);
		} else {
			if (operData.stream ==null)
			{
				var myPromise = this.runServerDB(operData);
			} else {
				var myPromise = this.runServerStream(operData);
			}
			
		}
		if (Object.prototype.toString.call(myPromise)=='[object Promise]')
		{
			this.catchError(myPromise,operData);
		}
	}


}
module.exports = VerticalServerRun;