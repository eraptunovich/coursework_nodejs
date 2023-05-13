$(function () {

    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function () {
        if (!confirm('Confirm deletion'))
            return false;
    });
    
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }

	$(document).ready(function() {
		$('.block .toggle').click(function(e) {
		  e.preventDefault();
		  $(this).parent().find('.content').slideToggle();
		});
	});

	

});