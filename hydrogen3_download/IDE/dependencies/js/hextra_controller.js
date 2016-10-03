
	function hoveringOver(item){

	}

	function clickingOver(item){
		if ( item.tagName != "IMG" ) {
			$(item).attr("contentEditable","");
			$(item).mouseleave(function(){
				$(item).attr("contentEditable","false");
			})
		}
		else{
			
		}
	}