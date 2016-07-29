"use strict";
var express = require('express');
var app = express();

app.get('/',function(req,res){
	res.status(404).send('');
});

app.listen(8080,function(){
	console.log('Live on port 8080');
});
