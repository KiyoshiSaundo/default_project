jQuery(document).ready(function($) {

	InitInput();

	if ( $().bxSlider ) {
		// sliders
	}
	if ( $().colorbox ) {
		// popup images
		$('.colorbox').colorbox({
			maxWidth: '98%',
			maxHeight: '98%',
			transition: "fade",
			opacity: false,
			onOpen: function(){
				$("#cboxClose").css({opacity: 0});
			},
			onComplete: function(){
				$("#cboxClose").stop().animate({opacity: 1});
			}
		});
		// popup forms
		$(".pforms").colorbox({
			className: 'pforms',
			maxWidth: '98%',
			maxHeight: '98%',
			transition: "fade",
			opacity: false,
			onOpen: function(){
				$("#cboxClose").css({opacity: 0});
			},
			onComplete: function(){
				$("#cboxClose").stop().animate({opacity: 1});
				InitInput();
			}
		});
	}
	// scroll to the element
	$('a[href^="#"]').click(function(){
		var el = $(this).attr('href');
		$('body').animate({scrollTop: $(el).offset().top}, 1000);
		return false;
	});
	// styles for form elements
	function InitInput(){
		if ( $().datepicker ) {
			$('input.date').datepicker({
				autoClose: true,
				toggleSelected: false,
				keyboardNav: false,
				minDate: new Date()
			});
		}
		if ( $().mask ) {
			$(".phone").mask("+7 (999) 999 99 99", {placeholder: "+7 (   )          "});
		}
		if ( $().styler ) {
			setTimeout(function() {
				$("select:not(.nostyle), input[type='checkbox'], input[type='radio']").styler({
					singleSelectzIndex: 10
				});
			}, 100)
		}
	}
});