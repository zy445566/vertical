const packageInfo = require('../package.json');
const child_process = require('child_process');
const net = require('net');

class VerticalBin
{
	constructor()
	{
		this.sockPath = './vertical.sock';
	}

	printArrayText(ary)
	{
		for (var i = 0; i <ary.length; i++) {
			console.log(ary[i]);
		};
	}

	printVersion()
	{
		console.log('vertical-server@'+packageInfo.version);
	}

	start()
	{
		outFD = fs.openSync('../log/output.log', 'a');
    	errFD = fs.openSync('../log/error.log', 'a');
    	var worker_process = child_process.spawn(
    		"node", 
    		["VerticalBinServer.js"],
    		{
    			detached : true,
    			stdio: ['ignore', outFD, errFD]
    		}
    	);	
    	worker_process.unref();
	}

	stop()
	{
		var stream = net.connect(this.sockPath);
		this.sendInstruction(stream,'stop',[]);
	}

	restart()
	{
		var stream = net.connect(this.sockPath);
		this.sendInstruction(stream,'restart',[]);
	}

	sync(host,db)
	{
		var port = port;
		var auth = '';
		var stream = net.connect(this.sockPath);
		this.sendInstruction(stream,'sync',[host,port,auth,db]);
	}

	sendInstruction(stream,instruct,param)
	{
		var nano = process.hrtime();
		var operid = method+nano[0]+nano[1];
		var resData = {
			openid:operid,
			instruct:instruct,
			param:param,
		};
		stream.write(JSON.stringify(resData));
		var instructFunc = (buffer)=>{
			stream.end();
			stream.removeListener('data', instructFunc);
		};
		stream.on('data',instructFunc);

	}
}
module.exports = VerticalBin;