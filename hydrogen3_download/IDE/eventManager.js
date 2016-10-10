"use strict";

let eventSet = {
	build:null,
	run:null,
	save:null,
	undo:null,
	redo:null,
	changedSession:null,
	changedState:null,
	loading:null
}

let eventManager = {
	triggerEvent:function(eventName,details,comment){
		eventSet[eventName].details = details;
		eventSet[eventName].description = comment;
		dispatchEvent(eventSet[eventName]);
	},
	onEvent:function(eventName,doFunction){
		addEventListener(eventName, function(e){ doFunction(e) },true);
	},
	createEvent:function(eventName){
		eventSet[eventName] = document.createEvent('Event');
		eventSet[eventName].initEvent(eventName,true,true);
		console.log('Created and Initialised '+ eventName);
		return eventSet;
	}
}

	eventManager.createEvent('building');
	eventManager.createEvent('compiling');
	eventManager.createEvent('buildError');
	eventManager.createEvent('compileError');
	eventManager.createEvent('buildComplete');
	eventManager.createEvent('compileComplete');
	eventManager.createEvent('save');
	eventManager.createEvent('saveError');
	eventManager.createEvent('run');
	eventManager.createEvent('undo');
	eventManager.createEvent('redo');
	eventManager.createEvent('changedSession');
	eventManager.createEvent('changedState');
	eventManager.createEvent('loading');
	eventManager.createEvent('startingUp');
	eventManager.createEvent('startUpComplete');
	eventManager.createEvent('readyForPlugin');
	eventManager.createEvent('searching');
	eventManager.createEvent('updating');
	eventManager.createEvent('shortcutCalled');
