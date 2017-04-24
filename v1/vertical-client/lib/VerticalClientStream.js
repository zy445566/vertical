class VerticalClientStream
{
	constructor(socket,db,options={})
	{
		this.socket = socket;
		this.db = db;
		var nano = process.hrtime();
		this.stream = {};
		this.stream.streamId = 'stream'+nano[0]+nano[1];
		this.stream.params = [options];
		this.init = 0;
	}

	isInit()
	{
		return this.init;
	}

	initStream()
	{
		switch(this.init)
		{
			case 0:
				this.init++;
			break;
			case 1:
				delete this.stream['options'];
				this.init++;
			break;
		}
	}

	pause()
	{
		this.initStream();
		return this.socket.writeData('pause',[],this.db,null,this.stream);
	}

	resume()
	{
		this.initStream();
		return this.socket.writeData('resume',[],this.db,null,this.stream);
	}

	destroy()
	{
		this.initStream();
		return this.socket.writeData('destroy',[],this.db,null,this.stream);
	}

	on(event, listener)
	{
		this.initStream();
		return this.socket.writeData('on',event,this.db,listener,this.stream);
	}


}
module.exports = VerticalClientStream;