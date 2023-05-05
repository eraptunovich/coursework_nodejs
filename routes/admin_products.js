var express = require('express');
// const { findById } = require('../models/page');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

//get page model
var Product=require('../models/product');
var Category=require('../models/category');
//get product index

router.get('/', function (req, res) {
   var count;

   Product.count(function(err, c){
	count=c;
   });
   Product.find(function(err, products){
	res.render('admin/products',{
		products: products,
		count: count
	});
   });
});


//get add product

router.get('/add-product', function(req, res){
	var title="";
	var desc="";
	var price="";
	Category.find(function(err, categories){
		res.render('admin/add_product',{
			title: title,
			desc: desc,
			categories: categories,
			price: price
		});
	});
	
});

//post add product

router.post('/add-product', function(req, res){

	if(!req.files){ imageFile =""; }
    if(req.files){
   		var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
	req.checkBody('title', 'Вы не заполнили поле "Название товара"!').notEmpty();
	req.checkBody('desc', 'Вы не заполнили поле "Описание товара"!').notEmpty();
	req.checkBody('price', 'Неверное значение поля "Цена товара"!').isDecimal();
	req.checkBody('image', 'Вы не загрузили изображение товара!').isImage(imageFile);

	var title=req.body.title;
	var slug=title.replace(/\s+/g, '-').toLowerCase();
	var desc=req.body.desc;
	var price=req.body.price;
	var category=req.body.category;

	var errors=req.validationErrors();
	if(errors){
		Category.find(function(err, categories){
			res.render('admin/add_product',{
				errors: errors,
				title: title,
				desc: desc,
				categories: categories,
				price: price
			});
		});
	}
	else{
		Product.findOne({slug: slug}).then((err, product)=>{
			if(product){
				req.flash('danger', 'Товар с таким названием уже существует!');
				Category.find(function(err, categories){
					res.render('admin/add_product',{
						title: title,
						desc: desc,
						categories: categories,
						price: price
					});
				});
			}
			else{
				console.log(imageFile);
				var price2 = parseFloat(price).toFixed(2);
				var product=new Product({
					title: title,
					slug: slug,
					desc: desc,
					price: price2,
					category: category,
					image: imageFile
				});

				product.save().then(()=>{
					if(err) return console.log(err);

					mkdirp('public/product_images/'+product._id, function(err){
						return console.log(err);
					});

					mkdirp('public/product_images/'+product._id+'/gallery', function(err){
						return console.log(err);
					});

					mkdirp('public/product_images/'+product._id+'/gallery/thumbs', function(err){
						return console.log(err);
					});

					console.log(imageFile);
					if(imageFile!=""){
						var productImage = req.files.image;
						var path = 'public/product_images/'+product._id+'/'+imageFile;
						productImage.mv(path, function(err){
							return console.log(err);
						});
					}
					req.flash('success', 'Товар добавлен!');
					res.redirect('/admin/products');
				});
			}
		});
	}
	
});


router.get('/edit-product/:id', function(req, res){
	var errors;
	if(req.session.errors) errors = req.session.errors;
	req.session.errors=null;
	Category.find(function(err, categories){

		Product.findById(req.params.id, function(err, p){
			if(err) {
				console.log(err);
				res.redirect('/admin/products');
			}else{
				var galleryDir = 'public/product_images/'+p._id+'/gallery';
				var galleryImages = null;

				fs.readdir(galleryDir, function(err, files){
					if(err) {console.log(err);}
					else{
						galleryImages = files;

						res.render('admin/edit_product',{
							title: p.title,
							errors: errors,
							desc: p.desc,
							category: p.category.replace(/\s+/g, '-').toLowerCase(),
							categories: categories,
							price: parseFloat(p.price).toFixed(2),
							image: p.image,
							galleryImages: galleryImages,
							id: p._id
						});
					}
				});
			}

		});
		
	});
	
});

router.post('/edit-product/:id', function(req, res){

	if(!req.files){ imageFile =""; }
    if(req.files){
   		var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
	req.checkBody('title', 'Вы не заполнили поле "Название товара"!').notEmpty();
	req.checkBody('desc', 'Вы не заполнили поле "Описание товара"!').notEmpty();
	req.checkBody('price', 'Неверное значение поля "Цена товара"!').isDecimal();
	req.checkBody('image', 'Вы не загрузили изображение товара!').isImage(imageFile);

	var title=req.body.title;
	var slug=title.replace(/\s+/g, '-').toLowerCase();
	var desc=req.body.desc;
	var price=req.body.price;
	var category=req.body.category;
	var pimage=req.body.pimage;
	var id = req.params.id;

	var errors=req.validationErrors();

	if(errors){
		req.session.errors = errors;
		res.redirect('/admin/products/edit-product'+id);
	} else{
		Product.findOne({slug: slug, _id:{'$ne':id}}, function(err, p){
			if(err) console.log(err);
			if(p){
				req.flash('danger', 'Такой товар уже существует!');
				res.redirect('/admin/products/edit-product'+id);
			} else{
				Product.findById(id, function(err, p){
					if(err) console.log(err);

					p.title = title;
					p.slug = slug;
					p.desc = desc;
					p.price = parseFloat(price).toFixed(2);
					p.category=category;
					if(imageFile != ""){
						p.image=imageFile;
					}

					p.save(function(err){
						if(err) console.log(err);

						if(imageFile!=""){
							if(pimage!=""){
								fs.remove("public/product_images/"+id+'/'+pimage, function(err){
									if(err) console.log(err);
								});
							}

							var productImage = req.files.image;
						    var path = 'public/product_images/'+product._id+'/'+imageFile;
							productImage.mv(path, function(err){
							return console.log(err);
						});

						}
						req.flash('success', 'Товар добавлен!');
						res.redirect('/admin/products');
					});

				});
			}
		});
	}

});

//post product gallery

router.post('/product-gallery/:id', function (req, res) {
    var productImage = req.files.file;
	var id = req.params.id;
	var path = "public/product_images/"+id+"/gallery/"+req.files.file.name;
	var thumbsPath = "public/product_images/"+id+"/gallery/thumbs/"+req.files.file.name;

	console.log("Path: "+path);
	productImage.mv(path, function(err){
		if(err) console.log(err);

		resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function(buf){
			fs.writeFileSync(thumbsPath, buf);
	});
	});

	res.sendStatus(200);
});

//get delete image

router.get('/delete-image/:image', function (req, res) {
	var originalImage = "public/product_images/"+req.query.id+"/gallery/"+req.params.image;
	var thumbImage = "public/product_images/"+req.query.id+"/gallery/thumbs/"+req.params.image;

	fs.remove(originalImage, function(err){
		if(err){
			console.log(err);
		} else{
			fs.remove(thumbImage, function(err){
				if(err){
					console.log(err);
				} else{
					req.flash('success', 'Изображение удалено!!');
					res.redirect('/admin/products/edit-product/'+req.query.id);
				}
			});
		}
	})
});

//get delete category

router.get('/delete-category/:id', function (req, res) {
    Page.findByIdAndRemove(req.params.id, function(err){
		if(err) console.log(err);
		req.flash('success', 'Категория была успешно удалена!');
		res.redirect('/admin/categories/');
	});
});

//get delete product

router.get('/delete-product/:id', function (req, res) {
    var id = req.params.id;
	var path = "public/product_images/"+id;

	fs.remove(path, function(err){
		if(err){
			console.log(err);
		} else {
			Product.findByIdAndRemove(id, function(err){
				console.log(err);
			});
			req.flash('success', 'Товар был успешно удален!');
			res.redirect('/admin/products');
		}
	});
});

module.exports=router;