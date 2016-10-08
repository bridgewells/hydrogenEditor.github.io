
	function hoveringOver(item){
		if ( item.tagName != "IMG" ) {
			$(item).attr("contentEditable","");
			$(item).mouseleave(function(){
				$(item).removeAttr("contentEditable");
			});
		}
	}

	var lastItem = undefined;

	function clickingOver(item){
		if ( item.tagName != "IMG" ) {
			$(item).attr("contentEditable","");
			$(item).mouseleave(function(){
				$(item).removeAttr("contentEditable");
			});
			$(this).effect("highlight", {}, 1000);
		}
	}

	// if (lastItem != item) reo.changeTarget( item );
			// if (lastItem != item) syncProperties(reo);
			// lastItem = item;
			// reo.show();
			// $(".liveEditor").css("width","calc(100% - 300px)")