namespace cpp vertical
namespace d vertical
namespace dart vertical
namespace java vertical
namespace php vertical
namespace perl vertical
namespace haxe vertical

struct DataKey {
1:string row_key,
2:string column_key,
3:string timestamp,
4:optional string table
}

struct DataKeyGen {
1:string row_key,
2:string column_key,
3:optional string timestamp,
4:optional string table
}

struct DataColumnKey {
1:string row_key,
2:string column_key,
3:optional string table
}

struct DataColumnOption {
1:optional i32 limit,
2:optional bool reverse,
3:optional bool fillCache
}

exception VerticalError {
1:string message
}

service Vertical
{
  void ping(),
  string getRow(1:DataKey data_key) throws (1:VerticalError error),
  string updateRow(1:DataKey data_key,2:string row_value) throws (1:VerticalError error),
  string insertRow(1:DataKeyGen data_key_gen,2:string row_value) throws (1:VerticalError error),
  bool delRow(1:DataKey data_key) throws (1:VerticalError error),
  string getColumn(1:DataColumnKey data_column_key,2:DataColumnOption data_column_option) throws (1:VerticalError error),
  i32 delColumn(1:DataColumnKey data_column_key,2:DataColumnOption data_column_option) throws (1:VerticalError error),
  i32 updateColum(1:DataColumnKey data_column_key,2:string row_value,3:DataColumnOption data_column_option) throws (1:VerticalError error),
  i32 insertColum(1:DataColumnKey data_column_key,3:string row_value_list) throws (1:VerticalError error),
  bool isSync(1:string server_sign,2:i64 timestamp) throws (1:VerticalError error)
}