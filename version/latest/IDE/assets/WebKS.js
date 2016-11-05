// Web Knowledge Scraper

class webKnowledgeScraper{
  constructor(){
    this.container = $('<div class="wks_container"></div>');
    this.searchInput = $('<input type="text" class="wks_input"></input>');
    this.resultPane = $('<ol class="wks_results"></ol>');
    this.container.append(this.searchInput);
    this.container.append(this.resultPane);
    $(document.body).append(this.container);
    window.wks = this;
    this.searchInput.keypress(function(event){
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(keycode == '13'){
        window.wks.search($(this).val(),function(b){
          for (var i = 0; i < b.attributes.list.length; i++) {
            window.wks.resultPane.append( $("<li><span>"+b.attributes.list[i]+"</span><div class='wks_description'>"+b.attributes.def[i]+"</div></li>") );
          }
        });
        window.wks.container.addClass("opened");
      }
      else{
        window.wks.container.removeClass("opened");
        window.wks.resultPane.empty();
      }
    });
    $(document.body).on("click",".wks_results li",function(e){
      $(e.target).toggleClass("opened");
    });
    this.container.hide();
  }
  show(){
    this.container.show();
  }
  hide(){
    this.container.hide();
  }
  getCSSsuggestions(css){
    var temp = getAllCSS().filter(function(s){
            return ~s.toLowerCase().indexOf(css.toLowerCase());
      });
    return temp;
  }
  search(term,fn){
    if (term.toLowerCase().indexOf("css:") == 0){
      term = term.split(":")[1];
      var cssList = window.wks.getCSSsuggestions(term);
      for (var i = 0; i < cssList.length; i++) {
        console.log(JSON.stringify(cssList[i]));
        window.wks.getCSSdescription(cssList[i],function(x){
          if (x.name != undefined && x.summary != "") window.wks.resultPane.append( $("<li><span>"+x.name+"</span><div class='wks_description'>"+x.summary+"</div></li>") );
        });
      }
    }
    else{
      var contentObjectHolder = $("<main></main>");
      contentObjectHolder.load("https://developer.mozilla.org/en-US/docs/Web/HTML/Element/"+term,function(responseText,textStatus,e){
        contentObjectHolder.find("a").map(function(d){ 
          try{
            if ($(this).attr("href").indexOf("/en-US/docs/Web/HTML") == 0 || $(this).attr("href").indexOf("/en-US/docs/") == 0) {
              this.href="#";
            }
          }
          catch(cc){
            console.log($(this).attr("href"));
          }
        });
        if (textStatus != "error"){
          var x = contentObjectHolder.find("#wikiArticle");
          fn({
            "summary":$(x.find("p")[0]).text(),
            "snippet":$(x.find("pre")[0])[0],
            "properties":$(x.find("table.properties")[0])[0],
            "attributes":{
              "raw":$(x.find("dl")[0])[0],
              "list":x.find("dt>strong>code").map(function(n){ return this.innerHTML }),
              "def":x.find("dd").map(function(n){ return this.innerHTML })
            },
            "examples":x.find("pre:not(:first)"),
            "raw":x[0],
            "JavascriptRecommendation":x.find("h3#JavaScript_recommendations").next()[0]
          });
        }
        else{
          fn( {} );
        }
      });
    }
  }
  getTags(fn){
    var x = $("<main></main>");
    x.load("https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a",function(responseText,textStatus,e){
      if (textStatus != "error"){
        fn( x.find("#quick-links ol li a code").map(function(){ return $(this).text().split("<")[1].split(">")[0] }) );
      }
      else{
        fn( [] );
      }
    });
  }
  getCSSdescription(css,fn){
    var browserSafe = css.replace(/([a-z](?=[A-Z]))/g, '$1-').toLowerCase();
    fn = (fn || function(){});
    var x = $("<main></main>");
    x.load("https://developer.mozilla.org/en-US/docs/Web/CSS/"+browserSafe,function(responseText,textStatus,e){
      x.find("a").map(function(d){ 
          try{
            if ($(this).attr("href").indexOf("/en-US/docs/Web/HTML") == 0 || $(this).attr("href").indexOf("/en-US/docs/") == 0) {
              this.href="#";
            }
          }
          catch(cc){
            // console.log($(this).attr("href"));
          }
        });
        if (textStatus != "error"){
          x = x.find("#wikiArticle");
          fn({
            "summary":$(x.find("p")[0]).text(),
            "snippet":$(x.find("pre")[0])[0],
            "name":browserSafe,
            "properties":$(x.find("table.properties")[0])[0],
            "attributes":{
              "raw":$(x.find("dl")[0])[0],
              "list":x.find("dt>strong>code").map(function(n){ return this.innerHTML }),
              "def":x.find("dd").map(function(n){ return this.innerHTML })
            },
            "examples":x.find("pre:not(:first)"),
            "raw":x[0],
            "values":x.find("#Values").next().find("code").map(function(n){ return this.innerHTML })
          });
        }
        else{
          fn( {} );
        }
    });
  }
  getRelatedCSS(term,fn){
    fn = (fn || function(){});
    var x = $("<main></main>");
    x.load("https://developer.mozilla.org/en-US/docs/Web/CSS/"+term,function(responseText,textStatus,e){
      if (textStatus != "error"){
        fn( x.find("#quick-links ol li ol li em code, #quick-links ol li ol li a code").map(function(){ return $(this).text() }) );
      }
      else{
        fn( [] );
      }
    });
  }
}