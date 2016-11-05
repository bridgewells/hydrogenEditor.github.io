
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
		},
		appView:{
			document:function(path){
				var $av = $('#appview');
				if ( $av[0] == undefined ){
					$av = $('<div id="appview"></div>');
					$(document.body).append($av)
					$av.css({
						'background':'white',
						'width':'300px',
						'right':'0',
						'position':'fixed',
						'height':'calc(100% - 39px)',
						'z-Index':'20',
						'top':'39px',
						'border-left':'1px solid gainsboro'
					});
					$('#editor').css('width','calc(80% - 300px)');
					$('#cssVisual').css('visibility','hidden');
					$av.append( $('<iframe class="frame" nwUserAgent="Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0" src="http://google.com"></iframe>') );
					$('#appview .frame').css({
						'height':'calc(100% - 100px)',
						'width':'calc(100% - 10px)',
						'margin':'5px',
						'border':'1px solid gainsboro'
					});
					console.log('appview'+path);
					microManager.isActive = true;
					microManager.viewPort = $av.find('.frame');
					microManager.port.path = 'file://'+path;
					microManager.port.refresh();
				}
				else{
					microManager.isActive = false;
					microManager.viewPort = undefined;
					$av.remove();
					views.create.appView.document(path);
				}

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