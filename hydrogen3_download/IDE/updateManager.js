
let hydrogenInformationPack = {
	version: '3.41.64.99',
	channel:'beta',
	status:'stable',
	platform: require("os").platform(),
	updatables:[
		"core.js",
		"buildManager.js",
		"eventManager.js",
		"filemanager.js",
		"index.html",
		"package.json",
		"startup.js",
		"pluginManager.js",
		"shortcutManager.js",
		"random.jpg",
		"supportManager.js",
		"updateManager.js",
		"viewManager.js",
		"views/createNew.html",
		"views/deleteConfirmation.html",
		"views/workplace.html",
		"dependencies/js/hextra.js",
		"dependencies/js/jquery.js",
		"dependencies/js/hextra_controller.js",
		"dependencies/css/core.css",
		"dependencies/css/hextra.css",
		"assets/reo.js",
		"assets/webKS.css",
		"assets/WebKS.js",
		"assets/reo.css"
	],
	jobCounter:0,
	poll:undefined,
	pollers:[]
}

eventManager.triggerEvent('updating','checking','Checking server for latest updates...');

$( "<p></p>" ).load("https://hydrogenEditor.github.io/version.json",function(){
	analyseOnlineVersion( JSON.parse( $(this).html() ) );
});

function analyseOnlineVersion(versionContent){
	var version = {
		local:hydrogenInformationPack.version,
		remote:versionContent.version
	}
	var gotUpdate = false;
	var vl = explodeVersionNumbers(version.local);
	var vr = explodeVersionNumbers(version.remote);
	if (vl.major == vr.major){
		if (vl.minor == vr.minor){
			if (vl.release == vr.release){
				if (vl.build < vr.build){
					gotUpdate = true;
				}
			}
			else if (vl.release < vr.release){
				gotUpdate = true;
			}
		}
		else if (vl.minor < vr.minor){
			gotUpdate = true;
		}
	}
	else if (vl.major < vr.major){
		gotUpdate = true;
	}
	console.log([vl,vr]);
	if (gotUpdate){
		askUserUpdate(versionContent.important,versionContent)
	}
}

function askUserUpdate(important,info){
	// if (hydrogenInformationPack.channel == info.channel && hydrogenInformationPack.status == info.status && info.target.indexOf(hydrogenInformationPack.platform) != -1) return;
	if (important == 'true'){
		getAndInstallUpdates()
	}
	else if (confirm('A '+info.status+' release is available now for users on the '+info.channel+' channel. Would you like to install it?')) {
		getAndInstallUpdates()
	} else {
		eventManager.triggerEvent('updating','cancelled','Cancelled by the user!');
		return;
	}
}

function getAndInstallUpdates(){
	eventManager.triggerEvent('updating','working','Calculating updates...');
	console.log("Update installing");
	try{
		require("fs").mkdirSync(rootFolder + wsFolder.substr(0,wsFolder.lastIndexOf("/")) + "/packs")
	}
	catch(xxs){
		console.log("packs folder already exists");
	}
	$("*").css({"filter":"blur(2px)"});
	startPoll();
	eventManager.triggerEvent('updating','download','downloading updates...');
	hydrogenInformationPack.jobCounter = hydrogenInformationPack.updatables.length-1;
	for (var i = 0; i < hydrogenInformationPack.updatables.length; i++) {
		download(hydrogenInformationPack.updatables[i]);
	}
}

function explodeVersionNumbers(vn){
	var [major,minor,release,build] = vn.split(".");
	return {
		'major':parseInt(major),
		'minor':parseInt(minor),
		'release':parseInt(release),
		'build':parseInt(build)
	}
}

function download(filename){
	var http = require('https');
	var fs = require('fs');

	var file = fs.createWriteStream("./"+filename);
	var request = http.get("https://hydrogeneditor.github.io/hydrogen3_download/IDE/"+filename, function(response) {
	  response.pipe(file);
	  hydrogenInformationPack.jobCounter -= 1;
	  eventManager.triggerEvent('updating','installing',file);
	  if (hydrogenInformationPack.jobCounter <= 0){
	  	endPoll();
	  	eventManager.triggerEvent('updating','completed','Updates were installed successfully');
	  }
	});
}

function startPoll(){
	hydrogenInformationPack.poll = setInterval(function(){
		for (var i = 0; i < hydrogenInformationPack.pollers.length; i++) {
			hydrogenInformationPack.pollers[i]( hydrogenInformationPack.jobCounter )
		}
	},100);
}

function endPoll(){
	clearInterval(hydrogenInformationPack.poll);
	for (var i = 0; i < hydrogenInformationPack.pollers.length; i++) {
		hydrogenInformationPack.pollers[i]( hydrogenInformationPack.jobCounter )
	}
	hydrogenInformationPack.pollers = [];
	alert("Updates installed! Performing quick reload. . .");
	location = 'index.html';
	location.reload();
}

function pollStatus(fn){
	hydrogenInformationPack.pollers.push(fn)
}

eventManager.onEvent('updating',function(s){
	console.log(s);
})

$('#xvers').html("Version: "+hydrogenInformationPack.version);
