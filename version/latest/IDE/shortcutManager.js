

let io = {
	keys:{
		ctrl:17,
		cmd:91,
		v:86,
		c:67,
		x:88,
		s:83,
		z:90,
		y:89,
		shift:16,
		alt:18,
		q:81,
		u:85,
		t:84,
		n:78,
		r:82,
		e:69,
		b:66,
		m:77
	},
	activeKeys:{
		ctrl:false,
		shift:false,
		alt:false
	}
}

$(document).keydown(function(e) {
	if (e.keyCode == io.keys.ctrl || e.keyCode == io.keys.cmd) io.activeKeys.ctrl = true;
	if (e.keyCode == io.keys.shift) io.activeKeys.shift = true;
	if (e.keyCode == io.keys.alt) io.activeKeys.alt = true;
}).keyup(function(e) {
	if (e.keyCode == io.keys.ctrl || e.keyCode == io.keys.cmd) io.activeKeys.ctrl = false;
	if (e.keyCode == io.keys.shift) io.activeKeys.shift = false;
	if (e.keyCode == io.keys.alt) io.activeKeys.alt = false;
});

$(document).on('keydown','#editor',function(e) {
	if (io.activeKeys.ctrl && (e.keyCode == io.keys.s)) eventManager.triggerEvent('shortcutCalled','SAVE','Save keyboard shortcut');
	if ((io.activeKeys.shift && io.activeKeys.ctrl) && (e.keyCode == io.keys.n)) eventManager.triggerEvent('shortcutCalled','NEW','New keyboard shortcut');
	if (io.activeKeys.ctrl && (e.keyCode == io.keys.r)) eventManager.triggerEvent('shortcutCalled','RUN','Run keyboard shortcut');
	if (io.activeKeys.ctrl && (e.keyCode == io.keys.e)) eventManager.triggerEvent('shortcutCalled','EDIT','Edit keyboard shortcut');
	if (io.activeKeys.ctrl && (e.keyCode == io.keys.b)) eventManager.triggerEvent('shortcutCalled','BUILD','Build keyboard shortcut');
	if ((io.activeKeys.shift && io.activeKeys.ctrl) && (e.keyCode == io.keys.m)) eventManager.triggerEvent('shortcutCalled','BACK','Back keyboard shortcut');
});

eventManager.onEvent('shortcutCalled',function(x){
	switch(x.details) {
		case 'SAVE':
			saveEditorContent()
			break;
		case 'NEW':
			createItemPanel()
			break;
		case 'RUN':
			runProject();
			break;
		case 'EDIT':
			openLiveEditor();
			break;
		case 'BACK':
			saveEditorContent();
			location = 'index.html';
			break;
		case 'BUILD':
			buildManager.buildCurrent();
			break;
		default:
			console.log("Unknown shortcut " + x.details)
	}
});