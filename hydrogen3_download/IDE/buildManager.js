"use strict";

var finalFolder = "release"
var shell = require("shelljs");
var isPrepped = false;

let buildManager = {
	components:[],
	files:{},
	buildTemp:function(){
		//use scripts and styles for testing
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
		var outcome = false
		var buildInfoPath = rootFolder + wsFolder+"/"+ workingFolder + "/build.json";
		var buildInfo = JSON.parse(fs.readFileSync(buildInfoPath,'utf8'));

		if (isPrepped == false) buildManager.prepApp();

		shell.cd(buildInfo.name);

		var perms = buildInfo.permissions;
		for (var i = 0; i < perms.length; i++) {
			shell.exec("cordova plugin add "+perms[i]+" --save ",{silent:false,async:false});
		}

		shell.exec("cordova platform add "+ buildInfo.platform + " --save",{silent:false,async:false});
		shell.exec("cordova build "+ buildInfo.platform + " --verbose",{silent:false,async:false});
		shell.exec("cordova run "+ buildInfo.platform,{silent:false,async:true});

		shell.cd(path.dirname(nw.App.manifest.main).split("://")[1])

		if (outcome == true){
			changeStatus("BUILD COMPLETED SUCCESSFULLY!",5);
		}
		else{
			changeStatusNegative('APP BUILDING FAILED!!!',5)
		}
		return outcome
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