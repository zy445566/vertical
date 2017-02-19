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
			var sockPath = path.join('\\\\?\\pipe', __dirname, linstenPath);
		} else {
			var sockPath = path.join(__dirname, linstenPath);
		}
		return sockPath;
	}
}
module.exports = CommonBin;