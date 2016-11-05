
var microManager = {
    isActive:false,
    viewPort:undefined,
    port:{
        path:'',
        refresh:function(){
            microManager.viewPort[0].src = microManager.port.path;
        }
    },
    start:function(){
        editor.on("input", function() {
            if(microManager.port.path != ''){
                saveEditorContent();
                microManager.port.refresh();
            }
        });
    },
    initialised:false,
    init:function(path){
        if (microManager.initialised == false) {
            microManager.initialised = true;
            views.create.appView.document(path);
        }
        else{
            microManager.port.path = path;
            microManager.port.refresh()
        }
    },
    appOptions:{
        create:{
            ios:function(name){
                fs.closeSync(fs.openSync(rootFolder + wsFolder+"/"+ workingFolder + "/build.json", 'w'));
                var c = {
                    'name':name,
                    'access':'com.myCompany.'+name.replace(' ','_'),
                    'platform':'ios',
                    'version':'0.0.0.1',
                    'type':'hybrid',
                    'permissions':[
                        'cordova-plugin-device',
                        'phonegap-plugin-push',
                        'cordova-plugin-splashscreen',
                        'cordova-plugin-network-information'
                    ]
                }
                fs.writeFileSync(rootFolder + wsFolder+"/"+ workingFolder + "/build.json",JSON.stringify(c, null, "\t"));
            }
        },
        buildFileExists:function() {
            return (checkTypePath(rootFolder + wsFolder + "/" + workingFolder + "/build.json") == 'file');
        },
        getBuildType:function(){
            if (microManager.appOptions.buildFileExists()){
                var bjsonObj = JSON.parse(fs.readFileSync(rootFolder + wsFolder + "/" + workingFolder + "/build.json",'utf8'));
                if (bjsonObj.platform == 'ios'){
                    return 'Apple App'
                }
                else if (bjsonObj.platform == 'android'){
                    return 'Android App'
                }
                else{
                    return bjsonObj.platform
                }
            }
            else{
                return 'Wesbite';
            }
        }
    }
};

