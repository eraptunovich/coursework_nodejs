var express = require('express');
var router = express.Router();

//get product model
var Product=require('../models/product');

//добавление товара в корзину

router.get('/add/:product', function(req, res){

	var slug = req.params.product;

	Product.findOne({slug: slug}, function(err, p){
		if(err) console.log(err);

		if(typeof req.session.cart == "undefined"){
			req.session.cart = [];
			req.session.cart.push(
				{
					title: slug,
					qty: 1,
					price: parseFloat(p.price).toFixed(2),
					image: '/product_images/'+p._id+'/'+p.image

				}
			);
		} else{
			var cart = req.session.cart;
			var newItem = true;
			for(var i = 0; i<cart.length; i++){
				if(cart[i].title == slug){
					cart[i].qty++;
					newItem=false;
					break;
				}
			}

			if(newItem){
				cart.push(
					{
						title: slug,
						qty: 1,
						price: parseFloat(p.price).toFixed(2),
						image: '/product_images/'+p._id+'/'+p.image
	
					}
				);
			}
		}
		//console.log(req.session.cart);
		req.flash("success", "Товар успешно добавлен в корзину!");
		res.redirect('back');
	});
});

router.get('/checkout', function(req, res){
	if(req.session.cart && req.session.cart.length == 0){
		delete req.session.cart;
		res.redirect('/cart/checkout');
	} else {
		res.render('checkout',{
			title: "Checkout",
			cart: req.session.cart
		});
	}
	
});

router.get('/update/:product', function(req, res){
	var slug = req.params.product;
	var cart = req.session.cart;
	var action = req.query.action;
	console.log(action);
	for(var i=0; i<cart.length; i++){
		if(cart[i].title == slug){
			switch(action){
				case "add":
					cart[i].qty++;
					break;
				case "remove":
					cart[i].qty--;
					if (cart[i].qty < 1) cart.splice(i, 1);
					break;
				case "clear":
					cart.splice(i, 1);
					if(cart.length == 0) delete req.session.cart;
					break;
				default:
					console.log('Возникла проблема с обновлением!');
					break;
			}
			break;
		}
	}
	req.flash("success", "Корзина обновлена!");
	res.redirect('/cart/checkout');
});

router.get('/clear', function(req, res){
	delete req.session.cart;

	req.flash('success', 'Корзина успешно удалена!');
	res.redirect('/cart/checkout');
	
});

router.get('/buynow', function(req, res){
	delete req.session.cart;

	res.sendStatus(200);
	
});

module.exports=router;
