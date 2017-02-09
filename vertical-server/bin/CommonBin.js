const path = require('path');
const os=require('os');

class CommonBin
{
	static getSocketPath()
	{
		var linstenPath = './vertical.sock';
		var platform=os.platform();
		if (platform=='win32')
		{
			var sockPath = path.join('\\\\?\\pipe', process.cwd(), linstenPath);
		} else {
			var sockPath = path.join(process.cwd(), linstenPath);
		}
		return sockPath;
	}
}
module.exports = CommonBin;