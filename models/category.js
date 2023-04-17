var mongoose = require('mongoose');

//схема категорий
var CategorySchema = mongoose.Schema({
	title:{
		type: String,
		required: true
	},
	slug:{
		type: String
	},
	

});

var Category = module.exports=mongoose.model('Category', CategorySchema);