var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var session = require('express-session');
var config={
    user:"anu-asok",
    database:"anu-asok",
    host:"db.imad.hasura-app.io",
    port:"5432",
    password: "db-anu-asok-20933"
};
var pool=new Pool(config);

var app = express();
app.use(morgan('combined'));

var bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

function create_template(data,name){
	var id=data.id;
    var title=data.title;
    var heading=data.heading;
    var content=data.content;
    var author=name;
	var timestamp=data.timestamp;
	var counter=data.likes;	
    var htmltemplate=
    `<html>
    <head>
        <title>
			Articles | ${heading}
        </title>
		<link rel="shortcut icon" href="/ui/blog.png">
		<link rel="stylesheet" href="/ui/style.css"/>
		<link rel="stylesheet" href="/ui/comment.css"/>
        <meta name='viewport' content='width=device-width,initial-scale=1'/>
		<link href="https://fonts.googleapis.com/css?family=Pompiere" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Patrick+Hand+SC" rel="stylesheet">

    </head>
	<style>
		body{			
			background:url(/ui/rain1.jpg);			
		}		
		h1{
			font-family:'Patrick Hand SC';
		}
		#content{
			margin:0;
			margin-top:30px;
			font-family:Pompiere;
			font-size:23px;
		}
		.footer {
			font-family:'Patrick Hand SC';
			font-size:18px;
		}
		#likes{
			background-color:white;
			color:#009ed8;
		}
		
	</style>
    <body>
	<input type="checkbox" id="sidebartoggler" name="" value="" />
<div class="page-wrap">
  <label for="sidebartoggler" class="toggle">☰<img src="/ui/blog.png" style="width: 24px;
    padding-left: 29px;"><div class="main_title">Anupam Asok's Blog</div></label>


  <div class="page-content" style="padding-left:10px;">
	<div class="container">
		<div class="article">
			<h1>
				${heading}
			</h1>
			<div id="author_details">
			</div>
			<hr/>
			<div id="content">
				${content}
			</div>
			<br/>
			<hr/>
			
			<div class="footer">
				<br/>
				<button id="likes" class="button"><div id="check">Like this ? ♥ </div></button> <span id="like">►${counter}</span> <span id="person"> users</span> liked this article.
			</div>
			<br/>
		</div>
		<br/>
		<textarea id="comment" rows="5" cols="110" placeholder="Add a comment..." class="input comment-box" style='width:100%'></textarea>
		<br/>
		<input type="submit" id="submit-cmt" value="Post comment" class="button"/>
		<br/>
		<div id="show-comment">			
		</div>
		<div id="credit" style="background:none;">Made  with  ♥  by  Anupam  Asok</div>
		</div>

  </div>
  
  <!--end page-content-->

<!--Put .sidebar at bottom of webpage content, before </body>-->

  <div class="sidebar">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about-me">About me</a></li>
	  <li><a href="/user">Profile</a></li>
	  <li><a href="/edit-profile">Edit Profile</a></li>
	   <div id="check-login"><li><a href="/login">Login</a></li></div>
    </ul>
  </div><!--end sidebar-->
  
</div>
<script type="text/javascript" src="/ui/main.js"></script>
				<script type="text/javascript" >
		if(parseInt(${counter})==1){
			var person=document.getElementById('person');
			person.innerHTML="user";
		}
		var time1 = new Date("${timestamp}");
		var p=document.getElementById('author_details');
		p.innerHTML=" 📅 "+ time1.toLocaleTimeString() + " , "+ time1.toLocaleDateString();
		var button = document.getElementById('likes');
		button.onclick=function(){
			var check=document.getElementById('check');
			check.innerHTML="Liking...";
			var request=new XMLHttpRequest();
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){										  
					if(!(request.responseText).localeCompare("Error")){
							alert("You already liked this article!");
							check.innerHTML="You like this";
					}					
					else{
						if(request.status === 403){
							alert("Login to like the article!");
							check.innerHTML="Like this ? ♥ ";
						}
						else{
							var counter=parseInt(request.responseText)+1;
							var span=document.getElementById('like');
							span.innerHTML=counter.toString();		
							var person=document.getElementById('person');
							check.innerHTML="You like this";
							if(counter == 1){
								person.innerHTML="user";
							}
							else{
								person.innerHTML="users";
							}
						}
					}					
				}				  
			}
		request.open('GET',"/articles-counter/${id}",true);
		request.send(null);
		}
		var checker=document.getElementById('check');

		function like_checker(){
			
			var request=new XMLHttpRequest();
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){										  
					
						if(!(request.responseText).localeCompare("Rows")){
								checker.innerHTML="You liked this";
						}	
			}
			
			}
			request.open('GET',"/like-checker/${id}",true);
			request.send(null);
		}
		like_checker();
		function comment1(){
			var div=document.getElementById('show-comment');
			div.innerHTML="Loading...";
			var time = new Date();
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){
					if(request.status === 200){
						
						
						if((request.responseText).localeCompare("No comments found")){
							var comment=JSON.parse(request.responseText);							
							var x="";
							var beg=comment[comment.length-1]['beg'];
							var lst=comment[comment.length-1]['lst'];
							var usr=comment[comment.length-1]['usr'];							
							for (i = 0; i < comment.length-1; i++) { 
							var time = new Date(comment[i].timestamp);
							x +=  beg +comment[i].comment + "<br/>" + usr+ 'Comment by <a href="/users/'+comment[i].user_id+'">'+comment[i].name +'</a> - '+ time.toLocaleTimeString() +" on "+ time.toLocaleDateString() + lst ;
							}
							div.innerHTML=x.toString();
						}
						else{
							div.innerHTML="No comments found";
						}
					}
				}
			}
			request.open('GET',"/get-comment/${id}",true);
			request.send(null);		  
		}
		var submit_cmt=document.getElementById('submit-cmt');
		submit_cmt.onclick=function(){
			submit_cmt.value="Posting...";
			var request=new XMLHttpRequest();
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){
					submit_cmt.value="Post comment";
					if(request.status === 200){					
						comment1();						
					}
					else if(request.status===403){	
						alert("Login to post comment!");
					}
					else if(request.status===500){
						alert("Couldn\'t post the comment. Try again later!");	
					}
				}
			}	 
			
			var comment=document.getElementById('comment').value;
			if (comment.length==0){
				alert("Comment cannot be empty!");
				submit_cmt.value="Post comment";
			}
			else{
				var article_id=${id};
				request.open('POST',"/post-comment",true);
				request.setRequestHeader('Content-Type','application/json');
				request.send(JSON.stringify({article_id:article_id,comment:comment}));
			}
		};
		
		comment1();	
		
		</script>
	</body>
</html>`;
    return htmltemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});



app.get('/login',function(req,res){
  res.sendFile(path.join(__dirname, 'ui', 'login.html'));	
});

app.get('/create-user',function(req,res){
  res.sendFile(path.join(__dirname, 'ui', 'create-user.html'));	
});

function hash(input,salt){
	var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512')
	return ['pbkdf2','10000',salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
	var hashed=hash(req.params.input,"this-is-some-random-string");
	res.send(hashed);
});

app.get('/post',function(req,res){
    if (req.session && req.session.auth && req.session.auth.userId && req.session.auth.userId==43)
		res.sendFile(path.join(__dirname, 'ui', 'post.html'));	
	else
		res.send("You are not authorized to post articles!");	
});

app.post('/post-comment',function(req,res){
	var comment = req.body.comment;
	var article_id = req.body.article_id;
	if (req.session && req.session.auth && req.session.auth.userId){
		pool.query("INSERT INTO \"comment\" (article_id, user_id, comment) VALUES ($1, $2, $3)", [article_id,req.session.auth.userId,comment], function (err, result) {
		  if (err) {
			  res.status(500).send(err.toString());
		  } else {
			  res.send('Comment posted!');
		  }
		});	
	}
	else{
		res.status(403).send("");
	}   
});

app.get('/get-comment/:id',function(req,res){
	var id=req.params.id;
	pool.query("SELECT comment.* ,\"user\".name from \"comment\",\"user\" WHERE comment.user_id = \"user\".id AND comment.article_id=$1 ORDER BY comment.timestamp DESC",[id],function(err,result){
		if (err) {
          res.status(500).send(err.toString());
		} 
		else {
			if(result.rows.length===0){
				res.send("No comments found");
			}
			else{var beg="<div class=\"dialogbox\"><div class=\"body\"><span class=\"tip tip-left\"></span><div class=\"message\">";
				var lst="</div></div></div></div>";	
				var usr="<div id=\"comment\">";
				result.rows.push({'beg':beg,'lst':lst,'usr':usr});
				res.send(result.rows);
			}
		}	
	});
});


app.post('/create-user', function (req, res) {
   var username = req.body.username;
   var password = req.body.password;
   var name = req.body.name;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password, salt);   
   pool.query("INSERT INTO \"user\" (name, username, password) VALUES ($1, $2, $3)", [name, username, dbString], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
		pool.query("select \"user\".id from \"user\" where username=$1",[username], function(err,result){
			var id=result.rows[0].id;
			pool.query("INSERT INTO \"userDetails\" (\"user_id\") VALUES ($1)",[id],function(err,result){
				res.send('User successfully created: ' + username);
			}); 
		});		  
      }
   });
});


app.post('/submit-article', function (req, res) {
   var article = req.body.article;
   var heading = req.body.heading;
   var title = req.body.title;
   if (req.session && req.session.auth && req.session.auth.userId && req.session.auth.userId==43) {
	   pool.query("INSERT INTO \"article\" (title, heading,content,user_id) VALUES ($1, $2, $3, $4)",[title,heading,article,43], function (err, result) {
		  if (err) {
			  res.status(500).send(err.toString());
		  } else {
			  res.send('Article submitted!');
		  }
	   });
   }
   else{
	   res.status(403).send("");
   }
});

app.post('/login',function(req,res){
	var username=req.body.username;
	var password1=req.body.password;
	pool.query('SELECT * FROM "user" WHERE username=$1',[username],function(err,result){
		if(err){
			res.status(500).send(err.toString());
		}
		else{
			if(result.rows.length == 0){
				res.status(403).send('Username Invalid:'+username);
			}
			else{
				var dbString=result.rows[0].password;
				var salt=dbString.split('$')[2];
				var hashedPassword=hash(password1,salt);
				if(hashedPassword===dbString){
					req.session.auth = {userId: result.rows[0].id};
					res.send('Correct credentials');
				}
				else{
					res.status(403).send("");
				}
			}
		}
	});
});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
        pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err){
               res.status(500).send('Not Logged In');
            } else{
               res.status(200).send("Logged In");   
            }
        });
    }
	else{
		res.status(400).send('Not Logged In');
    }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.sendFile(path.join(__dirname, 'ui', 'index.html'));	   
});

app.get('/get-article/:i',function(req,res){
	var i=req.params.i;
	pool.query('select article.*,"user".name from article, "user" where article.user_id="user".id ORDER BY "timestamp" DESC LIMIT 4 OFFSET $1',[i*4],function(err,result){
		if(err){
			res.status(500).send("Couldn't fetch the articles");
		}
		else{
			if(result.rows.length===0)
				res.send("No articles found");
			else
				res.send(result.rows);
		}
	});
});

app.get('/articles-counter/:id',function(req,res){
	var article_id=parseInt(req.params.id);	 
    if (req.session && req.session.auth && req.session.auth.userId) {
		var user_id=req.session.auth.userId;
		pool.query("INSERT INTO \"like-checker\" (user_id,article_id) VALUES ($1,$2)",[user_id,article_id],function(err,result){
			if (err){	
              res.send("Error");
            }
			else{
				pool.query("SELECT * FROM \"article\" WHERE id=$1",[article_id],function(err,result){
					res.send(JSON.stringify(result.rows[0].likes));
				});
				pool.query("UPDATE \"article\" SET likes=likes+1 WHERE id=$1",[article_id],function(err,result){});   
            }
		});
	}
	else{
		res.status(403).send("");
	}
});

app.get('/like-checker/:id',function(req,res){
    {	
		var articleId=req.params.id;		
		pool.query("SELECT * FROM \"like-checker\" WHERE user_id=$1 and article_id=$2",[req.session.auth.userId,articleId],function(err,result){
			if (err){	
              res.send("Wow");
            }
			else{
				if(result.rows.length==0)
					res.send("No rows");
				else
					res.send("Rows");
            }
		});
	}	
});
		

app.get('/articles/:articleName',function(req,res){
    var articleName=req.params.articleName;
    pool.query("SELECT * FROM article WHERE title=$1",[articleName],function(err,result){
       if(err)
        res.status(500).send(err.toString());
       else{
           if(result.rows.length === 0)
            res.status(404).send("Article not found");
           else{
               var articleData=result.rows[0];
				pool.query("SELECT * FROM \"user\" WHERE id=$1",[articleData.user_id],function(err,result){
					var name= result.rows[0].name;
					res.send(create_template(articleData,name));
				});	
           }
       }    
    });
});

function userTemplate(data){
	var template=`
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<link href="/ui/style.css" rel="stylesheet" />
	<link href="/ui/blog.png" rel="shortcut icon">
	<title>Blog</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>One Page Resume</title>
	<style type="text/css">
		@import url(https://fonts.googleapis.com/css?family=Rancho);
		@import url(https://fonts.googleapis.com/css?family=Abel);
		* { margin: 0; padding: 0; }
		body { line-height: 31px;  }
		.clear { clear: both; }
		#page-wrap {  margin-left:5px; margin-right:14px;padding:20px;
		padding: 34px;
		background: whitesmoke;font-family: Abel;
		box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);}        
		#pro_title {margin: 0 0 16px 0;  padding: 21px 0 16px 0;   font-size: 45px;  word-wrap: break-word;
		line-height: 35px;font-family: Rancho;}
		p { margin: 11px 0 16px 0;  font-size: 21px;}        
		dt { font-size: 26px; text-align: left; padding: 0 18px 0 0; width: 107px; float: left; height: 150px; border-right: 1px solid #999;  }
		dd {  margin-left:129px; font-size: 20px; text-align: justify; padding: 0 18px 0 10; max-width: 570px; word-wrap: break-word;}
		dd.clear { float: none; margin: 0; height: 15px; }
		hr{
		border-bottom: 1px solid #1f1209;
		box-shadow: 0 20px 20px -20px #333;
		}
		a{
		color:white;
		}
	</style>
</head>
<body>
	<input type="checkbox" id="sidebartoggler" name="" value="" />
	<div class="page-wrap">
		<label for="sidebartoggler" class="toggle">☰<img src="/ui/blog.png" style="width: 24px;
		padding-left: 29px;"><div class="main_title" style="padding-top:0px;">Anupam Asok's Blog</div></label>
		<div class="page-content" style="padding-left:10px;">
			<div class="index">
				<div id="page-wrap">	
					<div id="pro_title">${data.name}</div>			
					<hr/>
					<p>
					<b>Username : </b>${data.username}<br/>
					<b>Phone Number :</b> ${data.phone_no}<br />
					<b>Email :</b> ${data.email}
					</p>
					<dd class="clear"></dd>
					<dl>
					<dd class="clear"></dd>
					<dt>About me</dt>
					<dd>
					${data.about}
					</dd>
					<dd class="clear"></dd>			
					</dl>
					<div class="clear"></div>			
				</div>
			</div>
			<div id="credit">Made  with  ♥  by  Anupam  Asok</div>
		</div>
		<div class="sidebar">
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/about-me">About me</a></li>
				<li><a href="/user">Profile</a></li>
				<li><a href="/edit-profile">Edit Profile</a></li>
				<li id="check-login"><a href="/login">Login</a></li>
			</ul>
		</div>
	</div>
	<script type="text/javascript">
	function check_login(){		
		var request=new XMLHttpRequest();		
		request.onreadystatechange=function(){
			if(request.status === 200){
				var div=document.getElementById('check-login');					
				div.innerHTML='<a href=\"\\\logout\">Logout</a>';
			}
		}
		request.open('GET',"/check-login",true);
		request.send(null);		
	}	
	check_login();
	</script>
</body>
</html>`;
return template;
}

app.get('/about-me',function(req,res){
	res.sendFile(path.join(__dirname, 'ui', 'about-me.html'));
});

//To display another user profile
app.get('/users/:userid',function(req,res){
	var userId=req.params.userid;
	pool.query("select \"userDetails\".*,\"user\".name,\"user\".username from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
		if(err)
			res.send(err);
		else
			res.send(userTemplate(result.rows[0]));
	});
});

//To display logged in user profile
app.get('/user',function(req,res){	
	if(req.session && req.session.auth && req.session.auth.userId){
		var userId=req.session.auth.userId;
		pool.query("select \"userDetails\".*,\"user\".name,\"user\".username,\"user\".id from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
			if(err)
				res.send(err);
			else
				res.send(userTemplate(result.rows[0]));
		});
	}
	else
		res.sendFile(path.join(__dirname, 'ui', 'login.html'));	
});



//To update user profile
function editTemplate(data){
	var template=`<head>		
	<link href="/ui/style.css" rel="stylesheet" />
	<link href="/ui/blog.png" rel="shortcut icon">
	<title>Blog</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="https://fonts.googleapis.com/css?family=Roboto+Condensed" rel="stylesheet">
	<style type="text/css">
	* { margin: 0; padding: 0; }
	body { line-height: 24px;  }
	#page-wrap { margin-top: 30px; margin-left:5px; margin-right:5px;padding:20px;}         
	.objective { max-width: 735px; float: left; margin: 0 auto; text-align:justify; margin-bottom:10px; margin-top:10px }
	textarea{
		border: none;
		padding: 10px 0px 0px 10px;
		font-family: Roboto Condensed;
		font-size: 18px;
		width:100%;
		display:block;
		position:relative;
		margin-top: 20px;
		word-wrap:break-word;
		style='width:100%';
	}
	
	body{
		background:#1a130d;
	}
	
	</style>
</head>
<body>
<input type="checkbox" id="sidebartoggler" name="" value="" />
<div class="page-wrap">
  <label for="sidebartoggler" class="toggle">☰<img src="/ui/blog.png" style="width: 24px;
    padding-left: 29px;"><div class="main_title" style="padding-top:0px;">Anupam Asok's Blog</div></label>
  <div class="page-content" style="padding-left:10px; width:100%;">
	<div class="index" style="margin-top:0px;">			
		<div id="page-wrap">	
			<div class="objective">
				<textarea rows="2" cols="80" style="float:right;" id="name" placeholder="Name" >${data.name}</textarea>		
				<textarea rows="2" cols="80" style="float:right;" id="phone" placeholder="Phone Number">${data.phone_no}</textarea>	
				<textarea rows="2" cols="80" style="float:right;" id="email" placeholder="E-mail">${data.email}</textarea>
				<textarea rows="8" cols="80" style="float:right;" id="about"  placeholder="About Me">${data.about}</textarea>				
			</div>
			<input type="submit" id="submit-cmt" value=" Update Profile " class="button" style="width: 98%;    background: #1a130d;"/>
		</div>		
	</div>
  </div>
  <div class="sidebar">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about-me">About me</a></li>
	  <li><a href="/user">Profile</a></li>
	  <li><a href="/edit-profile">Edit Profile</a></li>
	  <li id="check-login"><a href="/login">Login</a></li>
    </ul>
  </div>  
</div>	
	<script type="text/javascript">
		function check_login(){		
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.status === 200){
						var div=document.getElementById('check-login');					
						div.innerHTML='<a href=\"/logout\">Logout</a>';
					}
			}
			request.open('GET',"/check-login",true);
			request.send(null);		
		}	
		check_login();
		var submit=document.getElementById('submit-cmt');
		submit.onclick=function(){
			
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.status === 200){
					submit.value="Profile Updated!";
					window.location="/user";
				}
			}			
			var name=document.getElementById('name').value;
			var email=document.getElementById('email').value;
			var phone=document.getElementById('phone').value;
			var about=document.getElementById('about').value;
			if (name == null || name == "") {
				alert("Name cannot be empty!");
			}
			else if (email == null || email == "") {
				alert("Heading cannot be empty!");
			}
			else if (phone == null || phone == "") {
				alert("Phone Number cannot be empty!");
			}
			else if(about == null || about ==""){
				alert("About me cannot be empty!");
			}
			else{
			submit.value="Updating...";
				request.open('POST',"/update-user",true);
				request.setRequestHeader('Content-Type','application/json');
				request.send(JSON.stringify({id:${data.id},name:name,email:email,phone:phone,about:about}));
			}
		}
	</script>
</body>
</head>`;
return template;
}

app.post('/update-user',function(req,res){
	var id=req.body.id;
	var name=req.body.name;
	var phone_no=req.body.phone;	
	var about=req.body.about;
	var email=req.body.email;
	pool.query("UPDATE \"user\" SET  name=$1 WHERE id=$2",[name,id],function(err,result){});
	pool.query("UPDATE \"userDetails\" SET  \"phone_no\"=$1, \"email\"=$2, \"about\"=$3 WHERE \"user_id\" = $4",[phone_no,email,about,id],function(err,result){
		if(err){
			res.status(500).send("Couldn't Update! Try again later.");
		}
		else{
			res.send("Update made!");
		}
	});
});

app.get('/edit-profile',function(req,res){
	if(req.session && req.session.auth && req.session.auth.userId){
		var userId=req.session.auth.userId;
		pool.query("select \"userDetails\".*,\"user\".name,\"user\".id from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
			if(err)
				res.send(err);
			else
				res.send(editTemplate(result.rows[0]));
		});
	}
	else
		res.sendFile(path.join(__dirname, 'ui', 'login.html'));	
});

app.get('/ui/:filename',function(req,res){
	var filename=req.params.filename;
	res.sendFile(path.join(__dirname, 'ui', filename));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
