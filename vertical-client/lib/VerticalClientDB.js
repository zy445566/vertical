var VerticalClientDBBatch = require('./VerticalClientDBBatch');
var VerticalClientReadStream = require('./VerticalClientReadStream');
var VerticalClientKeyStream = require('./VerticalClientKeyStream');
var VerticalClientValueStream = require('./VerticalClientValueStream');
class VerticalClientDB
{
	constructor(socket,db)
	{
		this.socket = socket;
		this.db = db;
	}

	open()
	{
		return this.socket.writeData('open',[],this.db);
	}

	close()
	{
		return this.socket.writeData('open',[],this.db);
	}

	put(key,value,options={})
	{
		return this.socket.writeData('put',[key,value,options],this.db);
	}

	get(key,options={})
	{
		return this.socket.writeData('get',[key,options],this.db);
	}

	del(key,options={})
	{
		return this.socket.writeData('del',[key,options],this.db);
	}

	batch(ops,options={})
	{
		if (typeof ops =='undefined')
		{
			return new VerticalClientDBBatch(this.socket,this.db);
		}
		return this.socket.writeData('batch',[ops,options={}],this.db);
	}

	isOpen()
	{
		return this.socket.writeData('isOpen',[],this.db);
	}

	isClosed()
	{
		return this.socket.writeData('isClosed',[],this.db);
	}

	createReadStream(options={})
	{
		return new VerticalClientReadStream(this.socket,this.db,options);
	}

	createKeyStream(ptions={})
	{
		return new VerticalClientKeyStream(this.socket,this.db,options);
	}

	createValueStream(ptions={})
	{
		return new VerticalClientValueStream(this.socket,this.db,options);
	}

	approximateSize(start, end)
	{
		return this.socket.writeData('approximateSize',[start, end],this.db);
	}

	getProperty(property)
	{
		return this.socket.writeData('getProperty',[property],this.db);
	}

	on(event, listener)
	{
		return this.socket.writeData('on',event,this.db,listener);
	}
}
module.exports = VerticalClientDB;