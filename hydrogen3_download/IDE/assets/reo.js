
$.fn.measure = function(fn){
	var el = $(this).clone(false);
	el.css({
		visibility:'hidden',
		position:'absolute'
	});
	el.appendTo('body');
	var result = fn.apply(el);
	el.remove();
	return result;
}

function jmeasure(obj,fn){
	var el = $(obj).clone(false);
	el.css({
		visibility:'hidden',
		position:'absolute'
	});
	el.appendTo('body');
	var result = fn.apply(el);
	el.remove();
	return result;
}

jQuery.fn.extend({
	getPath: function() {
		var pathes = [];

		this.each(function(index, element) {
			var path, $node = jQuery(element);

			while ($node.length) {
				var realNode = $node.get(0), name = realNode.localName;
				if (!name) { break; }

				name = name.toLowerCase();
				var parent = $node.parent();
				var sameTagSiblings = parent.children(name);

				if (sameTagSiblings.length > 1)
				{
					allSiblings = parent.children();
					var index = allSiblings.index(realNode) +1;
					if (index > 0) {
						name += ':nth-child(' + index + ')';
					}
				}

				path = name + (path ? ' > ' + path : '');
				$node = parent;
			}

			pathes.push(path);
		});

		return pathes.join(',');
	}
});





class reoVisual{
	constructor(obj){
		this.$component = $(obj.component);
		this.eventTracker = new CustomEvent("reo_changed");
		this.stylesManaged = [];
		this.targetObject = undefined;
	}
	triggerChange(){
		document.body.dispatchEvent(this.eventTracker);
	}
	changeTarget(newTarget){
		this.targetObject = newTarget;
	}
	init(){
		this.$component.addClass("reoEditor");
		this.$component.append( $("<div class='reo_title'>REO</div>") );
		this.$component.append( $("<div class='reo_heading'>reio/component</div>") );


		$(document.body).on("click",".reo_prop",function(){
			var skip = false;
			if ( $(this).hasClass('opened') ) skip = true;
			$(".reo_prop").removeClass("opened");
			if (skip == false) $(this).toggleClass("opened");
		});

		$(document.body).on("click",".reo_prop_container",function(event){
			if (event.stopPropagation) {    // standard
				event.stopPropagation();
			} else {    // IE6-8
				event.cancelBubble = true;
			}
		});
	}
	show(){
		$(".reoEditor").css("right","0px");
	}
	hide(){
		$(".reoEditor").css("right","-350px");
	}
	addProperty(title,names){
		var prop = $("<div class='reo_prop'></div>");
		var prop_name = $("<span class='reo_prop_name'>"+title+"</span>");

		prop.append(prop_name);

		this.$component.append( prop );

		for (var i = 0; i < names.length; i++) {
			var prop_container = $("<div class='reo_prop_container'></div>");
			var prop_title = $("<span>"+names[i].split(":")[0]+"</span>");
			prop_container.append( prop_title );

			// var p_t_w = prop_title.measure(function(){ return this.width() });
			// var p_c_w = prop_name.measure(function(){ return this.width() });
			var p_t_w = jmeasure(prop_title,function(){ return this.width() });
			var p_c_w = 300;

			var prop_input = $("<input type='text' value='"+names[i].split(":")[1]+"'></input>");
			prop_input.width(300);
			prop_input.css({
				float:'right'
			});

			var r = this;
			var n = names[i];

			var typingTimer;                //timer identifier
			var doneTypingInterval = 400;  //time in ms, 0.4 second for example
			var $input = prop_input;

			//on keyup, start the countdown
			$input.on('keyup', function (event) {
				clearTimeout(typingTimer);
				typingTimer = setTimeout(function(){
					doneTyping(event);
				}, doneTypingInterval);
			});

			//on keydown, clear the countdown 
			$input.on('keydown', function () {
				clearTimeout(typingTimer);
			});

			//user is "finished typing," do something
			function doneTyping (event) {
				reo_update_properties( r , $(event.target).siblings().html() , $(event.target).val() );
				console.log( $(event.target).siblings().html() );
			}

			prop_container.append( prop_input );

			//Enter autocomplete stuff here
			wks.getCSSdescription(names[i].split(":")[0],function(b){
				console.log([b.values[0],b.name]);
				prop_input.autocomplete({
					source: b.values
				});
			})

			prop.append( prop_container );
		}

	}
	clearAll(){
		this.$component.empty();
	}
	onChanged(fn){
		document.body.addEventListener('reo_changed',fn,false);
	}
	genID(){
		return Math.random().toString(36).substr(2, 16);
	}
}

function reo_update_properties(self, propName,propValue){
	self.targetObject.style[propName] = propValue;
	console.log([self,propName,propValue]);
	// syncProperties(self)
}

function getAllCSS(){
	var pstyles = window.getComputedStyle(document.body);
	var listStyles = [];
	for (var prop in pstyles){
		if ($.isNumeric(prop) == false){
			listStyles.push(prop);
		}
	}
	return listStyles;
}

function syncProperties(self){
	reo.clearAll();
	reo.$component.addClass("reoEditor");
	// reo.$component.append( $("<div class='reo_title'>REO</div>") );
	// reo.$component.append( $("<div class='reo_heading'>reio/component</div>") );
	var alpha_props = {};
	var pstyles = window.getComputedStyle(self.targetObject);
	var listStyles = [];
	for (var prop in pstyles){
		if ($.isNumeric(prop) == false){
				listStyles.push(prop);
		}
		if (pstyles.hasOwnProperty(prop)){
			// if ($.isNumeric(prop) == false) reo.addProperty(prop,[prop]);
			if ($.isNumeric(prop) == false){
				var firstChar = prop[0];
				if (alpha_props[firstChar] == undefined){
					alpha_props[firstChar] = [];
				}
				var y = {};
				y[prop] = pstyles[prop];
				alpha_props[firstChar].push(y);
			}
		}
	}

	var letters = "abcdefghijklmnopqrstuvwxyz";

	for (var i = 0; i < letters.length; i++) {
		var category = alpha_props[letters[i]];
		var cont = [];
		if (category != undefined){
			for (var x = 0; x < category.length; x++) {
				var opt_json = category[x];
				for (var k in opt_json){
					cont.push(k +":"+ opt_json[k]);
				}
			}
		}
		reo.addProperty(letters[i] , cont);
	}

	return {
		"ordered":alpha_props,
		"list":listStyles
	}
	// reo.addProperty("Properties",styleList);
}