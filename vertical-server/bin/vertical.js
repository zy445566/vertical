var VerticalBin = require('./VerticalBin');
var verticalBin = new VerticalBin();
var action = [
"start","stop","restart","sync","help"
];
var help = [
"Usage: vertical-server <command>",
"",
"command:",
"v	:	print vertical-server version >vertical-server v",
"start	:	start vertical-server >vertical-server start",
"stop	:	stop vertical-server >vertical-server stop",
"restart	:	restart vertical-server >vertical-server restart",
"sync	:	sync vertical-server >vertical-server sync 192.168.231.88 /mydata/mydb",
];

var welcome = [
"vv    vv  eeee    rr  r   tt    ii  ccccc    aaaa     ll         ",
"vv   vv  eeeeee   rrrr   tttt       cc      a   aa    ll         ",
"vv  vv   eeeee    rr      tt    ii  cc        aaaaa   ll         ",
"vv vv    e        rr      tt    ii  cc       a    a   ll         ",
"vvv      eeeee    rr      ttt   ii  ccccc     aaaaaa  llllll    ",
"-------------------------------------------------------------",
"use `vertical-server help` to get help!",
"-------------------------------------------------------------",
];

// var welcome = [
// "555555   222222   000000     11      333333     11     4    4     ",
// "5             2   0    0     11           3     11     4    4    ",
// "55555    222222   0    0     11      333333     11     444444        ",
// "    5    2        0    0     11           3     11          4   ",
// "55555    222222   000000     11      333333     11          4    ",
// "-------------------------------------------------------------",
// "h    h   jjjj  l          ",
// "h    h    j    l          ",
// "hhhhhh    j    l          ",
// "h    h    j    l          ",
// "h    h  jjj    llllll     ",
// "-------------------------------------------------------------",
// ];

if (typeof process.argv[2]=='undefined')
{
	verticalBin.printArrayText(welcome);
	return;
}
switch(process.argv[2])
{
	case 'v':
	verticalBin.printVersion();
	break;
	case 'start':
	verticalBin.start();
	break;
	case 'stop':
	verticalBin.stop();
	break;
	case 'restart':
	verticalBin.restart();
	break;
	case 'sync':
	console.log('sync');
	break;
	case 'ping':
	verticalBin.ping();
	break;
	default:
	verticalBin.printArrayText(help);
	break;
}
