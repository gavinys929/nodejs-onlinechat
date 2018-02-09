var express = require("express");
var path = require('path');
var app = express();

app.set("view engine", "jade");
app.set("views", path.join(__dirname, 'views'));

app.use("/index", function(req, res, next){
	res.render('server', {
    });
});