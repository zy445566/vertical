var thrift = require('thrift');
var Vertical = require('../thrift/gen-nodejs/Vertical');
var VerticalTypes = require('../thrift/gen-nodejs/Vertical_types');

var transport = thrift.TBufferedTransport;
var protocol = thrift.TBinaryProtocol;

var connection = thrift.createConnection("localhost", 5234, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  console.log(err)
});

var client = thrift.createClient(Vertical, connection);


client.ping(function(err, response) {
  console.log('pong');
  // connection.end();
});

var data_key = new VerticalTypes.DataKey({row_key:'1',column_key:'user',timestamp:5454756});
client.getRow(data_key,function(err, response) {
  console.log(response);
  connection.end();
});


