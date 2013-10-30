//Global app varibale
var api_url         = "http://backend.local:8000/";
var user_playing    = null;
var game_start_time = Math.round(new Date().getTime() / 2000);
var timer_id        = 0;
var game_play_time  = 0;
var challenge_interval_id = 0;
var part_name       = "Grind";

//Check if user has checkin and start challenge
//----------------------------------------------------------------
function checkin(){
  if(challenge_interval_id != 0)
    return;

  if(user_playing != null){
    displayChallenge();
    challenge_interval_id = window.setInterval( function(){challenge()},2000 );
  } else {
    ajaxObject = new ajax(api_url+'checkinUser');
    ajaxObject.isPost = false;
    ajaxObject.onReady = function() {
      try {
          var jsend = JSON.parse( this.getText() );
      } catch(e) {
          console.log('checkin: invalid json');
          return;
      }

      if(jsend.status == "error") {
          console.log("error: "+jsend.message);
          return;
        }
        if(jsend.status == "fail"){
          console.log("Fail: "+jsend.data);
          return;
        }
        if(jsend.data != null)
          user_playing = jsend.data;
    }
    ajaxObject.send();
  }
}

//timer for checkking if user has checkin
window.setInterval( function(){checkin()},1000 );

//Check if challenge is completed
//----------------------------------------------------------------
function challenge(){
  ajaxObject = new ajax(api_url+'challenge');
  ajaxObject.isPost = false;
  ajaxObject.onReady = function() {
    try {
        var jsend = JSON.parse( this.getText() );
    } catch(e) {
        console.log('challenge: invalid json');
        return;
    }

    if(jsend.status == "error") {
        console.log("Error: "+jsend.message);
        return;
      }
      if(jsend.status == "fail"){
        console.log("Fail: "+jsend.data);
        return;
      }
      if(jsend.data != null) {
        //add score
        if(jsend.data >= 0) {
          addScoreToSidebar(user_playing.level.levelScore, user_playing.username, jsend.data);
        }

        //display chekin
        displayCheckin();

        //stop challenge interval id
        window.clearInterval(challenge_interval_id);
        challenge_interval_id = 0;
      }
  }
  ajaxObject.send();
}

//Displays the chekin page/element
//----------------------------------------------------------------
function displayCheckin(){
  var checkinDiv    = document.getElementById("checkin");
  var challengeDiv  = document.getElementById("challenge");
  checkinDiv.style.display = "block";
  challengeDiv.style.display = "none";
  document.getElementById('background-checkin').style.opacity = "100";
  document.getElementById('background-challenge').style.opacity = "0";
}

//Displays the checkin challenge page/element
//----------------------------------------------------------------
function displayChallenge(){
  var checkinDiv    = document.getElementById("checkin");
  var challengeDiv  = document.getElementById("challenge");
  var challenge     = user_playing.level;

  document.getElementById('background-checkin').style.opacity = "0";
  document.getElementById('background-challenge').style.opacity = "100";
  //Profile 
  document.getElementById("profile-pic").src = user_playing.avatarUrl;
  replaceHtmlElement("profile-name", user_playing.username);
  replaceHtmlElement("profile-score", user_playing.levelScore);
  setStars(user_playing.levelScore);
  
  //Challenge info
  replaceHtmlElement("challenge-level", challenge.levelNumb);
  replaceHtmlElement("challenge-title", challenge.title);
  replaceHtmlElement("challenge-attempt", user_playing.attempt);
  game_start_time = (new Date().getTime()/1000)+challenge.playTime;
  timer();
  timer_id = window.setInterval(timer,1000 );

  //Challenge extra info
  replaceHtmlElement("challenge-description-text", challenge.description);
  
  var html = "";
  for (var i = 0; i < challenge.topScores.length; i++) {
   html += "<p><span class='level-icon'>"+(i+1)+"</span>";
   html += challenge.topScores[i].username;
   html += "<span class='score'>"+challenge.topScores[i].score+" pt</span></p>";
  };
  replaceHtmlElement("challenge-scores", html);

  //play video
  var videoMp4 = document.getElementById("videoMp4");
  videoMp4.src = challenge.mp4_url;
  var videoOgg = document.getElementById("videoOgg");
  videoOgg.src = challenge.ogg_url;
  var video = document.getElementById("videoPlayer");
  video.load();
  video.play();

  checkinDiv.style.display = "none";
  challengeDiv.style.display = "block";
}

//----------------------------------------------------------------
function setStars(score){
  var challenge     = user_playing.level;
  var html = "";
  var scores = [challenge.one_star_score, challenge.two_star_score, challenge.three_star_score, challenge.four_star_score];
  for (var i = 0; i < 4; i++) {
    if(score >= scores[i]) {
      html += "<img src='img/star_full.png'> ";
    } else {
      html += "<img src='img/star_empty.png'> ";
    }
  };
  replaceHtmlElement("profile-stars", html);
}

//Displays the score popup
//----------------------------------------------------------------
function displayScore(level, player, score){

}

//Add the score to the sidebar
//----------------------------------------------------------------
function addScoreToSidebar(level, player, score){
  var parent    = document.getElementById("scores");
  var firstChild  = parent.firstChild;

  //Create score div element
  var scoreDiv = document.createElement("div");
  var html = "";
  html += "<p><span class='level-icon'>"+level+"</span>";
  html += player;
  html += "<span class='score'>"+score+" pt</span></p>";
  scoreDiv.innerHTML = html;
  
  parent.insertBefore(scoreDiv, firstChild);
  
  cleanOldScoreSidebar();
}

//----------------------------------------------------------------
function getKing(){
  ajaxObject = new ajax(api_url+'getKingPart/'+part_name);
  ajaxObject.isPost = false;
  ajaxObject.onReady = function() {
    console.log('getKing: run');
    try {
        var jsend = JSON.parse( this.getText() );
    } catch(e) {
        console.log('getKing: invalid json');
        return;
    }

    if(jsend.status == "error") {
      console.log("Error: "+jsend.message);
      return;
    }
    if(jsend.status == "fail"){
      console.log("Fail: "+jsend.data);
      return;
    }
    if(jsend.data != null){
      //set data
      document.getElementById('king-avatar').src = jsend.data.avatarUrl;
      replaceHtmlElement("king-name", jsend.data.username);
      replaceHtmlElement("king-score", jsend.data.score+"<span> pt</span>");
    }
  }
  ajaxObject.send();
}

//----------------------------------------------------------------
function getLatestScore(){
  ajaxObject = new ajax(api_url+'latestResultsParts/'+part_name);
  ajaxObject.isPost = false;
  ajaxObject.onReady = function() {
    console.log('getLatestScore: run');
    try {
        var jsend = JSON.parse( this.getText() );
    } catch(e) {
        console.log('getLatestScore: invalid json');
        return;
    }

    if(jsend.status == "error") {
         console.log("Error: "+jsend.message);
        return;
      }
      if(jsend.status == "fail"){
        console.log("Fail: "+jsend.data);
        return;
      }
      if(jsend.data != null){
        for (var i = jsend.data.length - 1; i >= 0; i--) {
          addScoreToSidebar(jsend.data[i].level, jsend.data[i].username, jsend.data[i].score);
        };
      }
  }
  ajaxObject.send();
}

//clear old score when list is bigger then 10
//----------------------------------------------------------------
function cleanOldScoreSidebar(){
  var sidebarContent    = document.getElementById("scores");
  while(sidebarContent.childNodes.length > 10)
    sidebarContent.removeChild( sidebarContent.childNodes[ sidebarContent.childNodes.length - 1 ] );
}

// Function for changing the innerHTML of element
//----------------------------------------------------------------
function replaceHtmlElement(id, html){
  var node = document.getElementById(id);
  if (node != null) {
    node.innerHTML = html;
    return true;
  }
  return false;
}

//Timer function
//----------------------------------------------------------------
function timer(){
    var time = -Math.round((new Date().getTime()/1000)- game_start_time);
    var node = document.getElementById("challenge-time");
    if(time >= 0) {
      minutes = Math.floor(time/60);
      seconds = time%60;
      node.innerHTML = minutes+':'+(seconds > 9 ? "" + seconds: "0" + seconds); 
    } else {
        node.innerHTML = "Time is up";
        window.clearInterval(timer_id);
    }
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
      var self = this;
  		xmlhttp.onreadystatechange = function(){
  			if (xmlhttp.readyState==4 && xmlhttp.status==200)
  				self.onReady();
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