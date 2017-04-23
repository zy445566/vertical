const path = require('path');
const config = {
    dataDir:path.join(__dirname,'data'),
    sysTable:'sys',
    serverPort:5234,
    syncFrequence:1000,
    servers:[
        '127.0.0.1'
        // '192.168.63.23',
        // '192.168.63.24',
        // '192.168.63.25',
        // '192.168.63.26',
    ]
};
module.exports = config;