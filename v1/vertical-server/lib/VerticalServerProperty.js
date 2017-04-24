var numFilesAtLevelList = [];
for (var i = 0; i < 7; i++) {
	numFilesAtLevelList[i] = 'leveldb.num-files-at-level'+i; 
};
const VerticalServerProperty ={
	'numFilesAtLevel':numFilesAtLevelList,
	'stats':'leveldb.stats',
	'sstables':'leveldb.sstables'
}
module.exports = VerticalServerProperty;