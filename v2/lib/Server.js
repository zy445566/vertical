const thrift = require("thrift");
const Vertical = require('../thrift/gen-nodejs/Vertical');
const VerticalTypes = require('../thrift/gen-nodejs/Vertical_types');
const Method = require('./Method');
const config = require("../config");

var server = thrift.createServer(Vertical, {
  ping: function (result) {
    Method.getResult(result);
  },
  getRow: function (data_key, result) {
    Method.getResult(Method.getRow(
      data_key.row_key,
      data_key.column_key,
      data_key.timestamp,
      data_key.table
    ),result);
  },
  updateRow: function (data_key, row_value,result) {
    Method.getResult(Method.updateRow(
      data_key.row_key,
      data_key.column_key,
      row_value,
      data_key.timestamp,
      data_key.table
    ),result);
  },
  insertRow: function (data_key_gen, row_value,result) {
    Method.getResult(Method.insertRow(
      data_key_gen.row_key,
      data_key_gen.column_key,
      row_value,
      data_key_gen.timestamp,
      data_key_gen.table
    ),result);
  },
  delRow: function (data_key, result) {
    Method.getResult(Method.delRow(
      data_key.row_key,
      data_key.column_key,
      data_key.timestamp,
      data_key.table
    ),result);
  },
  getColumn: function (data_column_key, data_column_option, result) {
    Method.getResult(Method.getColumn(
      data_column_key.row_key,
      data_column_key.column_key,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache
    ),result);
  },
  delColumn: function (data_column_key, data_column_option, result) {
    Method.getResult(Method.delColumn(
      data_column_key.row_key,
      data_column_key.column_key,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache
    ),result);
  },
  updateColum: function (data_column_key, row_value, data_column_option, result) {
    Method.getResult(Method.updateColum(
      data_column_key.row_key,
      data_column_key.column_key,
      data_column_key.table,
      data_column_option.limit,
      data_column_option.reverse,
      data_column_option.fillCache
    ),result);
  },
  insertColum: function (data_column_key, row_value_list, result) {
    Method.getResult(Method.insertColum(
      data_column_key.row_key,
      data_column_key.column_key,
      row_value_list,
      data_column_key.table
    ),result);
  }
});

server.on('error', function (err) {
  //err.name err.message err.stack
  console.log(err);
})

server.on('connection', function () {
  console.log('connection');
})

//初始化数据库
Method.InitServer();

server.listen(config.serverPort);