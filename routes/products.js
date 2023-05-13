var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

//get product model
var Product=require('../models/product');
var Category=require('../models/category');

router.get('/', function(req, res){
	//console.log("Все товары");
	Product.find(function(err, products){
		if(err) console.log("Ошибка"+err);

			res.render('all_products', {
				title: "Все товары",
				products: products
			});
	});
});


router.get('/:category', function(req, res){

	var categorySlug=req.params.category;
	console.log("Категории");

	Category.findOne({slug: categorySlug}, function(err, c){
		Product.find( {category:  categorySlug}, function(err, products){
			if(err) console.log("Ошибка"+err);
	
				res.render('cat_products', {
					title: c.title,
					products: products
				});
		});
	});
	
});

router.get('/:category/:product', function(req, res){

	var galleryImages=null;

	Product.findOne({slug: req.params.product}, function(err, product){
		if(err){
			console.log(err);
		} else{
			var galleryDir = "public/product_images/"+product._id+"/gallery";

			fs.readdir(galleryDir, function(err, files){
				if(err){
					console.log(err);
				} else{
					galleryImages=files;
					res.render('product',{
						title: product.title,
						p: product,
						galleryImages:galleryImages
					});
				}
			});
		}
	});
});

router.post('/search', (req, res) => {
	
	const searchTerm = req.body.search.toLowerCase();
	//console.log(searchTerm);
	// Обработка запроса поиска

	Product.find({slug: searchTerm}, function(err, products){
		if(err) console.log("Ошибка"+err);

			res.render('all_products', {
				title: "Все товары",
				products: products
			});
	});

  });

module.exports=router;
