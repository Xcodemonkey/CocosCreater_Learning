
// server.js

// 获取web框架构造方法
var express = require('express');

// 调用构造方法 app就是一个服务器
var app = express();

// 加载安装包
var http = require('http').Server(app);

// 装饰模式
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/publish'));

var userList = new Map();

var db_connect = require('db_connect');

io.on('connection',(socket)=> {
    console.log(socket.id);	
    // 密码校验
    socket.on('checkPassword',function(userModel){
        db_connect.checkPassword(userModel,(msg,user)=>{
            if (null != user) {
                socket.emit('checkPasswordResult',{code:1,userId:user.userId,userSign:user.loginSign});
            } else {
                socket.emit('checkPasswordResult',{code:0});
            }
        });
    });

    // 获取服务器列表
    socket.on('severLists',(loginModel) => {
        db_connect.getSeverLists(loginModel,(msg,severLists)=>{
            if (null == severLists || 0 == severLists.length) {
                socket.emit('severListsResult',{code:0});
            } else {
                socket.emit('severListsResult',{code:1,severLists:severLists});
            }
        });
    });

    // 获取服务器上的用户的英雄列表
    socket.on('loginOnSever',(data)=>{
        db_connect.getUserHeroLists(data.loginModel,data.severId,(code,msg,result)=>{
            if (1 != code) {
                socket.emit('loginOnSeverResult',{code:0,msg:msg});
                return;
            }
            socket.emit('loginOnSeverResult',{code:1,msg:msg,heroLists:result});
        });
    });

    // 登录请求
    socket.on('heroLogin',function(loginOnModel){
        db_connect.heroLoginOnSever(loginOnModel,(code,msg,hero)=>{
            if (1 == code && null != hero) {

                var isOnLine = false;

                var userListArr = Array.from(userList.values());

                console.log('userListArr->' + userListArr);
                for (var onlineUser of userListArr) {
                    if (onlineUser.userId == hero.userId) {
                       isOnLine = true;
                       // 上一个该ID被踢
                       socket.broadcast.emit('userLeave',{userId: onlineUser.userId}); //广播删除
                        break;
                    }
                }
                
                console.log('heroLoginResult heroName ->' + hero.heroName);

                socket.emit('heroLoginResult',{code:1,
                                               userId:hero.userId,
                                               heroId:hero.heroId,
                                               userName:hero.heroName,
                                               jobType:hero.jobType,
                                               msg:msg,
                                               userList:userListArr});

                if (!isOnLine) {
                    var keyStr = 'key_' + hero.userId;
                    userList.set(keyStr,{					//加入用户列表
                        userId : hero.userId,
                        heroId : hero.heroId,
                        jobType:hero.jobType,
                        userName:hero.heroName,
                        curTileX: 12,
                        curTileY: 42,
                    });
                }

                socket.userID = hero.userId;	
                console.log('newUser jobType ->' + hero.jobType);
		        socket.broadcast.emit('newUser',{userId:hero.userId,heroId:hero.heroId,jobType:hero.jobType,userName:hero.heroName}); //广播新用户
            } else {
                socket.emit('loginResult',{code:0,msg:msg});
            }
        });
    });

    //begin---------------------离线处理-----------------------------//
	
	socket.on('disconnect',function(){
        console.log('a user leaved ' + socket.userID);	//服务器端记录

        var keyStr = 'key_' + socket.userID;
        var user = userList.get(keyStr);
        if (user) {
            userList.delete(keyStr);	 		//删除的为undefined
            var userListArr = Array.from(userList.values());
            console.log('userListArr count==>' + userListArr.length);
            socket.broadcast.emit('userLeave',{userId: user.userId,heroId:user.heroId,userName:user.userName,userList:userListArr}); //广播删除
        }
	});

	//end-----------------------离线处理-----------------------------//

    //begin---------------------移动处理-----------------------------//
	socket.on('move',function(data){

        var keyStr = 'key_' + data.userId;

        var user = userList.get(keyStr);
        if (null != user) {
            user.userId = data.userId;
            heroId = user.heroId,
            jobType = user.jobType,
            user.userName = data.userName;
            user.curTileX = data.curTileX + data.newPos.newX;
            user.curTileY = data.curTileY + data.newPos.newY;
        } else {
            userList.set(keyStr,{					//加入用户列表
                userId : data.userId,
                heroId : data.heroId,
                jobType: data.jobType,
                userName : data.userName,
                curTileX: 12 + data.newPos.newX,
                curTileY: 42 + data.newPos.newY,
            });
        }

		socket.broadcast.emit('move',data);			   //广播位置改变
	});

	//end-----------------------移动处理-----------------------------//
});

http.listen(8000,()=>{
    console.log('listening on : 8000');
});


// var http = require("http");
 
// http.createServer(function(request, response) {
//   response.writeHead(200, {
//     "Content-Type" : "text/plain"
//   });
//   response.write("Welcome to Nodejs");
//   response.end();
// }).listen(8000, "127.0.0.1");
 
// console.log("Creat server on http://127.0.0.1:8000/");