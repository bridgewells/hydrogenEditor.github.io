
	Array.prototype.removeItem = function(item) {
		for(var i = this.length; i--;) {
			if(this[i] === item) {
			  this.splice(i, 1);
			}
		}
	}

	 Array.prototype.addItem = function(name) {
		var id = this.length + 1;
		var found = this.some(function (el) {
			return el === name;
		});
		if (!found) { this.push(name); }
	}

	function hoveringOver(item){
		if ( item.tagName != "IMG" ) {
			$(item).attr("contentEditable","");
			$(item).mouseleave(function(){
				$(item).removeAttr("contentEditable");
			});
			editables.addItem(item);
		}
	}

	var lastItem = undefined;
	var editables = [];

	function clearEditables(){
		for (var i = 0; i < editables.length; i++) {
			$(editables[i]).removeAttr("contentEditable");
		}
		editables = [];
	}

	function clickingOver(item){
		if ( item.tagName != "IMG" ) {
			$(item).attr("contentEditable","");
			$(item).mouseleave(function(){
				$(item).removeAttr("contentEditable");
			});
			$(this).effect("highlight", {}, 1000);
			editables.addItem(item);
		}
	}

	// if (lastItem != item) reo.changeTarget( item );
			// if (lastItem != item) syncProperties(reo);
			// lastItem = item;
			// reo.show();
			// $(".liveEditor").css("width","calc(100% - 300px)")