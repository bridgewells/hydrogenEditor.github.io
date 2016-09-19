
"use strict";

let views = {
	load:{
		popup:function(viewName){
			$("body").append( require('fs').readFileSync('views/'+viewName+'.html','utf8') );
		},
		into:function(target,viewName){
			$(target).append( require('fs').readFileSync('views/'+viewName+'.html','utf8') );
		}
	},
	create:{
		panel:function(){
			$("#panel_Create_new").remove();
			$("body").append( $('<div class="blankPanel" id="panel_Create_new" />') );
		},
		preview:{
			document:function(path){
				parent.chrome.browser.openTab({'url':'../'+path});
			},
			location:function(url){
				parent.chrome.browser.openTab({'url':url});
			}
		}
	},
	close:{
		panel:function(){
			$("#panel_Create_new").remove();
		}
	},
	add:{
		closeButton:function(){
			$("#panel_Create_new").append( $('<a class="controlSpace material-icons" id="ctrl-close">close</a>') );
		}
	},
	main:{
		change:function(newViewName){
			$("body").html( require('fs').readFileSync('views/'+newViewName+'.html','utf8') );
		}
	}
}