/**
* Login check
*/
var saLogin = 0;
$('body').append('<div id="configurator-s7-preSelect"></div>');
$(document).ready(function(){
	/*if(window.location.href.indexOf("/us/mobile/mobile-accessories/phones/sm-v2010abaatt-sm-v2010abaatt") >-1){
		$('#pdp-page .product-details__info-results > a').remove();
	}*/

	hostName();
	checkIframeHeight();
	initPromoOverlay();
	window.uniday = 'active';
	
	$(document).on("click", ".logoutSMG", function(e) {
		//dropCookiesHistory($(this).attr('href'));
		e.preventDefault();
		var ssoUrl=window.location.host.indexOf("www.samsung.com")>-1?"https://sso-us.samsung.com":"https://sso-stg.us.samsung.com";
		$.ajax({
			url: ssoUrl+"/sso/apiservices/logout",
			method:"GET",
			async: false,
			dataType: 'jsonp',
			crossDomain: true,
			jsonpCallback: 'logoutCallback'
		});
	});
	
    if (location.hash === '#12days' && location.pathname === '/us/shop/black-friday/') {
		$(window).scrollTop($('.section.sg-g-n-days').offset().top);
	}
	
	if($("meta[name='title']").attr("content")=="Home"){
		$.lazysizesLoaded($(".page-content .feature-benefit-full-bleed-image.section:first-of-type .feature-benefit-full-bleed-image__image-container"), '.lazyload').done(function() {
		var $eppbar=$(".epp-bar-wrap");
		var $fbsect=$(".feature-benefit-full-bleed-image.section:first-of-type");
		var $picCont=$(".page-content .feature-benefit-full-bleed-image.section:first-of-type .feature-benefit-full-bleed-image__image-container");
		var $pic=$(".page-content .feature-benefit-full-bleed-image.section:first-of-type .feature-benefit-full-bleed-image__image-container picture");
		var $imgsrc=$(".page-content .feature-benefit-full-bleed-image.section:first-of-type .feature-benefit-full-bleed-image__image-container picture source");
		var $img=$(".page-content .feature-benefit-full-bleed-image.section:first-of-type .feature-benefit-full-bleed-image__image-container picture img");
		var imgh=$picCont.outerHeight()>0?$picCont.outerHeight():959;
		var imgt=$(".gnb-b2c-promo-wrapper").outerHeight()||0;
		var hpimg=$imgsrc.attr('data-srcset')||0;
		
		if($picCont.size()>0){
			$("#inner-wrap").addClass("home");
			var ph=$(".gnb-b2c-promo-wrapper").css("display")!="none"?($(".gnb-b2c-promo-wrapper").outerHeight()||0):0;
			var epph=$eppbar.css("display")!="none"?$eppbar.outerHeight():0;
			var navh=($("nav").outerHeight()-ph-epph)||67;
			$fbsect.css({"position":"relative","top":"-"+navh+"px","padding-top":navh+"px","margin-bottom":"-"+navh+"px","background-image":"url('"+hpimg+"')","background-position":"center top","background-size":"cover"});
			$img.css("visibility","hidden");
		}
		});
	}
	if (!window.location.pathname.match('/us/support/account$') && !window.location.pathname.match('/us/support/account/$')) {
		$(document).trigger('initLogin');
	}
	if(getCookie("tppid")!="16568500"){
		$(".eppFaq").remove();
	}else{
		$(".eppFaq").show();
	}

// gnb login checkout page text
	var isCheckout = /^\/us\/checkout\//.test(window.location.pathname),
	checkoutBarImg = $('.gnb-login-container__group-image'),
	loginStep = $('.gnb-login-container .sign-in-phase'),
	signUpStep = $('.gnb-login-container .sign-up-phase');


	if (isCheckout) {
		$('.gnb-login-inner__left__title', loginStep).text('Please log into your Samsung account');

		$('.gnb-login-inner__left__subtitle', loginStep).text('');
		// Before
		// $('.gnb-login-inner__left__title--signup', signUpStep).text('Get the Galaxy you truly love with 0% APR*');
		// $('.gnb-login-inner__left__subtitle', signUpStep).text('Sign up for a Samsung account to gain access to exclusive offers, world-class customer support and apply for Samsung financing with 0% APR for purchases of $500 or more.*');

		// After for reflect the deferred program
		 $('.gnb-login-inner__left__title--signup', signUpStep).text('Get the products you love now and pay over time.');
		 $('.gnb-login-inner__left__subtitle', signUpStep).text('Create a Samsung account to gain access to exclusive offers, world-class customer support and to apply for special financing to pay for your purchases over time.');

		$('.gnb-login-inner__left__link a', loginStep).text('Create your Samsung account now');
		checkoutBarImg.show();
	}
	var remoteId = getCookie("remoteId");
	if ((remoteId == null) || (remoteId == "")){
		deleteCookie('SSO_SESSIONID','/','.samsung.com');
		deleteCookie('SSO_TOKEN','/','.samsung.com');
	}
	
	$(document).on('click', '.dr-ecom', function(e) {
		if ($(this).attr('hasgifttag') === 'Y') {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			window.location.href = window.location.protocol + '//' + window.location.hostname + $(this).parents('.product-module').find('.sizeme-title a').attr("href");
		}
	});

	if(/Android/i.test(window.navigator.userAgent) && (/SM-G950/i.test(window.navigator.userAgent) || /SM-G955/i.test(window.navigator.userAgent))) {
	    $('#hp-bixby-s8').show();
	}
});

function open2016PromoOverlay() {
	  if ($(".sg-overlay").length > 0) {
	    $('.sg-overlay-form').show();
	    $('.sg-overlay-success').hide();
	    $('.sg-overlay-error').hide();
	    $('.sg-overlay-exist').hide();
	    $('.sg-overlay-container .sg-overlay-modal').removeClass('sg-overlay-narrow-view');
	    $('.sg-g-overlay .sg-overlay').show();
	    var diff = $(window).height() - $('.sg-g-overlay .sg-overlay-modal').height() - 2*parseFloat($('.sg-g-overlay .sg-overlay-modal').css('padding-top'));
	    var dis = $(window).scrollTop();
	    if (diff > 0) {
	      dis += diff/2;
	    }
	    $('.sg-g-overlay .sg-overlay').css('top', dis);
	  }
}
function initPromoOverlay() {
	if($(".sg-overlay").length > 0) {
		function initForm() {
	      $(".sg-overlay-errormessage").remove();
	      _.each($('.sg-overlay-input-field'), function(el) {
	        $(el).val("");
	        if (el.attributes && el.attributes.isoptional && el.attributes.isoptional.value == 'true') {
	          el.removeAttribute("required");
	          if (el.attributes.placeholder.value.indexOf('(Optional)') == -1) {
	            el.attributes.placeholder.value += " (Optional)";
	          }
	        }
	      });
	    }
		initForm();
	    $('#sg-overlay-modal-close').click(function() {
	      $('.sg-overlay').hide();
	    });
	    $('.sg-overlay-input-field').blur(function() {
	      validateInput(this)
	    });
	    $('form#overlay-signUp').submit(function(e) {
	      var noError = true;
	      console.log('submit form');
	      _.each($('.sg-overlay-input-field'), function(el) {
	        var res = validateInput(el);
	        noError = noError && res;
	      });
	      e.preventDefault();
	      if (noError) {
	    	$('.sg-overlay-button').attr('disabled','true');
	        //var url = ''; //Using apache RewriteRule
	        var url = 'http://pages.samsung.com/us/DailySweepsEntries.do?'; //Original URL
	        url = url + 'campaignid=SEAC/160928-SEA1-03-08';
	        var data = '&' + $(this).serialize();
	        if (data.indexOf('&%3Acq_csrf_token') > -1) {
	          url = url + data.substring(0, data.indexOf('&%3Acq_csrf_token')); //substring csrf token from query
	        } else {
	          url = url + data;
	        }
	        url = url + '&cb_optin1=Y';
	        url = url + '&cb_optin2=0';
	        url = url + '&cb_optin3=0';
	        console.log('final url: ', url);
	        $.ajax({
	          type: 'POST',
	          url: url,
	          success: function(data) {
	        	$('.sg-overlay-button').removeAttr('disabled');
	            $('.sg-overlay-form').hide();
	            if (data == 'true') {
	              $('.sg-overlay-success').show();
	            } else if (data == 'alreadyExist'){
	              $('.sg-overlay-exist').show();
	            } else {
	              $('.sg-overlay-error').show();
	            }
	            $('.sg-overlay-container .sg-overlay-modal').addClass('sg-overlay-narrow-view');
	            var diff = $(window).height() - $('.sg-g-overlay .sg-overlay-modal').height() - 2*parseFloat($('.sg-g-overlay .sg-overlay-modal').css('padding-top'));
	            var dis = $(window).scrollTop();
	            if (diff > 0) {
	              dis += diff/2;
	            }
	            $('.sg-g-overlay .sg-overlay').css('top', dis);
	          },
	          error: function (error){
	        	 $('.sg-overlay-button').removeAttr('disabled');
	 			 console.log(error);
	          }
	        });    
	      }
	    });

	    function validateInput(el) {
	      $(el).next().remove();
	      var name = $(el).attr("placeholder");
	      var type = $(el).attr("validatetype");
	      var data = $(el).val();
	      var required = $(el).attr("required");
	      
	      if (!data) {
	        if (required) {
	          $(el).after('<span class="sg-overlay-errormessage">Please enter your ' + name + ' </span>');
	          return false;
	        }
	      } else {
	        if (type == 'text') {
	          var regexp = /^[A-Za-z0-9]{2,50}$/;
	          if (!regexp.test(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Please enter proper ' + name + ' </span>');
	            return false;
	          }
	        }
	        if (type == 'email') {
	          var regexp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	          if (!regexp.test(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Invalid email address </span>');
	            return false;
	          }
	        }
	        if (type == 'zipCode') {
	          var regexp = /^[0-9]{5}$/;
	          if (!regexp.test(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Please enter 5-digit zipcode </span>');
	            return false;
	          }
	        }
	        if (type == 'password') {
	          if (!isCustomSameCharPassword(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Passwords cannot contain 3 of the same characters in a row, e.g. 111, aaa</span>');
	            return false;
	          }
	          if (!isCustomAscDescPassword(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Password cannot contain 3 consecutive characters, e.g. 123, 321</span>');
	            return false;
	          }
	          if (!isCustomPassword(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Special characters cannot be used</span>');
	            return false;
	          }
	          if (!isAlphaNumPassword(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Please use alphanumeric combination</span>');
	            return false;
	          }
	          if (!isCustomSameEmailPassword(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Please do not use same words as your E-mail</span>');
	            return false;
	          }
	          if (!isMinLength(data)) {
	            $(el).after('<span class="sg-overlay-errormessage">Password must be at least 8 characters</span>');
	            return false;
	          }
	        }
	      }
	      return true; 
	    }

	    var isCustomSameCharPassword = function(password) {
	      if(!password || password.length<3)
	        return true;
	      var count = 1, it =1;
	      for( it = 1; it < password.length && count<3 ; it++){
	        if(password[it] == password[it-1] )
	          count++;
	          else
	            count = 1;
	        }
	      return it==password.length && count<3;
	    }

	    var isCustomAscDescPassword = function(password) {
	       if(!password || password.length < 3)
	        return true;
	       var flag,it;
	       var charSet ="1234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	       password = password.toUpperCase();
	       for( it = 2; it < password.length; it++){
	        var first = charSet.indexOf(password[it-2]);
	        var second = charSet.indexOf(password[it-1]);
	        var third = charSet.indexOf(password[it]);
	        if(first==-1)
	          continue;
	        if ((first+1 == second )&& (second+1 == third))
	          return false; //ASC
	        if ((first == second+1) && (second == third+1))
	          return false; //DESC
	        }
	        return true;
	    }

	    var isAlphaNumPassword = function(password) {
	      if(!password)
	        return false;
	      return /[a-z]/i.test(password) && /[0-9]/.test(password);
	    }

	    var isCustomPassword = function(password) {
	      if (!password || password == "")
	        return true;
	      var allowedCharSet = /^[a-zA-Z0-9\~\`\!\@\\\#\$\%\^\&\*\(\)\-\_\=\+\\\|\[\]\{\}\;\:\'\"\,\.\/\<\>\?]+$/;
	      return -1 != password.search(allowedCharSet);
	    }

	    var isCustomSameEmailPassword = function(email, password){
	      if(!email || !password)
	        return true;
	      return email.indexOf(password) == -1;
	    }

	    var isMinLength = function(password){
	      if(!password)
	        return false;
	      return  /.{8,}/.test(password);
	    }
	  }
}
function deleteCookie(name, path, domain)
{

  domain = "samsung.com";
  if (getCookie(name)) {
    document.cookie = name + '=' +
      ((path) ? ';path=' + path : '') +
      ((domain) ? ';domain=' + domain : '' ) +
      ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
  }
}
function checkIframeHeight(){
	var remoteId = getCookie("remoteId");
	var loggedIn = false;
	if ((remoteId != null) && (remoteId != "")){		
		loggedIn = true;
	}
	if(loggedIn==false&&window.location.href.indexOf("/us/support/account") != 23){
		$('#support_iframe').height(1560);
	}
}
function isLogin(){
	
	var remoteId = getCookie("remoteId");
	var optVal = getCookie("iPlanetDirectoryProOptVal");

	if ((remoteId != null) && (remoteId != "")){
		
		return true;
	}else if((optVal != null) && (optVal != "")){
			
		loginUser(optVal);
		
	} else{
		return false;
	}		
}
function loginUser(val){
	saLogin++;
	var url= "//sso-us.samsung.com/sso/profile/saLoginUser?optVal="+val;
	if(saLogin==1){
		$.ajax({
	        type: "POST",
	        url: url,
	        dataType: "jsonp",
	        async: false,
	        cache: false,
	        jsonpCallback: "callbackSso",
			jsonp: "callback"
	    });
	} 
}
function logoutCallback(data){
	if(data && data.result && data.result=="success"){
		dropCookiesHistory($('.logoutSMG').attr('href'));
		window.location.reload();
	}
	else{
		console.log(data);
	}
}
function callbackSso(data){
	if(data.login){
	var loginLink = $('.login');
	 var logoutLink = $('.logoutSMG');
	 loginLink.text('HI, ' + getUserName());
	  $('.login-trigger').hover(function(){
          loginLink.addClass('account-open');
          $(".myaccount-dropdown").css({opacity:1, display:'block'});
      }, function(){
          loginLink.removeClass('account-open');
          $(".myaccount-dropdown").css({opacity:0, display:'none'});
          open = false;
      });
	  
	  hostName();
	  //gnbNavigation.init();
      logoutLink.click(function(){
         dropCookiesHistory(logoutLink.attr('href'));
      });
	}
}

 function hostName(){
    var hostName = location.hostname;
    var logout = $('.logoutSMG');
	if(hostName.indexOf('www') !== -1) {
		logout.attr("href" ,'//sso-us.samsung.com/sso/logout');
    }
    else {
        logout.attr("href" ,'//sso-stg.us.samsung.com/sso/logout');
    }
}

function dropCookiesHistory(href){
    var finalURL = href;
    $('.logoutSMG').attr("href", finalURL);
    setCookie( "targetUrl", window.location.href, 0, '/', "samsung.com", '' );
    deleteCookie("prof_country", "/", document.domain);
    deleteCookie("prof_prolist_saved", "/", "");
    deleteCookie("prof_id", "/", document.domain);
    deleteCookie("prof_lname", "/", document.domain);
    deleteCookie("prof_bpno_s", "/", document.domain);
    deleteCookie("prof_fname", "/", document.domain);
    deleteCookie("prof_login_success", "/", document.domain);
    deleteCookie("bvdisplaycode", "/", "");
    deleteCookie("bvproductid", "/", "");
    deleteCookie("bvpage", "/", "");
    deleteCookie("bvcontenttype", "/", "");
    deleteCookie("bvauthenticateuser", "/", "");
    deleteCookie("bzv_url", "/", "");
    deleteCookie("auth_flag", "/", "");
    deleteCookie("iPlanetDirectoryProOptVal", "/", document.domain);
    deleteCookie("iPlanetDirectoryPro", "/", document.domain);
    deleteCookie("tppid", "/", document.domain);
    deleteCookie("tmktid", "/", document.domain);
    deleteCookie("tmktname", "/", document.domain);
    deleteCookie("tlgimg", "/", document.domain);
    deleteCookie("taccessrtype", "/", document.domain);
    deleteCookie("dr_a_token", "/", document.domain);
    deleteCookie("dr_r_token", "/", document.domain);
    deleteCookie("work_email", "/", document.domain);
    deleteCookie("work_pin", "/", document.domain);
    deleteCookie("remoteId", "/", document.domain);
    sessionStorage.removeItem('eppPlanId');
    sessionStorage.removeItem('eppMarketId');
    sessionStorage.removeItem('finderPrdIaCd');

    $.ajax({
        url: "http://shop.us.samsung.com/store?Action=Logout&Locale=en_US&SiteID=samsung&sout=json",
        dataType:'jsonp',
        data:'jsonp=callbackLogout'

    });

    return true;
}



/**
* Logout
*/
function clearCookiesAndMakeFinalURL(hrefValue)
{
     var mainURL=document.URL;
	 if(mainURL.indexOf("/us/appstore") >= 0){ 
		 mainURL = mainURL.substring(0,mainURL.indexOf("/us/appstore"))+"/us/appstore";
		 if(mainURL.indexOf("https://secureus") == 0){
			 mainURL = mainURL.replace("https://secureus", "http://www");
		 }
	 }
     var finalURL=hrefValue+"?url="+mainURL;
     $(".logoutSMG").attr("href", finalURL);
     deleteCookie("prof_country", "/", document.domain);
     deleteCookie("prof_id", "/", document.domain);
     //deleteCookie("prof_prolist", "/", document.domain);
     deleteCookie("bvdisplaycode", "/", "");
     deleteCookie("bvproductid", "/", "");
     deleteCookie("bvpage", "/", "");
     deleteCookie("bvcontenttype", "/", "");
     deleteCookie("bvauthenticateuser", "/", "");
     deleteCookie("bzv_url", "/", "");
     deleteCookie("auth_flag", "/", "");
     
     $.ajax({

	url: "http://shop.us.samsung.com/store?Action=Logout&Locale=en_US&SiteID=samsung&sout=json",
	dataType:'jsonp',
	data:'jsonp=callbackLogout'

	  
     });
     return true;
}

function callbackLogout(data){

/*
var mainURL=document.URL;

	 if(mainURL.indexOf("/us/appstore") >= 0){ 
		 mainURL = mainURL.substring(0,mainURL.indexOf("/us/appstore"))+"/us/appstore";
		 if(mainURL.indexOf("https://secureus") == 0){
			 mainURL = mainURL.replace("https://secureus", "http://www");
		 }
	 }

     var finalURL=hrefValue+"?url="+mainURL;
     
location.href = finalURL;
*/
}
/**
* get UserName
*/
function getUserName() {
    var prof_fname = fortune("prof_fname");
    // var name = "";

    // try {

    //     if (prof_fname)
    //         name = prof_fname.substring(0, 10);
    // } catch (e) {
    // }


    // return name;
    return prof_fname;
}

function getCookie(key) {
	return $.cookie(key);
}

function setCookie( name, value, expires, path, domain, secure )
{
	// set time, it's in milliseconds
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) {
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );
	document.cookie = name + "=" +( value ) +
	( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
	( ( path ) ? ";path=" + path : "" ) +
	( ( domain ) ? ";domain=" + domain : "" ) +
	( ( secure ) ? ";secure" : "" );
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function fortune(cookie) {
    return String($.cookie(cookie))
    .replace(/<script>/g,'')
    .replace(/<\/script>/g,'')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

if (window.location.href.indexOf('all-deals') > -1) {
    if ($.cookie("remoteId")) {
        $.removeCookie("teppaccess", {
            domain: '.samsung.com'
        })
    }
}

$(function(){
	if(window.location.href.indexOf("/us/support/account") > -1 && !$.cookie("remoteId") && $.cookie("taccessrtype") && $.cookie("taccessrtype") == "EmailDomain" ){
		setCookie( "targetUrl", document.location.protocol+'//'+document.domain+'/us/shop/all-deals/', 0, '/', "samsung.com", '' );
	
	} else if($.cookie("fromPage")=='prc'){
		var tarUrl = window.location.href.split('/us')[0];
		setCookie( "targetUrl", tarUrl+'/us/support/account', 0, '/', "samsung.com", '' );
	} else if(window.location.href.indexOf("marsLinkCategory") > -1){
		setCookie( "targetUrl", window.location.href, 0, '/', "samsung.com", '' );
	} else {
		var referrer = document.referrer;
		if(!!referrer && endsWith(referrer, "/us/mobile/phones/upgrade/") && $.cookie("sUPurl") != null) {
			setCookie( "targetUrl", window.location.origin + $.cookie("sUPurl"), 0, '/', "samsung.com", '' );
			if(!!$('#support_iframe').attr('src')){
				var addressDomain = $('#support_iframe').attr('src').split('/sso/secure/urlAction?targetUrl=')[0];
				if(!!addressDomain){
					$('#support_iframe').attr('src',addressDomain+'/sso/secure/urlAction');
				}
			}
		} else {
			if(!referrer||referrer.indexOf('/us/support/account')>-1||referrer=='http://sso-us.samsung.com/sso/logout?url=http://www.samsung.com/us/support/account/'){
				setCookie( "targetUrl", document.location.protocol+'//'+document.domain+'/us/support/account', 0, '/', "samsung.com", '' );
			}else{
				if(referrer.slice(-1)=='/'){
					referrer = referrer.slice(0,-1);
				}
				if(referrer.indexOf('//www')>-1 && referrer.indexOf('https')==-1){
					referrer = referrer.replace('http','https');
				}
				setCookie( "targetUrl", referrer, 0, '/', "samsung.com", '' );
			}
			if(!!$('#support_iframe').attr('src')){
				var addressDomain = $('#support_iframe').attr('src').split('/sso/secure/urlAction?targetUrl=')[0];
				var addressTarget = $('#support_iframe').attr('src').split('/sso/secure/urlAction?targetUrl=http://')[1];
				if(!!addressDomain && !!addressTarget){
					$('#support_iframe').attr('src',addressDomain+'/sso/secure/urlAction?targetUrl=https://'+addressTarget);
				}
			}
		}
	}
	
	if($.cookie('STA_USER_TYPE')=='DEALER'){
		$(".account .dropdown>ul>li>a").attr('href','http://support-us.samsung.com/stacyber/b2b/review_20/sta_b2b_index.jsp');
	}
	
	//FOOTER MOBILE ACCORDION
	function footerAccordions(){
		$(".span12 .column>h6").click(function(){
			footerCloseAll();
			if($(this).next('ul').css('display')=='none'){
				$(this).next('ul').slideToggle();
				if(!$("i",this).hasClass("inverted")){
					$("i",this).addClass("inverted");
				}
			}

		});
		$(".footer-store>h6").click(function(){
			footerCloseAll();
			if($(this).next('div').css('display')=='none'){
				$(this).next('div').slideToggle();
				if(!$("i",this).hasClass("inverted")){
					$("i",this).addClass("inverted");
				}
			}

		});
		$(".footer-store .span6>h6").click(function(){
			shopCloseAll();
			if($(this).next('ul').css('display')=='none'){
				$(this).next('ul').slideToggle();
				if(!$("i",this).hasClass("inverted")){
					$("i",this).addClass("inverted");
				}
			}
		});
		footerCloseAll();
	}

	function footerCloseAll(){
		shopCloseAll();
		$(".span12 .column>h6>i, .footer-store>h6>i").removeClass("inverted");
		$(".span12 .column>ul, .footer-store-body").not($(">ul",this)).slideUp();
	}
	function shopCloseAll(){
		$(".footer-store .span6>h6>i").removeClass("inverted");
		$(".footer-store .span6>ul").not($(">ul",this)).slideUp();
	}
	function desktopInit(){
		$(".footer-store-body, .footer-store-body ul, .right-column .span12 .column ul").show();
	}
	$(window).on('load resize', function(){
		$(".span12 .column>h6,.footer-store>h6,.footer-store .span6>h6").unbind('click');
		if(window.matchMedia("(min-width: 768px)").matches){
			desktopInit();
		}else{
			footerAccordions();

		}
	});
	
	// WHERE TO BUY INTERCEPT FOR PDP
	if(document.location.pathname.indexOf("/us/mobile/phones/galaxy-s/samsung-galaxy-s7-edge-32gb-us-cellular-black-onyx-sm-g935rzkausc")>-1){
		$("#pdp-page[data-prodid='SM-G935RZKAUSC'] .where-to-buy-cta").click(function(e){
			e.preventDefault();
			var mpdp="<div id='mpOverlay' style='display: none; position: fixed; width: 100%; height: 100%; background-color: rgba(0,0,0,.5); z-index: 10000;'>"
						+"<div style='display: block; max-width: 480px; height: 640px; margin: 0 auto; position: relative; top: 65px;'>"
							+"<div style='background-color: #fff;display: block; padding: 20px; height: 100%; margin: 0 15px; box-shadow: 0 2px 10px 0px rgba(0,0,0,.3);'>"
								+"<div class='closeMpOverlay' style='font-size: 2em; color: #000; float: right; line-height: .5em; cursor: pointer;'>&times;</div>"
							+"</div>"
						+"</div>"
					+"</div>";
			$("body").prepend(mpdp);
			$("#mpOverlay").fadeIn();
			$(".closeMpOverlay").click(function(){
				$("#mpOverlay").fadeOut().remove();
			});
		});
	}
	
	//PROMO CLOSE SESSION
	if($.cookie("spromoClose")!=undefined){
		$(".gnb-b2c-promo-wrapper").removeClass("gnb-active-promo-").hide();
	}else{
		$(".gnb-b2c-promo-wrapper").addClass("gnb-active-promo-")
	}
	$(".gnb-promo-close").click(function(){
		$('.gnb-b2c-promo-wrapper').removeClass('gnb-active-promo-').slideUp();
		$.cookie("spromoClose","closed",{domain:".samsung.com",path:"/"});
	});
});

/*---*/
var hideSamsungAppOverlay = function() {
     if(window.location.href.indexOf('/us/checkout') >= 0) {
        if($('#spop-overlay').length > 0 ) {
            $('#spop-overlay').hide();
        }
    if($('#spop-overlay2').length > 0 ) {
			$('#spop-overlay2').hide();
        }
    }
};

hideSamsungAppOverlay();

$(window).load(function() {
	if(getCookie('fromPage') == 'prc' && location.href.indexOf('/us/support/account') > -1){
        deleteCookie('fromPage','/','.samsung.com');
	}
});