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

});

module.exports=router;
