//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/*global window, require, define */
(function(_window) {
  'use strict';

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

  function setupBrowser() {
    // Allow for MSIE11 msCrypto
    var _crypto = _window.crypto || _window.msCrypto;

    if (!_rng && _crypto && _crypto.getRandomValues) {
      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
      //
      // Moderately fast, high quality
      try {
        var _rnds8 = new Uint8Array(16);
        _whatwgRNG = _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
        _rng();
      } catch(e) {}
    }

    if (!_rng) {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var  _rnds = new Array(16);
      _mathRNG = _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return _rnds;
      };
      if ('undefined' !== typeof console && console.warn) {
        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
      }
    }
  }

  function setupNode() {
    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if ('function' === typeof require) {
      try {
        var _rb = require('crypto').randomBytes;
        _nodeRNG = _rng = _rb && function() {return _rb(16);};
        _rng();
      } catch(e) {}
    }
  }

  if (_window) {
    setupBrowser();
  } else {
    setupNode();
  }

  // Buffer class to use
  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) === 'string') {
      buf = (options === 'binary') ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  uuid._rng = _rng;
  uuid._mathRNG = _mathRNG;
  uuid._nodeRNG = _nodeRNG;
  uuid._whatwgRNG = _whatwgRNG;

  if (('undefined' !== typeof module) && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});


  } else {
    // Publish as global (in browsers)
    _previousRoot = _window.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _window.uuid = _previousRoot;
      return uuid;
    };

    _window.uuid = uuid;
  }
})('undefined' !== typeof window ? window : null);

window.EcomApi=function(){},function(e){EcomApi=window.EcomApi,EcomApi.errors={defaultError:{title:"We are unable to process your request at this time.",description:"Please try again later; we apologize for the inconvenience."},"401Error":{title:"Your session has expired.",description:"Please log in again."},"403Error":{title:"We are unable to process your request at this time.",description:"Please try again later; we apologize for the inconvenience."},CartHasBeenSubmittedError:{title:"Your order has already been placed.",description:""}};var o=0,i={ShowLoading:!0,LoaderContainerId:"#divLoader",LoaderText:"Loading...",headers:{"x-ecom-app-id":"temp","Content-Type":"application/json"}},n=function(){window.paypalLoaderText&&(e(".spinner_container").addClass("preloader-paypal"),e(".spinner_container").append('<div class="preloader-paypal-msg">We are retrieving the payment information from PayPal. Please be patient.</div>'))},r=function(o){0==e(".spinner_container").length?(e("body").append('<div class="spinner_container"><div class="uil-spin-css"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div></div>'),n(),e(".spinner_container").show()):(n(),e(".spinner_container").show())},t=function(){0===o&&(e(".spinner_container").removeClass("preloader-paypal"),e(".spinner_container .preloader-paypal-msg").remove(),e(".spinner_container").hide())},s=function(e,o){"object"==typeof newrelic&&("object"==typeof e?(e.status<200||e.status>600)&&newrelic.addPageAction("ecom-unhandled-error",{error:e,url:o}):newrelic.addPageAction("ecom-unhandled-error",{error:e,url:o}))},a=function(){var o={};return o.remoteId=e.cookie("remoteId"),o.s_vi=e.cookie("s_vi"),o.prof_id=e.cookie("prof_id"),o.s_ecom_session=e.cookie("s_ecom_session"),o.ecom_vi=e.cookie("ecom_vi"),o.tmktid=e.cookie("tmktid"),o.tmktname=e.cookie("tmktname"),o.taccessrtype=e.cookie("taccessrtype"),o.tppid=e.cookie("tppid"),o.tlgimg=e.cookie("tlgimg"),o},d=function(e){var o=uuid.v4(),i="web-common",n="common",r=EcomApi.getCurrentUrlHash();if(r){var t=r.split("/");t&&t.length>1&&(i=t[1])}return e&&(n=e),i+"_"+n+"_"+o};EcomApi.apiViaServer=function(){var e=window.location.hostname;return-1!=e.indexOf("devus")||-1!=e.indexOf("stgweb")?!0:!1},EcomApi.getProtocolByEnv=function(){var e="https",o=window.location.hostname;return(-1!=o.indexOf("devus")||-1!=o.indexOf("stgwww")||-1!=o.indexOf("local"))&&(e="http"),e},EcomApi.getCookie=function(e){var o="; "+document.cookie,i=o.split("; "+e+"=");return 2==i.length?i.pop().split(";").shift():void 0},EcomApi.findIfTransformIsRequired=function(){var e=EcomApi.getCookie("tppid");return e?EcomApi.v3enabledStores&&EcomApi.v3enabledStores.length>0&&-1!=EcomApi.v3enabledStores.indexOf(e)?(EcomApi.isTransformRequired=!0,EcomApi.setUrlPrefix(),SCart&&(SCart.findShoppingCartVersion(),SCart.deleteShoppingCartIdForTransform()),!0):!1:void 0},EcomApi.getV3EnabledStores=function(){var e=(EcomApi.getCookie("remoteId"),EcomApi.getCookie("tppid"),new XMLHttpRequest),o="https://www.samsung.com/us/consumer/shop/ecom/ecom_config.json",i=window.location.hostname;-1!=i.indexOf("devus")?o="http://devus.samsung.com:9000/us/consumer/shop/ecom/ecom_config.json":-1!=i.indexOf("stgwww")&&(o="http://stgwwwus.samsung.com/us/consumer/shop/ecom/ecom_config.json"),e.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var e=JSON.parse(this.responseText);e&&e.enable_v3&&(EcomApi.v3enabledStores=e.enable_v3),EcomApi.findIfTransformIsRequired()}},e.open("GET",o,!0),e.send()},EcomApi.isTransformRequired=EcomApi.getCookie("checkoutv4")||EcomApi.getV3EnabledStores(),EcomApi.getUrlPrefixByEnv=function(){var e=window.location.hostname,o=EcomApi.getProtocolByEnv(),i=window.location.host;return EcomApi.apiViaServer()?o+"://"+i+"/us/api":-1!=e.indexOf("devus")?EcomApi.isTransformRequired?o+"://qa3.apiaws.samsung.com":o+"://qa2.apiaws.samsung.com":-1!=e.indexOf("stgwww")?EcomApi.isTransformRequired?o+"://qa3.apiaws.samsung.com":o+"://qa1.apiaws.samsung.com":-1!=e.indexOf("stgweb")?o+"://stg.apiaws.samsung.com":-1!=e.indexOf("local")?EcomApi.isTransformRequired?o+"://qa3.apiaws.samsung.com":o+"://qa2.apiaws.samsung.com":o+"://www.samsung.com/us/api/ecom"},EcomApi.getCurrentUrlHash=function(){return window.location.hash},EcomApi.get=function(n){var c=e.Deferred(),m=e.extend({},i,n),p=e.extend({},i.headers,n.headers);return p["x-client-request-id"]=d(m.context),p["x-ecom-web-jwt"]=e.cookie("s_ecom_jwt"),p["x-ecom-cookie-credentials"]=JSON.stringify(a()),m.ShowLoading&&(o++,r(m)),e.ajax({url:n.url,headers:p,beforeSend:function(e,o){},type:"GET",xhr:function(){var e=new window.XMLHttpRequest;return void 0==n.useiframeWindow&&window.ecomWindow&&(e=new window.ecomWindow.XMLHttpRequest),e},xhrFields:{withCredentials:!0},crossDomain:!0}).fail(function(e){s(e,m.url),m.ShowLoading&&(o--,t()),c.reject(e)}).then(function(e){m.ShowLoading&&(o--,t()),c.resolve(e)}),c.promise()},EcomApi.post=function(n){var c=e.Deferred(),m=c.promise(),p=e.extend({},i,n),u=e.extend({},i.headers,n.headers);u["x-client-request-id"]=d(p.context),u["x-ecom-web-jwt"]=e.cookie("s_ecom_jwt"),p.excludeEcomCreds||(u["x-ecom-cookie-credentials"]=JSON.stringify(a())),p.ShowLoading&&(o++,r(p));var w={};if(p.transform){var l=function(e){var o=[];for(var i in e)o.push(encodeURIComponent(i)+"="+encodeURIComponent(e[i]));return o.join("&")};w=l(p.postBody)}else w=JSON.stringify(n.postBody);return e.ajax({url:n.url,type:"POST",headers:u,transformRequest:l,beforeSend:function(e,o){},data:w,xhr:function(){var e=new window.XMLHttpRequest;return void 0==n.useiframeWindow&&window.ecomWindow&&(e=new window.ecomWindow.XMLHttpRequest),e},xhrFields:{withCredentials:!0},crossDomain:!0}).fail(function(e){s(e,p.url),p.ShowLoading&&(o--,t()),c.reject(e)}).then(function(i,n,r){if(p.ShowLoading&&(o--,t()),p.consumeHeaders&&p.consumeHeaders["x-ecom-order-search-token"]){var s=r.getResponseHeader("x-ecom-order-search-token");e.cookie("x-ecom-order-search-token",s,{domain:".samsung.com"})}c.resolve(i)}),m},EcomApi.put=function(n){var c=n.deferred||e.Deferred(),m=e.extend({},i,n),p=e.extend({},i.headers,n.headers);p["x-client-request-id"]=d(m.context),p["x-ecom-web-jwt"]=e.cookie("s_ecom_jwt"),p["x-ecom-cookie-credentials"]=JSON.stringify(a());var u=(m.retries||0,0);return m.ShowLoading&&(o++,r(m)),e.ajax({url:n.url,type:"PUT",headers:p,beforeSend:function(e,o){},data:JSON.stringify(n.postBody),xhr:function(){var e=new window.XMLHttpRequest;return void 0==n.useiframeWindow&&window.ecomWindow&&(e=new window.ecomWindow.XMLHttpRequest),e},xhrFields:{withCredentials:!0},crossDomain:!0}).fail(function(e){if(s(e,m.url),m.retries){if(u++,u<m.retries)var i=m.retries-u;return m.retries=i,m.deferred=c,void EcomApi.put(m)}m.ShowLoading&&(o--,t()),c.reject(e)}).then(function(e){m.ShowLoading&&(o--,t()),c.resolve(e)}),c.promise()},EcomApi["delete"]=function(n){var c=e.Deferred(),m=e.extend({},i,n),p=e.extend({},i.headers,n.headers);return p["x-client-request-id"]=d(m.context),p["x-ecom-web-jwt"]=e.cookie("s_ecom_jwt"),p["x-ecom-cookie-credentials"]=JSON.stringify(a()),m.ShowLoading&&(o++,r(m)),e.ajax({url:n.url,type:"DELETE",beforeSend:function(e,o){},headers:p,xhr:function(){var e=new window.XMLHttpRequest;return void 0==n.useiframeWindow&&window.ecomWindow&&(e=new window.ecomWindow.XMLHttpRequest),e},data:n.data,xhrFields:{withCredentials:!0},crossDomain:!0}).fail(function(e){s(e,m.url),m.ShowLoading&&(o--,t()),c.reject(e)}).then(function(e){m.ShowLoading&&(o--,t()),c.resolve(e)}),c.promise()}}(jQuery);
window.SCart=window.SCart||{},$(document).ready(function(){!function(t,r){var o=t("a").filter(function(){return this.href.match(/.*sso\/logout/)});o.on("click",function(t){r.logOutUtilObj.clearCookieOnLogOut("s_ecom_sc_cnt","/",".samsung.com")}),r.logOutUtilObj={clearCookieOnLogOut:function(t,r,o){deleteCookie(t,r,o)}}}(jQuery,window.SCart)}),window.SCart=window.SCart||{},SCart.isEppRedirect=function(){return $.cookie("tppid")&&"undefined"!=$.cookie("tppid")&&!window.isLogin()?!0:!1},window.SCart.isEppUser=function(){return $.cookie("tppid")&&"undefined"!=$.cookie("tppid")?!0:!1},window.SCart.isEcomCheckout=function(){return!0},function(t,r){t(function(){r.OnAddToCart=function(o,e,n,i){"object"==typeof newrelic&&newrelic.addPageAction("ecom-add-to-cart-click-event");var a=(new r.ShoppingCartService({ShowLoading:!1}),e.split(",")),s=[];t.each(a,function(t,r){r.replace("/","~"),s.push(r+",1")});var c=null,p=[];n&&(c=n.split(","),t.each(c,function(t,r){r.replace("/","~"),p.push(r+",1")}));var u=r.URL.CHECKOUT_ADDITEM_URL(s,c);i&&(u+="&activate=true"),t("#pdp-page").length&&void 0!=document.forms.productDetail&&"HHP-ADH1-PB4-A"===t("#pdp-page").attr("data-prodid")&&(u+="&isMobileApp=true"),window.location.href=u},r.isEcomCheckout()&&t(document).on("click",".dr-ecom.button",function(o){var e=t(o.target).attr("model-cd");r.OnAddToCart(o.target,e)})})}(jQuery,window.SCart),window.SCart=window.SCart||{},SCart.ShoppingCartService=function(t,r,o){t.shoppingCartTransformService=t.shoppingCartTransformService||{};var e=function(t){this.options=t};urlPrefix="/us/api";var n=r.errors,i=[400,404,500,502,503,504],a=[401,403],s={409:function(t){return t=JSON.parse(t.responseText),"CartHasBeenSubmitted"==t.error?p(n.CartHasBeenSubmittedError.title,n.CartHasBeenSubmittedError.description)():void 0}},c=function(t){return function(r){return this.isHandlerAvailable[t]=!0,this._fail(function(o){o.status==t&&r(o)}),this}},p=function(t,r){return function(e){var n=t,i=r,a=".generic-error";o(a).show(),o("html, body").animate({scrollTop:o(a).offset().top},1e3),o(a).find(".checkout-error-msg-title").text(n),o(a).find(".checkout-error-msg-desc").text(i),o(a).show()}},u=function(r){return t.ShoppingCartService.prototype.extendPromise(r)},d=function(){var r=getCookie("s_ecom_pfscid"),o=r&&r.split("|")[0],e=r&&r.split("|")[1];return e?(this.shoppingCartId=e,this.purchaseFlowId=o,t.shoppingCartTransformService&&(t.shoppingCartTransformService.shoppingCartId=e,t.shoppingCartTransformService.purchaseFlowId=o),!0):!1},f=function(e,n){var i,a=o.Deferred();return i=t.shoppingCartTransformService.shoppingCartId?{url:r.isTransformRequired?t.URL.CART_V3_URL(t.shoppingCartTransformService.shoppingCartId):t.URL.CART_URL(t.shoppingCartTransformService.shoppingCartId),context:e}:{url:r.isTransformRequired?t.URL.CART_V3_URL(this.shoppingCartId):t.URL.CART_URL(this.shoppingCartId),context:e},n&&(i.url+="?pre_checkout=true"),r.get(i).then(function(t){a.resolve(t)}).fail(function(t){a.reject(t)}),a.promise()};return e.prototype.cartExists=function(){return this.shoppingCartId||d.call(this)?!0:!1},e.prototype.initPurchaseFlow=function(e){var n=o.Deferred(),i={url:r.isTransformRequired?t.URL.PURCHASE_FLOW_V3_URL():t.URL.PURCHASE_FLOW_URL(),LoaderText:"Loading...",ShowLoading:e.options.showLoading};r.isTransformRequired&&(i.postBody={purchase_flow_id:{template_id:"ecom"}});var a=this;return r.post(i).then(function(r){t.shoppingCartTransformService&&t.shoppingCartTransformService.transformCartResponse&&"function"==typeof t.shoppingCartTransformService.transformCartResponse&&(r.cart=t.shoppingCartTransformService.transformCartResponse(r,"initPurchaseFlow")),r&&r.cart&&(a.shoppingCartId=r.cart.cart_id,a.purchaseFlowId=r.purchase_flow_id,t.shoppingCartTransformService&&(t.shoppingCartTransformService.shoppingCartId=r.cart.cart_id,t.shoppingCartTransformService.purchaseFlowId=r.purchase_flow_id),a.cart=r.cart,a.attributes=r.attributes),n.resolve(r)}).fail(function(t){n.reject(t)}),u(n.promise())},e.prototype.extendPromise=function(r){var e=this,u=[400,401,403,404,405,409,500,502,503,504];return o.each(u,function(t,o){r["E"+o]=c(o)}),r._then=r.then,r._fail=r.fail,r.isHandlerAvailable={},r.then=function(t,r,o){return prom=this._then(t,r,o),e.extendPromise(prom)},r.fail=function(r){this._fail(function(e){return window.paypalLoaderText=!1,401!=e.status||window.isLogin()?this.isHandlerAvailable[e.status]?void("function"==typeof s[e.status]&&s[e.status](e)):(r(e),!t.isEppRedirect()&&window.SCart.sessionIdValid?o.inArray(e.status,i)>-1?p(n.defaultError.title,n.defaultError.description)():o.inArray(e.status,a)>-1?p(n[e.status+"Error"].title,n[e.status+"Error"].description)():void("function"==typeof s[e.status]&&s[e.status](e)):void 0):void(window.location.href=window.SCart.URL.CHECKOUT_URL()+"?error=SessionExpiredForGuest")})},r},e.prototype.getCart=function(r,e){var n=o.Deferred(),i=this;return r&&t.ShoppingCartService.prototype.cartExists.call(i)?f.call(i,r,e).then(function(r){t.shoppingCartTransformService&&t.shoppingCartTransformService.transformCartResponse&&"function"==typeof t.shoppingCartTransformService.transformCartResponse&&(r=t.shoppingCartTransformService.transformCartResponse(r)),n.resolve(r)}).fail(function(t){n.reject(t)}):t.ShoppingCartService.prototype.initPurchaseFlow(i).then(function(){n.resolve(i.cart)}).fail(function(t){n.reject(t)}),u(n.promise())},e}(window.SCart,window.EcomApi,jQuery),function(t,r){var o="",e="",n="",i="";t.apiViaServer=function(){var t=window.location.hostname;return-1!=t.indexOf("devus")||-1!=t.indexOf("stgweb")?!0:!1},t.getProtocolByEnv=function(){var t="https",r=window.location.hostname;return(-1!=r.indexOf("devus")||-1!=r.indexOf("stgwww")||-1!=r.indexOf("local"))&&(t="http"),t},t.getUrlPrefixByEnv=function(){var r=window.location.hostname,o=t.getProtocolByEnv(),e=window.location.host;return t.apiViaServer()?o+"://"+e+"/us/api":-1!=r.indexOf("devus")?o+"://qa2.apiaws.samsung.com":-1!=r.indexOf("stgwww")?o+"://qa1.apiaws.samsung.com":-1!=r.indexOf("stgweb")?o+"://stg.apiaws.samsung.com":-1!=r.indexOf("local")?o+"://qa2.apiaws.samsung.com":o+"://www.samsung.com/us/api/ecom"},t.initServiceBaseUrls=function(){t.apiViaServer()?(o="/checkout/shopping-carts/",e="/checkout/purchase-flows/",n="/checkout/promotions",i="/checkout/identity/"):(o="/v1/shopping-carts/",e="/v1/purchase-flows/",n="/v1/products",i="/v1/identity/",shoppingCartV3Base="/v3/shopping-carts/")},t.initServiceBaseUrls();var a=t.getUrlPrefixByEnv();t.URL={PURCHASE_FLOW_URL:function(){return a+e+"ecom"},CART_URL:function(t){return a+o+t},CHECKOUT_URL:function(){var r=t.getProtocolByEnv();return r+"://"+window.location.host+"/us/checkout/#/cart-info/"},CHECKOUT_ADDITEM_URL:function(t,r){var o="";if(t&&t.length>0){for(var e="addItem[]",n=0;n<t.length;n++)o+=encodeURIComponent(e)+"="+encodeURIComponent(t[n])+"&";o=o.substring(0,o.length-1)}if(r&&r.length>0){o+="&";for(var i="addChildItem[]",a=0;a<r.length;a++)o+=encodeURIComponent(i)+"="+encodeURIComponent(r[a])+"&";o=o.substring(0,o.length-1)}return this.CHECKOUT_URL()+"?"+o},PURCHASE_FLOW_V3_URL:function(){return a+shoppingCartV3Base},CART_V3_URL:function(t){return a+shoppingCartV3Base+t}}}(window.SCart,window.EcomApi);
