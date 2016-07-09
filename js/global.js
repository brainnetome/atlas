// JavaScript Document

// for Google site search. 
// uses a defined Google CSE that is restricted to this site, the MGH-UCLA site, and the NIH Neuroscience Blueprint
// the MGH-UCLA site appears to be hidden from search engines? (Oct 15, 2010)
/*
*  How to restrict a search to a Custom Search Engine
*  http://www.google.com/cse/
*/

// for rollover nav
startList = function() {
	if (document.all&&document.getElementById) {
		navRoot = document.getElementById("nav");
		for (i=0; i<navRoot.childNodes.length; i++) {
			node = navRoot.childNodes[i];
			if (node.nodeName=="LI") {
				node.onmouseover=function() {
					this.className+=" over";
				}
				node.onmouseout=function() {
					this.className=this.className.replace(" over", "");
				}
			}
		}
	}
}
window.onload=startList;

// for nifty expand/contract lists
function switchMenu2(opener,obj) {
	var op = document.getElementById(opener);
	var el = document.getElementById(obj);
	if ( el.style.display != 'none' ) {
		el.style.display = 'none';
		op.style.listStyleImage = 'url(img/widget-expand.png)';
	}
	else {
		el.style.display = '';
		op.style.listStyleImage = 'url(img/widget-contract.png)';
	}
}

// protected email script based on script by Joe Maller
// JavaScripts available at http://www.joemaller.com
// this script is free to use and distribute
// but please credit me and/or link to my site
			
			
function mailer(to, mailbox) {
	var mailto="<a href='mailto:" + to + "@" + mailbox + "' rel='nofollow'>Email</a>"; 
	return mailto;
}

function closeBanner() {
	document.getElementById("bannerOpen").className+=" hidden";	
	document.getElementById("bannerCollapsed").className="bannerContainer";	
}
function openBanner() {
	document.getElementById("bannerCollapsed").className+=" hidden";	
	document.getElementById("bannerOpen").className="bannerContainer";	
}

function closeLightbox() {
	document.getElementById("lightbox").className+=" hidden";
}
function lightbox(id) {
	// shades the screen and brings up a full-size image, identified by ID.
	document.getElementById("page-mask").style.display="block";	
	var imgsrc = document.getElementById(id).src;
	// ... more to come
}

/*
 * ---
 * list filtering
 * ---
 */

// create new case-insensitive :contains selector 
// usage - $('.this_selector:containsNC("hello")').click(function() { ... }); 
$.extend($.expr[":"], {
	"containsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "")
			.toLowerCase()
			.indexOf((match[3] || "")
			.toLowerCase()) >= 0;
	}
});
// create new case-insensitive anti-':contains' selector 
// usage - $('.this_selector:containsNC("hello")').click(function() { ... }); 
$.extend($.expr[":"], {
	"aintContainsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "")
			.toLowerCase()
			.indexOf((match[3] || "")
			.toLowerCase()) < 0;
	}
});
