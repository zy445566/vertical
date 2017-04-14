var thrift = require("thrift");
var Vertical = require('../thrift/gen-nodejs/Vertical');
var VerticalTypes = require('../thrift/gen-nodejs/Vertical_types');

var server = thrift.createServer(Vertical, {
  ping: function(result) {
    result(null);
  },
  useTable: function (table,result)
  {
    result(null,true);
  },
  getRow: function (data_key,result) {
    result(null,'xxxxxxxxx');
  },
  updateRow: function (data_key,row_value) {
    result(null,1111111111111);
  },
  insertRow: function (data_key_gen,row_value) {
    result(null,1111111111111);
  },
  delRow: function (data_key,result) {
    result(null,true);
  },
  getColumn: function (data_column_key,data_column_option,result) {
    result(null,'xxxxxxxxxx');
  },
  delColumn: function (data_column_key,data_column_option,result) {
    result(null,'xxxxxxxxxx');
  },
  updateColum: function (data_column_key,row_value,data_column_option,result) {
    result(null,123);
  },
  updateColum: function (data_column_key,row_value,data_column_option,result) {
    result(null,123);
  },
  updateColum: function (data_column_key,row_value_list,result) {
    result(null,123);
  }
});

server.on('error', function(err) {
    console.log(err);
//   console.log(err.name);
//   console.log(err.message);
//   console.log(err.stack);
})

server.listen(5234);