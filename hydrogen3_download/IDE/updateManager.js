

eventManager.triggerEvent('updating','checking','Checking server for latest updates...');

console.log("u");

// $.getJSON( "https://hydrogenEditor.github.io/version.json", function( data ) { 
// 	console.log(data) 
// });

var s = $( "<p></p>" ).load("https://hydrogenEditor.github.io/version.json",function(){
	console.log( $(this).html().version  )
});