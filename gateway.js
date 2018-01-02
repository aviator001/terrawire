/**
 * @platform		All
 * @category   		Secure SMS & Messaging Gateway API
 * @package    		Gateway
 * @how-to-install	
 * dependencies		
 * @author     		Gautam Sharma <g@txt.am>
 * @copyright  		Creative Commons
 * @license    		M.I.T.
 * @major-version   1.0
 * @link       		http://github.com/terrawire
 * @since      		File available since Release 1.0.0
 * @deprecated 		N/A 
 *
 * DESCRIPTION
 * ---------------------------------------------------------------------------
 
 * LEGAL
 * ---------------------------------------------------------------------------
 *	Permission is hereby granted, free of charge, to any person obtaining a
 *	copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sub-license, and/or sell copies of the Software, and to permit
 *  persons to whom the Software is furnished to do so, subject to the
 *  following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included
 *  in all copies or substantial portions of the Software.
 *   
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 *   OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 *   NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 *   DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 *   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 *   USE OR OTHER DEALINGS IN THE SOFTWARE.
 *---------------------------------------------------------------------------
 * 
 *
 * PARAMETERS
 * --------------------------------------------------------------------------
	a. $_GET
	b. $_POST
	c. $_COOKIE
	
 * END POINTS
 * --------------------------------------------------------------------------
	a.
	b.
	c.
	d.
	e.
	f.
	g.
	h.
	
 * JS Dependencies
 
 * CSS Dependencies
 
 * PHP Package Dependencies
 
 * Remote Functions
	a. Name
	b. URL
	
 * Configuration File 
 
 **/
 "use strict";
process.title = 'sms-im-gateway';
var webSocketsServerPort = 7788;
var ctr=0;
var clients = [ ];
var users = [ ];
var mobiles = [ ];
var user_mobiles = [ ];
var xConn = [ ];
var alias;
var http
var server, APIServer, SMSServer
var webSocketServer
var out='';
var toIndex 
var to_user
var from_user
var toUser;
var msg;
var toMobile;
var fromMobile;
var fromLongCode;
var fromImg;
var obj
var json;
var long_code
var mData
var mType
var message
var fromUser
var mObj
var oldMsg
var fromImg
var q;
var msg;
var msgs;
var source;
var smsIndex;
var fs  = require('fs')
var httpsOptions
var sql
var usr
var msg
var socketIOServer='https://txt.am:9001/'
var socketIOPort='9001'
var express=require('express');
var results, fields
var mysql = require('mysql');
var sms_response
var fs
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var httpsOptions
var sql
var usr
var msg
var express
var results, results1, fields, fields1
var to_mobile, from_long_code, from_mobile, to_mobile, to_long_code, to_login, from_login
var app, mysql,pool
var params=[]
var gatewayPort = 7799

	httpsOptions = null;
	http = require('https');

	httpsOptions = {
		key: fs.readFileSync('/webroot/sites/txt/public_html/gateway/txt.key'),
		cert: fs.readFileSync('/webroot/sites/txt/public_html/gateway/txt.crt')
	};

	server = http.createServer(httpsOptions, function(request, response){});
	webSocketServer = require('websocket').server;

	var wsServer = new webSocketServer({
		httpServer: server
	});

	server.listen(webSocketsServerPort, function() {
		//All IM/Chat stuff
		console.log('IMWebsocket Engine Online; Listening on 7788...');
	});

	//Init app server
	express=require('express');
	app = express();
	app.use(express.static('public'));	

	var server = app.listen(gatewayPort, function () {
	  console.log("sms engine listening at Port " + gatewayPort)
	})

	mysql = require('mysql');
	pool  = mysql.createPool({
	 connectionLimit 	: 	1000,
				host    : 	'x.x.x.x',
				user    : 	'xxxx',
			password 	: 	'xxxx',
			database 	: 	'xxxx'
	});

	var plivo = require('plivo');
	var p = plivo.RestAPI({
	  authId: 'MAOWUYZMM5MDM4MWRHMW',
	  authToken: 'NGIzN2VlY2Y1NzY5Y2Y5Mzg4ZjBlYzlkYTUwNjQx'
	});
	
	app.get('/sql/:query', function (req, res) {
		pool.getConnection(function(err, connection) {
		connection.query(req.params.query, function (error, results, fields) {
			res.end(JSON.stringify(results));
			if (error) throw error
				else connection.release();
		  });
		});
	})


	app.get('/users', function (req, res) {
		var s='select login,mobile,long_code from members where mobile <>"" limit 150';
		pool.getConnection(function(err, connection) {
			connection.query(s, function (error, results, fields) {
				console.log(results[0].login)
				res.end(JSON.stringify(results));
				connection.release();
			});
		});		
	})

	app.get('/whois/:login', function (req, res) {
		var sql='select * from members where login="'+req.params.login+'"';
		pool.getConnection(function(err, connection) {
			connection.query(sql, function (error, results, fields) {
				res.end(JSON.stringify(results));
				connection.release();
			});
		});	
		
   });

  
	function sql(query) {
		pool.getConnection(function(err, connection) {
			connection.query(query, function (error, results, fields) {
				connection.release();
			});
		});		
	}

	//Send SMS Screen
	app.get('/msg', function (req, res) {
	   res.sendFile("/webroot/sites/txt/public_html/gateway/sms.html");
	}) 

	//Send SMS LARGE text messages - uses POST
	app.post('/send_sms', urlencodedParser, function (req, res) {
	   response = {
		  msg:req.body.msg,
		  to:req.body.to,
		  from:req.body.from
	   };
	   sms(req.body.to, req.body.from, req.body.msg, res)
	   res.end(JSON.stringify(response));
	})


 /**
  *
    ***********************************
	NAME		: /sms
	FUNCTION	: Sends an sms message
	INPUT		: 3 Args: to mobile, from mobile, message
	OUTPUT		: status code, status
    ***********************************
  *
 **/
    app.get('/sms/:to/:fr/:msg', function (request, response) {
		sms(request.params.to,request.params.fr,request.params.msg, response)
	})
	
 /**
  *
    ***********************************
	NAME		: /smsByLogin
	FUNCTION	: Sends sms message using member logins or email addresses
	INPUT		: 3 Args: to login/email, from login/email, message
	OUTPUT		: status code, status
    ***********************************
  *
 **/
	app.get('/smsByLogin/:to/:fr/:msg', function (req, res) {
		var s='select `long_code` from members where login="' + req.params.fr + '"';
		pool.getConnection(function(err, connection) {
			connection.query(s, function (error, results1, fields1) {
				from_long_code=results1[0].long_code
				var s='select login,mobile,long_code from members where login="' + req.params.to + '"';
				connection.query(s, function (error, results2, fields2) {
					to_mobile=results2[0].mobile
					fetchURL('http://txt.am/gateway/sms.php?to='+to_mobile+'&from='+from_long_code+'&msg=' + req.params.msg)
					res.end('SMS for '+req.params.to+' has been sent to ' + to_mobile);
					connection.release();
				});				
			});
		});		
	})

	
 /**
  *
    ***********************************
	NAME		: /initByLogin
	FUNCTION	: Initiate Anon SMS chat with another user (using logins only)
	INPUT		: to login, from login
	OUTPUT		: status
    ***********************************
  *
 **/	
	app.get('/initByLogin/:to/:fr', function (req, res) {
		var s='select `long_code` from members where login="' + req.params.fr + '"';
		pool.getConnection(function(err, connection) {
			connection.query(s, function (error, results1, fields1) {
				from_long_code=results1[0].long_code
				from_mobile=results1[0].mobile
				//console.log(from_long_code)
				var s='select login,mobile,long_code from members where login="' + req.params.to + '"';
				connection.query(s, function (error, results2, fields2) {
					to_mobile=results2[0].mobile
					fetchURL('http://txt.am/gateway/index.php?To=12132140004&From='+from_mobile+'&Text=' + to_mobile + '&f=node&hide=' + req.params.to)
					res.end('Anon message to '+req.params.to+' has been initiated for recepient mobile#' + to_mobile);
					connection.release();
				});				
			});
		});		
	})


 /**
  *
    ***********************************
	NAME		: /init
	FUNCTION	: Initiate Anon SMS chat with another user (using recipients real mobile number or long code. No emails or logins)
	INPUT		: to mobile, from mobile
	OUTPUT		: status
    ***********************************
  *
 **/	
	app.get('/init/:to/:fr', function (req, res) {
		var num_to=req.params.to
		var num_from=req.params.fr
		num_to=isValidMobile(num_to)
		num_from=isValidMobile(num_from)
		var s='select `mobile`, `long_code` from dt_anon_sms where mobile="' + num_from + '" or `long_code`="' + num_from  + '"';
		//console.log(s)
		if (num_to && num_from) {
			pool.getConnection(function(err, connection) {
				connection.query(s, function (error, results1, fields1) {
					from_long_code=results1[0].long_code
					from_mobile=results1[0].mobile
					fetchURL('http://txt.am/gateway/index.php?To=12132140004&From='+from_mobile+'&Text=' + num_to + '&f=node&hide=' + num_to)
					res.end('Anon message to '+num_to+' has been initiated for recepient mobile#' + num_to);
					connection.release();
				});
			});		
		} else {
			res.end('Invalid sender or recepient mobile')
		}
	})
	
 /**
  *
    ***********************************
	NAME		: /longcode
	FUNCTION	: Register with system to get a new long code with 100 free trial text messages
	INPUT		: to login, from login
	OUTPUT		: status
    ***********************************
  *
 **/	
	app.get('/longcode/:mobile/:domain', function (req, res) {
		var sql=fetchURL('http://txt.am/nodeFunctions.php?f=long_code&domain='+req.params.domain+'&from=' + req.params.mobile+'&table=members'); 
		var long_code = sql;
		res.end(long_code);
	})
 
 /**
  *
    ***********************************
	NAME		: /longcode
	FUNCTION	: Gateway for incoming SMS Messages. Interface to the Plivo API
	INPUT		: POST; 3 Parameters: To, From, Text
	OUTPUT		: 200/400
    ***********************************
  *
 **/	
	app.post('/gateway', urlencodedParser, function (req, res) {
		var msg=req.body.Text
		if(req.body.To == '12132140004') {
			console.log('here');
			var sql="select login,long_code, mobile from members where mobile='" + req.body.Text + "' or long_code='" + req.body.Text + "' or login='" + req.body.Text + "' or email='" + req.body.Text + "'"
			pool.getConnection(function(err, connection) {
				connection.query(sql, function (error, results, fields) {
					if (!results[0]) {
						var toNum=isValidMobile(req.body.Text)
						if (toNum===false) {
							res.end("Invalid Destination or User Doesn't exist in Database. Try mobile number instead of login")
						} else {
							msg=toNum
						}
					} else {
						var toNum=isValidMobile(results[0].mobile)
						if (toNum===false) {
							res.end("Invalid Destination or User Doesn't exist in Database. Try mobile number instead of login")
						} else {
							msg=toNum
						}
					}
					fetchURL('http://txt.am/gateway/index.php?To='+req.body.To+'&From='+req.body.From+'&Text=' + encodeURI(isValidMobile(msg)) + '&f=node&hide=' + encodeURI(req.body.Text))
					console.log('http://txt.am/gateway/index.php?To='+req.body.To+'&From='+req.body.From+'&Text=' + encodeURI(isValidMobile(msg)) + '&f=node&hide=' + encodeURI(req.body.Text))
				});
			});
		} else {
			console.log('there');
			//Dispatch to Gateway
			fetchURL2('http://txt.am/gateway/index.php?To=' + req.body.To + '&From=' + req.body.From + '&Text=' + encodeURI(msg) + '&f=node&hide=' + encodeURI(req.body.Text))
			console.log('http://txt.am/gateway/index.php?To=' + req.body.To + '&From=' + req.body.From + '&Text=' + encodeURI(msg) + '&f=node&hide=' + encodeURI(req.body.Text))
			
			//Get Login of Sender & receiver
			pool.getConnection(function(err, connection) {
				var sql="select login, long_code from members where mobile='" + req.body.To + "' or long_code='" + req.body.To + "'"
				connection.query(sql, function (error, results, fields) {
					if (results[0]) {
						to_login=results[0].login
						to_long_code=results[0].long_code
					}
				});
				var sql="select login, long_code from members where mobile='" + req.body.From + "' or long_code='" + req.body.From + "'"
				connection.query(sql, function (error, results1, fields1) {
					if (results1[0]) {
						from_login=results1[0].login
						from_long_code=results1[0].long_code
					}
				});
			});
			if (users.indexOf(to_login) >= 0) {
				var to_user_index=users.indexOf(to_login);
				mObj = {	'msg'			: msg,
							'toUser'		: to_login,
							'fromUser'		: from_login,
							'fromLongCode'	: from_long_code,
							'fromImg'		: fromImg
						};

				//console.log(mObj)
				var json = JSON.stringify({ type:'M', data: mObj});
				if (clients[to_user_index] !== undefined) clients[to_user_index].sendUTF(json)
			}			   
		}
		res.end('200');
	})


	//Start video Call with another person with a valid mobile number that is capable of accepting sms messages
	
	//Initiate IM
	
	//Send a regular SMS (using mobile numbers)
	
	//Authenticate user (get token as a result of auth)
	
	//Who all are on-line now
	
	//Gift a User
	
	//Add aNew anonymous mobile number
	
	//Show my existing mobile numbers
	
	//Show my sms & call history
	
	//Make voice call number I pick and speak out specified text.
	
	//Call given number, and then call me once connection is made - and finally connect both call in a conference.
	
	//Modify CallerID to CallerID I specify - and then call someone
	
	// Lookup Address Book
	
	// Import Address Book from Google
	
	//Send an SMS using login names


	var global=[];
	var source;
	var user=[];
	var connection;
	var index=0;
	var userData=[];
	var msg	
	var imgs=[]
	
	wsServer.on('request', function(request) { 
		msg=request.resourceURL.query['msg'];
		if (request.resourceURL.query['source']) var source=request.resourceURL.query['source'];
		if (request.resourceURL.query['login']) var login=request.resourceURL.query['login'];
		if (request.resourceURL.query['mobile']) var mobile=request.resourceURL.query['mobile'];
		if (request.resourceURL.query['fromLongCode']) var fromLongCode=request.resourceURL.query['fromLongCode'];
		if (request.resourceURL.query['fromImg']) var fromImg=request.resourceURL.query['fromImg'];
		if ((login !== 'undefined') && (!!login)) {
			connection = request.accept(null, request.origin); 
			if (users.indexOf(login)<0) {
				if (source !='gateway') {
					index = clients.push(connection)-1;
					users.push(login);
					mobiles.push(mobile);
					imgs.push(fromImg);
					console.log(login + ' just joined')
					user['mobile']=mobile;
					user['login']=login;
					user['img']=fromImg;
					global[source]=[];
					global[source].push(user);
					
					//1. Send user a welcome message, with list of all users that are currently on-line (Types W and O)
					//2. Notify all on-line users that a new user has logged in. (type C)
					for (var i=0; i < clients.length; i++) {
						userData[i] = ({'user': users[i], 'mobile': mobiles[i], 'img': imgs[i] })
						var jsonC=JSON.stringify({ type:'C', data: ({user:login,mobile:mobile})});
						if (users[i] !== login) {
							clients[i].sendUTF(jsonC);
						}
					}
					if (clients.length ==1) msg= "Welcome " + login + ". Looks like you're the only one online right now"
					if (clients.length ==2) msg= "Welcome " + login + ". There is one other person online"
					if (clients.length > 2) msg= "Welcome " + login + ". There are " + clients.length + " people online"
					var jsonW = JSON.stringify({ type:'W', data: msg });
					var jsonO = JSON.stringify({ type:'O', data: userData});
					connection.sendUTF(jsonW) 
					connection.sendUTF(jsonO)
				}
			} 
			if (msg) {
				toUser=msg.split('|')[0];
				fromUser=login;
				msg=msg.split('|')[1];
				if (users) {
					if (users.indexOf(toUser) >= 0) {
						toIndex=users.indexOf(toUser);
					} else {
						if (mobiles.indexOf(toUser) >= 0) {
							toIndex=mobiles.indexOf(toUser);
							toUser=clients[mobiles.indexOf(toUser)];
						}
					}
				}
				mObj = [{	'msg'			: msg,
							'toUser'		: toUser,
							'fromImg'		: fromImg,
							'fromUser'		: fromUser,
							'fromLongCode'	: fromLongCode}];			
					if (clients) {
						if (clients[toIndex]) {
							clients[toIndex].sendUTF(JSON.stringify({'type':'M', 'data': mObj}));
							xConn[toUser].sendUTF(JSON.stringify({'type':'M', 'data': mObj}));
							if (source !='gateway') {
								toMobile=mobiles[toIndex];
								var mr=sendSMS(toMobile,fromLongCode,msg)
							} 
						} else {
							console.log('No such client');
						}
					}
				}
				connection.on('message', function(message) {
					msg=JSON.parse(message.utf8Data);
					if (msg) {
						if (msg.type && msg.data) {
							if (msg.data) {
								mData=msg.data
								if (mData.toUser) {
									toUser=mData.toUser		
								}
								if (mData.fromUser) {
									fromUser=mData.fromUser				 
								}
								if (mData.msg) {
									msgs=mData.msg		
								}
								if (mData.fromLongCode) {
									fromLongCode=mData.fromLongCode
								}
								if (mData.fromImg) {
									fromImg=mData.fromImg		
								}
							}
							mType=msg.type
							if (mType=='V') {
								if (users.indexOf(toUser) >= 0) {
									toIndex=users.indexOf(toUser);
									send_msg(clients,toIndex,mData)
								}
							} else if (mType=='M') {
								if (users.indexOf(toUser) >= 0) {
									toIndex=users.indexOf(toUser);
									send_msg(clients,toIndex,mData) 
								}
							} else if (mType=='G'){
								if (users.indexOf(toUser) >= 0) {
									toIndex=users.indexOf(toUser);
									send_msg(clients,toIndex,mData)
								} 
							} else if (mType=='N') {
								sendSMS(toMobile,fromLongCode,pm)
							} else if (mType=='Q') {
								var json = JSON.stringify({ type:'O', data: userData});
								connection.sendUTF(json)
							} else {
								var json = JSON.stringify({ type:'E', data: message.utf8Data });
								connection.sendUTF(json)
							}
						}
					}
				});

				// user disconnected
				connection.on('close', function(connection) {
					clients.splice(users.indexOf(login), 1); 
					users.splice(users.indexOf(login),1);
					mobiles.splice(users.indexOf(login),1);
					userData=[]
					console.log(login + ' just left')
					console.log('Users in chat: ' + clients.length)
					console.log(users)
					for (var i=0; i < clients.length; i++) {
						var json = JSON.stringify({ type:'D', data: ({user:login,mobile:mobile})});
						if (clients) {
							if (clients[i]) {
								clients[i].sendUTF(json);
							}
						}
					}				
				});

		} else {
			console.log("Error: User is undefined: " +login)
		}
	})

	function isValidMobile(mob) {
		//console.log(mob)
		var num = mob.trim();
		//console.log(num)
		var arr_a=[]
		var arr_b=[]
		arr_a = ["-","."," ","(",")"];
		arr_b = ["","","","",""];
		num = num.replace(arr_a, arr_b);

		if ((num.length < 10) || (num.length > 11) || (num.substring(0,1)=='0') || (num.substring(1,1)=='0') || ((num.length==10)&&(num.substring(0,1)=='1'))||((num.length==11)&&(num.substring(0,1)!='1'))) return false;
		num = (num.length == 11) ? num : ('1' . num);	
		
		if ((num.length == 11) && (num.substring(0,1) == "1")) {
			return num;
		} else {
			return false;
		}
	}
	
	function fetchURL(url) {
		url=encodeURI(url);
		var exec = require('child_process').execFileSync
		var html = exec('curl', ['-s', url]).toString()
		return html
	}

	function fetchURL2(url) {
		console.log(url)
		var exec = require('child_process').execFileSync
		var html = exec('curl', ['-s', url]).toString()
		return html
	}

	function sms(to, from, msg, sms_response) {
		params = {
			'src': from,
			'dst' : to,
			'text' : msg
		};
		p.send_message(params, function (status, res) {
			if (sms_response) sms_response.end(JSON.stringify(res))
		});
	}
	
	function sendSMS(to, from, msg) {
		params = {
			'src': from,
			'dst' : to,
			'text' : msg
		};
		p.send_message(params, function (status, res) {
			console.log(JSON.stringify(res))
		});
	}
	
	function send_msg(clients,toIndex,mData) {
		mObj = {	'msg'			: mData.msg,
					'toUser'		: mData.toUser,
					'fromUser'		: mData.fromUser,
					'fromLongCode'	: mData.fromLongCode,
					'fromImg'		: mData.fromImg
				};			

		if (oldMsg != mData.msg) {
			if (clients[toIndex]) {
				try {
					clients[toIndex].sendUTF(JSON.stringify({'type':'M', data: mObj}));
					sendSMS(mobiles[toIndex],mData.fromLongCode,mData.msg);
					console.log('SEND TO MOBILE: ' + mobiles[toIndex] + ' LONG_CODE: ' + mData.fromLongCode + ' MSG: ' + mData.msg)
				} catch (e) {
					console.log(e)
				}
			}
		}
		oldMsg=mData.msg
	}
