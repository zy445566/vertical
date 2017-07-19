const thrift = require("thrift");
const Vertical = require('../thrift/gen-nodejs/Vertical');
const Method = require('./Method');
const config = require("../config");

var server = thrift.createServer(Vertical, {
  ping: function (result) {
    Method.getResult(result);
  },
  getToken: function (power_key,is_write,result) {
    Method.getResult(result,Method.getToken(power_key,is_write));
  },
  getRow: function (data_key, token, result) {
    Method.getResult(result,Method.getRow(
      data_key.row_key,
      data_key.column_key,
      data_key.timestamp,
      data_key.table,
      token
    ));
  },
  updateRow: function (data_key, row_value, token,result) {
    Method.getResult(result,Method.updateRow(
      data_key.row_key,
      data_key.column_key,
      row_value,
      data_key.timestamp,
      data_key.table, 
      token
    ));
  },
  insertRow: function (data_key_gen, row_value,token,result) {
    Method.getResult(result,Method.insertRow(
      data_key_gen.row_key,
      data_key_gen.column_key,
      row_value,
      data_key_gen.timestamp,
      data_key_gen.table,
      token
    ));
  },
  delRow: function (data_key,token, result) {
    Method.getResult(result,Method.delRow(
      data_key.row_key,
      data_key.column_key,
      data_key.timestamp,
      data_key.table,
      token
    ));
  },
  getColumn: function (data_column_key, data_column_option,token, result) {
    Method.getResult(result,Method.getColumn(
      data_column_key.row_key,
      data_column_key.column_key,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache,
      token
    ));
  },
  delColumn: function (data_column_key, data_column_option,token, result) {
    Method.getResult(result,Method.delColumn(
      data_column_key.row_key,
      data_column_key.column_key,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache,
      token
    ));
  },
  updateColum: function (data_column_key, row_value, data_column_option,token, result) {
    Method.getResult(result,Method.updateColum(
      data_column_key.row_key,
      data_column_key.column_key,
      row_value,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache,
      token
    ));
  },
  insertColum: function (data_column_key, row_value_list,token, result) {
    Method.getResult(result,Method.insertColum(
      data_column_key.row_key,
      data_column_key.column_key,
      row_value_list,
      data_column_key.table,
      token
    ));
  },
  isSync: function (server_sign, timestamp,token, result) {
    Method.getResult(result,Method.isSync(server_sign, timestamp,token));
  },
  writeSyncData: function (sync_write_data,token, result) {
    Method.getResult(result,Method.writeSyncData(sync_write_data,token));
  }
});

server.on('error', function (err) {
  //err.name err.message err.stack
  console.log(err);
})

// server.on('connection', function () {
//   console.log('connection');
// })

//初始化数据库
Method.InitServer();

server.listen(config.serverPort);