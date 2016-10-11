"use strict";

var gui = require('nw.gui');
var ismax = false;
var win = gui.Window.get();
var nextMove = "";
var statusBarColor = "white";
var statusBarBackground = "deepskyblue";
var liveEditorOpened = false;

let UI = {
	editor:{
		focus:function(){
			$('#editor').css({
        				"zIndex":"1"
    			});
		}
	},
	drawbar:{
		destroy:function(){
			$("#drawbar").hide();
		}
	},
	tree:{
		loadStarter:function(){
			var dataSet = require('fs').readFileSync('templates/starter.json','utf8');
			$('#tree').treeview({
				data: dataSet,
				showBorder:false
			});
		}
	}
}

let sessionManager = {
	newTemp:function(text,mode){
		var a = ace.createEditSession(text,mode);
		editor.setSession(a);
		editor.getSession().setUseWrapMode(true);
		currentlyLoadedPath = "";
	},
	applyToPath:function(path){
		editSessions[path] = editor.getSession();
		currentlyLoadedPath = path;
	},
	changeSession:function(path){
		if (editSessions[path] == undefined){
			var a = ace.createEditSession("","");
			editSessions[path] = a;
			editor.setSession(a);
			editor.getSession().setUseWrapMode(true);
			UI.editor.focus();
		}
		else{
			editor.setSession(editSessions[path]);
		}
		currentlyLoadedPath = path;
		if (getFileExtension(path).toLowerCase() == "html"){ lastHTMLpath = path }
	},
	removeSession:function(path){
		editSessions[path] = undefined;
	}
}

var editSessions = {};
var currentlyLoadedPath = "";
var lastHTMLpath = "";

//editSessions holds keyValue pair > path : session

function changeStatus(newstat,sec){
	sec = (sec || 2);
	changeStatusAnimated(newstat);
	setTimeout(function(){
		hideStatus();
	},sec*1000)
}

function changeStatusNegative(newstat,sec){
	sec = (sec || 2);
	changeStatusAnimated(newstat,"bad");
	setTimeout(function(){
		hideStatus();
	},sec*1000)
}

function changeStatusAnimated(newstat,dir){
	$('#bottomBar').css({color:"deepskyblue",background:'deepskyblue'});
	$('#bottomBar').html("<strong>"+newstat+"</strong>");
	if (dir != "bad") {
		$('#bottomBar').css({	color:"white",background:'#00C853' });
	}
	else{
		$('#bottomBar').css({	color:"white",background:'#ff1744' });
	}
}

function hideStatus(){
	$('#bottomBar').css({color:"deepskyblue",background:"deepskyblue"});
	$('#bottomBar').html("");
}

function hideSearchResults(){
	$("#searchResults").empty();
	$('#searchBar').val("");
	$('#tree').treeview('search', [ "", {
	  		ignoreCase: true,     // case insensitive
	  		exactMatch: false,    // like or equals
	  		revealResults: true,  // reveal matching nodes
		}]);
}

function showSearchResults(terms){
	eventManager.triggerEvent('searching',terms);
	if (terms.indexOf("file:") == 0){

	}
	else{
		$("#searchResults").empty();

		$('#tree').treeview('search', [ terms, {
	  		ignoreCase: true,     // case insensitive
	  		exactMatch: false,    // like or equals
	  		revealResults: true,  // reveal matching nodes
		}]);

		var occurences = countInstances(editor.getSession().getValue(),terms);
		for (var i = 0; i < occurences; i++) {
			var res = undefined;
			res = editor.find(terms);
			if (res != undefined) $("#searchResults").append( $("<div class='searchItem'>Found '"+terms+"' in current document on line "+(res.start.row+1)+"</div>") );

		}
		

	}
}

function countInstances(string, word) {
	   var substrings = string.split(word);
	   return substrings.length - 1;
}

(function(){
	setTimeout(function(){

		$('.cmdhover').mouseover(function(){
			$('#bottomBar').empty();
			$('#bottomBar').append( $('<span style="text-align:right;position: absolute;width: 59.8%;color: white;right: 20.2%;">'+$(this).data('label')+'</span>') );
		});

		$('.cmdhover').mouseleave(function(){
			$('#bottomBar').empty();
		});

		$(document.body).on('click','.blankPanel>div>.inline',function(){
			$('.blankPanel>div>.inline').removeClass('sel');
			$(this).toggleClass('sel');
		});
		$(document.body).on('click','#ctrl-close',function(){
			$('#panel_Create_new').remove();
		});

		$(document.body).on('click','#cmd_save',function(){
			saveEditorContent();
		});
		$(document.body).on('click','#cmd_build',function(){
			buildManager.buildCurrent();
		});
		$(document.body).on('click','#cmd_projsel',function(){
			saveEditorContent();
			location = 'index.html';
		});
		$(document.body).on('click','#cmd_newitm',function(){
			createItemPanel();
		});
		$(document.body).on('click','#cmd_addmedia',function(){
			openLiveEditor();
		});
		$(document.body).on('click','#cmd_delete',function(){
			var curpath = buildPathFromTree( $('#tree').treeview('getSelected')[0] ).direct;
			if (curpath != undefined) 
				{
					createDeleteItemPanel(curpath);
				}
			
		});
		$(document.body).on('click','#cmd_run',function(){
			runProject();
		});

		$(document.body).on('click','#cmd_undo',function(){
			editor.undo(); 
		});

		$(document.body).on('click','#cmd_redo',function(){
			editor.redo();
		});

		$(document.body).on('click','#create-item-button',function(){
			createItemPanelBEGIN();
		});
	},1000);
})();

function runScript(e,m) {
	if (m=='newItem'){
		if (e.keyCode == 13) {
			createItemPanelBEGIN();
		}
	}
	else{
		if (e.keyCode == 13) {
			createProject(document.getElementById('new-project-name').value);
		}
	}
}

function createItemPanelBEGIN(){
	if (createItemPanelContent!=""){
		saveEditorContent();
		createWSItem( $('#create-item-input').val() , $('.blankPanel>div>.inline.sel>h3').text() , createItemPanelContent );
	}
	else{
		saveEditorContent();
		createWSItem( $('#create-item-input').val() , $('.blankPanel>div>.inline.sel>h3').text() );
	}
	$('#panel_Create_new').remove();
}

function openLiveEditor(){
	if ( $('ul.breadcrumb>li:last').text().split('.').pop() == "html" ) {
		if (buildManager.buildCurrent() == true) {
			$('.liveEditor').toggleClass('bye');
			$('.liveEditor').attr("src","file://"+$('ul.breadcrumb>li').append('/').text().replace("My Project",rootFolder + wsFolder+"/"+ finalFolder + "/" + workingFolder).slice(0, -1));
			$(this).toggleClass('bactive');
			liveEditorOpened = !liveEditorOpened;

			if ( $(".liveEditor").hasClass("bye")==false ){
				reo.clearAll();
				reo.hide();
			}

			var __dirname = fs.realpathSync('.');
			var $head = $(".liveEditor").contents().find("head");

			setTimeout(prick,300);
			$head.append($("<link/>", { rel: "stylesheet", href: "file://"+__dirname+"/dependencies/css/hextra.css", type: "text/css" }));
		}
		$('ul.breadcrumb>li').text(function (_,txt) {
				return txt.slice(0, -1);
		});	
	}
	else{
		if (lastHTMLpath != "" && buildManager.buildCurrent() == true){
			$('.liveEditor').toggleClass('bye');
			$('.liveEditor').attr("src","file://"+lastHTMLpath);
			$(this).toggleClass('bactive');
			liveEditorOpened = !liveEditorOpened;
			if ( $(".liveEditor").hasClass("bye")==false ){
				reo.clearAll();
				reo.hide();
			}

			var __dirname = fs.realpathSync('.');
			var $head = $(".liveEditor").contents().find("head");

			setTimeout(prick,300);
			$head.append($("<link/>", { rel: "stylesheet", href: "file://"+__dirname+"/dependencies/css/hextra.css", type: "text/css" }));
		}
	}
}

function runProject(){
	if ( $('ul.breadcrumb>li:last').text().split('.').pop() == "html" ) {
		if (buildManager.buildCurrent() == true) {
			views.create.preview.location( "file://"+$('ul.breadcrumb>li').append('/').text().replace("My Project",rootFolder + wsFolder+"/"+ finalFolder + "/" + workingFolder).slice(0, -1) );
		}
		$('ul.breadcrumb>li').text(function (_,txt) {
				return txt.slice(0, -1);
		});
	}
	else{
		if (buildManager.buildCurrent() == true) views.create.preview.location( "file://" + lastHTMLpath );
	}
}

function bumpRecents(name,path){
	var recentsObj = JSON.parse( require('fs').readFileSync(global.__dirname+'/assets/mem.json') );
	if (recentsObj.recents[name] == undefined) recentsObj.recents[name] = {};
	if (recentsObj.recents[name].count != undefined){
		recentsObj.recents[name].count +=1;
	} 
	else{
		recentsObj.recents[name].path = path;
		recentsObj.recents[name].count = 1;
	}
	require('fs').writeFileSync(global.__dirname+'/assets/mem.json', JSON.stringify( recentsObj ));
}

function remove_CreatePanel(){
	$('#getStartedBox').css({
		"zIndex":"-1",
		"visibility":"hidden",
		"pointerEvents":"none"
	});
	enable_editor();
}

function goto_create(){
	nextMove = "create";
	views.main.change('workplace');
}

function goto_continue(){
	nextMove = "continue";
	views.main.change('workplace');
}

function max_h(){
	if (ismax == false) {
		win.maximize();
		ismax=true;
	}
	else{
		win.unmaximize();
		ismax=false;
	}
}

function saveEditorContent(){
	if (currentlyLoadedPath == ""){
		changeStatusNegative("UNABLE TO SAVE. Select file first",3);
		eventManager.triggerEvent('saveError');
	}
	else{
		fs.writeFileSync( currentlyLoadedPath , editor.getSession().getValue() );	
		changeStatus("SAVED!",1);
		eventManager.triggerEvent('save');
	}
	if (liveEditorOpened){
		clearEditables();
		var html_pretty = require('js-beautify').html;
		var documentContent =  html_pretty( "<!DOCTYPE html><html>" + $(".liveEditor").contents().find("html").html() + "</html>" , { 
			indent_size: 4,
			indent_char:" ",
			indent_with_tabs:true,
			end_with_newline:false,
			indent_inner_html:true,
			wrap_line_length:0,
			unformatted:["pre","code"]
		 } ) ;
		fs.writeFileSync( currentlyLoadedPath , documentContent);	
		changeStatus("SAVED!",1);
		eventManager.triggerEvent('save');
		editor.getSession().setValue(documentContent);
		editor.getSession().setUseWrapMode(true);
	}
}

function enable_editor(){
	$("#editor,#editor *").children().prop('disabled',false);
	$("#editor").css('opacity',1);
	$("#editor").parent().css('background','white');
}

function disable_editor(){
	$("#editor,#editor *").children().prop('disabled',true);
	$("#editor").css('opacity',0);
	$("#editor").parent().css('background','gainsboro');
}

var createItemPanelContent = "";

function createItemPanel(withContent){
	views.create.panel();
	views.load.into('#panel_Create_new','createNew');
	views.add.closeButton();
}

function createDeleteItemPanel(withContent){
	views.create.panel();
	views.load.into('#panel_Create_new','deleteConfirmation');
	views.add.closeButton();

	var path = require('path');
	var file = withContent;
	var filename = path.parse(file).base;

	$('#delText').text('Are you sure you want to delete '+filename+'?');

	$('#yesDelete').on('click',function(){
		if (checkTypePath(file) == 'directory') {
			deleteFolderRecursive(file);
		}
		else{
			require('fs').unlinkSync(withContent);
		}
		changeStatus('Deleted '+withContent+'!',1);
		var struct = dirTree(rootFolder + wsFolder + "/" + workingFolder);
		var treeX = genTreeJSON(struct);
		$('#tree').treeview({data:treeX});
		sessionManager.removeSession(withContent);
		ace.edit("editor").getSession().setValue("");
		refreshTree();
		setupTree();
		views.close.panel();
	});

	$('#noDelete').on('click',function(){
		views.close.panel();
	});
}

function shaveOffExtraSep(path){
	var wordSoFar = "";
	for (var i = 0; i < path.length; i++) {
		if (path[i] == "/" && i == (path.length-1)){
			break;
		}
		else{
			wordSoFar += path[i];
		}
	}
	return wordSoFar;
}

function checkTypePath(path){
	var fs = require('fs');
	var theType = "";
	try {
	    stats = fs.lstatSync(path);
	    if (stats.isDirectory()) theType = "folder";
	    if (stats.isFile()) theType = "file";
	}
	catch (e) {
	    theType = "unknown";
	}
	return theType;
}

function treePathParentDir(path,stopCount){
	stopCount = (stopCount || 1);
	path = path.split("/").join("/");
	var sepCount = path.replace(/[^/]/g, "").length;
	var encountered = 0;
	var wordSoFar = "";
	for (var i = 0; i < path.length; i++) {
			wordSoFar += path[i];
		if (path[i] == "/"){
			encountered += 1;
			if (encountered == sepCount - stopCount) break;
		}
	}
	return wordSoFar;
}

win.on('close', function() {
	this.hide();
	saveEditorContent();
	this.close(true);
});
