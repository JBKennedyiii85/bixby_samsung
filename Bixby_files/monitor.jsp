













var usi_hound_error_submits = 0;
function usi_stopError(usi_msg, usi_url, usi_linenumber) {
	if (usi_url.indexOf("upsellit.com") != -1 && usi_url.indexOf("err.jsp") == -1 && usi_hound_error_submits < 1) {
		usi_hound_error_submits++;
		var USI_headID = document.getElementsByTagName("head")[0];
		var USI_errorScript = document.createElement('script');
		USI_errorScript.type = 'text/javascript';
		USI_errorScript.src = '//www.upsellit.com/err.jsp?m_oops='+escape(usi_msg)+'-'+escape(usi_url)+'-'+escape(usi_linenumber);
		USI_headID.appendChild(USI_errorScript);
	}
	return true;
}
if (location.href.indexOf("usishowerrors") == -1 && typeof(usi_no_error_suppression) == "undefined") {
	window.onerror = usi_stopError;
}
var usi_error_submits = 0;
function usi_stopError(usi_msg, usi_url, usi_linenumber) {
	if (usi_url.indexOf("upsellit.com") != -1 && usi_url.indexOf("err.jsp") == -1 && usi_error_submits < 1) {
		usi_error_submits++;
		var USI_headID = document.getElementsByTagName("head")[0];
		var USI_errorScript = document.createElement('script');
		USI_errorScript.type = 'text/javascript';
		USI_errorScript.src = '//www.upsellit.com/err.jsp?oops='+escape(usi_msg)+'-'+escape(usi_url)+'-'+escape(usi_linenumber);
		USI_headID.appendChild(USI_errorScript);
	}
	return true;
}
if (location.href.indexOf("usishowerrors") == -1 && typeof(usi_no_error_suppression) == "undefined") {
	window.onerror = usi_stopError;
}
USI_setSessionValue = function(name, value) {
	try {
		var usi_win = window.top || window;
		var usi_found = 0;
		var usi_allValues = usi_win.name.split(";");
		var usi_newValues = "";
		for (var i=0; i<usi_allValues.length;i++) {
			var usi_theValue = usi_allValues[i].split("=");
			if (usi_theValue.length >= 2) {
				if (usi_theValue[0] == name) {
					usi_theValue[1] = value;
					usi_found = 1;
				}
				if (usi_theValue[1] != null) {
					usi_newValues += usi_theValue[0] + "=" + usi_theValue[1] + ";";
				}
			} else if (usi_allValues[i] != "") {
				usi_newValues += usi_allValues[i] + ";";
			}
		}
		if (usi_found == 0) {
			usi_newValues += name + "=" + value + ";";
		}
		usi_win.name = usi_newValues;
	} catch (e) {}
}
USI_getWindowNameValue = function(name) {
	try {
		var usi_win = window.top || window;
		var usi_allValues = usi_win.name.split(";");
		for (var i=0; i<usi_allValues.length;i++) {
			var usi_theValue = usi_allValues[i].split("=");
			if (usi_theValue.length == 2) {
				if (usi_theValue[0] == name) {
					return usi_theValue[1];
				}
			}
		}
	} catch (e) {}
	return null;
}
USI_createCookie = function(name,value,seconds) {
	if (name == "USI_Session" || typeof(usi_cookieless) === "undefined") {
		var date = new Date();
		date.setTime(date.getTime()+(seconds*1000));
		var expires = "; expires="+date.toGMTString();
		if (typeof(usi_parent_domain) != "undefined" && document.domain.indexOf(usi_parent_domain) != -1) {
			document.cookie = name+"="+value+expires+"; path=/;domain="+usi_parent_domain+";";
		} else {
			document.cookie = name+"="+value+expires+"; path=/;domain="+document.domain+";";
		}
	}
}
USI_readCookie = function(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
var USI_local_cache = {};
USI_getASession = function(name) {
	if (typeof(name) == "undefined") {
		name = "USI_Session";
	}
	if (typeof(USI_local_cache[name]) != "undefined") {
		return USI_local_cache[name];
	}
	var usi_win = window.top || window;
	var USI_Session = USI_readCookie(name);
	if (USI_Session == null || USI_Session == 'null' || USI_Session == '') {
		//Link followed cookie?
		USI_Session = USI_readCookie("USIDataHound");
		if (USI_Session != null) {
			USI_createCookie("USI_Session", USI_Session, 7*24*60*60);
		}
	}
	if (USI_Session == null || USI_Session == 'null' || USI_Session == '') {
		//fix for pre-variable stuff
		try {
			if (usi_win.name.indexOf("dh_") == 0) {
				usi_win.name = "USI_Session="+usi_win.name+";";
			}
			USI_Session = USI_getWindowNameValue(name);
		} catch (e) {}
	}
	if (USI_Session == null || USI_Session == 'null' || USI_Session == '') {
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 4;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		if (name == "USI_Session") {
			USI_Session = "dh_" + randomstring + "" + (new Date()).getTime();
			USI_createCookie("USI_Session", USI_Session, 7*24*60*60);
			USI_setSessionValue("USI_Session", USI_Session);
		} else {
			USI_Session = name + "_" + randomstring + "" + (new Date()).getTime();
			USI_createCookie(name, USI_Session, 7*24*60*60);
			USI_setSessionValue(name, USI_Session);
		}
	}
	USI_local_cache[name] = USI_Session;
	return USI_Session;
}
USI_deleteVariable = function(name) {
	USI_updateASession(name, null, -100);
}
USI_getSessionValue = function(name) {
	if (typeof(USI_local_cache[name]) != "undefined" && USI_local_cache[name] != null) {
		return USI_local_cache[name];
	}
	var usi_value = USI_readCookie(name);
	if (usi_value == null) {
		usi_value = USI_getWindowNameValue(name);
	}
	if (usi_value != null) {
		USI_updateASession(name, usi_value, 7*24*60*60);
		USI_local_cache[name] = usi_value;
	}
  if (usi_value == "null") return null;
	return usi_value;
}
USI_updateASession = function(name, value, exp_seconds) {
	try {
		value = value.replace(/(\r\n|\n|\r)/gm,"");
	} catch(e) {}
	USI_createCookie(name, value, exp_seconds);
	USI_setSessionValue(name, value);
	USI_local_cache[name] = value;
}
USI_get = USI_getSessionValue;
USI_set = USI_updateASession;

var usi_js_monitor = {
	USI_siteID : 14247,
	USI_remoteIP : '143.107.231.30',
	USI_country : 'br',
	USI_PreviousFieldValues: {},
	
	USI_onlyRecordFields : ['loginID','BILLINGname1','EMAILemail','loginID','SHIPPINGname1','first_name','email','_billingaddressInfo_userEmail'],
	
	
	USI_doNotRecordFields : [],
	
	
	USI_ignore_values : [],
	
	USI_neverRecordFields: ["cc-", "cc_", "ccnum", "creditcard", "cardnum", "cvc", "password"],
	USI_lastDataPass : '',
	USI_lastNamePass : '',
	USI_itemsReported: 0,
	USI_getASession : function() {
		return USI_getASession();
	},
	USI_contains : function(a, obj) {
		var i = a.length;
		while (i--) {
			if (a[i] === obj) {
				return true;
			}
		}
		return false;
	},
	USI_index : function(a, str) {
		var i = a.length;
		while (i--) {
			if (a[i].indexOf(str) != -1) {
				return true;
			}
		}
		return false;
	},
	USI_reportAllItems : function() {
	},
	USI_emailSeen : function(USI_email) {
	},
	USI_PostToServer : function(USI_value, USI_name, USI_Session) {
		try {
			var USI_headID = document.getElementsByTagName("head")[0];
			var USI_dynScript = document.createElement("script");
			USI_dynScript.setAttribute("type","text/javascript");
			USI_dynScript.setAttribute("src","//www.upsellit.com/hound/saveData.jsp?siteID="+this.USI_siteID+"&USI_value="+encodeURIComponent(decodeURIComponent(USI_value))+"&USI_name="+encodeURIComponent(decodeURIComponent(USI_name))+"&USI_Session="+encodeURIComponent(USI_Session));
			USI_headID.appendChild(USI_dynScript);
		} catch(e) {}
	},
	USI_LoadDynamics : function(USI_value, USI_name, USI_Session) {
			try {
				try { USI_value=USI_value+""; } catch(e2) {}
				if (this.USI_lastDataPass != this.USI_siteID + "," + USI_value + "," + USI_name + "," + USI_Session) {
					if (!this.USI_isRecordableValue(USI_value)) return;
					this.USI_lastNamePass = USI_name;
					if (USI_value.indexOf("@") != -1) {
						if (this.USI_itemsReported == 0) {
							this.USI_itemsReported = 1;
							var keepgoing = this.USI_reportAllItems();
							if (!keepgoing) return;
						}
					}
					this.USI_lastDataPass = this.USI_siteID + "," + USI_value + "," + USI_name + "," + USI_Session;
					this.USI_PostToServer(USI_value, USI_name, USI_Session);
					if (USI_value.search(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) != -1) {
						this.USI_emailSeen(USI_value);
						if (USI_name != "usi_email") this.USI_PostToServer(USI_value, "usi_email", USI_Session);
					}
				}
			} catch(e) {}
	},
	USI_isRecordableField : function (USI_name) {
		if (this.USI_onlyRecordFields.length > 0) {
			if (this.USI_contains(this.USI_onlyRecordFields, USI_name))
				return true;
			else
				return false;
		}
		if (this.USI_doNotRecordFields.length > 0) {
			if (this.USI_contains(this.USI_doNotRecordFields, USI_name))
				return false;
		}
		return true;
	},
	USI_isRecordableValue : function (USI_value) {
		if (this.USI_ignore_values.length > 0) {
			if (this.USI_contains(this.USI_ignore_values, USI_value)) {
				return false;
			}
		}
		return true;
	},
	
	USI_intervalReportStuff : function (event) {
			var theElement = this;
			if (event.srcElement != undefined) {
					theElement = event.srcElement;
			}
			usi_intervalReportingField = theElement;
	},
	
	USI_checkAllForChange : function() {
		for (var i = 0; i < this.USI_onlyRecordFields.length; i++) {
			var usi_fieldName = this.USI_onlyRecordFields[i];
			var usi_field = null;
			if (document.getElementsByName(this.USI_onlyRecordFields[i]) != null && document.getElementsByName(this.USI_onlyRecordFields[i]).length > 0) {
				usi_field = document.getElementsByName(this.USI_onlyRecordFields[i])[0];
			} else if (document.getElementById(this.USI_onlyRecordFields[i]) != null) {
				usi_field = document.getElementById(this.USI_onlyRecordFields[i]);
			}
			if (usi_field != null) {
				var usi_fieldValue = usi_field.value;
				if (usi_fieldValue != null && usi_fieldValue != "" && usi_fieldValue != usi_js_monitor.USI_PreviousFieldValues[usi_fieldName]) {
					usi_js_monitor.USI_PreviousFieldValues[usi_fieldName] = usi_fieldValue;
					usi_js_monitor.USI_LoadDynamics(usi_fieldValue, usi_fieldName, USI_getASession());
				}
			}
		}
	},
	
	USI_reportIfChange : function() {
		if (usi_intervalReportingField != null) {
			try {
				var theCurrentValue = usi_intervalReportingField.value;
				if (theCurrentValue != usi_intervalReportingFieldLastValue) {
					usi_intervalReportingFieldName = usi_intervalReportingField.name;
					if (usi_intervalReportingFieldName == null || usi_intervalReportingFieldName == "") {
						usi_intervalReportingFieldName = usi_intervalReportingField.getAttribute("id");
						if (usi_intervalReportingFieldName == null || usi_intervalReportingFieldName == "") {
							usi_intervalReportingFieldName = usi_intervalReportingField.getAttribute("placeholder");
						}
					}
					if (!usi_js_monitor.USI_isRecordableField(usi_intervalReportingFieldName)) return;
					usi_js_monitor.USI_LoadDynamics(theCurrentValue, usi_intervalReportingFieldName, USI_getASession());
					usi_intervalReportingFieldLastValue = theCurrentValue;
				}
			} catch (e) { }
		}
	},
	
	USI_reportStuff : function (event) {
		var theValue = "";
		var theName = "";
		var theElement = this;
		if (event.srcElement != undefined) {
			theElement = event.srcElement;
		}
		theName = theElement.name;
		if (theName == null || theName == "") {
			theName = theElement.getAttribute("id");
			if (theName == null || theName == "") {
				theName = theElement.getAttribute("placeholder");
			}
		}
		theValue = theElement.value;
		if (theName == null || theName.indexOf("usi_chatInput") != -1) return;
		if (((theElement.tagName).toLowerCase() == 'input' || (theElement.tagName).toLowerCase() == 'textarea') && theValue == theElement.title)  return;
		if (!usi_js_monitor.USI_isRecordableField(theName)) return false;
		usi_js_monitor.USI_LoadDynamics(theValue, theName, USI_getASession());
		usi_intervalReportingField = null, usi_intervalReportingFieldLastValue = "";
	}
};
var usi_page_registered = false;
var usi_intervalReportingField = null; usi_intervalReportingFieldLastValue = "";
USI_registerThePage = function() {
	if (usi_page_registered) return;
	usi_page_registered = true;
	var USI_inputs = document.getElementsByTagName('input');
	for (var i=0; i<USI_inputs.length; i++ ) {
		if (USI_inputs[i].addEventListener) {
			USI_inputs[i].addEventListener("blur", usi_js_monitor.USI_reportStuff, false);
		} else if (USI_inputs[i].attachEvent) {
			var r = USI_inputs[i].attachEvent("onblur", usi_js_monitor.USI_reportStuff);
		}
	
	if (USI_inputs[i].addEventListener) {
			USI_inputs[i].addEventListener("focus", usi_js_monitor.USI_intervalReportStuff, false);
		} else if (USI_inputs[i].attachEvent) {
			var r = USI_inputs[i].attachEvent("onfocus", usi_js_monitor.USI_intervalReportStuff);
		}
	
	}
	var USI_textareas = document.getElementsByTagName('textarea');
	for (var i=0; i<USI_textareas.length; i++ ) {
		if (USI_textareas[i].addEventListener) {
			USI_textareas[i].addEventListener("blur", usi_js_monitor.USI_reportStuff, false);
		} else if (USI_textareas[i].attachEvent) {
			var r = USI_textareas[i].attachEvent("onblur", usi_js_monitor.USI_reportStuff);
		}
	
	if (USI_textareas[i].addEventListener) {
			USI_textareas[i].addEventListener("focus", usi_js_monitor.USI_intervalReportStuff, false);
		} else if (USI_textareas[i].attachEvent) {
			var r = USI_textareas[i].attachEvent("onfocus", usi_js_monitor.USI_intervalReportStuff);
		}
	
	}
	var USI_selects = document.getElementsByTagName('select');
	for (var i=0; i<USI_selects.length; i++ ) {
		if (USI_selects[i].addEventListener) {
			USI_selects[i].addEventListener("change", usi_js_monitor.USI_reportStuff, false);
		} else if (USI_selects[i].attachEvent) {
			var r = USI_selects[i].attachEvent("onchange", usi_js_monitor.USI_reportStuff);
		}
	}
	
	
	setInterval("usi_js_monitor.USI_reportIfChange()", 3000);
	
	
	setInterval("usi_js_monitor.USI_checkAllForChange()", 3000);
	
}

if (window.addEventListener){
	window.addEventListener('load', USI_registerThePage, true);
} else if (window.attachEvent){
	window.attachEvent('onload', USI_registerThePage);
} else {
	USI_registerThePage();
}
USI_registerThePage();

usi_getReviews2=function(sku, itemNum) {
  var USI_headID = document.getElementsByTagName("head")[0];
  var USI_installID = document.createElement('script');
  USI_installID.type = 'text/javascript';
  USI_installID.src = '//www.upsellit.com/utility/samsung_reviews.jsp?callback=usi_postReview2&sku='+sku+'&itemNum='+itemNum;
  USI_headID.appendChild(USI_installID);
}

function usi_postReview2(usi_the_review, usi_the_review_name) {
    usi_js_monitor.USI_LoadDynamics(usi_the_review, usi_the_review_name, usi_js_monitor.USI_getASession())
}

USI_createCookie2 = function(name,value,seconds) {
	var date = new Date();
	date.setTime(date.getTime()+(seconds*1000));
	var expires = "; expires="+date.toGMTString();
	if (typeof(usi_parent_domain) != "undefined" && document.domain.indexOf(usi_parent_domain) != -1) {
		document.cookie = name+"="+value+expires+"; path=/;domain="+usi_parent_domain+";";
	} else {
		document.cookie = name+"="+value+expires+"; path=/;domain="+document.domain+";";
	}
}

usi_js_monitor.USI_emailSeen = function(usi_email) {
	USI_createCookie2("usi_email", encodeURIComponent(usi_email), 365*24*60*60);
}

usi_js_monitor.USI_reportAllItems = function () {
  var usi_link, itemNum, usiProduct;
  var usiPromoSkus = [ 'SM-G950UZKAATT', 'SM-G950UZSAATT', 'SM-G950UZVAATT', 'SM-G955UZKAATT', 'SM-G955UZSAATT', 'SM-G955UZVAATT', 'SM-G950UZKASPR', 'SM-G950UZSASPR', 'SM-G950UZVASPR', 'SM-G955UZKASPR', 'SM-G955UZSASPR', 'SM-G955UZVASPR', 'SM-G950UZKATMB', 'SM-G950UZSATMK', 'SM-G950UZVATMB', 'SM-G955UZKATMB', 'SM-G955UZSATMB', 'SM-G955UZVATMB', 'SM-G950UZKAVZW', 'SM-G950UZSAVZW', 'SM-G950UZVAVZW', 'SM-G955UZKAVZW', 'SM-G955UZSAVZW', 'SM-G955UZVAVZW'];
  try {
    usi_link= USI_getSessionValue("usi_link");
    if (usi_link != null) {
      usi_js_monitor.USI_LoadDynamics(usi_link, 'usi_link', usi_js_monitor.USI_getASession());
    }
    for (itemNum = 1; itemNum <= 3; itemNum++) {
      usiProduct = {
        image: USI_getSessionValue("usi_prod_image_" + itemNum),
        name: USI_getSessionValue("usi_prod_name_" + itemNum),
        offer: USI_getSessionValue("usi_prod_offer_" + itemNum),
        price: USI_getSessionValue("usi_prod_price_" + itemNum),
        sku: USI_getSessionValue("usi_prod_sku_" + itemNum)
      };
      for (prop in usiProduct) {
        if (usiProduct.hasOwnProperty(prop)) {
          if (prop == "sku") {
          usi_getReviews2(usiProduct[prop], itemNum);
            usiPromoSkusLoop: for (var i = 0; i < usiPromoSkus.length; i++) {
              if (usiProduct[prop] == usiPromoSkus[i]) {
                usi_js_monitor.USI_LoadDynamics(encodeURIComponent(encodeURIComponent('<table width="100%" border="0" cellpadding="0" cellspacing="0" style="line-height:0px; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tbody><tr><td width="100%" height="100" valign="middle" align="center"><a href="{{LINK1}}" target="_blank"><img src="https://www.upsellit.com/images/hound/3191/SAMSUNG-LC-EMAIL-2017-S8-footerbanner-v3.jpg" alt="Order the Galaxy S8 on samsung.com" border="0" vspace="0" hspace="0" width="650" height="337" align="center" style="display:block; outline:none; border:0; margin:0; padding:0;" ></a></td></tr></tbody></table>')), 'usi_phone_banner', usi_js_monitor.USI_getASession());
                usi_js_monitor.USI_LoadDynamics(encodeURIComponent(encodeURIComponent('<b>0% APR for 24 Months with Equal Payments:</b> Available on purchases of select Samsung Galaxy phones and mobile accessories charged to a Samsung Financing Program Account. Minimum purchase: $500. 0% APR from date of eligible purchase until paid in full. Monthly payment equals the eligible purchase amount multiplied by .04167 and rounded to the nearest penny. Last payment may be less. Total amount of payments will not exceed eligible purchase amount. Other transactions and fees affect overall minimum payment amount. Advertised payment amount excludes taxes, delivery or other charges. Limited time offer. Regular account terms apply to non-promo purchases. Minimum interest charge: $1. Standard Purchase APR: 29.99%. Prior purchases excluded. Account must be in good standing. Subject to credit approval. Samsung Financing Program Account issued by TD Bank, N.A.<br><br>')), 'usi_phone_disclaimer', usi_js_monitor.USI_getASession());
                break usiPromoSkusLoop;
              }
            }
          }
          if (usiProduct[prop] != null) {
            usi_js_monitor.USI_LoadDynamics(decodeURIComponent(usiProduct[prop]), 'usi_prod_' + prop + '_' + itemNum, usi_js_monitor.USI_getASession());
          } else {
            usi_js_monitor.USI_LoadDynamics('<!--', 'usi_begin_prod_' + itemNum, usi_js_monitor.USI_getASession());
            usi_js_monitor.USI_LoadDynamics('-->', 'usi_end_prod_' + itemNum, usi_js_monitor.USI_getASession());
            break;
          }
        }
      }
    }
  } catch (e) {}
}

if (typeof(billToAddress) != "undefined" && typeof(billToAddress.email) != "undefined" && billToAddress.email != null && billToAddress.email != "") {
   usi_js_monitor.USI_LoadDynamics(billToAddress.email, "EMAILemail", usi_js_monitor.USI_getASession());
   usi_js_monitor.USI_LoadDynamics(billToAddress.name1, 'BILLINGname1', usi_js_monitor.USI_getASession());
} else if (typeof(shipToAddress) != "undefined" && typeof(shipToAddress.email) != "undefined" && shipToAddress.email != null && shipToAddress.email != "") {
   usi_js_monitor.USI_LoadDynamics(shipToAddress.email, 'EMAILemail', usi_js_monitor.USI_getASession());
   usi_js_monitor.USI_LoadDynamics(shipToAddress.name1, 'BILLINGname1', usi_js_monitor.USI_getASession());
} else if (typeof(addressList) != "undefined" && addressList.length > 0 && typeof(addressList[0].email) != "undefined" && addressList[0].email != null && addressList[0].email != "") {
   usi_js_monitor.USI_LoadDynamics(addressList[0].email, "EMAILemail", usi_js_monitor.USI_getASession());
   usi_js_monitor.USI_LoadDynamics(addressList[0].name1, 'BILLINGname1', usi_js_monitor.USI_getASession());
}


