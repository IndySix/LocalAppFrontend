//Global app varibale
var api_url         = "http://145.89.96.50:8000/";
var score_item_count= 0;
var challenge_id    = null;
var user_playing    = null;
var game_start_time = Math.round(new Date().getTime() / 2000);
var game_play_time  = 0;
var challenge_interval_id = 0;

//Check if user has checkin and start challenge
function checkin(){
  if(challenge_interval_id != 0)
    return;

  if(user_playing != null){
    displayChallenge();
    challenge_interval_id = window.setInterval( function(){challenge()},2000 );
  } else {
    ajaxObject = new ajax(api_url+'user');
    ajaxObject.isPost = false;
    ajax.onReady = function() {
      try {
          var jsend = JSON.parse( ajaxObject.getText() );
      } catch(e) {
          console.log('checkin: invalid json');
          return;
      }

      if(jsend.status == "error") {
          alert(jsend.message);
          return;
        }
        if(jsend.status == "fail"){
          alert(jsend.data);
          return;
        }
        if(jsend.data != null)
          user_playing = jsend.data;
          challenge_id
    }
    ajaxObject.send();
  }
}

//timer for checkking if user has checkin
window.setInterval( function(){checkin()},1000 );

//Check if challenge is completed
function challenge(){
  //stop challenge interval id
  ajaxObject = new ajax(api_url+'challenge');
  ajaxObject.isPost = false;
  ajax.onReady = function() {
    try {
        var jsend = JSON.parse( ajaxObject.getText() );
    } catch(e) {
        console.log('challenge: invalid json');
        return;
    }

    if(jsend.status == "error") {
        alert(jsend.message);
        return;
      }
      if(jsend.status == "fail"){
        alert(jsend.data);
        return;
      }
      if(jsend.data != null) {
        window.clearInterval(challenge_interval_id);
        //display score

        //add score

        //display chekin
      }
  }
  ajaxObject.send();
}

//Displays the chekin page/element
function displayCheckin(){
  var checkinDiv    = document.getElementById("checkin");
  var challengeDiv  = document.getElementById("challenge");
  checkinDiv.style.display = "block";
  challengeDiv.style.display = "none";
}

//Displays the checkin challenge page/element
function displayChallenge(){
  var checkinDiv    = document.getElementById("checkin");
  var challengeDiv  = document.getElementById("challenge");
  var challenge     = user_playing.level;

  replaceHtmlElement("content-title", user_playing.username);
  replaceHtmlElement("challenge-title", "<span>"+challenge.order+"</span> "+challenge.title);
  replaceHtmlElement("description-text", challenge.description);
  
  var html = "";
  for (var i = 0; i < challenge.topScores.length; i++) {
   challenge.topScores[i];
   html += "<div><span>"+challenge.topScores[i].username+"</span> "+challenge.topScores[i].score+"</div>";
  };
  replaceHtmlElement("topScores-text", html);

  //play video
  // var videoMp4 = document.getElementById("videoMp4");
  // videoMp4.src = videos[movie].mp4Url;
  // var videoOgg = document.getElementById("videoOgg");
  // videoOgg.src = videos[movie].oggUrl;
  // var video = document.getElementById("videoPlayer");
  // video.load();
  // video.play();

  checkinDiv.style.display = "none";
  challengeDiv.style.display = "block";
}

//Displays the score popup
function displayScore(level, player, score){

}

//Add the score to the sidebar
function addScoreToSidebar(level, player, score){
  var parent    = document.getElementById("sidebar-content");
  var firstChild  = parent.firstChild;

  //Create score div element
  var scoreDiv = document.createElement("div");
  scoreDiv.innerHTML = level+" | "+player+" | "+score;

  parent.insertBefore(scoreDiv, firstChild);
  
  score_item_count++;
  cleanOldScoreSidebar();
}

//clear old score when list is bigger then 10
function cleanOldScoreSidebar(){
  var sidebarContent    = document.getElementById("sidebar-content");
  if(score_item_count > 9){
    sidebarContent.removeChild( sidebarContent.childNodes[ sidebarContent.childNodes.length - 1 ] );
    score_item_count--; 
  }
}

// Function for changing the innerHTML of element
function replaceHtmlElement(id, html){
  var node = document.getElementById(id);
  if (node != null) {
    node.innerHTML = html;
    return true;
  }
  return false;
}

// Ajax class
//----------------------------------------------------------------
function ajax(urlp) {
	var xmlhttp = null;
	var params = '';
	var url = urlp;
	
	this.onReady = function(){}
	this.isPost = false;

	this.getText = function(){
		if (xmlhttp != null) 
			return xmlhttp.responseText;
	}

	this.getXML = function() {
		if (xmlhttp != null) 
			return xmlhttp.responseXML;
	}

	this.addParam = function(name, value) {
		if(name == "")
			return false;

		if (params == "") {
			params = name+"="+encodeURIComponent(value);
		} else {
			params = params+"&"+name+"="+encodeURIComponent(value);
		}
		return true;
    }

    this.send = function(){
		if (window.XMLHttpRequest){
  			xmlhttp = new XMLHttpRequest();
  		} else {
  			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  		}

  		xmlhttp.onreadystatechange = function(){
  			if (xmlhttp.readyState==4 && xmlhttp.status==200)
  				ajax.onReady();
  		}

  		if (this.isPost) {
  			post();
  		} else {
  			get();
  		}
    }

    var post = function(){
    	xmlhttp.open("POST", url,true);
    	if (params == "") {
			xmlhttp.send();
    	} else {
    		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    		xmlhttp.send(params);
    	}
    }

    var get = function(){
    	if (params == "") {
    		xmlhttp.open("GET",url,true);
    	} else {
    		xmlhttp.open("GET",url+"?"+params,true);
    	}
    	xmlhttp.send();
    }
}