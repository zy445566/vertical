const packageInfo = require('../package.json');
const child_process = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const CommonBin = require('./CommonBin');

class VerticalBin
{
	constructor(config)
	{
		this.sockPath = CommonBin.getSocketPath();
		this.config = config;
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
		var stream = new net.Socket();
		stream.setTimeout(3000);
		stream.on('error',(error)=>{
			if (error.syscall == 'connect')
			{
				console.log(':can\'t connect,start server,please!');
				process.exit(0);
			}
			
		});
		return new Promise((resolve,reject)=>{
			stream.connect(this.sockPath,()=>{
				resolve(stream);
			});
		});
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
		this.showRun(instruct);
		var outPath = path.join(this.config.logPath,'output.log');
		var errPath = path.join(this.config.logPath,'error.log');
		var outFD = fs.openSync(outPath, 'a');
    	var errFD = fs.openSync(errPath, 'a');
    	var worker_process = child_process.spawn(
    		"node", 
    		["VerticalBinServer.js"],
    		{
    			detached : true,
    			stdio: ['ignore', outFD, errFD]
    		}
    	);	
    	worker_process.unref();
    	setTimeout(()=>{
    		this.getStream()
    		.then((stream)=>{
				return this.sendInstruction(this.stream,'ping',[]);
			})
			.then((res)=>{
			console.log('start success!');
			})
			.catch((err)=>{
				console.log('if can\'t start,del manually "'+CommonBin.getSocketPath()+'",please!');
			});
		},1000);

	}

	ping()
	{
		var instruct = 'ping';
		// this.showRun(instruct);
		this.getStream()
		.then((stream)=>{
			return this.sendInstruction(stream,instruct,[]);
		})
		.then((res)=>{
			console.log('pong');
		})
		.catch((err)=>{
			console.log(err);
		});
	}

	stop()
	{
		var instruct = 'stop';
		this.showRun(instruct);
		this.getStream()
		.then((stream)=>{
			return this.sendInstruction(stream,instruct,[]);
		})
		.catch((err)=>{
			console.log(err);
		});
	}

	restart()
	{
		var instruct = 'restart';
		this.showRun(instruct);
		this.getStream()
		.then((stream)=>{
			return this.sendInstruction(stream,instruct,[]);
		})
		.catch((err)=>{
			console.log(err);
		});
	}

	sync(host,db)
	{
		var instruct = 'sync';
		this.showRun(instruct);
		this.getStream()
		.then((stream)=>{
			return this.sendInstruction(stream,instruct,[host,db]);
		})
		.then((res)=>{
			console.log(res);
		})
		.catch((err)=>{
			console.log(err);
		});
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
		var endList = {
				'start':1,
				'stop':1,
				'restart':1,
			};
		if (endList[resData.instruct]==1)
		{
			stream.end(JSON.stringify(resData));
			return;
		}
		stream.write(JSON.stringify(resData));
		return new Promise((resolve,reject)=>{
			var instructFunc = (buffer)=>{
				var recData = JSON.parse(buffer.toString());
				if (recData.operid==operid)
				{
					stream.end();
					stream.removeListener('data', instructFunc);
					if (recData.err==0)
					{
						resolve(recData.res);
					} else {
						reject(recData.res);
					}
				}
			}
			stream.on('data',instructFunc);
		});
		
	}

}
module.exports = VerticalBin;