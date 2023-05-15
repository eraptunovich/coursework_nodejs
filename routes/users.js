var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User=require('../models/user');

router.get('/register', function(req, res){
	res.render('register', {
		title: "Регистрация"
	});
});

router.post('/register', function(req, res){

	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	req.checkBody('name', 'Имя является обязательным при регистрации!').notEmpty();
	req.checkBody('email', 'Неверный адрес электронной почты!').isEmail();
	req.checkBody('username', 'Имя пользователя является обязательным при регистрации!').notEmpty();
	req.checkBody('password', 'Пароль является обязательным при регистрации!').notEmpty();
	req.checkBody('password2', 'Пароли не совпадают!').equals(password2);

	var errors = req.validationErrors();
	if(errors){
		res.render('register', {
			errors: errors,
			user: null,
			title: "Регистрация"
		});
	} else{
		User.findOne({username: username},function(err, user){
			if(err) console.log(err);
			if(user){
				req.flash('danger', 'Пользователь с таким никнеймом уже существует, пожалуйста, выберите другой.');
				res.redirect('/users/register');
			} else {
				var user = new User({
					name: name,
					email: email,
					username: username,
					password: password,
					admin: 0
				});

				bcrypt.genSalt(10, function(err, salt){
					bcrypt.hash(user.password, salt, function(err, hash){
						if(err) console.log(err);
						user.password = hash;
						user.save(function(err){
							if(err) {
								console.log(err);
							} else {
								req.flash('success', 'регистрация прошла успешно!');
								res.redirect('/users/login');
							}
						});
					});
				});
			}
		});
	}
});

router.get('/login', function(req, res){
	if(res.locals.users) res.redirect('/');

	res.render('login', {
		title: "Вход"
	});
});

router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
    
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'Вы вышли из аккаунта.');
	res.redirect('/users/login');
});


module.exports=router;
