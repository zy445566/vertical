const path = require('path');
var config = 
{
	"dataPath":path.join(path.dirname(process.cwd()), "data"),
	"logPath":path.join(path.dirname(process.cwd()), "log"),
	"host":"127.0.0.1",
	"port":5234,
	"auth":"",
	"timeout":3000,
	"serverList":[
		"192.168.231.43",
		"192.168.231.44",
		"192.168.231.45",
		"192.168.231.46",
	],
};
module.exports = config;