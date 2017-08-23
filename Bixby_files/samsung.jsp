
usi_alert = function (msg) {}

var usi_cookieless = 1;
var usi_parent_domain = "samsung.com"
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


// <script type="text/javascript">
var usiDoublePlaced = false;
try {
		if (typeof usiLaunch !== "undefined") usiDoublePlaced = true;
} catch (e) {}
if (usiDoublePlaced === false) {
	var usi_dateString = (new Date()).toISOString().slice(0,10).replace(/-/g,"");
	var usi_is_new = 1;
	if (USI_readCookie("usi_first_visit") == null) {
		USI_createCookie("usi_first_visit", usi_dateString, 365*24*60*60*1000);
	} else if (USI_readCookie("usi_first_visit") != usi_dateString) {
		usi_is_new = 0;
	}
	function usi_getElementsByClassName(node, classname) {
		var a = [];
		var re = new RegExp("(^| )" + classname + "( |$)");
		var els = node.getElementsByTagName("*");
		for (var i = 0, j = els.length; i < j; i++)
			if (re.test(els[i].className)) a.push(els[i]);
		return a;
	}
	function usiCheckCookieExists(cookieTest) {
		for (var i = 0; i < arguments.length; i++) {
			var thisCookie = USI_get(arguments[i]);
			if (thisCookie == "" || thisCookie == null) return false;
		}
		return true;
	}
	function usiLoadDisplay(usiQS, usiSiteID, usiKey) {
		if (usi_is_new == 1) usiKey = "NEW";
		else usiKey = "RETURN";
		var usiDocHead = document.getElementsByTagName("head")[0];
		var usiLaunchScript = document.createElement("script");
		if (top.location != location) usiDocHead = parent.document.getElementsByTagName("head")[0];
		usiLaunchScript.type = "text/javascript";
		usiLaunchScript.src = ("//www.upsellit.com/launch.jsp?qs=" + usiQS + "&siteID=" + usiSiteID + "&keys=" + usiKey);
		usiDocHead.appendChild(usiLaunchScript);
		usiLoadDisplay = function() {};
	}
	function usiLoadDisplay2(usiQS, usiSiteID, usiKey) {
		var usiDocHead = document.getElementsByTagName("head")[0];
		var usiLaunchScript = document.createElement("script");
		if (top.location != location) usiDocHead = parent.document.getElementsByTagName("head")[0];
		usiLaunchScript.type = "text/javascript";
		usiLaunchScript.src = ("//www.upsellit.com/launch.jsp?qs=" + usiQS + "&siteID=" + usiSiteID + "&keys=" + usiKey);
		usiDocHead.appendChild(usiLaunchScript);
		usiLoadDisplay2 = function() {};
	}
	function usiLoadPreCapture(usiQS, usiSiteID) {
		var usiDocHead = document.getElementsByTagName("head")[0];
		var usiMonitorScript = document.createElement("script");
		usiMonitorScript.type = "text/javascript";
		usiMonitorScript.src = ("//www.upsellit.com/hound/monitor.jsp?qs=" + usiQS + "&siteID=" + usiSiteID);
		usiDocHead.appendChild(usiMonitorScript);
		usiLoadPreCapture = function() {};
	}
	function usiDeleteValuesWith(name) {
		var allCookies = document.cookie.split(";");
		for (var i = 0; i < allCookies.length; i++) {
			var thisCookie = allCookies[i];
			if (thisCookie.indexOf(name) != -1) {
				var ourCookie = thisCookie.substring(0, thisCookie.indexOf("="));
				USI_set(ourCookie, "", 0);
			}
		}
	}
	function usiLoadScript(source) {
		var docHead = document.getElementsByTagName("head")[0];
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.src = source;
		docHead.appendChild(newScript);
	}
	function usiSuppress() {
		USI_suppress = true;
	}
	function usiSendProdRec(siteID, info) {
		if (!!siteID && !!info.name && !!info.link && !!info.pid && !!info.price && !!info.image) {
			usiLoadScript("//www.upsellit.com/active/pv2.js?" + encodeURIComponent(siteID + "|" + (info.name) + "|" + (info.link) + "|" + (info.pid) + "|" + (info.price) + "|" + (info.image) + "|" + (info.extra)));
		}
	}
	function usiScrapeCart_new() {
		var usiCartRows = document.getElementsByClassName("uc-product-row");
		var allProducts = [];
		// Delete existing cookies
		usiDeleteValuesWith("usi_prod");
		// Collect product info
		var usi_link = "https://www.samsung.com/us/checkout/#/cart-info/?";
		try {
			if (usi_getElementsByClassName(document.body, "finance-terms-calculation").length > 0) {
				var finance = document.getElementsByClassName("finance-terms-calculation");
				financeLoop: for (var f = 0; f < finance.length; f++) {
					if (finance[f].className.indexOf("ng-hide") == -1 && finance[f].className.indexOf("minimum-not-met") == -1 && finance[f].className.indexOf("empty-cart") == -1) {
						var financePrice = finance[f].getElementsByTagName("p")[0].innerHTML.replace(/ng-binding|\*/g, '').replace(/^\s+|\s+$/g, '');
						if (finance[f].className.indexOf("mixed-product") != -1) {
							var financeTerms = finance[f].getElementsByTagName("p")[1].innerHTML.replace(/ng-binding|\n|\s\s/g, '').replace(/^\s+|\s+$/g, '');
							var fullFinance = financePrice + "<br>" + financeTerms;
							fullFinance = fullFinance.substring(0, fullFinance.lastIndexOf("months") + 6);
							USI_set("usi_finance", encodeURIComponent(fullFinance), 86400 * 7);
							break financeLoop;
						}
						USI_set("usi_finance", encodeURIComponent(financePrice), 86400 * 7);
					}
				}
			}
		} catch (e) {}
		cartProductLoop: for (var i = 0; i < usiCartRows.length; i++) {
			var product = {};
			if (usi_getElementsByClassName(usiCartRows[i], "uc-product-photo").length > 0) {
				var usi_prod_data = usi_getElementsByClassName(usiCartRows[i], "uc-product-photo")[0].innerHTML;
				usi_image = usi_prod_data.substring(usi_prod_data.lastIndexOf("src=") + 5, usi_prod_data.length);
				usi_image = usi_image.substring(0, usi_image.indexOf("\""));
				if (usi_image.indexOf("//") == 0) usi_image = "https:"+usi_image;
				product.image = usi_image;
				usi_sku = usi_prod_data.substring(usi_prod_data.lastIndexOf("data-link_position=") + 20, usi_prod_data.length);
				usi_sku = usi_sku.substring(0, usi_sku.indexOf("\""));
				product.sku = usi_sku;
				usi_link += "addItem%5B%5D=" + usi_sku + ",1&";
			}
			if (usi_getElementsByClassName(usiCartRows[i], "uc-product-left-container").length > 0) {
				var usi_prod_data = usi_getElementsByClassName(usiCartRows[i], "uc-product-left-container")[0].innerHTML;
				usi_name = usi_prod_data.substring(usi_prod_data.lastIndexOf("<a") + 1, usi_prod_data.length);
				usi_name = usi_name.substring(usi_name.indexOf(">") + 1, usi_name.length);
				usi_name = usi_name.substring(0, usi_name.indexOf("<"));
				product.name = usi_name;
				usi_url = usi_prod_data.substring(usi_prod_data.lastIndexOf("href=\"") + 6, usi_prod_data.length);
				usi_url = usi_url.substring(0, usi_url.indexOf("\""));
				product.link = usi_url;
			}
			if (usi_getElementsByClassName(usiCartRows[i], "uc-product-price-details").length > 0) {
				var usi_prod_data = usi_getElementsByClassName(usiCartRows[i], "uc-product-price-details")[0].innerHTML;
				usi_price = usi_prod_data.substring(usi_prod_data.indexOf("$") + 1, usi_prod_data.length);
				usi_price = usi_price.substring(0, usi_price.indexOf("<"));
				product.price = usi_price.replace(",", "");
				usi_offer = usi_prod_data.substring(usi_prod_data.indexOf("You Save "), usi_prod_data.length);
				usi_offer = usi_offer.substring(0, usi_offer.indexOf("<"));
				if (usi_offer == "You Save $0.00") usi_offer = "FREE STANDARD SHIPPING ON ALL ORDERS OVER $50!";
				product.offer = usi_offer;
			}
			
			if (product.image.indexOf("http") != -1) {
				try {
					if (document.getElementsByClassName("uc-product-quantity uc-product-quantity-text ng-hide")[i].innerHTML.indexOf(">1<") != -1) {
						product.pid = product.sku;
						product.extra = product.offer;
						//usiSendProdRec("10559", product);
					}
				} catch (e) {}
				allProducts.push(product);
			}
			USI_set("usi_link", encodeURIComponent(usi_link), 24 * 60 * 60);
		}
		// Save product info
		cartCookies: for (var prodIndex = 0; prodIndex < allProducts.length; prodIndex++) {
			var currentProd = allProducts[prodIndex];
			if (prodIndex < 3) {
				for (prop in currentProd) {
					if (currentProd.hasOwnProperty(prop) && Number(currentProd.price) > 0) {
						USI_set("usi_prod_" + prop + "_" + (prodIndex + 1), encodeURIComponent(currentProd[prop]), 86400 * 7);
					}
				}
			}
		}
	}
	function usiScrapeCart() {
		try {
			var usiCartRows = usi_getElementsByClassName(document.getElementById("dr-cart-grid"), "dr-cart-item-row");
			var usi_locale = "";
			var usi_siteid = "";
			var usi_pids = "";
			var allProducts = [];
			// Delete existing cookies
			usiDeleteValuesWith("usi_prod");
			// Collect product info
			cartProductLoop: for (var i = 0; i < usiCartRows.length; i++) {
				var product = {};
				if (usi_getElementsByClassName(usiCartRows[i], "product-thumb img-desktop").length > 0) {
					product.image = usi_getElementsByClassName(usiCartRows[i], "product-thumb img-desktop")[0].src;
				} else if (usi_getElementsByClassName(usiCartRows[i], "img-responsive product-thumb img-mobile").length > 0) {
					product.image = usi_getElementsByClassName(usiCartRows[i], "img-responsive product-thumb img-mobile")[0].src;
				}
				product.name = usi_getElementsByClassName(usiCartRows[i], "dr-cart-prd-details-box")[0].getElementsByTagName("a")[0].textContent.replace(/”/g, '"');
				product.offer = usi_getElementsByClassName(usiCartRows[i], "dr-cart-prd-details-box")[0].getElementsByTagName("p")[0].textContent;
				product.sku = usi_getElementsByClassName(usiCartRows[i], "dr-cart-prd-details-box")[0].getElementsByTagName("a")[0].href;
				if (product.sku.indexOf("/") != -1) product.sku = product.sku.substring(product.sku.lastIndexOf("/") + 1, product.sku.length);
				product.price = usi_getElementsByClassName(usiCartRows[i], "dr-price")[0].firstElementChild.textContent.replace(/[^0-9\.]+/g, "");
				//product.pid = usi_getElementsByClassName(usiCartRows[i], "dr-cart-prd-details-box")[0].getElementsByTagName("a")[0].outerHTML;
				//product.pid = product.pid.substring(product.pid.indexOf('lineitemid="')+12, product.pid.indexOf('">'));
				product.pid = utag_data.product_id[i];
				USI_set("usi_minicart", "0", 24 * 60 * 60);
				if (product.offer == "") product.offer = "FREE STANDARD SHIPPING ON ALL ORDERS OVER $50!";
				allProducts.push(product);
			}
			// Save product info
			cartCookies: for (var prodIndex = 0; prodIndex < allProducts.length; prodIndex++) {
				var currentProd = allProducts[prodIndex];
				usi_pids += "/productID." + currentProd["pid"];
				if (prodIndex < 3) {
					for (prop in currentProd) {
						if (currentProd.hasOwnProperty(prop) && Number(currentProd.price) > 0) {
							USI_set("usi_prod_" + prop + "_" + (prodIndex + 1), encodeURIComponent(currentProd[prop]), 86400 * 7);
						}
					}
				}
			}
			// Create cart link
			if (document.getElementsByName("Locale").length > 0 && document.getElementsByName("SiteID").length > 0) {
				usi_siteid = document.getElementsByName("SiteID")[0].value;
				usi_locale = document.getElementsByName("Locale")[0].value;
				if (usi_siteid != "" && usi_locale != "" && usi_pids != "") {
					var usi_link = "https://shop.us.samsung.com/store/" + usi_siteid + "/" + usi_locale + "/buy" + usi_pids + "/clearCart.yes";
					USI_set("usi_link", encodeURIComponent(usi_link), 24 * 60 * 60);
				}
			}
		} catch (e) {}
	}
	// SET VARIABLES
	var usiUrl = location.href.toLowerCase();
	var usiLaunch = {
		pageIsCart_new: usiUrl.indexOf("/cart-info/") != -1,
		pageIsCart: usiUrl.indexOf("threepgcheckoutshoppingcartpage") != -1,
		pageIsCheckout: usiUrl.indexOf("/us/checkout/") != -1 || usiUrl.indexOf("displaythreepgcheckoutaddresspaymentinfopage") != -1 || usiUrl.indexOf("shop.us.samsung.com/store") != -1 || usiUrl.indexOf("/cart-payment/") != -1,
		pageIsConfirmation: usiUrl.indexOf("thankyoupage") != -1,
		siteIsMobile: /Mobi|iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
		referrerOffSite: document.referrer.toLowerCase().indexOf("samsung.com") == -1,
		siteIsUS: usiUrl.indexOf("samsung.com/us/") != -1 || usiUrl.indexOf("shop.us.samsung.com") != -1,
		suppressedURL: usiUrl.indexOf("samsung.com/us/note7recall/") != -1 || usiUrl.indexOf("pages.samsung.com/us/tlw/index.html") != -1,
		notsuppressedSku: true
	};
	usiLaunch.companyIsNotSuppressed = (USI_get("u-upsellitc3191") == null && !usiLaunch.suppressedURL && !usiLaunch.pageIsConfirmation) || location.href.indexOf("showchat") != -1;
	// LAUNCH RULES
	// Suppress any cart with Note 7 SKUs
	var usi_includeCodes = function() {
		try {
			var all_SuppressedSKUs = "SM-N930AZKAATT|SM-N930AZSAATT|SM-N930AZBAATT|SM-N930VZKAVZW|SM-N930VZSAVZW|SM-N930VZBAVZW|SM-N930TZKATMB|SM-N930TZSATMB|SM-N930TZBATMB|SM-N930PZKASPR|SM-N930PZSASPR|SM-N930PZBASPR";
			var usifound = 1;
			usi_happyloop: for (i = 0; i < 3; i++) {
				if (USI_get("usi_prod_sku_" + usifound) != null) {
					if (all_SuppressedSKUs.indexOf(USI_get("usi_prod_sku_" + usifound)) != -1) {
						usiLaunch.notsuppressedSku = false; // suppress
						break usi_happyloop;
					} else {
						usifound++; // try next product
					}
				}
			}
		} catch (e) {}
		if (usiLaunch.notsuppressedSku) {
			var usiRequiredCookies = usiCheckCookieExists("usi_link", "usi_prod_image_1", "usi_prod_name_1", "usi_prod_price_1", "usi_prod_offer_1");
			if (usiLaunch.companyIsNotSuppressed) {
				if (!usiLaunch.siteIsMobile && usiRequiredCookies && usiLaunch.siteIsUS) {
					
					usiLoadDisplay("250222205272236339278300323321310289341314291332343327308279280", "14499");
					
				} else if (usiLaunch.siteIsMobile && usiRequiredCookies && usiLaunch.siteIsUS && usiLaunch.referrerOffSite) {
					
							usiLoadDisplay("260206264219256299327339310346346289301327289345272298313328295", "14048");
					
				}
			}
			
				usiLoadPreCapture("247268203225209343296276291302277323291293277312321301340300332", "14247");
			
		}
	};
	var dh_email_wishlist = "";
	usi_wishlist_checker_pass = function(USI_value, USI_name, USI_siteID) {
		try {
			if (dh_email_wishlist == "") {
				if (USI_readCookie("dh_email_wishlist") == null) {
					dh_email_wishlist = "dh_email_wishlist" + Math.round(1000 * Math.random()) + "_" + (new Date()).getTime();
					USI_createCookie("dh_email_wishlist", dh_email_wishlist, 364 * 24 * 60 * 60 * 1000);
				} else {
					dh_email_wishlist = USI_readCookie("dh_email_wishlist");
				}
			}
			var USI_headID = document.getElementsByTagName("head")[0];
			var USI_dynScript = document.createElement("script");
			USI_dynScript.setAttribute("type", "text/javascript");
			USI_dynScript.setAttribute("src", "//www.upsellit.com/hound/saveData.jsp?siteID=" + USI_siteID + "&USI_value=" + escape(USI_value) + "&USI_name=" + escape(USI_name) + "&USI_Session=" + dh_email_wishlist + "&bustCache=" + (new Date()).getTime());
			USI_headID.appendChild(USI_dynScript);
		} catch (e) {}
	};
	usi_wishlist_checker = function() {
		if (USI_readCookie("usi_email") != null) {
			if (document.getElementsByClassName("cta-wishlist")[0].innerHTML.indexOf("in your wishlist") != -1) {
				//Wish list added!
				usi_wishlist_checker_pass(utag_data.product_price[0], utag_data.product_id_s, 16340);
				usi_wishlist_checker_pass(USI_readCookie("usi_email"), "usi_email", 16340);
			} else {
				setTimeout("usi_wishlist_checker()", 2000);
			}
		} else {
			setTimeout("usi_wishlist_checker()", 4000);
		}
	};
	var usi_product = {};
	scrapeWishListable = function() {
		try {
			usi_product.name = document.getElementsByClassName("product-details__info-title")[0].innerHTML;
			usi_product.image = document.getElementsByClassName("product-details__img")[0].src.replace("http://", "https://");
			if (usi_product.image.indexOf("$") != -1) usi_product.image = usi_product.image.substring(0, usi_product.image.indexOf("$"));
			usi_product.link = location.href;
			if (usi_product.link.indexOf("?") != -1) usi_product.link = usi_product.link.substring(0, usi_product.link.indexOf("?"));
			if (usi_product.link.indexOf("#") != -1) usi_product.link = usi_product.link.substring(0, usi_product.link.indexOf("#"));
			usi_product.price =  utag_data.product_price_s;
			usi_product.pid = utag_data.product_id_s;
			usi_product.name = utag_data.product_name_s;
			usi_product.extra = "";
			usiSendProdRec("16340", usi_product);
		} catch (e) {}
	};
	if (document.getElementsByClassName("cta-wishlist").length > 0) {
		usi_wishlist_checker();
		scrapeWishListable();
		if (USI_get("usi_link") == null && usi_product.name != undefined && usi_product.image != undefined && usi_product.price != undefined && usi_product.pid != undefined) {
			var usiQledPids = ["QN55Q7CAMFXZA", "QN55Q7FAMFXZA", "QN55Q8CAMFXZA", "QN65Q7CAMFXZA", "QN65Q7FAMFXZA", "QN65Q8CAMFXZA", "QN65Q9FAMFXZA", "QN75Q7FAMFXZA", "QN75Q8CAMFXZA", "QN75Q9FAMFXZA"];
			if (usiQledPids.indexOf(usi_product.pid) != -1) {
				var usiKey = usiLaunch.siteIsMobile ? "mobile" : "desktop";
				usiLoadDisplay2("221253231232208342280331340322308274334294279312274292342336274", "17014", usiKey);
				if (document.getElementsByClassName("add-to-cart-cta").length > 0) {
					var usiAddToCartBtn = document.getElementsByClassName("add-to-cart-cta")[0];
					if (usiAddToCartBtn.addEventListener) {
						usiAddToCartBtn.addEventListener("click", usiSuppress, false);
					} else if (usiAddToCartBtn.attachEvent) {
						var usiClickAddToCartBtn = usiAddToCartBtn.attachEvent("onclick", usiSuppress);
					}
				}
			}
		}
	}
	if (usiLaunch.pageIsCart) {
		usiScrapeCart();
		usi_includeCodes();
	} else if (usiLaunch.pageIsCart_new) {
		setTimeout("usiScrapeCart_new();usi_includeCodes();", 2000);
	} else {
		usi_includeCodes();
	}
	
	


}
//</script>
