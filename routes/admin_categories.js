var express = require('express');
const { findById } = require('../models/page');
var router = express.Router();

//get category model
var Category=require('../models/category');

//get category index

router.get('/', function (req, res) {
	Category.find(function(err, categories){
		if(err) return console.log(err);
		res.render('admin/categories', {
            categories: categories
        });
	})
        
});


//get add category

router.get('/add-category', function(req, res){
	var title="";
	res.render('admin/add_category',{
		title: title
	});
});

//post add category

router.post('/add-category', function(req, res){
	req.checkBody('title', 'Вы не заполнили поле "Заголовок"!').notEmpty();


	var title=req.body.title;
	var slug=title.replace(/\s+/g, '-').toLowerCase();

	var errors=req.validationErrors();
	if(errors){
		res.render('admin/add_category',{
			errors: errors,
			title: title
		});
	}
	else{
		Category.findOne({slug: slug}).then((err, category)=>{
			if(category){
				req.flash('danger', 'Category title exists, choose another');
				res.render('admin/add_category',{
					title: title
				});
			}
			else{
				var category=new Category({
					title: title,
					slug: slug
				});

				category.save().then(()=>{

					Category.find(function(err, categories){
						if(err){
							console.log(err);
						} else{
							req.app.locals.categories = categories;
						}
					});
					

					req.flash('success', 'Категория добавлена!');
					res.redirect('/admin/categories');
				});
			}
		});
	}
	
});

router.get('/edit-category/:id', function(req, res){
	Category.findById(req.params.id, function(err, category){
		if(err) return console.log(err);
		res.render('admin/edit_category',{
			title: category.title,
			id: category._id
		})
	});
});

router.post('/edit-category/:id', function(req, res){
	req.checkBody('title', 'Вы не заполнили поле "Название категории"!').notEmpty();


	var title=req.body.title;
	var slug=title.replace(/\s+/g, '-').toLowerCase();
	var content=req.body.content;
	var id=req.params.id;

	var errors=req.validationErrors();

	if(errors){
		// console.log(errors);
		res.render('admin/edit_category',{
			errors: errors,
			title: title,
			id: id
		});
	}
	else{
		Category.findOne({slug: slug, _id:{'$ne':id}}).then((err, category)=>{
			if(category){
				req.flash('danger', 'Такая категория уже существует!');
				res.render('admin/edit_category',{
					title: title,
					id: id
				});
			}
			else{
				Category.findById(id, function(err, category){
					if(err) return console.log(err);
					category.title=title;
					category.slug=slug;

					category.save().then(()=>{

						Category.find(function(err, categories){
							if(err){
								console.log(err);
							} else{
								req.app.locals.categories = categories;
							}
						});
						
						req.flash('success', 'Категория была успешно изменена!');
						res.redirect('/admin/categories/edit-category/'+id);
					});
				});

			
			}
		});
	}
	
});

//get delete page

router.get('/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function(err){
		if(err)console.log(err);

		Category.find(function(err, categories){
			if(err){
				console.log(err);
			} else{
				req.app.locals.categories = categories;
			}
		});
		
		req.flash('success', 'Категория была успешно удалена!');
		res.redirect('/admin/categories/');
	});
});

module.exports=router;