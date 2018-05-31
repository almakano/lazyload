/* 
	Version: 1.0
	Author: Alexey Makano https://github.com/almakano/lazyload

	Usage: 
		<img class="lazyload" data-src="//path/to/source.jpg" src="//path/to/nophoto.jpg">
		<div class="lazyload" data-src="//path/to/source.jpg" style="background-image: url(//path/to/nophoto.jpg)"></div>
*/

$.fn.lazyload = function(params){

	var _this = this;
	var opts = $.fn.lazyload.defaults;

	if(opts.status == 'loading' || opts.timeout_handler) {
		if(opts.log) console.log("%cLazyload event ignored", 'color: brown');
		return this;
	}

	if(opts.log) console.log('Lazyload called', params);

	opts.timeout_handler = setTimeout(function(){

		var w = $(window);
		var w_top = w.scrollTop();
		var w_bottom = w_top + window.innerHeight;
		var w_left = w.scrollLeft();
		var w_right = w_left + window.innerWidth;
		var parsed_counter = 0;
		var ignored_counter = 0;

		if(typeof params != 'undefined'){
			$.extend(opts, params);
		}

		opts.timeout_handler = 0;
		opts.status = 'loading';

		if(opts.log) console.log('Lazyload started', 'Trigger', opts.trigger);

		_this.filter('[data-src]').each(function(){
			var th = $(this);
			var src = th.attr('data-src');
			var th_position = th.offset();
			var is_th_visible = (
				th.css('display') != 'none' &&
				th_position.left < w_right &&
				(th_position.left + th.outerWidth()) > w_left &&
				th_position.top < w_bottom &&
				(th_position.top + th.outerHeight()) > w_top
			);
			var is_parents_visible = !th.parents().filter(function(){
				var thp = $(this);
				return (
					!thp.is(':visible') ||
					thp.css('display') == 'none'
				);
			}).length;

			parsed_counter++;

			if(is_parents_visible && is_th_visible) {
				var img = $('<img style="display: none">');

				opts.counters.loading++;
				th.addClass('loading').removeAttr('data-src');

				img.on('load', function(){

					if(th.get(0).nodeName == 'IMG') th.attr('src', src);
					else th.css('background-image', 'url('+src+')');

					th.removeClass('loading');
					img.remove();

					opts.counters.loading--;
					opts.counters.loaded++;

					if(!opts.counters.loading){
						if(opts.log)
							console.log("%cLazyload report", 'color: green', 'Loaded', opts.counters.loaded, 'Errors', opts.counters.errors);
						opts.counters.loaded = 0;
						opts.counters.errors = 0;
					}
				}).on('error', function(){

					th.removeClass('loading');
					img.remove();

					opts.counters.loading--;
					opts.counters.errors++;

					if(!opts.counters.loading){
						if(opts.log)
							console.log("%cLazyload report", 'color: green', 'Loaded', opts.counters.loaded, 'Errors', opts.counters.errors);
						opts.counters.loaded = 0;
						opts.counters.errors = 0;
					}
				}).appendTo('body').attr('src', src);
			} else {
				ignored_counter++;
			}
		});

		opts.status = 'init';
		opts.timeout_handler = 0;
		if(opts.log) console.log('Lazyload finished', 'Parsed', parsed_counter , 'Ignored', ignored_counter);

	}, opts.timeout_interval);

	return this;
};

$.fn.lazyload.defaults = {
	status: 'init',
	trigger: 'manual',
	log: false,
	counters: {
		loading: 0,
		loaded: 0,
		errors: 0
	},
	timeout_handler: 0,
	timeout_interval: 200
};

$(function(){

	if($.fn.lazyload){
		$(document).ajaxComplete(function(e){
			$('.lazyload[data-src]').lazyload({trigger: 'ajaxComplete'});
		}).on('click mousemove', function(e){
			$('.lazyload[data-src]').lazyload({trigger: e.type});
		});

		$(window).on('scroll', function(e){
			$('.lazyload[data-src]').lazyload({trigger: e.type});
		});

		$('.lazyload[data-src]').lazyload({trigger: 'onload'});
	}

});
