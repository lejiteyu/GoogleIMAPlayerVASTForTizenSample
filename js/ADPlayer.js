
/**
 * Ref:https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side?hl=zh-tw
 * Ref:https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side?hl=zh-tw
 * Ref:Google Ads HTML5 DAI IMA SDK for Tizen Smart TVs :https://github.com/googleads/googleads-ima-tizen-dai
 */
  //'https://ad.doubleclick.net/ddm/pfadx/N1708956.5077296FRIDAY_TW/B30699153.377742570;'+
    // 'sz=0x0;dsp_xappb_0_=[ctv_appid];ord=[timestamp];dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;'+
    // 'dc_tdv=1;dcmt=text/xml;dc_sdk_apis=[APIFRAMEWORKS];dc_omid_p=[OMIDPARTNER];gdpr=${GDPR};gdpr_consent=${GDPR_CONSENT_755};dc_mpos=[BREAKPOSITION];'+
    // 'ltd=&cust_params=friday_contenttype%3D2%26friday_contentid%3D34';
    // 'https://pubads.g.doubleclick.net/gampad/ads?iu=/76486173/fet/frid_androidtv_generic_mr_1&description_url=net.fetnet.fetvod.tv&tfcd=0&npa=0&sz=640x360&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=[timestamp]&cust_params=friday_contenttype%3D2%26friday_contentid%3D34' 
      
    //Google sample
    //https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=
   
var ADPlayer={
    TAG:" #AD",
    adsManager:undefined,
    adsLoader:undefined,
    adDisplayContainer:undefined,
    intervalTimer:undefined,
    isAdPlaying:false,
    isAdLoading:false,
    isContentFinished:undefined,
    videoElement:undefined,
    adUrl:undefined,
    adContainer:undefined,
    adPlayCompleteCallBack:undefined,
    adLoadedCallBack:undefined,
    adPlayStartCallBack:undefined,
    adManagerCallBack:undefined,
    adTime:0,
    adTimeOld:-1,
    init:function(adUrl,adPlayCompleteCallBack,adLoadedCallBack,adPlayStartCallBack,adManagerCallBack){
        ADPlayer.adPlayCompleteCallBack = adPlayCompleteCallBack;
        ADPlayer.adLoadedCallBack=adLoadedCallBack;
        ADPlayer.adPlayStartCallBack=adPlayStartCallBack;
        ADPlayer.adManagerCallBack=adManagerCallBack;
        if(adUrl==""){
            adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
      'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&' +
      'output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';
        }
        console.log("initializing adUrl:"+adUrl);
        ADPlayer.adUrl=adUrl;
        ADPlayer.setUpIMA(adUrl);
    },
    /**
     * Sets up IMA ad display container, ads loader, and makes an ad request.
     */
    setUpIMA:function(adUrl){
       console.log("initializing IMA");
        // Create the ad display container.
        if(ADPlayer.adContainer==undefined)
            ADPlayer.adContainer = document.getElementById('ad-container');
        if(ADPlayer.videoElement==undefined)
            ADPlayer.videoElement = document.getElementById('video-element');
        if(ADPlayer.adDisplayContainer==undefined)
            ADPlayer.adDisplayContainer = new google.ima.AdDisplayContainer(ADPlayer.adContainer, ADPlayer.videoElement);

        // Create ads loader.
        if( ADPlayer.adsLoader==undefined){
            ADPlayer.adsLoader = new google.ima.AdsLoader(ADPlayer.adDisplayContainer);
           
    
            ADPlayer.adsLoader.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR, ADPlayer.onAdError, false);
            
            // An event listener to tell the SDK that our content video
            // is completed so the SDK can play any post-roll ads.
            ADPlayer.videoElement.addEventListener('ended', function() {
                // An ad might have been playing in the content element, in which case the
                // content has not actually ended.
                ADPlayer.adsLoader.contentComplete();
            });
        }

         // Listen and respond to ads loaded and error events.
         ADPlayer.adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            ADPlayer.onAdsManagerLoaded, false);
       

      
        // Request video ads.
        var adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = adUrl;
        console.log(" adUrl:"+adsRequest.adTagUrl);
        // Specify the linear and nonlinear slot sizes. This helps the SDK to
        // select the correct creative if multiple are returned.
        adsRequest.linearAdSlotWidth = ADPlayer.videoElement.clientWidth;
        adsRequest.linearAdSlotHeight = ADPlayer.videoElement.clientHeight;
        adsRequest.nonLinearAdSlotWidth =ADPlayer.videoElement.clientWidth;
        adsRequest.nonLinearAdSlotHeight = ADPlayer.videoElement.clientHeight / 3;

        ADPlayer.adsLoader.requestAds(adsRequest);
    },
    playAds:function(event){
         // Initialize the container. Must be done through a user action on mobile devices.
    	console.log("play ads");
         // Prevent triggering immediate playback when ads are loading
        try{
            if(event!=undefined)
                event.preventDefault();
        }catch (e) {
        // TODO: handle exception
            console.log("event error:"+e);
        }
        console.log("#AD loading ads");
        ADPlayer.videoElement.load();
        ADPlayer.adDisplayContainer.initialize();

        var width = ADPlayer.videoElement.clientWidth;
        var height = ADPlayer.videoElement.clientHeight;
    
        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            ADPlayer.adsManager.init(width, height, google.ima.ViewMode.NORMAL);
            // Call play to start showing the ad. Single video and overlay ads will
            // start at this time; the call will be ignored for ad rules.
            ADPlayer.adsManager.start();
            ADPlayer.isAdLoading=true;
        console.log("#AD start ads");
        } catch (adError) {
            // An error may be thrown if there was a problem with the VAST response.
            ADPlayer.adPlayCompleteCallBack();
            console.log("#AD start adError:"+adError);
        }
    },
    onAdsManagerLoaded:function(adsManagerLoadedEvent){
        // Get the ads manager.
        var adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings.loadVideoTimeout=20*1000;
        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
        // videoElement should be set to the content video element.
        ADPlayer.adsManager =
            adsManagerLoadedEvent.getAdsManager(ADPlayer.videoElement, adsRenderingSettings);
    
        // Add listeners to the required events.//監聽 VAST 事件
        ADPlayer.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, ADPlayer.onAdError);

        console.log("#AD  adsManager init");

        //觸發播放及暫停事件
        ADPlayer.adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, ADPlayer.onContentPauseRequested);

        ADPlayer.adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            ADPlayer.onContentResumeRequested);

        ADPlayer.adsManager.addEventListener(
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED, ADPlayer.onAdEvent);

        
    
        // Listen to any additional events, if necessary. //觸發非線性廣告的播放
        ADPlayer.adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, ADPlayer.onAdEvent);
        ADPlayer.adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, ADPlayer.onAdEvent);
        ADPlayer.adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, ADPlayer.onAdEvent);
        ADPlayer.adManagerCallBack( ADPlayer.adsManager);
    },
    onAdEvent:function(adEvent){
        // Retrieve the ad from the event. Some events (for example,
        // ALL_ADS_COMPLETED) don't have ad object associated.
        let ad = adEvent.getAd();
        console.log("#AD  onAdEvent ad:"+JSON.stringify(ad));
        switch (adEvent.type) {
            case google.ima.AdEvent.Type.LOADED:
                // This is the first event sent for an ad - it is possible to
                // determine whether the ad is a video ad or an overlay.
                if (!ad.isLinear()) {
                // Position AdDisplayContainer correctly for overlay.
                // Use ad.width and ad.height.
                    ADPlayer.adLoadedCallBack()
                }
                ADPlayer.isAdLoading = true;
                break;
            case google.ima.AdEvent.Type.STARTED:
                // This event indicates the ad has started - the video player
                // can adjust the UI, for example display a pause button and
                // remaining time.
                if (ad.isLinear()) {
                // For a linear ad, a timer can be started to poll for
                // the remaining time.
                ADPlayer.isAdPlaying = true;
                ADPlayer.intervalTimer = setInterval(
                    function() {
                        // Example: var remainingTime = adsManager.getRemainingTime();
                    },
                    300);  // every 300ms
                    ADPlayer.adPlayStartCallBack();
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
                // This event indicates the ad has finished - the video player
                // can perform appropriate UI actions, such as removing the timer for
                // remaining time detection.
                console.log("#AD  onAdError ad COMPLETE:");
                if (ad.isLinear()) {
                    clearInterval(ADPlayer.intervalTimer);
                }
                ADPlayer.isAdLoading = false;
                ADPlayer.isAdPlaying = false;
                console.log("#AD COMPLETE")
                if(ADPlayer.adsManager!=undefined){
                    ADPlayer.adsManager.destroy();
                    ADPlayer.adsManager=undefined;
                    console.log("#AD  ADPlayer.adsManager destroy()");
                }
                ADPlayer.adPlayCompleteCallBack();
                break;
        }
    },
    onAdError:function(adErrorEvent){
        // Handle the error logging.
        ADPlayer.isAdLoading = false;
        console.log("#AD  onAdError ad:"+adErrorEvent.getError());
        if(ADPlayer.adsManager!=undefined){
            ADPlayer.adsManager.destroy();
            ADPlayer.adsManager=undefined;
            console.log("#AD  ADPlayer.adsManager destroy()");
        }
        if(!ADPlayer.isAdPlaying){
            console.log("#AD  onAdError ad COMPLETE:");
            ADPlayer.isAdLoading = false;
            ADPlayer.isAdPlaying = false;
            ADPlayer.adPlayCompleteCallBack(); 
        }
        
    },
    onContentPauseRequested:function(){
        ADPlayer.isAdPlaying = true;
        ADPlayer.videoElement.pause();
        console.log("#AD  onAd pause:");
        // This function is where you should setup UI for showing ads (for example,
        // display ad timer countdown, disable seeking and more.)
        // setupUIForAds();
    },
    onContentResumeRequested:function(){
        console.log("#AD  onAd Resume Requested:");
        ADPlayer.isAdPlaying = false;
        if (!ADPlayer.isContentFinished) {
            ADPlayer.adPlayCompleteCallBack()
        }
        // This function is where you should ensure that your UI is ready
        // to play content. It is the responsibility of the Publisher to
        // implement this function when necessary.
        // setupUIForContent();
    }
}