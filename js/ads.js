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
	  initializeIMA();
	  videoElement.addEventListener('play', function(event) {
	    loadAds(event);
	  });
	  var playButton = document.getElementById('play-button');
	  playButton.addEventListener('click', function(event) {
	    videoElement.play();
	  });
	  playButton.focus({ preventScroll: false });
	 
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

window.addEventListener('load', function(event) {
  
});

window.addEventListener('resize', function(event) {
  console.log("window resized");
  if(adsManager) {
	    var width = videoElement.clientWidth;
	    var height = videoElement.clientHeight;
	    adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
	  }
});

function initializeIMA() {
  console.log("initializing IMA");
  adContainer = document.getElementById('ad-container');
  
  adContainer.addEventListener('click', adContainerClick);
  
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  
  adsLoader.addEventListener(
	      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
	      onAdsManagerLoaded,
	      false);
	  adsLoader.addEventListener(
	      google.ima.AdErrorEvent.Type.AD_ERROR,
	      onAdError,
	      false);

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener('ended', function() {
//    adsLoader.contentComplete();
	  loadAds();
  });

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21646396938/frid_androidtv_hotdrama_pr_1&description_url=https%3A%2F%2Fvideo.friday.tw%2F&tfcd=0&npa=0&sz=640x360%7C640x390%7C1024x768&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';
  //'https://pubads.g.doubleclick.net/gampad/ads?iu=/21646396938/frid_androidtv_generic_mr_1&description_url=https%3A%2F%2Fvideo.friday.tw%2F&tfcd=0&npa=0&sz=640x360%7C640x390%7C1024x768&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=&cust_params=friday_contenttype%3D4%26friday_contentid%3D1127';
	  //'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';
	  // 'https://pubads.g.doubleclick.net/gampad/ads?' +
    //   'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
    //   'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&' +
    //   'gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;
  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element

  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.loadVideoTimeout=20*1000;
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoElement, adsRenderingSettings);
  
  //監聽 VAST 事件
  adsManager.addEventListener(
	      google.ima.AdErrorEvent.Type.AD_ERROR,
	      onAdError);
  
  //觸發播放及暫停事件
  adsManager.addEventListener(
	      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
	      onContentPauseRequested);
  adsManager.addEventListener(
	      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
	      onContentResumeRequested);
  
  
  //觸發非線性廣告的播放
  adsManager.addEventListener(
	      google.ima.AdEvent.Type.LOADED,
	      onAdLoaded);
}

function adContainerClick(event) {
  console.log("ad container clicked");
  if(videoElement.paused) {
    videoElement.play();
    playing= true;
  } else {
    playing= false;
    videoElement.pause();
  }
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if(adsManager) {
    adsManager.destroy();
  }
}

//觸發非線性廣告的播放
function onAdLoaded(adEvent) {
  var ad = adEvent.getAd();
  if (!ad.isLinear()) {
    videoElement.play();
    playing= true;
  }
}

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
  adDisplayContainer.initialize();

  var width = videoElement.clientWidth;
  var height = videoElement.clientHeight;
  playing= true;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log("AdsManager could not be started:"+adError);
    videoElement.play();
  }
}

function hidePlayButton() {
    document.getElementById('play-button').style.display = 'none';
  }

  function showPlayButton() {
    document.getElementById('play-button').style.display = 'block';
  }