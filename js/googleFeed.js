// Google Feed API for reading RSS feeds from any website. 
// Requires a unique API key for any web root URL (i.e. humanconnectome.org) from http://code.google.com/apis/loader/signup.html
// Google Feed documentation at http://code.google.com/apis/feed/v1/devguide.html

google.load("feeds", "1");

    function initialize() {
      var feed = new google.feeds.Feed("http://humanconnectome.org/about/pressroom/feed/");
      feed.load(function(result) {
		  if (!result.error) {
			  jQuery(function() {
				  jQuery('#newsBox').append('<h1>PROJECT NEWS'
					+ '<span style="font: 11px Arial, Helvetica, sans-serif; font-weight: normal; color: #999; padding-left: 1em;">['
					+ '<a href="'
					+ result.feed.link
					+ '">All News</a>]'
					+ '</h1>');
					
					var html = '<ul>';
            
					for(var i = 0; i < result.feed.entries.length && i < 3; i++) {
					
						var item = result.feed.entries[i];
						var pubDate = new Date(item.publishedDate);
						var month = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
						
						html += '<li>'
						+ '<p class="date">'
						+ item.categories[0] + ' | '
						+ month[pubDate.getMonth()] + ' ' 
						+ pubDate.getDate() + ', '
						+ pubDate.getFullYear()
						+ '</p>';
						
						html += '<p><a href="'
						+ item.link
						+ '">'
						+ item.title
						+ '</a>'
						+ '</p>';
						
						html += '</li>';
					}
					
					html +='</ul>'; 
					
					jQuery('#newsBox').append(html);
			  }); 
		  }
      });
    }
    google.setOnLoadCallback(initialize);