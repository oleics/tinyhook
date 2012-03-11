var vows = require('vows');
var assert = require('assert');
var Hook = require('../hook').Hook;

vows.describe('hook.io alike spawn').addBatch({
	'In process spawned':{
		topic:function () {
			var master = new Hook({name: 'master',local:true, port:1976 });
			var cb = this.callback.bind(this, null,master);
			master.start();
			master.on('hook::ready', function () {
				master.spawn([{src:__dirname+'/testhook.js',name:'child', port:1976}]);
			})
			master.on('children::ready', cb);
		},
		'child pid':{
			topic:function(master) {
				master.on('child::test_getpid', this.callback.bind(this,null))
				master.emit('testcmd',{action:'getpid'});
			},
			'equal to parent pid':function(pid) {
				assert.equal(pid,process.pid);
			}
		},
		'child respond to echo':{
			topic:function(master) {
				master.on('child::test_echo', this.callback.bind(this,null))
				master.emit('testcmd',{action:'echo',data:'ilovetinyhook'});
			},
			'with proper value':function(echo) {
				assert.equal(echo,'ilovetinyhook');
			}
		}
	}
}).addBatch({
	'Inter process spawned':{
		topic:function () {
			var master = new Hook({name: 'master',local:false,port:1977});
			var cb = this.callback.bind(this, null,master);
			master.start();
			master.on('hook::ready', function () {
				master.spawn([{src:__dirname+'/testhook.js',name:'child',port:1977}]);
			})
			master.on('children::ready', cb);
		},
		'child pid':{
			topic:function(master) {
				master.on('child::test_getpid', this.callback.bind(this,null))
				master.emit('testcmd',{action:'getpid'});
			},
			'not equal to parent pid':function(pid) {
				assert.notEqual(pid,process.pid);
			}
		},
		'chile respond to echo':{
			topic:function(master) {
				master.on('child::test_echo', this.callback.bind(this,null))
				master.emit('testcmd',{action:'echo',data:'ilovetinyhook'});
			},
			'with proper value':function(echo) {
				assert.equal(echo,'ilovetinyhook');
			}
		}		
	}
}).export(module);
