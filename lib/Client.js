var thrift = require('thrift');
var Vertical = require('../thrift/gen-nodejs/Vertical');
var VerticalTypes = require('../thrift/gen-nodejs/vertical_types');
const Common = require('./Common');

var transport = thrift.TBufferedTransport;
var protocol = thrift.TBinaryProtocol;

class Client {
  constructor(host,port,power_key='',is_write=true) {
    this.thriftConnection = null;
    this.thriftClient = null;
    this.power_key = power_key;
    this.is_write = is_write;
    this.token = '';
    this.host = host;
    this.port = port;
  }

  connection() {
    return new Promise((reslove, reject) => {
      this.thriftConnection = thrift.createConnection(this.host, this.port, {
        transport: transport,
        protocol: protocol
      });
      this.thriftConnection.connection.on('error', function (err) {
        reject(err);
      });
      this.thriftConnection.connection.on('connect', function (err) {
        reslove(true);
      });
      this.thriftClient = thrift.createClient(Vertical, this.thriftConnection);
    }).then((res)=>{
      return this.getToken(this.power_key,this.is_write);
    }).then((token)=>{
      this.token = token;
    });
  }

  ping()
  {
    return new Promise((reslove, reject) => {
      this.thriftClient.ping(function (err, response) {
        if(err)reject(err);
        reslove(true);
      });
    });
  }

  getToken(power_key,is_write)
  {
    return new Promise((reslove, reject) => {
      this.thriftClient.getToken(power_key,is_write,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  getRow(row_key,column_key,timestamp,table='tmp')
  {
    let data_key = new VerticalTypes.DataKey({row_key:row_key,column_key:column_key,timestamp:timestamp,table:table});
    return new Promise((reslove, reject) => {
      this.thriftClient.getRow(data_key,this.token,function (err, response) {
        if(err)reject(err);
        reslove(JSON.parse(response));
      });
    });
  }

  updateRow(row_key,column_key,row_value,timestamp,table='tmp')
  {
    let data_key = new VerticalTypes.DataKey({
      row_key:row_key,
      column_key:column_key,
      row_value:JSON.stringify(row_value),
      timestamp:timestamp,
      table:table
    });
    return new Promise((reslove, reject) => {
      this.thriftClient.updateRow(data_key,JSON.stringify(row_value),this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  insertRow(row_key,column_key,row_value,timestamp=null,table='tmp')
  {
    let data_key_gen = new VerticalTypes.DataKeyGen({
      row_key:row_key,
      column_key:column_key,
      timestamp:timestamp,
      table:table
    });
    return new Promise((reslove, reject) => {
      this.thriftClient.insertRow(data_key_gen,JSON.stringify(row_value),this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  delRow(row_key,column_key,timestamp,table='tmp')
  {
    let data_key = new VerticalTypes.DataKey({row_key:row_key,column_key:column_key,timestamp:timestamp,table:table});
    return new Promise((reslove, reject) => {
      this.thriftClient.delRow(data_key,this.token,function (err, response) {
        if(err)reject(err);
        reslove(true);
      });
    });
  }

  getColumn(row_key,column_key,table='tmp',limit=1,reverse=false,fillCache=false)
  {
    let data_column_key = new VerticalTypes.DataColumnKey({row_key:row_key,column_key:column_key,table:table});
    let data_column_option = new VerticalTypes.DataColumnOption({limit:limit,reverse:reverse,fillCache:fillCache});
    return new Promise((reslove, reject) => {
      this.thriftClient.getColumn(data_column_key,data_column_option,this.token,function (err, response) {
        if(err)reject(err);
        reslove(JSON.parse(response));
      });
    });
  }

  delColumn(row_key,column_key,table='tmp',limit=1,reverse=false,fillCache=false)
  {
    let data_column_key = new VerticalTypes.DataColumnKey({row_key:row_key,column_key:column_key,table:table});
    let data_column_option = new VerticalTypes.DataColumnOption({limit:limit,reverse:reverse,fillCache:fillCache});
    return new Promise((reslove, reject) => {
      this.thriftClient.delColumn(data_column_key,data_column_option,this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  updateColum(row_key,column_key,row_value,table='tmp',limit=1,reverse=false,fillCache=false)
  {
    let data_column_key = new VerticalTypes.DataColumnKey({row_key:row_key,column_key:column_key,table:table});
    let data_column_option = new VerticalTypes.DataColumnOption({limit:limit,reverse:reverse,fillCache:fillCache});
    return new Promise((reslove, reject) => {
      this.thriftClient.updateColum(data_column_key,JSON.stringify(row_value),data_column_option,this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  insertColum(row_key,column_key,row_value_list,table='tmp')
  {
    let data_column_key = new VerticalTypes.DataColumnKey({row_key:row_key,column_key:column_key,table:table});
    return new Promise((reslove, reject) => {
      this.thriftClient.insertColum(data_column_key,JSON.stringify(row_value_list),this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  isSync(server_sign,timestamp)
  {
    return new Promise((reslove, reject) => {
      this.thriftClient.isSync(server_sign,timestamp,this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  writeSyncData(sync_write_data)
  {
    return new Promise((reslove, reject) => {
      this.thriftClient.writeSyncData(sync_write_data,this.token,function (err, response) {
        if(err)reject(err);
        reslove(response);
      });
    });
  }

  disConnection()
  {
    this.thriftConnection.end();
  }
}

module.exports = Client;


