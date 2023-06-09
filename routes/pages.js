var express = require('express');
var router = express.Router();

//get page model
var Page=require('../models/page');

router.get('/', function(req, res){

	var videoContent = true;


	Page.findOne({slug: "home"}, function(err, page){
		if(err) console.log(err);

			res.render('index', {
				title: page.title,
				content: page.content,
				videoContent: videoContent
			});
	});
});

router.get('/:slug', function(req, res){

	var slug = req.params.slug;

	Page.findOne({slug: slug}, function(err, page){
		if(err) console.log(err);

		if(!page){
			res.redirect('/');
		} else {
			res.render('index', {
				title: page.title,
				content: page.content
			});
		}
	}); 

});

module.exports=router;
