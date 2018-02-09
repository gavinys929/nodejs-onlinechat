var express = require("express");
var path = require('path');
var app = express();

app.set("view engine", "jade");
app.set("views", path.join(__dirname, 'views'));

app.use("/index", function(req, res, next){
	res.render('index', {
    });
});
app.use(express.static('node_modules'));

app.use(express.static(path.join(__dirname, 'node_modules')));

var httpServer = app.listen(3000, function(){
	console.log("start to listen 3000 ");
});
var server = app.listen(3001, function(){
	console.log("start to listen 3001");
});

//客户端连接与用户
var clientIO = require("socket.io").listen(httpServer);
var client_user = [];
//服务端连接与用户
var serverIO = require("socket.io").listen(server);
var server_user = [];
var server_user_key = [];
//客户端与服务端随机map
var map = [];

// 客户端连接实例化
clientIO.on("connection", function(socket){
	socket.emit("user_login", "请登录");
	socket.on("user_login", function(username){
		var error = 0;
		if(!username) {
			socket.emit("error_info", "用户名不合法");
			error ++;
		}
		if(client_user.hasOwnProperty(username) || server_user.hasOwnProperty(username)) {
			socket.emit("error_info", "用户名已存在");
			error ++;
		}
		if(error == 0) {
			client_user[username] = socket;
			console.log(server_user_key.length);
			if(server_user_key.length > 0) {
				var rand = Math.floor((Math.random()*server_user_key.length))
				map[username] = server_user_key[rand];
				console.log(server_user_key[rand]);
				socket.emit("login_success", "用户登录成功，匹配的客服为：" + server_user_key[rand]);
			} else {
				socket.emit("error_info", "无客服");
			}
		}
	});

	socket.on("message", function(json){
		// 解析发送用户，解析到对应客服
		console.log(json.username);
		console.log(map[json.username]);
		server_user[map[json.username]].emit("message", {"username": json.username, "msg": json.msg});
	});

});

//服务端连接实例化
serverIO.on("connection", function(socket){
	socket.emit("user_login", "请登录");
	socket.on("user_login", function(username){
		var error = 0;
		if(!username) {
			socket.emit("error_info", "用户名不合法");
			error ++;
		}
		if(client_user.hasOwnProperty(username) || server_user.hasOwnProperty(username)) {
			socket.emit("error_info", "用户名已存在");
			error ++;
		}
		if(error == 0) {
			server_user[username] = socket;
			server_user_key.push(username);
			console.log(server_user_key);
			socket.emit("login_success", "用户登录成功");
		}
	});

	socket.on("message", function(json){
		// 解析发送用户，解析到对应客服
		var client_user_name = getArrKey(json.username, map);
		client_user[client_user_name].emit("message", {"username" : json.username, "msg" : json.msg});
	});
});

function getArrKey(value, arr)
{
	for(j in arr) {
		console.log(j);
		console.log(arr[j]);
		if(arr[j] == value) {
			return j;
		}
	}
}