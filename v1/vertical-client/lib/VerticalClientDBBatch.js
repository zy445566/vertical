class VerticalClientDBBatch
{
	constructor(socket,db)
	{
		this.socket = socket;
		this.db = db;
		this.ops = [];
		this.length =0;
	}

	put(key,value,options={})
	{
		var baseData = { type: 'put', key: key, value: value };
		var data = Object.assign(baseData,options);
		this.ops.push(data);
		this.length++;
		return this;
	}

	clear()
	{
		this.ops = [];
		this.length = 0;
	}



	del(key,options={})
	{
		var baseData = { type: 'del', key: key };
		var data = Object.assign(baseData,options);
		this.ops.push(data);
		this.length++;
		return this;
	}

	write()
	{
		return this.socket.writeData('batch',[this.ops],this.db);
	}

}
module.exports = VerticalClientDBBatch;