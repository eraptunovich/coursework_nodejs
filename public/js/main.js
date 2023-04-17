$(function(){
	if($('textarea#ta').length){
		CKEDITOR.replace('ta');
	}

	$('a.confirmDeletion').on('click', function(){
		if(!confirm('Подтвердите удаление страницы!')) return false;
	});
});