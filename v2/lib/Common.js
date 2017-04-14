class Common
{
    static getDataKey(row_key,column_key,timestamp='')
    {
        return 'data:'+row_key+':'+column_key+':'+timestamp;
    }

    static genTimestamp()
    {
        var nano = process.hrtime();
        timestamp = new Date().getTime()+nano[0]+nano[1];
        return timestamp;
    }

    static genDataKey(row_key,column_key,timestamp=null)
    {   
        if (timestamp==null)
        {
            timestamp = Common.genTimestamp();
        }
        return 'data:'+row_key+':'+column_key+':'+timestamp;
    }

    static genSyncKey()
    {
        timestamp = Common.genTimestamp();
        return 'sync:'+timestamp;
    }
}

module.exports = Common;