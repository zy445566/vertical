# vertical-client(just beta now!)
levelDB distributed,BigTable model.

#install
		npm install vertical-client

## vertical-server & vertical-client
* [vertical-server](https://github.com/zy445566/vertical/tree/master/vertical-server "vertical-server")
* [vertical-client](https://github.com/zy445566/vertical/tree/master/vertical-client "vertical-client")

#use(must install vertical-server)
*[click here to konw vertical-server](https://github.com/zy445566/vertical/tree/master/vertical-server "click here to konw vertical-server")
##base example

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	return vcdb.put('a','aaa');
})
.then((res)=>{
	console.log(res);
	return vcdb.get('a');
})
.then((res)=>{
	console.log(res);
	return vcdb.del('a');
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```

### level & destroy & repair
```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var location = './mydb';
vc.startVerticalClient();
vc.level(location)
.then((res)=>{
	return vc.repair(location);
})
.then((res)=>{
	return vc.destroy(location);
})
.then((res)=>{
	vc.stopVerticalClient();
})
```

### open & close 
```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var location = './mydb';
var vcdb = null;
vc.startVerticalClient();
vc.level(location)
.then((res)=>{
	vcdb = res;
	return vcdb.open();
})
.then((res)=>{
	vcdb = res;
	return vcdb.close();
});
```

### put & get & del

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	return vcdb.put('a','aaa');
})
.then((res)=>{
	console.log(res);
	return vcdb.get('a');
})
.then((res)=>{
	console.log(res);
	return vcdb.del('a');
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```
```
### batch

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	var ops = [
	    { type: 'del', key: 'father' }
	  , { type: 'put', key: 'name', value: 'Yuri Irsenovich Kim' }
	  , { type: 'put', key: 'dob', value: '16 February 1941' }
	  , { type: 'put', key: 'spouse', value: 'Kim Young-sook' }
	  , { type: 'put', key: 'occupation', value: 'Clown' }
	]

	return vcdb.batch(ops);
})
.then((res)=>{
	return vcdb.batch()
	  .del('father')
	  .put('name', 'Yuri Irsenovich Kim')
	  .put('dob', '16 February 1941')
	  .put('spouse', 'Kim Young-sook')
	  .put('occupation', 'Clown')
	  .write();
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```


### isOpen & isClosed

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	return vcdb.isOpen();
})
.then((res)=>{
	console.log(res);
	return vcdb.isClosed();
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```



### createReadStream & createKeyStream & createValueStream
```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	//var option = {'gt':'a'};
	vcdb.createReadStream()
	  .on('data', function (data) {
	    console.log(data.key, '=', data.value)
	  })
	  .on('error', function (err) {
	    console.log('Oh my!', err)
	  })
	  .on('close', function () {
	    console.log('Stream closed')
	  })
	  .on('end', function () {
	    console.log('Stream ended')
	  });
	 vcdb.createKeyStream()
	  .on('data', function (data) {
	    console.log('key=', data.value)
	  })
	  .on('error', function (err) {
	    console.log('Oh my!', err)
	  })
	  .on('close', function () {
	    console.log('Stream closed')
	  })
	  .on('end', function () {
	    console.log('Stream ended')
	  });
	 vcdb.createValueStream()
	  .on('data', function (data) {
	    console.log('value=', data.value)
	  })
	  .on('error', function (err) {
	    console.log('Oh my!', err)
	  })
	  .on('close', function () {
	    console.log('Stream closed')
	  })
	  .on('end', function () {
	    console.log('Stream ended')
	  });
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```



Additionally, you can supply an options object as the first parameter to `createReadStream()` with the following options:

* `'gt'` (greater than), `'gte'` (greater than or equal) define the lower bound of the range to be streamed. Only records where the key is greater than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.

* `'lt'` (less than), `'lte'` (less than or equal) define the higher bound of the range to be streamed. Only key/value pairs where the key is less than (or equal to) this option will be included in the range. When `reverse=true` the order will be reversed, but the records streamed will be the same.
	
* `'start', 'end'` legacy ranges - instead use `'gte', 'lte'`

* `'reverse'` *(boolean, default: `false`)*: a boolean, set true and the stream output will be reversed. Beware that due to the way LevelDB works, a reverse seek will be slower than a forward seek.

* `'keys'` *(boolean, default: `true`)*: whether the `'data'` event should contain keys. If set to `true` and `'values'` set to `false` then `'data'` events will simply be keys, rather than objects with a `'key'` property. Used internally by the `createKeyStream()` method.

* `'values'` *(boolean, default: `true`)*: whether the `'data'` event should contain values. If set to `true` and `'keys'` set to `false` then `'data'` events will simply be values, rather than objects with a `'value'` property. Used internally by the `createValueStream()` method.

* `'limit'` *(number, default: `-1`)*: limit the number of results collected by this stream. This number represents a *maximum* number of results and may not be reached if you get to the end of the data first. A value of `-1` means there is no limit. When `reverse=true` the highest keys will be returned instead of the lowest keys.

* `'fillCache'` *(boolean, default: `false`)*: whether LevelDB's LRU-cache should be filled with data read.

* `'keyEncoding'` / `'valueEncoding'` *(string)*: the encoding applied to each read piece of data.


### approximateSize

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	var start ='a';
	var end ='z';
	return vcdb.approximateSize(start,end);
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```

### getProperty

```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	return vcdb.getProperty('leveldb.num-files-at-level3');
})
.then((res)=>{
	console.log(res);
})
.catch((err)=>{
	console.log(err);
});
```
* 'leveldb.num-files-at-levelN': returns the number of files at level N, where N is an integer representing a valid level (e.g. "0").

* 'leveldb.stats': returns a multi-line string describing statistics about LevelDB's internal operation.

* 'leveldb.sstables': returns a multi-line string describing all of the sstables that make up contents of the current database.

### Event


```node
var VerticalClient = require('vertical-client').VerticalClient;
var vc = new VerticalClient({host:'127.0.0.1',port:5234,timeout:3000,auth:"password"});
var vcdb = null;
vc.startVerticalClient();
vc.level('./mydb')
.then((res)=>{
	vcdb = res;
	return vcdb.on('put',(key,value)=>{
		console.log(key,value);
	});
})
.catch((err)=>{
	console.log(err);
});
```
* db.emit('put', key, value) emitted when a new value is 'put'
* db.emit('del', key) emitted when a value is deleted
* db.emit('batch', ary) emitted when a batch operation has executed
* db.emit('ready') emitted when the database has opened ('open' is synonym)
* db.emit('closed') emitted when the database has closed
* db.emit('opening') emitted when the database is opening
* db.emit('closing') emitted when the database is closing