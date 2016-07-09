var headerImage = {
	currentIndex: 0,
	lastIndex	: 0,
	idleTime	: false,
	api			: null
};

headerImage.changeTo = function(nextIndex){
	$('.items div').each(function(i){
		if(i == nextIndex){
			headerImage.currentIndex = nextIndex;
			$(this).stop().show().animate({'opacity' : 1},{duration : 800, easing : 'linear', complete : function(){
			}});
			$('.naviNumber').removeClass('current');
			$('#imgNavi0' + (headerImage.currentIndex + 1)).addClass('current');
		}else{
			if($(this).css('opacity') != 0){
				$(this).stop().show().animate({'opacity' : 0},{duration : 800, easing : 'linear', complete : function(){
					$(this).hide();
				}});
			}
		}
	});
	headerImage.updateTimer();
}

headerImage.changeNext = function(){
	if(headerImage.currentIndex ++ >= headerImage.lastIndex){
		headerImage.currentIndex = 0;
	}
	headerImage.changeTo(headerImage.currentIndex);
}

headerImage.changePrev = function(){
	if(headerImage.currentIndex -- < 1){
		headerImage.currentIndex = headerImage.lastIndex;
	}
	headerImage.changeTo(headerImage.currentIndex);
}

/* -----------------------------------------------------
 * Header Image
 */
headerImage.init = function(){
	var imageNum = $('.items').children().length - 1;
	headerImage.lastIndex = imageNum;
	$('#slideNav').empty();
	$('#slideNav').append('<li id="imgNaviLeft" class="backward"><a href="#">&lt;</a></li>');
	for(i = 1; i <= imageNum + 1; i++){
		if(i == 1){
			$('#slideNav').append('<li id="imgNavi0' + i + '" class="naviNumber"><a href="#">' + i + '</a></li>');
		}else{
			$('#slideNav').append('<li id="imgNavi0' + i + '" class="naviNumber"><a href="#">' + i + '</a></li>');
		}
	}
	$('#slideNav').append('<li id="imgNaviRight" class="forward"><a href="#">&gt;</a></li>');
	
	$('.items div').each(function(i){
		if(i == 0){
		}else{
			$(this).css({'opacity' : 0}).hide();
		}
	});
	$('#slideNav .naviNumber').eq(0).addClass('current');
	
	headerImage.updateTimer();
	
	$('#slideNav .naviNumber').bind('click', function(evt){
		evt.preventDefault();
		headerImage.changeTo($('#slideNav .naviNumber').index(this));
	});
	
	$('#imgNaviRight').bind('click', function(evt){
		evt.preventDefault();
		headerImage.changeNext();
	});
	$('#imgNaviLeft').bind('click', function(evt){
		evt.preventDefault();
		headerImage.changePrev();
	});
};

headerImage.updateTimer = function(){
	clearTimeout(headerImage.idleTime);
	headerImage.idleTime = setTimeout(headerImage.changeNext, 6000);
};

/* -----------------------------------------------------
 * jquery 
 */
$(function(){
	// Constructor
	headerImage.init();
});