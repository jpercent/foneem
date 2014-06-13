/**
 * jQuery.responsiveVideo
 * Version 1.1
 * Copyright (c) 2014 c.bavota - http://bavotasan.com
 * Dual licensed under MIT and GPL.
 * Date: 01/16/2014
 **/
( function($) {
	$.fn.responsiveVideo = function() {
		// Add CSS to head
		$( 'head' ).append( '<style type="text/css">.responsive-video-wrapper{width:100%;position:relative;padding:0}.responsive-video-wrapper iframe,.responsive-video-wrapper object,.responsive-video-wrapper embed{position:absolute;top:0;left:0;width:100%;height:100%}</style>' );
		// Gather all videos
		var $all_videos = $(this).find( 'iframe[src*="player.vimeo.com"], iframe[src*="ted.com"], iframe[src*="embed.ted.com"], iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"], iframe[src*="dailymotion.com"], iframe[src*="kickstarter.com"][src*="video.html"], object, embed' );
		// Cycle through each video and add wrapper div with appropriate aspect ratio if required
		$all_videos.not( 'object object' ).each( function() {
			var $video = $(this);
			if ( $video.parents( 'object' ).length )
				return;
			if ( ! $video.prop( 'id' ) )
				$video.attr( 'id', 'rvw' + Math.floor( Math.random() * 999999 ) );
			$video
				.wrap( '<div class="responsive-video-wrapper" style="padding-top: ' + ( $video.attr( 'height' ) / $video.attr( 'width' ) * 100 ) + '%" />' )
				.removeAttr( 'height' )
				.removeAttr( 'width' );
		} );
	};
} )(jQuery);