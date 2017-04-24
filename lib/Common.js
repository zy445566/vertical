const os = require("os");

class Common
{
    static getDataKey(row_key,column_key,timestamp='')
    {
        return 'data:'+row_key+':'+column_key+':'+timestamp;
    }

    static getHostIP()
    {
        var netWorkList = os.networkInterfaces();
        let ip ='127.0.0.1';
        for(let netWorkIndex in netWorkList)
        {
            for(let netWork of netWorkList[netWorkIndex])
            {
                if (netWork.family=='IPv4' && netWork.address!='127.0.0.1')
                {
                    ip = netWork.address;
                    break;
                }
            }
            if (ip!='127.0.0.1')
            {
                break;
            }
        }
        return ip;
    }

    static getSyncTimeKey(serverSign)
    {
        return 'syncTime:'+serverSign;
    }

    static getSyncSelfTime()
    {
        return 'syncSelfTime';
    }

    static getServerSignKey()
    {
        return 'serverSign';
    }

    static genServerSign()
    {
        let timestamp = Common.genTimestamp();
        let hostIp  =  Common.getHostIP();
        return hostIp+':'+timestamp;
    }

    static genTimestamp()
    {
        var nano = process.hrtime();
        return new Date().getTime().toString()+nano[0].toString()+nano[1].toString();
    }

    static genDataKey(row_key,column_key,timestamp=null)
    {   
        if (timestamp==null)
        {
            timestamp = Common.genTimestamp();
        }
        return 'data:'+row_key+':'+column_key+':'+timestamp;
    }

    static genSyncKey(timestamp=null)
    {
        if (timestamp==null)
        {
            timestamp = Common.genTimestamp();
        }
        return 'sync:'+timestamp;
    }
}

module.exports = Common;