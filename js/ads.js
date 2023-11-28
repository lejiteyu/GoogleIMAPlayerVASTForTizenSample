var videoElement;
// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;

var adContainer;
var adDisplayContainer;
var adsLoader;
var posElement;
var durElement;
var playing = false;
var adsManager;

var adUrlList = [
                 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
                 //'https://pubads.g.doubleclick.net/gampad/ads?iu=/21646396938/frid_androidtv_generic_pr_2&description_url=https%3A%2F%2Fvideo.friday.tw%2F&tfcd=0&npa=0&sz=640x360%7C640x390%7C1024x768&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=&cust_params=friday_contenttype%3D3%26friday_contentid%3D3152',
                 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
                 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=',
                 
             ]

var adPos =0;
var adCanPlay = false;
var isPlayEnd=false;

//load進 共用的資料
jQuery.loadScript = function(url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

if (typeof someObject == 'undefined') $.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js', function() {
	 console.log("IMA initialize.");
	 console.log("IMA initialize.");

	 videoElement = document.getElementById('video-element');
   posElement = document.getElementById('position-element');
   durElement = document.getElementById('duration-element');
	 videoElement.addEventListener('loadedmetadata', function() {
		  // 取得視訊的播放時間
      getPlayTime();
		});
    videoElement.addEventListener("playing", (event) => {
      console.log("Video is no longer paused");
      hidePlayButton();
      playing= true;
      getPlayTime();
    });
    videoElement.addEventListener('play', function(event) {
       loadAds(event);
         //ADPlayer.playAds(event);
	    
     
	  });
    videoElement.addEventListener('ended', function(event) {
      console.log("Video is ended");
      adPos=0;
      isPlayEnd=true;
      adsLoaded=false;
      loadAds(event);
      //ADPlayer.playAds(event);
      
  });
	  var playButton = document.getElementById('play-button');
	  playButton.addEventListener('click', function(event) {
      adPos=0;
      isPlayEnd=false;
      adsLoaded=false;
	    videoElement.play();
	  });
     //Initialize the container. Must be done via a user action on mobile devices.
     
	  playButton.focus({ preventScroll: false });
    ADPlayer.init(
       adUrlList[adPos],
       //ad play complete
       function(){
           adPos++;
           if(adPos<adUrlList.length){
                   //更新Ad Url
                   setTimeout(function(){
                    adUrl = adUrlList[adPos];
                    ADPlayer.setUpIMA(adUrl);
                    adCanPlay = true;
                   },1000);
                
           }else{
               //
               $('#ad-container').hide();
                adCanPlay = false;
                if(!isPlayEnd)
                  videoElement.play();
                 playing= true;
                console.log("video play start.")
               
           }
       },
       //loaded start
       function(){
           console.log("ad loaded start.")
            videoElement.pause();
               $('#player-container').hide();
               $('#video-element').show();
               $('#ad-container').show();
               getPlayTime();
           
       },
       //ad play start
       function(){
           //ADPlayer.adTime=0;
           console.log("ad play start.")
           $('#player-container').hide();
           $('#video-element').show();
           $('#ad-container').show();
           videoElement.pause();
       },
       //adManager is created
       function(adManager){
           if(adCanPlay){
               ADPlayer.playAds();
               videoElement.pause();
           }
          
       }
    
    );
}); //讀取右側內容

//獲取播放時間
function getPlayTime(){
  var duration = videoElement.duration;
  var currentPosition = videoElement.currentTime;
  posElement.innerHTML=currentPosition;
  durElement.innerHTML=duration;
  console.log('視訊播放時間：'+currentPosition +'/'+ duration + ' 秒');
  if(playing) {
    setTimeout(() => {
      getPlayTime();
    }, 500);
  }else{
	  showPlayButton();
  }
 
}

window.addEventListener('resize', function(event) {
  console.log("window resized");
  if(ADPlayer.adsManager) {
	    var width = videoElement.clientWidth;
	    var height = videoElement.clientHeight;
	    ADPlayer.adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
	  }
});







function onContentPauseRequested() {
  playing= false;
	videoElement.pause();
	showPlayButton();
}

function onContentResumeRequested() {
	videoElement.play();
  playing= true;
  hidePlayButton();
}

function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if(adsLoaded) {
    return;
  }
  ADPlayer.playAds(event);
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  try{
	  if(event!=undefined)
		    event.preventDefault();
  }catch (e) {
	// TODO: handle exception
	  console.log("event error:"+e);
  }
 
  console.log("loading ads");
  
//Initialize the container. Must be done via a user action on mobile devices.
  videoElement.load();
 
  var width = videoElement.clientWidth;
  var height = videoElement.clientHeight;
  playing= true;
 
}

function hidePlayButton() {
    document.getElementById('play-button').style.display = 'none';
  }

  function showPlayButton() {
    document.getElementById('play-button').style.display = 'block';
  }