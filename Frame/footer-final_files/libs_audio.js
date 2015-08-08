//<script src="{PREFIX}static/js/audioPlayer/ubanplayer/js/jquery.ubaplayer.js"></script>
/*
 * jquery.ubaplayer
 * https://github.com/brianhadaway/UbaPlayer
 *
 * Copyright (c) 2012 Brian Hadaway
 * Licensed under the MIT, GPL licenses.
 */

(function($) {
	var defaults = {
		audioButtonClass: "uba_audioButton",
		autoPlay: null,
		codecs: [{
			name: "OGG",
			codec: 'audio/ogg; codecs="vorbis"'
		}, {
			name: "MP3",
			codec: 'audio/mpeg'
		}],
		continuous: false,
		extension: null,
		flashAudioPlayerPath: "/file/dungchung/audioPlayer/ubanplayer/swf/player.swf",
		flashExtension: ".mp3",
		flashObjectID: "audioPlayer",
		loadingClass: "loading",
		loop: false,
		playerContainer: "player",
		playingClass: "playing",
		playStartCallback: null,
		stopCallback: null,
		isPaid:false,
		swfobjectPath: "/file/dungchung/audioPlayer/ubanplayer/swfobject/swfobject.js",
		volume: 0.5
	},
		currentTrack, isPlaying = false,
		isFlash = false,
		audio, $buttons, $tgt, $el, playTrack, resumeTrack, pauseTrack, 
               methods = {
			play: function(element){
				$tgt = element;
                                currentTrack = _methods.getFileNameWithoutExtension($tgt.attr("media-url"));
                                if(lesson_child()){
                                    currentTrack = _methods.getFileNameWithoutExtension(checkGOLDENKIDSaudioLink($tgt.attr("media-url")));
                                    
                                }else{
                                    if(defaults.isPaid==true){				
					currentTrack = _methods.getFileNameWithoutExtension(checkVIPaudioLink($tgt.attr("media-url")));
                                    }
                                }       
				isPlaying = true;
				$tgt.addClass(defaults.loadingClass);
				$buttons.removeClass(defaults.playingClass);
				
				if (isFlash) {
					if (audio) {
						_methods.removeListeners(window);
					}
					audio = document.getElementById(defaults.flashObjectID);
					_methods.addListeners(window);
					audio.playFlash(currentTrack + defaults.extension);
				} else {
					if (audio) {
						audio.pause();
						_methods.removeListeners(audio);
					}
					audio = new Audio("");
					_methods.addListeners(audio);
					audio.id = "audio";
					audio.loop = defaults.loop ? "loop" : "";
					audio.volume = defaults.volume;
					audio.src = currentTrack + defaults.extension;
					audio.play();
				}
			},

			pause: function() {
				if (isFlash) {
					audio.pauseFlash();
				} else {
					audio.pause();
				}

				$tgt.removeClass(defaults.playingClass);
				isPlaying = false;
			},

			resume: function() {
				if (isFlash) {
					audio.playFlash();
				} else {
					audio.play();
				}
				$tgt.addClass(defaults.playingClass);
				isPlaying = true;
			},

			playing: function() {
				return isPlaying;
			}
		},

		_methods = {
			init: function(options) {
				var types;
                                //Check init?
                                if(ubanPlayer_instance != null){
                                    return;
                                }
				//set defaults
				$.extend(defaults, options);
				$el = this;
                                ubanPlayer_instance = this;

				//listen for clicks on the controls
				$(".uba_audioButton").bind("click", function(event) {
					var target = null;					
					if(!$(event.target).attr('media-url')){
						event.target = $(event.target).parents('.uba_audioButton')
					}
					
					_methods.updateTrackState(event);
					return false;
				});
				
				$buttons = $("." + defaults.audioButtonClass);

				types = defaults.codecs;
				for (var i = 0, ilen = types.length; i < ilen; i++) {
					var type = types[i];
					if (_methods.canPlay(type)) {
						defaults.extension = [".", type.name.toLowerCase()].join("");
						break;
					}
				}

				if (!defaults.extension || isFlash) {
					isFlash = true;
					defaults.extension = defaults.flashExtension;
				}

				if (isFlash) {
					$el.html("<div id='" + defaults.playerContainer + "'/>");					
						swfobject.embedSWF(defaults.flashAudioPlayerPath, defaults.playerContainer, "0", "0", "9.0.0", "swf/expressInstall.swf", false, false, {
							id: defaults.flashObjectID
						}, _methods.swfLoaded);					
				} else {
					if (defaults.autoPlay) {
						methods.play(defaults.autoPlay);
					}
				}
			},

			updateTrackState: function(evt) {
				$tgt = $(evt.target);
				if (!$tgt.hasClass("uba_audioButton")) {
					return;
				}
				if (!audio || (audio && currentTrack !== _methods.getFileNameWithoutExtension($tgt.attr("media-url")))) {
					methods.play($tgt);
				} else if (!isPlaying) {					
					methods.resume();
				} else {					
					methods.pause();
				}
			},

			addListeners: function(elem) {
				$(elem).bind({
					"canplay": _methods.onLoaded,
					"error": _methods.onError,
					"ended": _methods.onEnded
				});
			},

			removeListeners: function(elem) {
				$(elem).unbind({
					"canplay": _methods.onLoaded,
					"error": _methods.onError,
					"ended": _methods.onEnded
				});
			},

			onLoaded: function() {
				$buttons.removeClass(defaults.loadingClass);
				$tgt.addClass(defaults.playingClass);					
				if(typeof(defaults.playStartCallback) == 'function'){
					defaults.playStartCallback($tgt);
				}
				audio.play();
			},

			onError: function() {
				$buttons.removeClass(defaults.loadingClass);
				if (isFlash) {
					_methods.removeListeners(window);
				} else {
					_methods.removeListeners(audio);
				}
			},

			onEnded: function() {
				isPlaying = false;
				$tgt.removeClass(defaults.playingClass);
				if(typeof(defaults.stopCallback) == 'function'){
					defaults.stopCallback($tgt);
				}
				currentTrack = "";
				if (isFlash) {
					_methods.removeListeners(window);
				} else {
					_methods.removeListeners(audio);
				}

				if (defaults.continuous) {
					var $next = $tgt.next().length ? $tgt.next() : $(defaults.audioButtonClass).eq(0);
					methods.play($next);
				}

			},

			canPlay: function(type) {
				if (!document.createElement("audio").canPlayType) {
					return false;
				} else {
					return document.createElement("audio").canPlayType(type.codec).match(/maybe|probably/i) ? true : false;
				}
			},

			swfLoaded: function() {
				if (defaults.autoPlay) {
					setTimeout(function() {
						methods.play(defaults.autoPlay);
					}, 500);
				}
			},

			getFileNameWithoutExtension: function(fileName) {
				//this function take a full file name and returns an extensionless file name
				//ex. entering foo.mp3 returns foo
				//ex. entering foo returns foo (no change)
				var fileNamePieces = fileName.split('.');
				fileNamePieces.pop();
				return fileNamePieces.join(".");
			}
		};

	$.fn.ubaPlayer = function(method){
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || !method) {
			return _methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " does not exist on jquery.ubaPlayer");
		}
	};

})(jQuery);

//<script src="{PREFIX}static/js/audioPlayer/ubanplayer/js/funcAudio.js"></script>
//JavaScript Document
function PlayingAudioHide(element){		
		if(element.hasClass('uba_hideAudio')){		
			element.children('.stt_par_hideaudio').children(0).attr('src','/file/dungchung/audioPlayer/ubanplayer/img/speaker-playing.gif');
			if(prev_element != null){	
				if(element.attr('media-url') != prev_element.attr('media-url')){				
					stopAudioHide(prev_element);
				}
			}		
			prev_element = element;
		}	
	}
	function stopAudioHide(element){
		if(element.hasClass('uba_hideAudio')){		
			element.children('.stt_par_hideaudio').children(0).attr('src','/file/dungchung/audioPlayer/ubanplayer/img/speaker-stop.gif');	
		}	
	}

//<script type="text/javascript" src="{PREFIX}static/js/audioPlayer/jplayer/js/jquery.jplayer.min.js"></script>
	/*
	 * jPlayer Plugin for jQuery JavaScript Library
	 * http://www.jplayer.org
	 *
	 * Copyright (c) 2009 - 2012 Happyworm Ltd
	 * Dual licensed under the MIT and GPL licenses.
	 *  - http://www.opensource.org/licenses/mit-license.php
	 *  - http://www.gnu.org/copyleft/gpl.html
	 *
	 * Author: Mark J Panaghiston
	 * Version: 2.2.0
	 * Date: 13th September 2012
	 */

	(function(b,f){b.fn.jPlayer=function(a){var c="string"===typeof a,d=Array.prototype.slice.call(arguments,1),e=this,a=!c&&d.length?b.extend.apply(null,[!0,a].concat(d)):a;if(c&&"_"===a.charAt(0))return e;c?this.each(function(){var c=b.data(this,"jPlayer"),h=c&&b.isFunction(c[a])?c[a].apply(c,d):c;if(h!==c&&h!==f)return e=h,!1}):this.each(function(){var c=b.data(this,"jPlayer");c?c.option(a||{}):b.data(this,"jPlayer",new b.jPlayer(a,this))});return e};b.jPlayer=function(a,c){if(arguments.length){this.element=
	b(c);this.options=b.extend(!0,{},this.options,a);var d=this;this.element.bind("remove.jPlayer",function(){d.destroy()});this._init()}};b.jPlayer.emulateMethods="load play pause";b.jPlayer.emulateStatus="src readyState networkState currentTime duration paused ended playbackRate";b.jPlayer.emulateOptions="muted volume";b.jPlayer.reservedEvent="ready flashreset resize repeat error warning";b.jPlayer.event={ready:"jPlayer_ready",flashreset:"jPlayer_flashreset",resize:"jPlayer_resize",repeat:"jPlayer_repeat",
	click:"jPlayer_click",error:"jPlayer_error",warning:"jPlayer_warning",loadstart:"jPlayer_loadstart",progress:"jPlayer_progress",suspend:"jPlayer_suspend",abort:"jPlayer_abort",emptied:"jPlayer_emptied",stalled:"jPlayer_stalled",play:"jPlayer_play",pause:"jPlayer_pause",loadedmetadata:"jPlayer_loadedmetadata",loadeddata:"jPlayer_loadeddata",waiting:"jPlayer_waiting",playing:"jPlayer_playing",canplay:"jPlayer_canplay",canplaythrough:"jPlayer_canplaythrough",seeking:"jPlayer_seeking",seeked:"jPlayer_seeked",
	timeupdate:"jPlayer_timeupdate",ended:"jPlayer_ended",ratechange:"jPlayer_ratechange",durationchange:"jPlayer_durationchange",volumechange:"jPlayer_volumechange"};b.jPlayer.htmlEvent="loadstart abort emptied stalled loadedmetadata loadeddata canplay canplaythrough ratechange".split(" ");b.jPlayer.pause=function(){b.each(b.jPlayer.prototype.instances,function(a,c){c.data("jPlayer").status.srcSet&&c.jPlayer("pause")})};b.jPlayer.timeFormat={showHour:!1,showMin:!0,showSec:!0,padHour:!1,padMin:!0,padSec:!0,
	sepHour:":",sepMin:":",sepSec:""};b.jPlayer.convertTime=function(a){var c=new Date(1E3*a),d=c.getUTCHours(),a=c.getUTCMinutes(),c=c.getUTCSeconds(),d=b.jPlayer.timeFormat.padHour&&10>d?"0"+d:d,a=b.jPlayer.timeFormat.padMin&&10>a?"0"+a:a,c=b.jPlayer.timeFormat.padSec&&10>c?"0"+c:c;return(b.jPlayer.timeFormat.showHour?d+b.jPlayer.timeFormat.sepHour:"")+(b.jPlayer.timeFormat.showMin?a+b.jPlayer.timeFormat.sepMin:"")+(b.jPlayer.timeFormat.showSec?c+b.jPlayer.timeFormat.sepSec:"")};b.jPlayer.uaBrowser=
	function(a){var a=a.toLowerCase(),c=/(opera)(?:.*version)?[ \/]([\w.]+)/,b=/(msie) ([\w.]+)/,e=/(mozilla)(?:.*? rv:([\w.]+))?/,a=/(webkit)[ \/]([\w.]+)/.exec(a)||c.exec(a)||b.exec(a)||0>a.indexOf("compatible")&&e.exec(a)||[];return{browser:a[1]||"",version:a[2]||"0"}};b.jPlayer.uaPlatform=function(a){var b=a.toLowerCase(),d=/(android)/,e=/(mobile)/,a=/(ipad|iphone|ipod|android|blackberry|playbook|windows ce|webos)/.exec(b)||[],b=/(ipad|playbook)/.exec(b)||!e.exec(b)&&d.exec(b)||[];a[1]&&(a[1]=a[1].replace(/\s/g,
	"_"));return{platform:a[1]||"",tablet:b[1]||""}};b.jPlayer.browser={};b.jPlayer.platform={};var i=b.jPlayer.uaBrowser(navigator.userAgent);i.browser&&(b.jPlayer.browser[i.browser]=!0,b.jPlayer.browser.version=i.version);i=b.jPlayer.uaPlatform(navigator.userAgent);i.platform&&(b.jPlayer.platform[i.platform]=!0,b.jPlayer.platform.mobile=!i.tablet,b.jPlayer.platform.tablet=!!i.tablet);b.jPlayer.prototype={count:0,version:{script:"2.2.0",needFlash:"2.2.0",flash:"unknown"},options:{swfPath:"js",solution:"html, flash",
	supplied:"mp3",preload:"metadata",volume:0.8,muted:!1,wmode:"opaque",backgroundColor:"#000000",cssSelectorAncestor:"#jp_container_1",cssSelector:{videoPlay:".jp-video-play",play:".jp-play",pause:".jp-pause",stop:".jp-stop",seekBar:".jp-seek-bar",playBar:".jp-play-bar",mute:".jp-mute",unmute:".jp-unmute",volumeBar:".jp-volume-bar",volumeBarValue:".jp-volume-bar-value",volumeMax:".jp-volume-max",currentTime:".jp-current-time",duration:".jp-duration",fullScreen:".jp-full-screen",restoreScreen:".jp-restore-screen",
	repeat:".jp-repeat",repeatOff:".jp-repeat-off",gui:".jp-gui",noSolution:".jp-no-solution"},fullScreen:!1,autohide:{restored:!1,full:!0,fadeIn:200,fadeOut:600,hold:1E3},loop:!1,repeat:function(a){a.jPlayer.options.loop?b(this).unbind(".jPlayerRepeat").bind(b.jPlayer.event.ended+".jPlayer.jPlayerRepeat",function(){b(this).jPlayer("play")}):b(this).unbind(".jPlayerRepeat")},nativeVideoControls:{},noFullScreen:{msie:/msie [0-6]/,ipad:/ipad.*?os [0-4]/,iphone:/iphone/,ipod:/ipod/,android_pad:/android [0-3](?!.*?mobile)/,
	android_phone:/android.*?mobile/,blackberry:/blackberry/,windows_ce:/windows ce/,webos:/webos/},noVolume:{ipad:/ipad/,iphone:/iphone/,ipod:/ipod/,android_pad:/android(?!.*?mobile)/,android_phone:/android.*?mobile/,blackberry:/blackberry/,windows_ce:/windows ce/,webos:/webos/,playbook:/playbook/},verticalVolume:!1,idPrefix:"jp",noConflict:"jQuery",emulateHtml:!1,errorAlerts:!1,warningAlerts:!1},optionsAudio:{size:{width:"0px",height:"0px",cssClass:""},sizeFull:{width:"0px",height:"0px",cssClass:""}},
	optionsVideo:{size:{width:"480px",height:"270px",cssClass:"jp-video-270p"},sizeFull:{width:"100%",height:"100%",cssClass:"jp-video-full"}},instances:{},status:{src:"",media:{},paused:!0,format:{},formatType:"",waitForPlay:!0,waitForLoad:!0,srcSet:!1,video:!1,seekPercent:0,currentPercentRelative:0,currentPercentAbsolute:0,currentTime:0,duration:0,readyState:0,networkState:0,playbackRate:1,ended:0},internal:{ready:!1},solution:{html:!0,flash:!0},format:{mp3:{codec:'audio/mpeg; codecs="mp3"',flashCanPlay:!0,
	media:"audio"},m4a:{codec:'audio/mp4; codecs="mp4a.40.2"',flashCanPlay:!0,media:"audio"},oga:{codec:'audio/ogg; codecs="vorbis"',flashCanPlay:!1,media:"audio"},wav:{codec:'audio/wav; codecs="1"',flashCanPlay:!1,media:"audio"},webma:{codec:'audio/webm; codecs="vorbis"',flashCanPlay:!1,media:"audio"},fla:{codec:"audio/x-flv",flashCanPlay:!0,media:"audio"},rtmpa:{codec:'audio/rtmp; codecs="rtmp"',flashCanPlay:!0,media:"audio"},m4v:{codec:'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',flashCanPlay:!0,media:"video"},
	ogv:{codec:'video/ogg; codecs="theora, vorbis"',flashCanPlay:!1,media:"video"},webmv:{codec:'video/webm; codecs="vorbis, vp8"',flashCanPlay:!1,media:"video"},flv:{codec:"video/x-flv",flashCanPlay:!0,media:"video"},rtmpv:{codec:'video/rtmp; codecs="rtmp"',flashCanPlay:!0,media:"video"}},_init:function(){var a=this;this.element.empty();this.status=b.extend({},this.status);this.internal=b.extend({},this.internal);this.internal.domNode=this.element.get(0);this.formats=[];this.solutions=[];this.require=
	{};this.htmlElement={};this.html={};this.html.audio={};this.html.video={};this.flash={};this.css={};this.css.cs={};this.css.jq={};this.ancestorJq=[];this.options.volume=this._limitValue(this.options.volume,0,1);b.each(this.options.supplied.toLowerCase().split(","),function(c,d){var e=d.replace(/^\s+|\s+$/g,"");if(a.format[e]){var f=false;b.each(a.formats,function(a,b){if(e===b){f=true;return false}});f||a.formats.push(e)}});b.each(this.options.solution.toLowerCase().split(","),function(c,d){var e=
	d.replace(/^\s+|\s+$/g,"");if(a.solution[e]){var f=false;b.each(a.solutions,function(a,b){if(e===b){f=true;return false}});f||a.solutions.push(e)}});this.internal.instance="jp_"+this.count;this.instances[this.internal.instance]=this.element;this.element.attr("id")||this.element.attr("id",this.options.idPrefix+"_jplayer_"+this.count);this.internal.self=b.extend({},{id:this.element.attr("id"),jq:this.element});this.internal.audio=b.extend({},{id:this.options.idPrefix+"_audio_"+this.count,jq:f});this.internal.video=
	b.extend({},{id:this.options.idPrefix+"_video_"+this.count,jq:f});this.internal.flash=b.extend({},{id:this.options.idPrefix+"_flash_"+this.count,jq:f,swf:this.options.swfPath+(this.options.swfPath.toLowerCase().slice(-4)!==".swf"?(this.options.swfPath&&this.options.swfPath.slice(-1)!=="/"?"/":"")+"Jplayer.swf":"")});this.internal.poster=b.extend({},{id:this.options.idPrefix+"_poster_"+this.count,jq:f});b.each(b.jPlayer.event,function(b,c){if(a.options[b]!==f){a.element.bind(c+".jPlayer",a.options[b]);
	a.options[b]=f}});this.require.audio=false;this.require.video=false;b.each(this.formats,function(b,c){a.require[a.format[c].media]=true});this.options=this.require.video?b.extend(true,{},this.optionsVideo,this.options):b.extend(true,{},this.optionsAudio,this.options);this._setSize();this.status.nativeVideoControls=this._uaBlocklist(this.options.nativeVideoControls);this.status.noFullScreen=this._uaBlocklist(this.options.noFullScreen);this.status.noVolume=this._uaBlocklist(this.options.noVolume);this._restrictNativeVideoControls();
	this.htmlElement.poster=document.createElement("img");this.htmlElement.poster.id=this.internal.poster.id;this.htmlElement.poster.onload=function(){(!a.status.video||a.status.waitForPlay)&&a.internal.poster.jq.show()};this.element.append(this.htmlElement.poster);this.internal.poster.jq=b("#"+this.internal.poster.id);this.internal.poster.jq.css({width:this.status.width,height:this.status.height});this.internal.poster.jq.hide();this.internal.poster.jq.bind("click.jPlayer",function(){a._trigger(b.jPlayer.event.click)});
	this.html.audio.available=false;if(this.require.audio){this.htmlElement.audio=document.createElement("audio");this.htmlElement.audio.id=this.internal.audio.id;this.html.audio.available=!!this.htmlElement.audio.canPlayType&&this._testCanPlayType(this.htmlElement.audio)}this.html.video.available=false;if(this.require.video){this.htmlElement.video=document.createElement("video");this.htmlElement.video.id=this.internal.video.id;this.html.video.available=!!this.htmlElement.video.canPlayType&&this._testCanPlayType(this.htmlElement.video)}this.flash.available=
	this._checkForFlash(10);this.html.canPlay={};this.flash.canPlay={};b.each(this.formats,function(b,c){a.html.canPlay[c]=a.html[a.format[c].media].available&&""!==a.htmlElement[a.format[c].media].canPlayType(a.format[c].codec);a.flash.canPlay[c]=a.format[c].flashCanPlay&&a.flash.available});this.html.desired=false;this.flash.desired=false;b.each(this.solutions,function(c,d){if(c===0)a[d].desired=true;else{var e=false,f=false;b.each(a.formats,function(b,c){a[a.solutions[0]].canPlay[c]&&(a.format[c].media===
	"video"?f=true:e=true)});a[d].desired=a.require.audio&&!e||a.require.video&&!f}});this.html.support={};this.flash.support={};b.each(this.formats,function(b,c){a.html.support[c]=a.html.canPlay[c]&&a.html.desired;a.flash.support[c]=a.flash.canPlay[c]&&a.flash.desired});this.html.used=false;this.flash.used=false;b.each(this.solutions,function(c,d){b.each(a.formats,function(b,c){if(a[d].support[c]){a[d].used=true;return false}})});this._resetActive();this._resetGate();this._cssSelectorAncestor(this.options.cssSelectorAncestor);
	if(!this.html.used&&!this.flash.used){this._error({type:b.jPlayer.error.NO_SOLUTION,context:"{solution:'"+this.options.solution+"', supplied:'"+this.options.supplied+"'}",message:b.jPlayer.errorMsg.NO_SOLUTION,hint:b.jPlayer.errorHint.NO_SOLUTION});this.css.jq.noSolution.length&&this.css.jq.noSolution.show()}else this.css.jq.noSolution.length&&this.css.jq.noSolution.hide();if(this.flash.used){var c,d="jQuery="+encodeURI(this.options.noConflict)+"&id="+encodeURI(this.internal.self.id)+"&vol="+this.options.volume+
	"&muted="+this.options.muted;if(b.jPlayer.browser.msie&&Number(b.jPlayer.browser.version)<=8){d=['<param name="movie" value="'+this.internal.flash.swf+'" />','<param name="FlashVars" value="'+d+'" />','<param name="allowScriptAccess" value="always" />','<param name="bgcolor" value="'+this.options.backgroundColor+'" />','<param name="wmode" value="'+this.options.wmode+'" />'];c=document.createElement('<object id="'+this.internal.flash.id+'" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="0" height="0"></object>');
	for(var e=0;e<d.length;e++)c.appendChild(document.createElement(d[e]))}else{e=function(a,b,c){var d=document.createElement("param");d.setAttribute("name",b);d.setAttribute("value",c);a.appendChild(d)};c=document.createElement("object");c.setAttribute("id",this.internal.flash.id);c.setAttribute("data",this.internal.flash.swf);c.setAttribute("type","application/x-shockwave-flash");c.setAttribute("width","1");c.setAttribute("height","1");e(c,"flashvars",d);e(c,"allowscriptaccess","always");e(c,"bgcolor",
	this.options.backgroundColor);e(c,"wmode",this.options.wmode)}this.element.append(c);this.internal.flash.jq=b(c)}if(this.html.used){if(this.html.audio.available){this._addHtmlEventListeners(this.htmlElement.audio,this.html.audio);this.element.append(this.htmlElement.audio);this.internal.audio.jq=b("#"+this.internal.audio.id)}if(this.html.video.available){this._addHtmlEventListeners(this.htmlElement.video,this.html.video);this.element.append(this.htmlElement.video);this.internal.video.jq=b("#"+this.internal.video.id);
	this.status.nativeVideoControls?this.internal.video.jq.css({width:this.status.width,height:this.status.height}):this.internal.video.jq.css({width:"0px",height:"0px"});this.internal.video.jq.bind("click.jPlayer",function(){a._trigger(b.jPlayer.event.click)})}}this.options.emulateHtml&&this._emulateHtmlBridge();this.html.used&&!this.flash.used&&setTimeout(function(){a.internal.ready=true;a.version.flash="n/a";a._trigger(b.jPlayer.event.repeat);a._trigger(b.jPlayer.event.ready)},100);this._updateNativeVideoControls();
	this._updateInterface();this._updateButtons(false);this._updateAutohide();this._updateVolume(this.options.volume);this._updateMute(this.options.muted);this.css.jq.videoPlay.length&&this.css.jq.videoPlay.hide();b.jPlayer.prototype.count++},destroy:function(){this.clearMedia();this._removeUiClass();this.css.jq.currentTime.length&&this.css.jq.currentTime.text("");this.css.jq.duration.length&&this.css.jq.duration.text("");b.each(this.css.jq,function(a,b){b.length&&b.unbind(".jPlayer")});this.internal.poster.jq.unbind(".jPlayer");
	this.internal.video.jq&&this.internal.video.jq.unbind(".jPlayer");this.options.emulateHtml&&this._destroyHtmlBridge();this.element.removeData("jPlayer");this.element.unbind(".jPlayer");this.element.empty();delete this.instances[this.internal.instance]},enable:function(){},disable:function(){},_testCanPlayType:function(a){try{a.canPlayType(this.format.mp3.codec);return true}catch(b){return false}},_uaBlocklist:function(a){var c=navigator.userAgent.toLowerCase(),d=false;b.each(a,function(a,b){if(b&&
	b.test(c)){d=true;return false}});return d},_restrictNativeVideoControls:function(){if(this.require.audio&&this.status.nativeVideoControls){this.status.nativeVideoControls=false;this.status.noFullScreen=true}},_updateNativeVideoControls:function(){if(this.html.video.available&&this.html.used){this.htmlElement.video.controls=this.status.nativeVideoControls;this._updateAutohide();if(this.status.nativeVideoControls&&this.require.video){this.internal.poster.jq.hide();this.internal.video.jq.css({width:this.status.width,
	height:this.status.height})}else if(this.status.waitForPlay&&this.status.video){this.internal.poster.jq.show();this.internal.video.jq.css({width:"0px",height:"0px"})}}},_addHtmlEventListeners:function(a,c){var d=this;a.preload=this.options.preload;a.muted=this.options.muted;a.volume=this.options.volume;a.addEventListener("progress",function(){if(c.gate){d._getHtmlStatus(a);d._updateInterface();d._trigger(b.jPlayer.event.progress)}},false);a.addEventListener("timeupdate",function(){if(c.gate){d._getHtmlStatus(a);
	d._updateInterface();d._trigger(b.jPlayer.event.timeupdate)}},false);a.addEventListener("durationchange",function(){if(c.gate){d._getHtmlStatus(a);d._updateInterface();d._trigger(b.jPlayer.event.durationchange)}},false);a.addEventListener("play",function(){if(c.gate){d._updateButtons(true);d._html_checkWaitForPlay();d._trigger(b.jPlayer.event.play)}},false);a.addEventListener("playing",function(){if(c.gate){d._updateButtons(true);d._seeked();d._trigger(b.jPlayer.event.playing)}},false);a.addEventListener("pause",
	function(){if(c.gate){d._updateButtons(false);d._trigger(b.jPlayer.event.pause)}},false);a.addEventListener("waiting",function(){if(c.gate){d._seeking();d._trigger(b.jPlayer.event.waiting)}},false);a.addEventListener("seeking",function(){if(c.gate){d._seeking();d._trigger(b.jPlayer.event.seeking)}},false);a.addEventListener("seeked",function(){if(c.gate){d._seeked();d._trigger(b.jPlayer.event.seeked)}},false);a.addEventListener("volumechange",function(){if(c.gate){d.options.volume=a.volume;d.options.muted=
	a.muted;d._updateMute();d._updateVolume();d._trigger(b.jPlayer.event.volumechange)}},false);a.addEventListener("suspend",function(){if(c.gate){d._seeked();d._trigger(b.jPlayer.event.suspend)}},false);a.addEventListener("ended",function(){if(c.gate){if(!b.jPlayer.browser.webkit)d.htmlElement.media.currentTime=0;d.htmlElement.media.pause();d._updateButtons(false);d._getHtmlStatus(a,true);d._updateInterface();d._trigger(b.jPlayer.event.ended)}},false);a.addEventListener("error",function(){if(c.gate){d._updateButtons(false);
	d._seeked();if(d.status.srcSet){clearTimeout(d.internal.htmlDlyCmdId);d.status.waitForLoad=true;d.status.waitForPlay=true;d.status.video&&!d.status.nativeVideoControls&&d.internal.video.jq.css({width:"0px",height:"0px"});d._validString(d.status.media.poster)&&!d.status.nativeVideoControls&&d.internal.poster.jq.show();d.css.jq.videoPlay.length&&d.css.jq.videoPlay.show();d._error({type:b.jPlayer.error.URL,context:d.status.src,message:b.jPlayer.errorMsg.URL,hint:b.jPlayer.errorHint.URL})}}},false);b.each(b.jPlayer.htmlEvent,
	function(e,g){a.addEventListener(this,function(){c.gate&&d._trigger(b.jPlayer.event[g])},false)})},_getHtmlStatus:function(a,b){var d=0,e=0,g=0,f=0;if(isFinite(a.duration))this.status.duration=a.duration;d=a.currentTime;e=this.status.duration>0?100*d/this.status.duration:0;if(typeof a.seekable==="object"&&a.seekable.length>0){g=this.status.duration>0?100*a.seekable.end(a.seekable.length-1)/this.status.duration:100;f=this.status.duration>0?100*a.currentTime/a.seekable.end(a.seekable.length-1):0}else{g=
	100;f=e}if(b)e=f=d=0;this.status.seekPercent=g;this.status.currentPercentRelative=f;this.status.currentPercentAbsolute=e;this.status.currentTime=d;this.status.readyState=a.readyState;this.status.networkState=a.networkState;this.status.playbackRate=a.playbackRate;this.status.ended=a.ended},_resetStatus:function(){this.status=b.extend({},this.status,b.jPlayer.prototype.status)},_trigger:function(a,c,d){a=b.Event(a);a.jPlayer={};a.jPlayer.version=b.extend({},this.version);a.jPlayer.options=b.extend(true,
	{},this.options);a.jPlayer.status=b.extend(true,{},this.status);a.jPlayer.html=b.extend(true,{},this.html);a.jPlayer.flash=b.extend(true,{},this.flash);if(c)a.jPlayer.error=b.extend({},c);if(d)a.jPlayer.warning=b.extend({},d);this.element.trigger(a)},jPlayerFlashEvent:function(a,c){if(a===b.jPlayer.event.ready)if(this.internal.ready){if(this.flash.gate){if(this.status.srcSet){var d=this.status.currentTime,e=this.status.paused;this.setMedia(this.status.media);d>0&&(e?this.pause(d):this.play(d))}this._trigger(b.jPlayer.event.flashreset)}}else{this.internal.ready=
	true;this.internal.flash.jq.css({width:"0px",height:"0px"});this.version.flash=c.version;this.version.needFlash!==this.version.flash&&this._error({type:b.jPlayer.error.VERSION,context:this.version.flash,message:b.jPlayer.errorMsg.VERSION+this.version.flash,hint:b.jPlayer.errorHint.VERSION});this._trigger(b.jPlayer.event.repeat);this._trigger(a)}if(this.flash.gate)switch(a){case b.jPlayer.event.progress:this._getFlashStatus(c);this._updateInterface();this._trigger(a);break;case b.jPlayer.event.timeupdate:this._getFlashStatus(c);
	this._updateInterface();this._trigger(a);break;case b.jPlayer.event.play:this._seeked();this._updateButtons(true);this._trigger(a);break;case b.jPlayer.event.pause:this._updateButtons(false);this._trigger(a);break;case b.jPlayer.event.ended:this._updateButtons(false);this._trigger(a);break;case b.jPlayer.event.click:this._trigger(a);break;case b.jPlayer.event.error:this.status.waitForLoad=true;this.status.waitForPlay=true;this.status.video&&this.internal.flash.jq.css({width:"0px",height:"0px"});this._validString(this.status.media.poster)&&
	this.internal.poster.jq.show();this.css.jq.videoPlay.length&&this.status.video&&this.css.jq.videoPlay.show();this.status.video?this._flash_setVideo(this.status.media):this._flash_setAudio(this.status.media);this._updateButtons(false);this._error({type:b.jPlayer.error.URL,context:c.src,message:b.jPlayer.errorMsg.URL,hint:b.jPlayer.errorHint.URL});break;case b.jPlayer.event.seeking:this._seeking();this._trigger(a);break;case b.jPlayer.event.seeked:this._seeked();this._trigger(a);break;case b.jPlayer.event.ready:break;
	default:this._trigger(a)}return false},_getFlashStatus:function(a){this.status.seekPercent=a.seekPercent;this.status.currentPercentRelative=a.currentPercentRelative;this.status.currentPercentAbsolute=a.currentPercentAbsolute;this.status.currentTime=a.currentTime;this.status.duration=a.duration;this.status.readyState=4;this.status.networkState=0;this.status.playbackRate=1;this.status.ended=false},_updateButtons:function(a){if(a!==f){this.status.paused=!a;if(this.css.jq.play.length&&this.css.jq.pause.length)if(a){this.css.jq.play.hide();
	this.css.jq.pause.show()}else{this.css.jq.play.show();this.css.jq.pause.hide()}}if(this.css.jq.restoreScreen.length&&this.css.jq.fullScreen.length)if(this.status.noFullScreen){this.css.jq.fullScreen.hide();this.css.jq.restoreScreen.hide()}else if(this.options.fullScreen){this.css.jq.fullScreen.hide();this.css.jq.restoreScreen.show()}else{this.css.jq.fullScreen.show();this.css.jq.restoreScreen.hide()}if(this.css.jq.repeat.length&&this.css.jq.repeatOff.length)if(this.options.loop){this.css.jq.repeat.hide();
	this.css.jq.repeatOff.show()}else{this.css.jq.repeat.show();this.css.jq.repeatOff.hide()}},_updateInterface:function(){this.css.jq.seekBar.length&&this.css.jq.seekBar.width(this.status.seekPercent+"%");this.css.jq.playBar.length&&this.css.jq.playBar.width(this.status.currentPercentRelative+"%");this.css.jq.currentTime.length&&this.css.jq.currentTime.text(b.jPlayer.convertTime(this.status.currentTime));this.css.jq.duration.length&&this.css.jq.duration.text(b.jPlayer.convertTime(this.status.duration))},
	_seeking:function(){this.css.jq.seekBar.length&&this.css.jq.seekBar.addClass("jp-seeking-bg")},_seeked:function(){this.css.jq.seekBar.length&&this.css.jq.seekBar.removeClass("jp-seeking-bg")},_resetGate:function(){this.html.audio.gate=false;this.html.video.gate=false;this.flash.gate=false},_resetActive:function(){this.html.active=false;this.flash.active=false},setMedia:function(a){var c=this,d=false,e=this.status.media.poster!==a.poster;this._resetMedia();this._resetGate();this._resetActive();b.each(this.formats,
	function(e,f){var i=c.format[f].media==="video";b.each(c.solutions,function(b,e){if(c[e].support[f]&&c._validString(a[f])){var g=e==="html";if(i){if(g){c.html.video.gate=true;c._html_setVideo(a);c.html.active=true}else{c.flash.gate=true;c._flash_setVideo(a);c.flash.active=true}c.css.jq.videoPlay.length&&c.css.jq.videoPlay.show();c.status.video=true}else{if(g){c.html.audio.gate=true;c._html_setAudio(a);c.html.active=true}else{c.flash.gate=true;c._flash_setAudio(a);c.flash.active=true}c.css.jq.videoPlay.length&&
	c.css.jq.videoPlay.hide();c.status.video=false}d=true;return false}});if(d)return false});if(d){if((!this.status.nativeVideoControls||!this.html.video.gate)&&this._validString(a.poster))e?this.htmlElement.poster.src=a.poster:this.internal.poster.jq.show();this.status.srcSet=true;this.status.media=b.extend({},a);this._updateButtons(false);this._updateInterface()}else this._error({type:b.jPlayer.error.NO_SUPPORT,context:"{supplied:'"+this.options.supplied+"'}",message:b.jPlayer.errorMsg.NO_SUPPORT,
	hint:b.jPlayer.errorHint.NO_SUPPORT})},_resetMedia:function(){this._resetStatus();this._updateButtons(false);this._updateInterface();this._seeked();this.internal.poster.jq.hide();clearTimeout(this.internal.htmlDlyCmdId);this.html.active?this._html_resetMedia():this.flash.active&&this._flash_resetMedia()},clearMedia:function(){this._resetMedia();this.html.active?this._html_clearMedia():this.flash.active&&this._flash_clearMedia();this._resetGate();this._resetActive()},load:function(){this.status.srcSet?
	this.html.active?this._html_load():this.flash.active&&this._flash_load():this._urlNotSetError("load")},play:function(a){a=typeof a==="number"?a:NaN;this.status.srcSet?this.html.active?this._html_play(a):this.flash.active&&this._flash_play(a):this._urlNotSetError("play")},videoPlay:function(){this.play()},pause:function(a){a=typeof a==="number"?a:NaN;this.status.srcSet?this.html.active?this._html_pause(a):this.flash.active&&this._flash_pause(a):this._urlNotSetError("pause")},pauseOthers:function(){var a=
	this;b.each(this.instances,function(b,d){a.element!==d&&d.data("jPlayer").status.srcSet&&d.jPlayer("pause")})},stop:function(){this.status.srcSet?this.html.active?this._html_pause(0):this.flash.active&&this._flash_pause(0):this._urlNotSetError("stop")},playHead:function(a){a=this._limitValue(a,0,100);this.status.srcSet?this.html.active?this._html_playHead(a):this.flash.active&&this._flash_playHead(a):this._urlNotSetError("playHead")},_muted:function(a){this.options.muted=a;this.html.used&&this._html_mute(a);
	this.flash.used&&this._flash_mute(a);if(!this.html.video.gate&&!this.html.audio.gate){this._updateMute(a);this._updateVolume(this.options.volume);this._trigger(b.jPlayer.event.volumechange)}},mute:function(a){a=a===f?true:!!a;this._muted(a)},unmute:function(a){a=a===f?true:!!a;this._muted(!a)},_updateMute:function(a){if(a===f)a=this.options.muted;if(this.css.jq.mute.length&&this.css.jq.unmute.length)if(this.status.noVolume){this.css.jq.mute.hide();this.css.jq.unmute.hide()}else if(a){this.css.jq.mute.hide();
	this.css.jq.unmute.show()}else{this.css.jq.mute.show();this.css.jq.unmute.hide()}},volume:function(a){a=this._limitValue(a,0,1);this.options.volume=a;this.html.used&&this._html_volume(a);this.flash.used&&this._flash_volume(a);if(!this.html.video.gate&&!this.html.audio.gate){this._updateVolume(a);this._trigger(b.jPlayer.event.volumechange)}},volumeBar:function(a){if(this.css.jq.volumeBar.length){var b=this.css.jq.volumeBar.offset(),d=a.pageX-b.left,e=this.css.jq.volumeBar.width(),a=this.css.jq.volumeBar.height()-
	a.pageY+b.top,b=this.css.jq.volumeBar.height();this.options.verticalVolume?this.volume(a/b):this.volume(d/e)}this.options.muted&&this._muted(false)},volumeBarValue:function(a){this.volumeBar(a)},_updateVolume:function(a){if(a===f)a=this.options.volume;a=this.options.muted?0:a;if(this.status.noVolume){this.css.jq.volumeBar.length&&this.css.jq.volumeBar.hide();this.css.jq.volumeBarValue.length&&this.css.jq.volumeBarValue.hide();this.css.jq.volumeMax.length&&this.css.jq.volumeMax.hide()}else{this.css.jq.volumeBar.length&&
	this.css.jq.volumeBar.show();if(this.css.jq.volumeBarValue.length){this.css.jq.volumeBarValue.show();this.css.jq.volumeBarValue[this.options.verticalVolume?"height":"width"](a*100+"%")}this.css.jq.volumeMax.length&&this.css.jq.volumeMax.show()}},volumeMax:function(){this.volume(1);this.options.muted&&this._muted(false)},_cssSelectorAncestor:function(a){var c=this;this.options.cssSelectorAncestor=a;this._removeUiClass();this.ancestorJq=a?b(a):[];a&&this.ancestorJq.length!==1&&this._warning({type:b.jPlayer.warning.CSS_SELECTOR_COUNT,
	context:a,message:b.jPlayer.warningMsg.CSS_SELECTOR_COUNT+this.ancestorJq.length+" found for cssSelectorAncestor.",hint:b.jPlayer.warningHint.CSS_SELECTOR_COUNT});this._addUiClass();b.each(this.options.cssSelector,function(a,b){c._cssSelector(a,b)})},_cssSelector:function(a,c){var d=this;if(typeof c==="string")if(b.jPlayer.prototype.options.cssSelector[a]){this.css.jq[a]&&this.css.jq[a].length&&this.css.jq[a].unbind(".jPlayer");this.options.cssSelector[a]=c;this.css.cs[a]=this.options.cssSelectorAncestor+
	" "+c;this.css.jq[a]=c?b(this.css.cs[a]):[];this.css.jq[a].length&&this.css.jq[a].bind("click.jPlayer",function(c){d[a](c);b(this).blur();return false});c&&this.css.jq[a].length!==1&&this._warning({type:b.jPlayer.warning.CSS_SELECTOR_COUNT,context:this.css.cs[a],message:b.jPlayer.warningMsg.CSS_SELECTOR_COUNT+this.css.jq[a].length+" found for "+a+" method.",hint:b.jPlayer.warningHint.CSS_SELECTOR_COUNT})}else this._warning({type:b.jPlayer.warning.CSS_SELECTOR_METHOD,context:a,message:b.jPlayer.warningMsg.CSS_SELECTOR_METHOD,
	hint:b.jPlayer.warningHint.CSS_SELECTOR_METHOD});else this._warning({type:b.jPlayer.warning.CSS_SELECTOR_STRING,context:c,message:b.jPlayer.warningMsg.CSS_SELECTOR_STRING,hint:b.jPlayer.warningHint.CSS_SELECTOR_STRING})},seekBar:function(a){if(this.css.jq.seekBar){var b=this.css.jq.seekBar.offset(),a=a.pageX-b.left,b=this.css.jq.seekBar.width();this.playHead(100*a/b)}},playBar:function(a){this.seekBar(a)},repeat:function(){this._loop(true)},repeatOff:function(){this._loop(false)},_loop:function(a){if(this.options.loop!==
	a){this.options.loop=a;this._updateButtons();this._trigger(b.jPlayer.event.repeat)}},currentTime:function(){},duration:function(){},gui:function(){},noSolution:function(){},option:function(a,c){var d=a;if(arguments.length===0)return b.extend(true,{},this.options);if(typeof a==="string"){var e=a.split(".");if(c===f){for(var d=b.extend(true,{},this.options),g=0;g<e.length;g++)if(d[e[g]]!==f)d=d[e[g]];else{this._warning({type:b.jPlayer.warning.OPTION_KEY,context:a,message:b.jPlayer.warningMsg.OPTION_KEY,
	hint:b.jPlayer.warningHint.OPTION_KEY});return f}return d}for(var g=d={},h=0;h<e.length;h++)if(h<e.length-1){g[e[h]]={};g=g[e[h]]}else g[e[h]]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(a,b){c._setOption(a,b)});return this},_setOption:function(a,c){var d=this;switch(a){case "volume":this.volume(c);break;case "muted":this._muted(c);break;case "cssSelectorAncestor":this._cssSelectorAncestor(c);break;case "cssSelector":b.each(c,function(a,b){d._cssSelector(a,
	b)});break;case "fullScreen":if(this.options[a]!==c){this._removeUiClass();this.options[a]=c;this._refreshSize()}break;case "size":!this.options.fullScreen&&this.options[a].cssClass!==c.cssClass&&this._removeUiClass();this.options[a]=b.extend({},this.options[a],c);this._refreshSize();break;case "sizeFull":this.options.fullScreen&&this.options[a].cssClass!==c.cssClass&&this._removeUiClass();this.options[a]=b.extend({},this.options[a],c);this._refreshSize();break;case "autohide":this.options[a]=b.extend({},
	this.options[a],c);this._updateAutohide();break;case "loop":this._loop(c);break;case "nativeVideoControls":this.options[a]=b.extend({},this.options[a],c);this.status.nativeVideoControls=this._uaBlocklist(this.options.nativeVideoControls);this._restrictNativeVideoControls();this._updateNativeVideoControls();break;case "noFullScreen":this.options[a]=b.extend({},this.options[a],c);this.status.nativeVideoControls=this._uaBlocklist(this.options.nativeVideoControls);this.status.noFullScreen=this._uaBlocklist(this.options.noFullScreen);
	this._restrictNativeVideoControls();this._updateButtons();break;case "noVolume":this.options[a]=b.extend({},this.options[a],c);this.status.noVolume=this._uaBlocklist(this.options.noVolume);this._updateVolume();this._updateMute();break;case "emulateHtml":if(this.options[a]!==c)(this.options[a]=c)?this._emulateHtmlBridge():this._destroyHtmlBridge()}return this},_refreshSize:function(){this._setSize();this._addUiClass();this._updateSize();this._updateButtons();this._updateAutohide();this._trigger(b.jPlayer.event.resize)},
	_setSize:function(){if(this.options.fullScreen){this.status.width=this.options.sizeFull.width;this.status.height=this.options.sizeFull.height;this.status.cssClass=this.options.sizeFull.cssClass}else{this.status.width=this.options.size.width;this.status.height=this.options.size.height;this.status.cssClass=this.options.size.cssClass}this.element.css({width:this.status.width,height:this.status.height})},_addUiClass:function(){this.ancestorJq.length&&this.ancestorJq.addClass(this.status.cssClass)},_removeUiClass:function(){this.ancestorJq.length&&
	this.ancestorJq.removeClass(this.status.cssClass)},_updateSize:function(){this.internal.poster.jq.css({width:this.status.width,height:this.status.height});!this.status.waitForPlay&&this.html.active&&this.status.video||this.html.video.available&&this.html.used&&this.status.nativeVideoControls?this.internal.video.jq.css({width:this.status.width,height:this.status.height}):!this.status.waitForPlay&&(this.flash.active&&this.status.video)&&this.internal.flash.jq.css({width:this.status.width,height:this.status.height})},
	_updateAutohide:function(){var a=this,b=function(){a.css.jq.gui.fadeIn(a.options.autohide.fadeIn,function(){clearTimeout(a.internal.autohideId);a.internal.autohideId=setTimeout(function(){a.css.jq.gui.fadeOut(a.options.autohide.fadeOut)},a.options.autohide.hold)})};if(this.css.jq.gui.length){this.css.jq.gui.stop(true,true);clearTimeout(this.internal.autohideId);this.element.unbind(".jPlayerAutohide");this.css.jq.gui.unbind(".jPlayerAutohide");if(this.status.nativeVideoControls)this.css.jq.gui.hide();
	else if(this.options.fullScreen&&this.options.autohide.full||!this.options.fullScreen&&this.options.autohide.restored){this.element.bind("mousemove.jPlayer.jPlayerAutohide",b);this.css.jq.gui.bind("mousemove.jPlayer.jPlayerAutohide",b);this.css.jq.gui.hide()}else this.css.jq.gui.show()}},fullScreen:function(){this._setOption("fullScreen",true)},restoreScreen:function(){this._setOption("fullScreen",false)},_html_initMedia:function(){this.htmlElement.media.src=this.status.src;this.options.preload!==
	"none"&&this._html_load();this._trigger(b.jPlayer.event.timeupdate)},_html_setAudio:function(a){var c=this;b.each(this.formats,function(b,e){if(c.html.support[e]&&a[e]){c.status.src=a[e];c.status.format[e]=true;c.status.formatType=e;return false}});this.htmlElement.media=this.htmlElement.audio;this._html_initMedia()},_html_setVideo:function(a){var c=this;b.each(this.formats,function(b,e){if(c.html.support[e]&&a[e]){c.status.src=a[e];c.status.format[e]=true;c.status.formatType=e;return false}});if(this.status.nativeVideoControls)this.htmlElement.video.poster=
	this._validString(a.poster)?a.poster:"";this.htmlElement.media=this.htmlElement.video;this._html_initMedia()},_html_resetMedia:function(){if(this.htmlElement.media){this.htmlElement.media.id===this.internal.video.id&&!this.status.nativeVideoControls&&this.internal.video.jq.css({width:"0px",height:"0px"});this.htmlElement.media.pause()}},_html_clearMedia:function(){if(this.htmlElement.media){this.htmlElement.media.src="";this.htmlElement.media.load()}},_html_load:function(){if(this.status.waitForLoad){this.status.waitForLoad=
	false;this.htmlElement.media.load()}clearTimeout(this.internal.htmlDlyCmdId)},_html_play:function(a){var b=this;this._html_load();this.htmlElement.media.play();if(!isNaN(a))try{this.htmlElement.media.currentTime=a}catch(d){this.internal.htmlDlyCmdId=setTimeout(function(){b.play(a)},100);return}this._html_checkWaitForPlay()},_html_pause:function(a){var b=this;a>0?this._html_load():clearTimeout(this.internal.htmlDlyCmdId);this.htmlElement.media.pause();if(!isNaN(a))try{this.htmlElement.media.currentTime=
	a}catch(d){this.internal.htmlDlyCmdId=setTimeout(function(){b.pause(a)},100);return}a>0&&this._html_checkWaitForPlay()},_html_playHead:function(a){var b=this;this._html_load();try{if(typeof this.htmlElement.media.seekable==="object"&&this.htmlElement.media.seekable.length>0)this.htmlElement.media.currentTime=a*this.htmlElement.media.seekable.end(this.htmlElement.media.seekable.length-1)/100;else if(this.htmlElement.media.duration>0&&!isNaN(this.htmlElement.media.duration))this.htmlElement.media.currentTime=
	a*this.htmlElement.media.duration/100;else throw"e";}catch(d){this.internal.htmlDlyCmdId=setTimeout(function(){b.playHead(a)},100);return}this.status.waitForLoad||this._html_checkWaitForPlay()},_html_checkWaitForPlay:function(){if(this.status.waitForPlay){this.status.waitForPlay=false;this.css.jq.videoPlay.length&&this.css.jq.videoPlay.hide();if(this.status.video){this.internal.poster.jq.hide();this.internal.video.jq.css({width:this.status.width,height:this.status.height})}}},_html_volume:function(a){if(this.html.audio.available)this.htmlElement.audio.volume=
	a;if(this.html.video.available)this.htmlElement.video.volume=a},_html_mute:function(a){if(this.html.audio.available)this.htmlElement.audio.muted=a;if(this.html.video.available)this.htmlElement.video.muted=a},_flash_setAudio:function(a){var c=this;try{b.each(this.formats,function(b,d){if(c.flash.support[d]&&a[d]){switch(d){case "m4a":case "fla":c._getMovie().fl_setAudio_m4a(a[d]);break;case "mp3":c._getMovie().fl_setAudio_mp3(a[d]);break;case "rtmpa":c._getMovie().fl_setAudio_rtmp(a[d])}c.status.src=
	a[d];c.status.format[d]=true;c.status.formatType=d;return false}});if(this.options.preload==="auto"){this._flash_load();this.status.waitForLoad=false}}catch(d){this._flashError(d)}},_flash_setVideo:function(a){var c=this;try{b.each(this.formats,function(b,d){if(c.flash.support[d]&&a[d]){switch(d){case "m4v":case "flv":c._getMovie().fl_setVideo_m4v(a[d]);break;case "rtmpv":c._getMovie().fl_setVideo_rtmp(a[d])}c.status.src=a[d];c.status.format[d]=true;c.status.formatType=d;return false}});if(this.options.preload===
	"auto"){this._flash_load();this.status.waitForLoad=false}}catch(d){this._flashError(d)}},_flash_resetMedia:function(){this.internal.flash.jq.css({width:"0px",height:"0px"});this._flash_pause(NaN)},_flash_clearMedia:function(){try{this._getMovie().fl_clearMedia()}catch(a){this._flashError(a)}},_flash_load:function(){try{this._getMovie().fl_load()}catch(a){this._flashError(a)}this.status.waitForLoad=false},_flash_play:function(a){try{this._getMovie().fl_play(a)}catch(b){this._flashError(b)}this.status.waitForLoad=
	false;this._flash_checkWaitForPlay()},_flash_pause:function(a){try{this._getMovie().fl_pause(a)}catch(b){this._flashError(b)}if(a>0){this.status.waitForLoad=false;this._flash_checkWaitForPlay()}},_flash_playHead:function(a){try{this._getMovie().fl_play_head(a)}catch(b){this._flashError(b)}this.status.waitForLoad||this._flash_checkWaitForPlay()},_flash_checkWaitForPlay:function(){if(this.status.waitForPlay){this.status.waitForPlay=false;this.css.jq.videoPlay.length&&this.css.jq.videoPlay.hide();if(this.status.video){this.internal.poster.jq.hide();
	this.internal.flash.jq.css({width:this.status.width,height:this.status.height})}}},_flash_volume:function(a){try{this._getMovie().fl_volume(a)}catch(b){this._flashError(b)}},_flash_mute:function(a){try{this._getMovie().fl_mute(a)}catch(b){this._flashError(b)}},_getMovie:function(){return document[this.internal.flash.id]},_checkForFlash:function(a){var b=false,d;if(window.ActiveXObject)try{new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+a);b=true}catch(e){}else if(navigator.plugins&&navigator.mimeTypes.length>
	0)(d=navigator.plugins["Shockwave Flash"])&&navigator.plugins["Shockwave Flash"].description.replace(/.*\s(\d+\.\d+).*/,"$1")>=a&&(b=true);return b},_validString:function(a){return a&&typeof a==="string"},_limitValue:function(a,b,d){return a<b?b:a>d?d:a},_urlNotSetError:function(a){this._error({type:b.jPlayer.error.URL_NOT_SET,context:a,message:b.jPlayer.errorMsg.URL_NOT_SET,hint:b.jPlayer.errorHint.URL_NOT_SET})},_flashError:function(a){var c;c=this.internal.ready?"FLASH_DISABLED":"FLASH";this._error({type:b.jPlayer.error[c],
	context:this.internal.flash.swf,message:b.jPlayer.errorMsg[c]+a.message,hint:b.jPlayer.errorHint[c]});this.internal.flash.jq.css({width:"1px",height:"1px"})},_error:function(a){this._trigger(b.jPlayer.event.error,a);this.options.errorAlerts&&this._alert("Error!"+(a.message?"\n\n"+a.message:"")+(a.hint?"\n\n"+a.hint:"")+"\n\nContext: "+a.context)},_warning:function(a){this._trigger(b.jPlayer.event.warning,f,a);this.options.warningAlerts&&this._alert("Warning!"+(a.message?"\n\n"+a.message:"")+(a.hint?
	"\n\n"+a.hint:"")+"\n\nContext: "+a.context)},_alert:function(a){alert("jPlayer "+this.version.script+" : id='"+this.internal.self.id+"' : "+a)},_emulateHtmlBridge:function(){var a=this;b.each(b.jPlayer.emulateMethods.split(/\s+/g),function(b,d){a.internal.domNode[d]=function(b){a[d](b)}});b.each(b.jPlayer.event,function(c,d){var e=true;b.each(b.jPlayer.reservedEvent.split(/\s+/g),function(a,b){if(b===c)return e=false});e&&a.element.bind(d+".jPlayer.jPlayerHtml",function(){a._emulateHtmlUpdate();
	var b=document.createEvent("Event");b.initEvent(c,false,true);a.internal.domNode.dispatchEvent(b)})})},_emulateHtmlUpdate:function(){var a=this;b.each(b.jPlayer.emulateStatus.split(/\s+/g),function(b,d){a.internal.domNode[d]=a.status[d]});b.each(b.jPlayer.emulateOptions.split(/\s+/g),function(b,d){a.internal.domNode[d]=a.options[d]})},_destroyHtmlBridge:function(){var a=this;this.element.unbind(".jPlayerHtml");b.each((b.jPlayer.emulateMethods+" "+b.jPlayer.emulateStatus+" "+b.jPlayer.emulateOptions).split(/\s+/g),
	function(b,d){delete a.internal.domNode[d]})}};b.jPlayer.error={FLASH:"e_flash",FLASH_DISABLED:"e_flash_disabled",NO_SOLUTION:"e_no_solution",NO_SUPPORT:"e_no_support",URL:"e_url",URL_NOT_SET:"e_url_not_set",VERSION:"e_version"};b.jPlayer.errorMsg={FLASH:"jPlayer's Flash fallback is not configured correctly, or a command was issued before the jPlayer Ready event. Details: ",FLASH_DISABLED:"jPlayer's Flash fallback has been disabled by the browser due to the CSS rules you have used. Details: ",NO_SOLUTION:"No solution can be found by jPlayer in this browser. Neither HTML nor Flash can be used.",
	NO_SUPPORT:"It is not possible to play any media format provided in setMedia() on this browser using your current options.",URL:"Media URL could not be loaded.",URL_NOT_SET:"Attempt to issue media playback commands, while no media url is set.",VERSION:"jPlayer "+b.jPlayer.prototype.version.script+" needs Jplayer.swf version "+b.jPlayer.prototype.version.needFlash+" but found "};b.jPlayer.errorHint={FLASH:"Check your swfPath option and that Jplayer.swf is there.",FLASH_DISABLED:"Check that you have not display:none; the jPlayer entity or any ancestor.",
	NO_SOLUTION:"Review the jPlayer options: support and supplied.",NO_SUPPORT:"Video or audio formats defined in the supplied option are missing.",URL:"Check media URL is valid.",URL_NOT_SET:"Use setMedia() to set the media URL.",VERSION:"Update jPlayer files."};b.jPlayer.warning={CSS_SELECTOR_COUNT:"e_css_selector_count",CSS_SELECTOR_METHOD:"e_css_selector_method",CSS_SELECTOR_STRING:"e_css_selector_string",OPTION_KEY:"e_option_key"};b.jPlayer.warningMsg={CSS_SELECTOR_COUNT:"The number of css selectors found did not equal one: ",
	CSS_SELECTOR_METHOD:"The methodName given in jPlayer('cssSelector') is not a valid jPlayer method.",CSS_SELECTOR_STRING:"The methodCssSelector given in jPlayer('cssSelector') is not a String or is empty.",OPTION_KEY:"The option requested in jPlayer('option') is undefined."};b.jPlayer.warningHint={CSS_SELECTOR_COUNT:"Check your css selector and the ancestor.",CSS_SELECTOR_METHOD:"Check your method name.",CSS_SELECTOR_STRING:"Check your css selector is a string.",OPTION_KEY:"Check your option name."}})(jQuery);
 

//<script type="text/javascript" src="{PREFIX}static/js/audioPlayer/audioJplayer.js" ></script>

function addAudioLong(element,i,isIOS){
    var file_play = $(element).attr("media-url");        
        var is_paid=$(element).attr("is_paid");
        var player_type=$(element).attr("player_type");
        if(is_paid){
            file_play=getLinkVIP(file_play,'mp3');           
        }
        var is_auto="";
        if($(element).attr("auto")){
            is_auto=',autoplay: "true"';
        }    
        var prefix = 'v2_audio_player';
        var class_id = 'v2_audio_player';
        var time_now = new Date().getTime();
        if($(element).hasClass("jquery_jplayer_home")){
            prefix = 'v2_player_home_';
            class_id = 'jquery_jplayer_home';
        }else if($(element).hasClass('jquery_jplayer_long')){
            prefix = 'v2_player_lesson_';
            class_id = 'jquery_jplayer_long';
        }else if($(element).hasClass('jquery_jplayer_lesson')){
            prefix = 'v2_player_comment_';
            class_id = 'jquery_jplayer_lesson';
        }        
        //Check element show?
        //console.log(prefix+i+':'+$(element).is(":visible"));
        if(!$(element).is(":visible")){
            return;
        }
        //Check added audio?
        if($(element).attr('add_audio')){
            return;
        }
        if(player_type){
             isIOS=true;
        }else{
            isIOS = DetectIos();
        }
        prefix += time_now;
        
    if(!isIOS){
                $(element).attr("id",prefix + i);
        $(element).after('<script language="javascript"> PKL_AddPlayer({ target: "' + prefix + i + '",id: "' + prefix + i + '", media: "' + file_play + '", timeformat: "1"'+is_auto+'});</script>');
    }else{
        $(element).after('<div id="' + prefix + i +'" class="jp_audio_long"><div class="jp-gui ui-widget ui-widget-content ui-corner-all adl_box"><ul><li class="jp-play ui-state-default ui-corner-all adl_play"><a href="javascript:;" class="jp-play ui-icon ui-icon-play adl_play_in" tabindex="1" title="play">play</a></li><li class="jp-pause ui-state-default ui-corner-all adl_pause"><a href="javascript:;" class="jp-pause ui-icon ui-icon-pause adl_play_in" tabindex="1" title="pause">pause</a></li></ul><div class="jp-progress-slider adl_slider"></div><div class="jp-current-time  counttime adl_time"></div><div class="jp-clearboth"></div></div></div>');    
        var myPlayer = $(element),
            myPlayerData,
            fixFlash_mp4,
            fixFlash_mp4_id,
            ignore_timeupdate, 
            options = {
                ready: function (event) {
                    if(event.jPlayer.status.noVolume) {
                        $(".jp-gui").addClass("jp-no-volume");
                    }
                    fixFlash_mp4 = event.jPlayer.flash.used && /mp3/.test(event.jPlayer.options.supplied);
                    if(is_auto==""){
                        $(this).jPlayer("setMedia", {
                        mp3: file_play
                        });
                    }else{
                        $(this).jPlayer("setMedia", {
                        mp3: file_play
                        }).jPlayer("play");
                    }    
                    
                    $(".adl_slider").find("a").addClass("adl_icon");
                    $(".adl_slider").find("div").addClass("adl_sl");
                },
                                   play: function(event) { // To avoid both jPlayers playing together.                
                                        $(this).jPlayer("pauseOthers");                            
                },                          
                 timeupdate: function(event) {
                    if(!ignore_timeupdate) {
                        myControl.progress.slider("value", event.jPlayer.status.currentPercentAbsolute);
                    }
                },
                 solution:"flash, html",    
                swfPath:"/static/js/audioPlayer/jplayer/js/Jplayer.swf",                
                supplied: "mp3",
                cssSelectorAncestor: "#" + prefix + i,
                wmode: "window"
            },
            myControl = {
                progress: $(options.cssSelectorAncestor + " .jp-progress-slider"),
                volume: $(options.cssSelectorAncestor + " .jp-volume-slider")
            };
                        
        myPlayer.jPlayer(options);
        myPlayerData = myPlayer.data("jPlayer");
        $('.jp-gui ul li').hover(
            function() { $(this).addClass('ui-state-hover'); },
            function() { $(this).removeClass('ui-state-hover'); }
        );
        myControl.progress.slider({
            animate: "fast",
            max: 100,
            range: "min",
            step: 0.1,
            value : 0,
            slide: function(event, ui) {
                var sp = myPlayerData.status.seekPercent;
                if(sp > 0) {
                    if(fixFlash_mp4) {
                        ignore_timeupdate = true;
                        clearTimeout(fixFlash_mp4_id);
                        fixFlash_mp4_id = setTimeout(function() {
                            ignore_timeupdate = false;
                        },1000);
                    }
                    myPlayer.jPlayer("playHead", ui.value * (100 / sp));
                } else {
                    setTimeout(function() {
                        myControl.progress.slider("value", 0);
                    }, 0);
                }
            }
        });
    }
        //Danh dau phan tu da add audio
        $(element).attr('add_audio', true);
}

function addAudioLong_toeic(cmd,i,filename,pathFile){	
	$(cmd).after('<div class="jplayer_common" >Audio '+(i+1)+':</div><div id="jp_container_long'+i+'" class="jplayer_common"><div class="jp-gui ui-widget ui-widget-content ui-corner-all adl_box"><ul><li class="jp_player_stt jp-play ui-state-default ui-corner-all adl_play"><a href="javascript:;" class="ui-icon ui-icon-play adl_play_in" tabindex="1" title="play">play</a></li><li class="jp-pause ui-state-default ui-corner-all adl_pause"><a href="javascript:;" class="jp-pause ui-icon ui-icon-pause adl_play_in" tabindex="1" title="pause">pause</a></li></ul><div class="jp-progress-slider adl_slider"></div><div class="jp-current-time  counttime adl_time"></div><div class="jp-clearboth"></div></div></div>');	
	
	var myPlayer = $(cmd),
		myPlayerData,
		fixFlash_mp4,
		fixFlash_mp4_id,
		ignore_timeupdate, 
		options = {
			ready: function (event) {
				if(event.jPlayer.status.noVolume) {
					$(".jp-gui").addClass("jp-no-volume");
				}
				fixFlash_mp4 = event.jPlayer.flash.used && /mp3/.test(event.jPlayer.options.supplied);
				$(this).jPlayer("setMedia", {
				mp3: pathFile+'/'+filename
				});
                                 $(".adl_slider").find("a").addClass("adl_icon");
                                 $(".adl_slider").find("div").addClass("adl_sl");
			},			
			play: function(event) { // To avoid both jPlayers playing together.
                                 $(this).jPlayer("pauseOthers"); 
                                    $(this).addClass('jplayer_playing');
			},
                        width:"150px",
                        height:"40px",
                        playing : function(event){
				
                             //   console.log(this);
			},
		/*	load : function(event){
				console.log("error");	
			},
			warning  : function(event){
				console.log("warning ");			
			},
			loadstart : function(event){
				console.log("loadstart");	
			},
			abort : function(event){
				console.log("abort");				
			},
			loadeddata : function(event){
				console.log("loadeddata");	
			},
			waiting : function(event){
				console.log("waiting");	
			},
			playing : function(event){
				console.log("playing");	
			},
			canplay : function(event){
				console.log("canplay");	
			},
			ended  : function(event){
				console.log("ended ");	
			},
			emptied : function(event){
				console.log("emptied");			
			},
			
			*/
			
			timeupdate: function(event) {
				if(!ignore_timeupdate) {
					myControl.progress.slider("value", event.jPlayer.status.currentPercentAbsolute);
				}
			},
                         solution:"flash, html",
                        swfPath:"/static/js/audioPlayer/jplayer/js/Jplayer.swf",
			supplied: "mp3",
			cssSelectorAncestor: "#jp_container_long"+i,
			wmode: "window"
		},
		myControl = {
			progress: $(options.cssSelectorAncestor + " .jp-progress-slider"),
			volume: $(options.cssSelectorAncestor + " .jp-volume-slider")
		};
	myPlayer.jPlayer(options);
	myPlayerData = myPlayer.data("jPlayer");
	$('.jp-gui ul li').hover(
		function() { $(this).addClass('ui-state-hover'); },
		function() { $(this).removeClass('ui-state-hover'); }
	);
	myControl.progress.slider({
		animate: "fast",
		max: 100,
		range: "min",
		step: 0.1,
		value : 0,
		slide: function(event, ui) {
			var sp = myPlayerData.status.seekPercent;
			if(sp > 0) {
				if(fixFlash_mp4) {
					ignore_timeupdate = true;
					clearTimeout(fixFlash_mp4_id);
					fixFlash_mp4_id = setTimeout(function() {
						ignore_timeupdate = false;
					},1000);
				}
				myPlayer.jPlayer("playHead", ui.value * (100 / sp));
			} else {
				setTimeout(function() {
					myControl.progress.slider("value", 0);
				}, 0);
			}
		}
	});
	
}
//<script type="text/javascript" src="{PREFIX}static/js/audioPlayer/detect/mdetect.js"></script>
var isIphone=false;var isAndroidPhone=false;var isTierTablet=false;var isTierIphone=false;var isTierRichCss=false;var isTierGenericMobile=false;var engineWebKit="webkit";var browserChrome="chrome";var deviceIphone="iphone";var deviceIpod="ipod";var deviceIpad="ipad";var deviceMacPpc="macintosh";var deviceAndroid="android";var deviceGoogleTV="googletv";var deviceXoom="xoom";var deviceHtcFlyer="htc_flyer";var deviceNuvifone="nuvifone";var deviceSymbian="symbian";var deviceS60="series60";var deviceS70="series70";var deviceS80="series80";var deviceS90="series90";var deviceWinPhone7="windows phone os 7";var deviceWinMob="windows ce";var deviceWindows="windows";var deviceIeMob="iemobile";var devicePpc="ppc";var enginePie="wm5 pie";var deviceBB="blackberry";var vndRIM="vnd.rim";var deviceBBStorm="blackberry95";var deviceBBBold="blackberry97";var deviceBBTour="blackberry96";var deviceBBCurve="blackberry89";var deviceBBTorch="blackberry 98";var deviceBBPlaybook="playbook";var devicePalm="palm";var deviceWebOS="webos";var deviceWebOShp="hpwos";var engineBlazer="blazer";var engineXiino="xiino";var deviceKindle="kindle";var vndwap="vnd.wap";var wml="wml";var deviceTablet="tablet";var deviceBrew="brew";var deviceDanger="danger";var deviceHiptop="hiptop";var devicePlaystation="playstation";var deviceNintendoDs="nitro";var deviceNintendo="nintendo";var deviceWii="wii";var deviceXbox="xbox";var deviceArchos="archos";var engineOpera="opera";var engineNetfront="netfront";var engineUpBrowser="up.browser";var engineOpenWeb="openweb";var deviceMidp="midp";var uplink="up.link";var engineTelecaQ='teleca q';var devicePda="pda";var mini="mini";var mobile="mobile";var mobi="mobi";var maemo="maemo";var linux="linux";var qtembedded="qt embedded";var mylocom2="com2";var manuSonyEricsson="sonyericsson";var manuericsson="ericsson";var manuSamsung1="sec-sgh";var manuSony="sony";var manuHtc="htc";var svcDocomo="docomo";var svcKddi="kddi";var svcVodafone="vodafone";var disUpdate="update";var uagent=navigator.userAgent.toLowerCase();function DetectIphone()
{if(uagent.search(deviceIphone)>-1)
{if(DetectIpad()||DetectIpod())
return false;else
return true;}
else
return false;}
function DetectIpod()
{if(uagent.search(deviceIpod)>-1)
return true;else
return false;}
function DetectIpad()
{if(uagent.search(deviceIpad)>-1&&DetectWebkit())
return true;else
return false;}
function DetectIphoneOrIpod()
{if(uagent.search(deviceIphone)>-1||uagent.search(deviceIpod)>-1)
return true;else
return false;}
function DetectIos()
{if(DetectIphoneOrIpod()||DetectIpad())
return true;else
return false;}
function DetectChrome(){if(uagent.search(browserChrome)>-1){return true;}else{return false;}}
function DetectAndroid()
{if((uagent.search(deviceAndroid)>-1)||DetectGoogleTV())
return true;if(uagent.search(deviceHtcFlyer)>-1)
return true;else
return false;}
function DetectAndroidPhone()
{if(DetectAndroid()&&(uagent.search(mobile)>-1))
return true;if(uagent.search(deviceHtcFlyer)>-1)
return true;else
return false;}
function DetectAndroidTablet()
{if(uagent.search(deviceHtcFlyer)>-1)
return false;if(DetectAndroid()&&!(uagent.search(mobile)>-1))
return true;else
return false;}
function DetectAndroidWebKit()
{if(DetectAndroid()&&DetectWebkit())
return true;else
return false;}
function DetectGoogleTV()
{if(uagent.search(deviceGoogleTV)>-1)
return true;else
return false;}
function DetectWebkit()
{if(uagent.search(engineWebKit)>-1)
return true;else
return false;}
function DetectS60OssBrowser()
{if(DetectWebkit())
{if((uagent.search(deviceS60)>-1||uagent.search(deviceSymbian)>-1))
return true;else
return false;}
else
return false;}
function DetectSymbianOS()
{if(uagent.search(deviceSymbian)>-1||uagent.search(deviceS60)>-1||uagent.search(deviceS70)>-1||uagent.search(deviceS80)>-1||uagent.search(deviceS90)>-1)
return true;else
return false;}
function DetectWindowsPhone7()
{if(uagent.search(deviceWinPhone7)>-1)
return true;else
return false;}
function DetectWindowsMobile()
{if(DetectWindowsPhone7())
return false;if(uagent.search(deviceWinMob)>-1||uagent.search(deviceIeMob)>-1||uagent.search(enginePie)>-1)
return true;if((uagent.search(devicePpc)>-1)&&!(uagent.search(deviceMacPpc)>-1))
return true;if(uagent.search(manuHtc)>-1&&uagent.search(deviceWindows)>-1)
return true;else
return false;}
function DetectBlackBerry()
{if(uagent.search(deviceBB)>-1)
return true;if(uagent.search(vndRIM)>-1)
return true;else
return false;}
function DetectBlackBerryTablet()
{if(uagent.search(deviceBBPlaybook)>-1)
return true;else
return false;}
function DetectBlackBerryWebKit()
{if(DetectBlackBerry()&&uagent.search(engineWebKit)>-1)
return true;else
return false;}
function DetectBlackBerryTouch()
{if(DetectBlackBerry()&&((uagent.search(deviceBBStorm)>-1)||(uagent.search(deviceBBTorch)>-1)))
return true;else
return false;}
function DetectBlackBerryHigh()
{if(DetectBlackBerryWebKit())
return false;if(DetectBlackBerry())
{if(DetectBlackBerryTouch()||uagent.search(deviceBBBold)>-1||uagent.search(deviceBBTour)>-1||uagent.search(deviceBBCurve)>-1)
return true;else
return false;}
else
return false;}
function DetectBlackBerryLow()
{if(DetectBlackBerry())
{if(DetectBlackBerryHigh()||DetectBlackBerryWebKit())
return false;else
return true;}
else
return false;}
function DetectPalmOS()
{if(uagent.search(devicePalm)>-1||uagent.search(engineBlazer)>-1||uagent.search(engineXiino)>-1)
{if(DetectPalmWebOS())
return false;else
return true;}
else
return false;}
function DetectPalmWebOS()
{if(uagent.search(deviceWebOS)>-1)
return true;else
return false;}
function DetectWebOSTablet()
{if(uagent.search(deviceWebOShp)>-1&&uagent.search(deviceTablet)>-1)
return true;else
return false;}
function DetectGarminNuvifone()
{if(uagent.search(deviceNuvifone)>-1)
return true;else
return false;}
function DetectSmartphone()
{if(DetectIphoneOrIpod()||DetectAndroidPhone()||DetectS60OssBrowser()||DetectSymbianOS()||DetectWindowsMobile()||DetectWindowsPhone7()||DetectBlackBerry()||DetectPalmWebOS()||DetectPalmOS()||DetectGarminNuvifone())
return true;return false;};function DetectArchos()
{if(uagent.search(deviceArchos)>-1)
return true;else
return false;}
function DetectBrewDevice()
{if(uagent.search(deviceBrew)>-1)
return true;else
return false;}
function DetectDangerHiptop()
{if(uagent.search(deviceDanger)>-1||uagent.search(deviceHiptop)>-1)
return true;else
return false;}
function DetectMaemoTablet()
{if(uagent.search(maemo)>-1)
return true;if((uagent.search(linux)>-1)&&(uagent.search(deviceTablet)>-1)&&!DetectWebOSTablet())
return true;else
return false;}
function DetectSonyMylo()
{if(uagent.search(manuSony)>-1)
{if(uagent.search(qtembedded)>-1||uagent.search(mylocom2)>-1)
return true;else
return false;}
else
return false;}
function DetectOperaMobile()
{if(uagent.search(engineOpera)>-1)
{if(uagent.search(mini)>-1||uagent.search(mobi)>-1)
return true;else
return false;}
else
return false;}
function DetectSonyPlaystation()
{if(uagent.search(devicePlaystation)>-1)
return true;else
return false;};function DetectNintendo()
{if(uagent.search(deviceNintendo)>-1||uagent.search(deviceWii)>-1||uagent.search(deviceNintendoDs)>-1)
return true;else
return false;};function DetectXbox()
{if(uagent.search(deviceXbox)>-1)
return true;else
return false;};function DetectGameConsole()
{if(DetectSonyPlaystation())
return true;if(DetectNintendo())
return true;if(DetectXbox())
return true;else
return false;};function DetectKindle()
{if(uagent.search(deviceKindle)>-1)
return true;else
return false;}
function DetectMobileQuick()
{if(DetectTierTablet())
return false;if(DetectSmartphone())
return true;if(uagent.search(deviceMidp)>-1||DetectBrewDevice())
return true;if(DetectOperaMobile())
return true;if(uagent.search(engineNetfront)>-1)
return true;if(uagent.search(engineUpBrowser)>-1)
return true;if(uagent.search(engineOpenWeb)>-1)
return true;if(DetectDangerHiptop())
return true;if(DetectMaemoTablet())
return true;if(DetectArchos())
return true;if((uagent.search(devicePda)>-1)&&!(uagent.search(disUpdate)>-1))
return true;if(uagent.search(mobile)>-1)
return true;if(DetectKindle())
return true;return false;};function DetectMobileLong()
{if(DetectMobileQuick())
return true;if(DetectGameConsole())
return true;if(DetectSonyMylo())
return true;if(uagent.search(manuSamsung1)>-1||uagent.search(manuSonyEricsson)>-1||uagent.search(manuericsson)>-1)
return true;if(uagent.search(svcDocomo)>-1)
return true;if(uagent.search(svcKddi)>-1)
return true;if(uagent.search(svcVodafone)>-1)
return true;return false;};function DetectTierTablet()
{if(DetectIpad()||DetectAndroidTablet()||DetectBlackBerryTablet()||DetectWebOSTablet())
return true;else
return false;};function DetectTierIphone()
{if(DetectIphoneOrIpod())
return true;if(DetectAndroidPhone())
return true;if(DetectBlackBerryWebKit()&&DetectBlackBerryTouch())
return true;if(DetectPalmWebOS())
return true;if(DetectGarminNuvifone())
return true;if(DetectMaemoTablet())
return true;else
return false;};function DetectTierRichCss()
{if(DetectMobileQuick())
{if(DetectTierIphone())
return false;if(DetectWebkit())
return true;if(DetectS60OssBrowser())
return true;if(DetectBlackBerryHigh())
return true;if(DetectWindowsPhone7())
return true;if(DetectWindowsMobile())
return true;if(uagent.search(engineTelecaQ)>-1)
return true;else
return false;}
else
return false;};function DetectTierOtherPhones()
{if(DetectMobileLong())
{if(DetectTierIphone()||DetectTierRichCss())
return false;else
return true;}
else
return false;};function InitDeviceScan()
{isIphone=DetectIphoneOrIpod();isAndroidPhone=DetectAndroidPhone();isTierIphone=DetectTierIphone();isTierTablet=DetectTierTablet();isTierRichCss=DetectTierRichCss();isTierGenericMobile=DetectTierOtherPhones();};InitDeviceScan()
