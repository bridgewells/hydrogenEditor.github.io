eventManager.triggerEvent('startUpComplete');

function getFilesInFolder(fpath){
	var filesHere = require("fs").readdirSync(fpath);
	return filesHere;
}

var pathSorted = getFilesInFolder(rootFolder + wsFolder)
for (var i = pathSorted.length - 1; i >= 0; i--) {
	var fs = require('fs');
	try {
		stats = fs.lstatSync(rootFolder + wsFolder+"/"+pathSorted[i]);
		if (stats.isDirectory()) {
			var nameSorted = require('path').basename(pathSorted[i]);
		    	$('#recentsListSide ul').append( $('<a href="#" onclick="goto_continue();setCurrentWS(\''+nameSorted+'\')"><li>'+nameSorted+'</li></a>') )
		}
	}
	catch (e) {
		console.log(e)
	}				
}

var timer = null;

$('#recentsListSide ul').on('mousedown','a',function(){
	var s = $(this).find('li')[0].innerHTML;
	timer = setTimeout( function(){
		doStuff(s)
	}, 1500 );
});

$('#recentsListSide ul').on('mouseup','a',function(e){
	clearTimeout( timer );
});

function doStuff(l) {
  	if (confirm('Would you like to delete '+l+'?')) {
		deleteFolderRecursive(rootFolder+wsFolder+"/"+l);
		location.reload();
	}
	else{
		console.log('Not deleting ' + l)
	}
}