"use strict";

class HPlugin{
	constructor(name,bod){
		this.reference = name;
		this.prop = bod;
	}
	start(){
		pluginManager.registerPlugin(this.reference,this.prop);
	}
}

var fs = require('fs');
var piFolder = "/Documents/hydrogen3/plugins";
var rootFolder = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);

let pluginManager = {
	plugins:[],
	pluginCode:{},
	reload:function(){
		for (var i = 0; i < pluginManager.plugins.length; i++) {
			document.head.removeChild(document.getElementById(pluginManager.plugins[i]));
		}
		pluginManager.plugins = [];
		pluginManager.pluginCode = {};
		pluginManager.start();
	},
	start:function(){
		fs.readdir(rootFolder + piFolder, function(err, items) {
    			for (var i=0; i<items.length; i++) {
    				var plid = pluginManager.generateID();
        				var s = document.createElement("script");
				s.type = "text/javascript";
				s.src = "file://"+rootFolder + piFolder + "/" + items[i];
				s.id = plid;
				document.head.appendChild(s);
    			}
		});
	},
	registerPlugin:function(name,prop){
		pluginManager.pluginCode[name] = prop;
		pluginManager.pluginCode[name].init(pluginManager.pluginCode[name]);
	},
	generateID:function(){
		return Math.random().toString(36).substr(2, 17);
	}
}

pluginManager.start();

/* USE CASE 

	new HPlugin('Maxima',{
		init:function(){
			Console.log("Hello Everyone");
		}
	}).start();


*/