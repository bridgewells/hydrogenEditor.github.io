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


	// eventSet.build = document.createEvent('Event');  eventSet.build.initEvent('build', true, true);
	// eventSet.run = document.createEvent('Event'); eventSet.run.initEvent('run', true, true);
	// eventSet.save = document.createEvent('Event'); eventSet.save.initEvent('save', true, true);
	// eventSet.undo = document.createEvent('Event'); eventSet.undo.initEvent('undo', true, true);
	// eventSet.redo = document.createEvent('Event'); eventSet.redo.initEvent('redo', true, true);
	// eventSet.changedSession = document.createEvent('Event'); eventSet.changedSession.initEvent('changedSession', true, true);
	// eventSet.changedState = document.createEvent('Event'); eventSet.changedState.initEvent('changedState', true, true);
	// eventSet.loading = document.createEvent('Event'); eventSet.loading.initEvent('loading', true, true);

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
