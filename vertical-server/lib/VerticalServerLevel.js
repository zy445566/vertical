var level = require('level');
var VerticalServerDB = require('./VerticalServerDB');
class VerticalServerLevel
{
	level(location,options={})
	{
		return new Promise((resolve,reject)=>{
			level(location,options,(err, db)=>{
				if(err)reject(err);
				resolve(new VerticalServerDB(db));
			})
		});
		
	}

	destroy(location)
	{
		return new Promise((resolve,reject)=>{
			level.destroy(location,(err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}

	repair(location)
	{
		return new Promise((resolve,reject)=>{
			level.repair(location,(err)=>{
				if(err)reject(err);
				resolve(true);
			});
		});
	}
}
module.exports = VerticalServerLevel;

