var express = require('express');
var path = require('path')
var mongoose=require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');



//подключение к базе данных
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log('Connected to MongoDB');
});

//инициализируем приложение
var app=express();

//просмотр настроек
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//глобальная переменная для хранения ошибок
app.locals.errors=null;

//get page model

var Page = require('./models/page');

//get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function(err, pages){
	if(err){
		console.log(err);
	} else{
		app.locals.pages = pages;
	}
});


//get category model

var Category = require('./models/category');

//get all categories to pass to header.ejs
Category.find(function(err, categories){
	if(err){
		console.log(err);
	} else{
		app.locals.categories = categories;
	}
});

//установка публичных папок
app.use(express.static(path.join(__dirname,'public' )));

//установка промежуточного по для загрузки файлов
app.use(fileUpload());

//определение парсера
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//express session middleware
app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	//cookie: { secure: true }
  }));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
	customValidators:{
		isImage: function(value, filename){
			var extension = (path.extname(filename)).toLowerCase();
			switch(extension){
				case '.jpg':
					return '.jpg';
				case '.jpeg':
					return '.jpeg';
				case '.png':
					return '.png';
				case '':
					return '.jpg';
				default:
					return false;
			}
		}
	}
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
	res.locals.cart = req.session.cart;
	next();
});

//set routes
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages);


//запуск сервера
var port=3000;
app.listen(port, function(){
	console.log("Server started at port: "+port);
});
