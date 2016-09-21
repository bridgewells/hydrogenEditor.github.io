"use strict";

var finalFolder = "release"

let buildManager = {
	components:[],
	files:{},
	buildCurrent:function(){
		buildManager.components = [];
		try{ fs.mkdirSync(rootFolder + wsFolder + "/" + finalFolder); }
		catch(e){}

		try{ copyFolderRecursiveSync(rootFolder + wsFolder + "/" + workingFolder, rootFolder + wsFolder + "/" + finalFolder);
		}catch(bf){ return false; }

		evalInContext( fs.readFileSync(rootFolder + wsFolder + "/" + workingFolder + "/Components/interfaces.js") +"console.log(this)", this);
		deleteFolderRecursive(rootFolder + wsFolder + "/" + finalFolder + "/" + workingFolder + "/Components"); 

		var files = fs.readdirSync(rootFolder + wsFolder + "/" + finalFolder + "/" + workingFolder);
		files.filter(function(file) { return file.substr(-5) === '.html'; }).forEach(function(file) { buildManager.files['html'].push(file)  });
		

		files = fs.readdirSync(rootFolder + wsFolder + "/" + workingFolder + "/Components");
		files.filter(function(file) { return file.substr(-5) === '.cdml'; }).forEach(function(file) { buildManager.files['cdml'].push(file)  });
		

		// TODO
		// Loop through stored components and:
		// create script tags and style tags to place inside all html files found above
		// use the component information to copy component layouts into all html files which reference the component
		// Make build tool accessible by save function and run function. Make build button repace stop button

		return true;
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

function copyFileSync( source, target ) {

	var targetFile = target;

	//if target is a directory a new file with the same name will be created
	if ( fs.existsSync( target ) ) {
		if ( fs.lstatSync( target ).isDirectory() ) {
			targetFile = path.join( target, path.basename( source ) );
		}
	}

	fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
	var files = [];

	//check if folder needs to be created or integrated
	var targetFolder = path.join( target, path.basename( source ) );
	if ( !fs.existsSync( targetFolder ) ) {
		fs.mkdirSync( targetFolder );
	}

	//copy
	if ( fs.lstatSync( source ).isDirectory() ) {
		files = fs.readdirSync( source );
		files.forEach( function ( file ) {
			var curSource = path.join( source, file );
			if ( fs.lstatSync( curSource ).isDirectory() ) {
				copyFolderRecursiveSync( curSource, targetFolder );
			} else {
				copyFileSync( curSource, targetFolder );
			}
		} );
	}
}

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