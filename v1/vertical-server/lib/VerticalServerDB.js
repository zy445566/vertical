class VerticalServerDB
{
	constructor(db)
	{
		this.db = db;
	}

	open()
	{
		return new Promise((resolve,reject)=>{
			this.db.open((err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	close()
	{
		return new Promise((resolve,reject)=>{
			this.db.close((err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	put(key,value,options={})
	{
		return new Promise((resolve,reject)=>{
			this.db.put(key,value,options,(err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	get(key,options={})
	{
		return new Promise((resolve,reject)=>{
			this.db.get(key,options,(err,value)=>{
				if(err)reject(err);
				resolve(value);
			});
		});
	}

	del(key,options={})
	{
		return new Promise((resolve,reject)=>{
			this.db.del(key,options,(err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	batch(ops,options={})
	{
		return new Promise((resolve,reject)=>{
			this.db.batch(ops,options,(err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	isOpen()
	{
		return this.db.isOpen();
	}

	isClosed()
	{
		return this.db.isClosed();
	}

	createReadStream(options={})
	{
		return this.db.createReadStream(options);
	}

	createKeyStream(options={})
	{
		return this.db.createKeyStream(options);
	}

	createValueStream(options={})
	{
		return this.db.createValueStream(options);
	}

	approximateSize(start, end)
	{
		return new Promise((resolve,reject)=>{
			this.db.db.approximateSize(start, end,(err,size)=>{
				if(err)reject(err);
				resolve(size);
			});
		});
	}

	getProperty(property)
	{
		return this.db.db.getProperty(property);
	}

	on(event,callback)
	{
		this.db.on(event,callback);
	}

	removeListener(event,callback)
	{
		this.db.removeListener(event,callback);
	}
	

}
module.exports = VerticalServerDB;