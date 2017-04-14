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
3:i64 timestamp,
}

struct DataKeyGen {
1:string row_key,
2:string column_key,
3:optional i64 timestamp,
}

struct DataColumnKey {
1:string row_key,
2:string column_key,
}

struct DataColumnOption {
1:optional i32 limit,
2:optional bool reverse,
3:optional bool fillCache
}

service Vertical
{
  void ping(),
  bool useTable(1:string table),
  string getRow(1:DataKey data_key),
  i64 updateRow(1:DataKey data_key,2:string row_value),
  i64 insertRow(1:DataKeyGen data_key_gen,2:string row_value),
  bool delRow(1:DataKey data_key),
  string getColumn(1:DataColumnKey data_column_key,2:DataColumnOption data_column_option),
  i32 delColumn(1:DataColumnKey data_column_key,2:DataColumnOption data_column_option),
  i32 updateColum(1:DataColumnKey data_column_key,2:string row_value,3:DataColumnOption data_column_option),
  i32 insertColum(1:DataColumnKey data_column_key,3:string row_value_list)
}