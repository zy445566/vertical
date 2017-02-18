var crypto = require('crypto');
class VerticalServerRun
{
	constructor(socket,config)
	{
		this.socket = socket;
		this.config = config;
		this.dbList = config.dbList;
		this.eventList = this.socket.eventList;
		this.streamList = this.socket.streamList;
		this.syncData = this.socket.syncData;
	}

	runServerLevel(operData)
	{
		switch (operData.method) {
			case 'level':
				var md5 = crypto.createHash('md5');
				var db = md5.update(JSON.stringify(operData.params[0])).digest('hex');
				if (this.dbList.hasOwnProperty(db))
				{
					this.socket.writeData(operData.operid,0,[db]);
					return;
				}
				var runFunc = this.genFunc(this.config.vsl,operData);
				if(runFunc == '[runFunc Error]'){return;}
				return  runFunc.then((res)=>{
					this.dbList[db] = {
						'path':operData.params[0],
						'db':res
					};
					this.socket.writeData(operData.operid,0,[db]);
				});
			break;
			case 'destroy':
				var runFunc = this.genFunc(this.config.vsl,operData);
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
				var runFunc = this.genFunc(this.config.vsl,operData);
				if(runFunc == '[runFunc Error]'){return;}
				return  runFunc.then((res)=>{
					this.socket.writeData(operData.operid,0,[res]);
				});
			break;
		}
	}

	runServerDB(operData)
	{
		var addSyncmethod = '';
		var syncData = [];
		switch (operData.method) {
			case 'isOpen':
			case 'isClosed':
			case 'getProperty':
				var runFunc = this.genFunc(this.dbList[operData.db]['db'],operData);
				if(runFunc == '[runFunc Error]'){return;}
				this.socket.writeData(operData.operid,0,[runFunc]);
				return;
			break;
			case 'on':
				var runEmit = this.genEmit(this.dbList[operData.db]['db'],operData);
				if(runEmit == '[runEmit Error]'){return;}
				break;
			case 'put':
				if (addSyncmethod=='')
				{
					syncData.push({ type: 'put', key: operData.params[0], value: operData.params[1] });
					notAddSyncData = 'put';
				}
			case 'del':
				if (addSyncmethod=='')
				{
					syncData.push({ type: 'del', key: operData.params[0] });
					notAddSyncData = 'del';
				}
			case 'batch':
				if (addSyncmethod=='')
				{
					syncData = operData.params[0];
					notAddSyncData = 'batch';
				}
				if (this.syncData.hasOwnProperty(operData.db)) {
					this.syncData[operData.db] = {
						'path':operData.path,
						'data':[]
					};
				};
				this.syncData[operData.db].push(...syncData);
			default:
				var runFunc = this.genFunc(this.dbList[operData.db]['db'],operData);
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

	acceptSync(operData)
	{
		try{

		var md5 = crypto.createHash('md5');
		var db = md5.update(JSON.stringify(operData.syncData.path)).digest('hex');
		if (!this.dbList.hasOwnProperty(db))
		{
			var dbSyncFunc =  this.config.vsl.level(operData.syncData.path)
			.then((res)=>{
				this.dbList[db] = res;
				return this.dbList[db].batch(operData.syncData.data);
			});
		} else {
			var dbSyncFunc = this.dbList[db].batch(operData.syncData.data);
		}

		dbSyncFunc
		.then((res)=>{
			this.socket.writeData(operData.operid,0,[res]);
		})
		.catch((err)=>{
			this.socket.writeData(operData.operid,1,[err.stack]);
		});

		} catch (err){
			this.socket.writeData(operData.operid,1,[err.stack]);
		}
	}

	run(operData)
	{
		
		var nowtime = Date.now();
		if (operData.nowtime>nowtime+300000 || operData.nowtime<nowtime-300000)
		{
			this.socket.writeData(operData.operid,1,[
				'Time expired!server timestamp:'+
				nowtime+
				'-your timestamp:'+
				operData.nowtime
				]);
			return;
		} else {
			var pass = this.getPass(operData.nowtime);
			if (pass!=operData.pass)
			{
				this.socket.writeData(operData.operid,1,['password failure!']);
				return;
			}
		}

		if (operData.method=='sync')
		{
			this.acceptSync(operData);
			return;
		}
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