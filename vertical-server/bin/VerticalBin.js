const packageInfo = require('../package.json');
const child_process = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const CommonBin = require('./CommonBin');

class VerticalBin
{
	constructor()
	{
		this.sockPath = CommonBin.getSocketPath();
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

	getStream()
	{

		var socket = new net.Socket();
		var stream = socket.connect(this.sockPath);
		stream.setTimeout(3000);
		stream.on('error',(error)=>{
			if (error.syscall == 'connect')
			{
				console.log(':can\'t connect,start server,please!');
				process.exit(0);
			}
			
		});
		return stream;
	}

	showRun(signText)
	{
		process.stdout.write(signText);
		setTimeout(()=>{
			process.stdout.write('.')
		},300);
		setTimeout(()=>{
			process.stdout.write('.')
		},600);
		setTimeout(()=>{
			process.stdout.write('.')
		},900);
	}

	start()
	{
		var instruct = 'start';
		console.log('(if can\'t start,del manually "'+CommonBin.getSocketPath()+'",please!)');
		this.showRun(instruct);
		var outFD = fs.openSync('../log/output.log', 'a');
    	var errFD = fs.openSync('../log/error.log', 'a');
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
		var instruct = 'stop';
		this.showRun(instruct);
		this.sendInstruction(this.getStream(),instruct,[]);
	}

	restart()
	{
		var instruct = 'restart';
		this.showRun(instruct);
		this.sendInstruction(this.getStream(),instruct,[]);
	}

	sync(host,db)
	{
		var instruct = 'sync';
		this.showRun(instruct);
		this.sendInstruction(this.getStream(),instruct,[host,db]);
	}

	sendInstruction(stream,instruct,param)
	{
		var nano = process.hrtime();
		var operid = instruct+nano[0]+nano[1];
		var resData = {
			operid:operid,
			instruct:instruct,
			param:param,
		};
		if (instruct!='sync')
		{
			stream.end(JSON.stringify(resData));
			return;
		}
		stream.write(JSON.stringify(resData));
		var instructFunc = (buffer)=>{
			var recData = JSON.parse(buffer.toString());
			if (recData.operid==operid)
			{
				return new Promise((resolve,reject)=>{
					if (recData.err==0)
					{
						resolve(recData.res);
					} else {
						reject(recData.res);
					}
					stream.end();
					stream.removeListener('data', instructFunc);
				});
			}
		};
		stream.on('data',instructFunc);

	}
}
module.exports = VerticalBin;