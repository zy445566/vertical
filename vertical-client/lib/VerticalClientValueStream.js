var VerticalClientStream = require('./VerticalClientStream');
class VerticalClientValueStream extends VerticalClientStream
{
	constructor(socket,db,options={})
	{
		super(socket,db,options);
		this.stream.method = 'createValueStream';
	}


}
module.exports = VerticalClientValueStream;