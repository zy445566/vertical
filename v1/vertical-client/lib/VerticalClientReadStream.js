var VerticalClientStream = require('./VerticalClientStream');
class VerticalClientReadStream extends VerticalClientStream
{
	constructor(socket,db,options={})
	{
		super(socket,db,options);
		this.stream.method = 'createReadStream';
	}


}
module.exports = VerticalClientReadStream;