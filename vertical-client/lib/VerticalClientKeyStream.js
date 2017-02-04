var VerticalClientStream = require('./VerticalClientStream');
class VerticalClientKeyStream extends VerticalClientStream
{
	constructor(socket,db,options={})
	{
		super(socket,db,options);
		this.stream.method = 'createKeyStream';
	}


}
module.exports = VerticalClientKeyStream;