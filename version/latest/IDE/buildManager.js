"use strict";

var finalFolder = "release"
var shell = require("shelljs");
var isPrepped = false;

let buildManager = {
	components:[],
	files:{},
	frameworkLive:false,
	buildTemp:function(){
		//use scripts and styles for testing
	},
	importFramework:function(){
		if (buildManager.frameworkLive) return;
		var stexStylePath = path.dirname(nw.App.manifest.main).split("://")[1] + '/templates/stex.css';
		// var stexScriptPath = path.dirname(nw.App.manifest.main) + '/templates/stex.js';
		var stexStyleDestinationPath = rootFolder+wsFolder+'/'+workingFolder +'/css';
		if ( checkTypePath( stexStyleDestinationPath ) != 'directory' ) {
			console.warn('creating destination folder');
			fs.mkdirSync( stexStyleDestinationPath );
		}
		if (checkTypePath(stexStyleDestinationPath + '/stex.css') != 'file' ) {
			console.warn('copying files');
			copyFileSync(stexStylePath, stexStyleDestinationPath);
		}
		buildManager.frameworkLive=true;
	},
	setBuildType:function(type){
		if (type == 'Website'){
			buildManager.projectType.source = 'com.hydrogen.framework:basic.website';
			buildManager.projectType.buildType = 'web';
			buildManager.projectType.is.app = false;
			buildManager.projectType.is.web = true;
		}
		else if (type == 'Apple App'){
			buildManager.projectType.source = 'com.hydrogen.framework:app.apple';
			buildManager.projectType.buildType = 'app';
			buildManager.projectType.is.app = true;
			buildManager.projectType.is.web = false;
		}
		else if (type == 'Android App'){
			buildManager.projectType.source = 'com.hydrogen.framework:app.android';
			buildManager.projectType.buildType = 'app';
			buildManager.projectType.is.app = true;
			buildManager.projectType.is.web = false;
		}
		else{
			buildManager.projectType.source = 'com.hydrogen.framework:basic.website';
			buildManager.projectType.buildType = 'web';
			buildManager.projectType.is.app = false;
			buildManager.projectType.is.web = true;
		}
	},
	projectType:{
		source:'',
		buildType:'',
		is:{
			app:false,
			web:true
		}
	},
	prepApp:function () {
		var buildInfoPath = rootFolder + wsFolder+"/"+ workingFolder + "/build.json";
		var buildInfo = JSON.parse(fs.readFileSync(buildInfoPath,'utf8'));
		var abp = '';

		shell.cd(rootFolder + wsFolder+"/"+ workingFolder);
		abp = shell.exec("cordova create "+ rootFolder + wsFolder+"/"+ workingFolder+"/"+buildInfo.name+" "+buildInfo.access+" "+buildInfo.name,{silent:false,async:false}).output;
		console.log(abp);
		try{
			copyFolderRecursiveSync(rootFolder + wsFolder + "/" + workingFolder, rootFolder + wsFolder + "/" + finalFolder + "/"+ buildInfo.name + "/www");
			console.log('copied over large dir')
		}
		catch(bf){
			changeStatusNegative('PRE-BUILDING APP FAILED!!',15);
			isPrepped = false;
			return false;
		}

		isPrepped = true;
		return true;
	},
	buildApp:function(){
		var outcome = false;
		var buildInfoPath = rootFolder + wsFolder+"/"+ workingFolder + "/build.json";
		var buildInfo = JSON.parse(fs.readFileSync(buildInfoPath,'utf8'));

		if (isPrepped == false) buildManager.prepApp();

		shell.cd(buildInfo.name);

		var perms = buildInfo.permissions;
		buildManager.build.addPermissions(perms);

		buildManager.build.addPlatform(buildInfo,function(x){

			if (x == true){
				buildManager.build.compile(buildInfo,function(c){

					if (c == true){
						changeStatus("BUILD COMPLETED SUCCESSFULLY!",5);
						buildManager.build.run(buildInfo)
					}
					else{
						changeStatusNegative('APP BUILDING FAILED!!!',5)
					}

				});
			}
			else{
				changeStatusNegative('APP BUILDING FAILED!!!',5)
			}

		});
	},
	build:{
		addPermissions:function(permissionList,cb){
			for (var i = 0; i < permissionList.length; i++) {
				shell.exec("cordova plugin add "+permissionList[i]+" --save ",{silent:false,async:false});
			}
			if (cb) cb(true)
		},
		addPlatform:function(buildInfo,cb){
			shell.exec("cordova platform add "+ buildInfo.platform + " --save",{silent:false,async:true},function(ec){
				if (cb) {
					cb(ec == 0)
				}
			});
		},
		compile:function(buildInfo,cb){
			shell.exec("cordova build "+ buildInfo.platform + " --verbose",{silent:false,async:true},function(){
				if (cb) {
					cb(ec == 0)
				}
			});
		},
		run:function(buildInfo){
			shell.exec("cordova run "+ buildInfo.platform,{silent:false,async:true});
			shell.cd(path.dirname(nw.App.manifest.main).split("://")[1]);
		}
	},
	buildCurrent:function(){
		buildManager.components = [];
		try{ fs.mkdirSync(rootFolder + wsFolder + "/" + finalFolder); }
		catch(e){}

		try{ copyFolderRecursiveSync(rootFolder + wsFolder + "/" + workingFolder, rootFolder + wsFolder + "/" + finalFolder);
		}catch(bf){ changeStatusNegative('BUILD FAILED!!',5) ;return false; }

		try{
			evalInContext( fs.readFileSync(rootFolder + wsFolder + "/" + workingFolder + "/Components/interfaces.js") +"console.log(this)", this);
			deleteFolderRecursive(rootFolder + wsFolder + "/" + finalFolder + "/" + workingFolder + "/Components"); 
		}
		catch(e){}
		buildManager.files['html'] = [];
		buildManager.files['cdml'] = [];

		var files = fs.readdirSync(rootFolder + wsFolder + "/" + finalFolder + "/" + workingFolder);
		files.filter(function(file) { return file.substr(-5) === '.html'; }).forEach(function(file) { buildManager.files['html'].push(file)  });

		try{
			files = fs.readdirSync(rootFolder + wsFolder + "/" + workingFolder + "/Components");
		}
		catch(sep){
			files = [];
		}
		
		files.filter(function(file) { return file.substr(-5) === '.cdml'; }).forEach(function(file) { buildManager.files['cdml'].push(file)  });
		
		console.log(buildManager.files['html'].length);
		for (var i = 0; i < buildManager.files['html'].length; i++) {
			var indexPath = rootFolder + wsFolder + "/" + workingFolder + "/" +buildManager.files['html'][i];
			var indexFinalPath = rootFolder + wsFolder + "/" + finalFolder + "/" + workingFolder + "/" + buildManager.files['html'][i];
			var indexContent = fs.readFileSync(indexPath,'utf8');
			
			for (var x = 0; x < buildManager.components.length; x++) {
				var componentFilePath = rootFolder + wsFolder + "/" + workingFolder + "/Components/" + buildManager.components[x].iname;
				var componentContent = fs.readFileSync(componentFilePath,'utf8');
				var componentDOM = $.parseHTML(componentContent);
				var componentTagID = componentDOM[0].firstChild.parentElement.id;
				
				console.log('<'+componentTagID+'></'+componentTagID+'>');
				componentContent = componentContent.replace( new RegExp("\n", "g") , "\n\t\t" );

				console.log(componentContent);
				indexContent = indexContent.replace(new RegExp( '<'+componentTagID+'></'+componentTagID+'>' , 'g'), componentContent);
			}

			console.log('222:'+indexContent);
			fs.writeFileSync(indexFinalPath,indexContent);
		}

		if (checkTypePath(rootFolder + wsFolder+"/"+ workingFolder + "/build.json")=='file'){
			return buildManager.buildApp()
		}
		else{
			changeStatus("BUILD COMPLETED SUCCESSFULLY!",5);
			return true;
		}
	}
}

var path = require('path');

function evalInContext(js, context) {
	return function() { return eval(js); }.call(context);
}

var deleteFolderRecursive = function(dirPath) {
	  try { var files = fs.readdirSync(dirPath); }
	  catch(e) { console.log(e);return; }
	  if (files.length > 0)
		for (var i = 0; i < files.length; i++) {
		  var filePath = dirPath + '/' + files[i];
		  if (fs.statSync(filePath).isFile())
			fs.unlinkSync(filePath);
		  else
			rmDir(filePath);
		}
	  fs.rmdirSync(dirPath);
	};



class ComponentInterface{
	constructor(type,prop){
		this.itype = type;
		this.iname = prop.name;
		this.prop = prop;

		buildManager.components.push(this);
	}
}

/* USE CASE

new interface('web-component',{
	id:'nav',
	styles:['navStyle.css'],
	scripts['myActions.js']	,
	order:'async'
});


*/