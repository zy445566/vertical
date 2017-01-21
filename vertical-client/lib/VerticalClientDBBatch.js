class VerticalClientDBBatch
{
	constructor(socket,db)
	{
		this.socket = socket;
		this.db = db;
		this.ops = [];
		this.length =0;
	}

	put(key,value)
	{
		this.ops.push({ type: 'put', key: key, value: value });
		this.length++;
		return this;
	}

	clear()
	{
		this.ops = [];
		this.length = 0;
	}



	del(key)
	{
		this.ops.push({ type: 'del', key: key });
		this.length++;
		return this;
	}

	write()
	{
		return this.socket.writeData('batch',[this.ops],this.db);
	}

}
module.exports = VerticalClientDBBatch;