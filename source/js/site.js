var vw = window.innerWidth;
var vh = window.innerHeight;
var sw = screen.width;
var sh = screen.height;
var pageScroll = window.pageYOffset || document.documentElement.scrollTop;

jQuery(document).ready(function ($) {

	/* PARAMS */

	$(window).resize(function () {
		vw = window.innerWidth;
		vh = window.innerHeight;
		sw = screen.width;
		sh = screen.height;
	});

	$(document).scroll(function () {
		pageScroll = window.pageYOffset || document.documentElement.scrollTop;
	});

	initInput();

	/* ACTIONS */

	// плавный скрол до элемента и отключение действий для ссылок "#"
	$('[href^="#"]').click(function (e) {
		e.preventDefault();
		if ($(this).attr('href').length > 1) {
			scroll2element(
				$($(this).attr('href')),
				1000,
				0,
				false
			);
		}
	});

	// placeholders
	var placeholder = '';
	$(document).on('focusin', 'input, textarea', function () {
		placeholder = $(this).attr('placeholder');
		$(this).attr('placeholder', '');
	});
	$(document).on('focusout', 'input, textarea', function () {
		$(this).attr('placeholder', placeholder);
	});
	// end - placeholders

	// ajax forms
	$(document).on('submit', '[data-form-ajax]', function (e) {
		e.preventDefault();
		sendForm($(this));
	});

	// всплывающие формы
	$('[data-popup-form]').click(function (e) {
		e.preventDefault();
		var form = $(this).data('popup-form');

		$.colorbox({
			href: '/ajax/form/' + form + '-form.html',
			className: 'colorbox-form',
			maxWidth: '100%',
			maxHeight: '100%',
			opacity: false,
		});
	});

	// colorbox
	$('.colorbox').colorbox({
		maxWidth: '100%',
		maxHeight: '100%',
		opacity: false
	});

	// colorbox buttons svg
	$(document).bind('cbox_complete', function () {
		initInput();
		$("#cboxPrevious").html('<svg><use xlink:href="#svg-arrow"></svg>');
		$("#cboxNext").html('<svg><use xlink:href="#svg-arrow"></svg>');
		$("#cboxClose").html('<svg><use xlink:href="#svg-close"></svg>');
	});
});

/* FUNCTIONS */

function sendForm($el) {
	var $form = $el,
		$btn = $form.find('button'),
		fd = new FormData($form[0]);

	if ($btn.hasClass('is-loading')) return;

	$.ajax({
		url: $form.attr('action'),
		type: $form.attr('method'),
		data: fd,
		processData: false,
		contentType: false,
		dataType: 'json',
		// dataType: 'html',
		beforeSend: function () {
			hideErrorFields($form);
			showBtnLoading($btn);
		},
		success: function (data) {
			// console.log('form success', data);
			setTimeout(function () {
				hideBtnLoading($btn);
				initInput();

				if (data.result) {
					$form[0].reset();
					if (data.message.length) {
						showPopupMessage(data.message);
					}
				} else {
					showErrorFields($form, data.errors);
				}
			}, 1000);
		},
		error: function (data) {
			// console.log('form error:', data);
			setTimeout(function () {
				hideErrorFields($form);
				hideBtnLoading($btn);
			}, 1000);
		}
	});

	function showErrorFields($form, errors) {
		$.each(errors, function (i, val) {
			$el = $form.find("[name='" + val + "']");
			if ($el.length) $el.addClass('is-error');
		});
	}
	function hideErrorFields($form) {
		$form.find('.is-error').removeClass('is-error');
	}

	function showBtnLoading($btn) {
		$btn.addClass('is-loading');
	}
	function hideBtnLoading($btn) {
		$btn.removeClass('is-loading');
	}
}

function showPopupMessage(text) {
	$.colorbox({
		html: '<div class="popup-message">' + text + '</div>',
		maxWidth: '100%',
		maxHeight: '100%',
		opacity: false,
		className: 'colorbox-message'
	});
}

function initInput() {
	if ($().datepicker) {
		$('input.date').datepicker({
			autoClose: true,
			toggleSelected: false,
			keyboardNav: false,
			minDate: new Date()
		});
	}
	if ($().inputmask) {
		$('[data-mask="phone"]').inputmask("+7-999-999-99-99");
	}
	if ($().styler) {
		setTimeout(function () {
			$(":not(.nostyle)").styler({
				singleSelectzIndex: 10
			});
		}, 100);
	}
}

function scroll2element($el, speed, offset, edges) {
	if (speed == undefined) speed = 'slow';
	if (offset == undefined) offset = 50;
	if (edges == undefined) edges = true;

	var scroll = $el.offset().top - offset,
		topEdge = window.pageYOffset,
		bottomEdge = window.pageYOffset + document.documentElement.clientHeight,
		bNeedScroll = edges ? (scroll < topEdge || scroll > bottomEdge) : true;

	if (bNeedScroll) {
		$('html, body').animate({
			scrollTop: scroll + 'px'
		}, speed);
	}
}