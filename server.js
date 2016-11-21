//process.env.DB_PASSWORD

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
			Articles | ${title}
        </title>
		<link rel="shortcut icon" href="/ui/blog.png">
		<link rel="stylesheet" href="/ui/style.css"/>
		<link rel="stylesheet" href="/ui/comment.css"/>
        <meta name='viewport' content='width=device-width,initial-scale=1'/>
    </head>
    <body>
		<ul class="nav_bar">
			<li><a class="nav" href="/">Home</a></li>
			<li><a class="nav" href="#news">Articles</a></li>
			<li><a class="nav" href="#contact">Blog-Post</a></li>
			<li ><a class="nav" href="/post">Post</a></li>
			<li class="nav" style="float:right"><a href="/login"><div id="lol">Login</div></a></li>
			<li class="nav" style="float:right"><a href="/user">Profile</a></li>
		</ul>	
		<div class="container">
		<div class="article">
			<h2>
				${heading}
			</h2>
			<hr/>
			<div>
				${content}
			</div>
			<br/>
			<hr/>
			<div id="author_details">
			</div>
			<div class="footer">
				<br/>
				<button id="likes" class="button"><div id="check">Click here to like</div></button> <span id="like">${counter}</span> <span id="person"> Users</span> liked this article.
			</div>
			<br/>
		</div>
		<br/>
		<textarea id="comment" rows="5" cols="110" placeholder="Add a comment..." style='width:100%'></textarea>
		<br/>
		<input type="submit" id="submit-cmt" value="Post comment" class="button"/>
		<br/>
		<div id="show-comment">
			<div id="gif">
				<img src="/ui/squares.gif"/>
			</div>
		</div>
		</div>
		<script type="text/javascript" >
		if(parseInt(${counter})==1){
			var person=document.getElementById('person');
			person.innerHTML="User";
		}
		function check_login(){		
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.status === 200){
						var div=document.getElementById('lol');					
						div.innerHTML="Logout";
					}
			}
			request.open('GET',"/check-login",true);
			request.send(null);		
		}	
		check_login();
		var time1 = new Date("${timestamp}");
		var p=document.getElementById('author_details');
		p.innerHTML="Posted by "+"${author}"+" at "+ time1.toLocaleTimeString() + " , "+ time1.toLocaleDateString();
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
							check.innerHTML="Click here to like";
						}
						else{
							var counter=parseInt(request.responseText)+1;
							var span=document.getElementById('like');
							span.innerHTML=counter.toString();		
							var person=document.getElementById('person');
							check.innerHTML="You like this";
							if(counter == 1){
								person.innerHTML="User";
							}
							else{
								person.innerHTML="Users";
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
			var time = new Date();
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){
					if(request.status === 200){
						var div=document.getElementById('show-comment');
						
						if((request.responseText).localeCompare("No comments found")){
							var comment=JSON.parse(request.responseText);							
							var x="";
							var beg=comment[comment.length-1]['beg'];
							var lst=comment[comment.length-1]['lst'];
							var usr=comment[comment.length-1]['usr'];							
							for (i = 0; i < comment.length-1; i++) { 
							var time = new Date(comment[i].timestamp);
							x +=  beg +comment[i].comment + "<br/>" + usr+ "Comment by "+comment[i].name +' - '+ time.toLocaleTimeString() +" on "+ time.toLocaleDateString() + lst ;
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
    if (req.session && req.session.auth && req.session.auth.userId)
		res.sendFile(path.join(__dirname, 'ui', 'post.html'));	
	else
		res.sendFile(path.join(__dirname, 'ui', 'login.html'));	
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


app.get('/comment',function(req,res){
	res.sendFile(path.join(__dirname, 'ui', 'submit-comment.html'));		
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
          res.send('User successfully created: ' + username);
		  
      }
   });
});

app.post('/submit-article', function (req, res) {
   var article = req.body.article;
   var heading = req.body.heading;
   var title = req.body.title;
   if (req.session && req.session.auth && req.session.auth.userId) {
	   pool.query("INSERT INTO \"article\" (title, heading,content,user_id) VALUES ($1, $2, $3, $4)",[title,heading,article,req.session.auth.userId], function (err, result) {
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
					res.status(500);
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
	pool.query('select article.*,"user".name from article, "user" where article.user_id="user".id ORDER BY "timestamp" DESC LIMIT 2 OFFSET $1',[i*2],function(err,result){
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

app.get('/ui/:filename',function(req,res){
	var filename=req.params.filename;
	res.sendFile(path.join(__dirname, 'ui', filename));
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
			* { margin: 0; padding: 0; }
			body { line-height: 24px;  }
			.clear { clear: both; }
			#page-wrap {  margin: 40px auto 60px; margin-left:5px; margin-right:5px;padding:20px;}        
			h1 { margin: 0 0 16px 0; padding: 0 0 16px 0; font-family:Georgia; font-size: 42px; font-style: italic; }
			h2 { font-size: 20px; margin: 0 0 6px 0; position: relative; }
			h2 span { position: absolute; bottom: 0; right: 0; font-style: italic; font-family: Georgia, Serif; font-size: 16px; color: #999; font-weight: normal; }
			p { margin: 11px 0 16px 0; }        
			#objective { width: 700px; float: left; margin: 0 auto; text-align:justify;}
			#objective p { font-family: Georgia, Serif; font-style: italic; color: #666; }
			dt { font-style: italic; font-weight: bold; font-size: 18px; text-align: left; padding: 0 24px 0 0; width: 82px; float: left; height: 100px; border-right: 1px solid #999;  }
			dd { margin-left:115px; font-size: 18px; text-align: justify; padding: 0 26px 0 10; width: 400px; }
			dd.clear { float: none; margin: 0; height: 15px; }
		</style>
	</head>
	<body class="index">	
		<ul class="nav_bar">
			<li><a class="nav" href="/">Home</a></li>
			<li><a class="nav" href="#news">Articles</a></li>
			<li><a class="nav" href="#contact">Blog-Post</a></li>
			<li ><a class="nav" href="/post">Post</a></li>
			<li class="nav" style="float:right"><div id="check-login"><a href="/login">Login</a></div></li>
			<li class="nav" style="float:right"><a class="active" href="/">Profile</a></li>
		</ul>
		<div id="page-wrap">	
			<a href="/edit-profile" style="float:right; margin-top:10px;">Edit Profile</a>
			<h1>${data.name}</h1>			
			<hr/>
			<p>
				Username: ${data.username}<br/>
				Phone Number: ${data.phone_no}<br />
				Email: <a href="mailto:${data.email}">${data.email}</a>
			</p>
			<div id="objective">
				<p>
				<b>About me</b>: ${data.description}
				</p>
			</div>
			<div class="clear"></div>
			<dl>
				<dd class="clear"></dd>
				<dt>Education</dt>
				<dd>
					${data.education}
				</dd>
				<dd class="clear"></dd>
				<dt>Skills</dt>
				<dd>
					${data.skills}
				</dd>
				<dd class="clear"></dd>
				<dt>Experience</dt>
				<dd>
					${data.experience}
				</dd>
				<dd class="clear"></dd>
				<dt>Articles</dt>
				<dd id="article">
					No articles to show
				</dd>
				<dd class="clear"></dd>
				<dt>Blog</dt>
				<dd id="blog">
					No blogs to show
				</dd>
				<dd class="clear"></dd>
			</dl>
			<div class="clear"></div>			
		</div>
	</body>
	<script type="text/javascript">
		function article(){
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){
					if(request.status === 200){
						var article=document.getElementById('article');
						var x=JSON.parse(request.responseText);
						var y='';						
						var t='<a href="\\\\articles\\\\';	
						var s='</a><br/>';
						for(i=0;i<x['title'].length;i++){
							y += t+x['title'][i]+'">'+x['title'][i]+s;
						}
						article.innerHTML=y;						
					}
				}
			}
			request.open('GET',"/article-title/"+${data.id},true);
			request.send(null);			
		}
		article();
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
</html>`;
return template;
}
app.get('/article-title/:id',function(req,res){
	var id=req.params.id;
	pool.query("SELECT \"user\".id,  array_agg(article.title) as title from \"user\",\"article\" where \"user\".id=$1 and \"article\".user_id=$1 group by \"user\".id",[id],function(err,result){
		if(err)
			res.send(err);
		else{
			
			res.send(JSON.stringify(result.rows[0]));
		}
	});
});



app.get('/users/:userid',function(req,res){
	var userId=req.params.userid;
	pool.query("select \"userDetails\".*,\"user\".name,\"user\".username from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
		if(err)
			res.send(err);
		else
			res.send(userTemplate(result.rows[0]));
	});
});


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

app.get('/update-user/:userid',function(req,res){
	var userId=req.params.userid;
	pool.query("select \"userDetails\".*,\"user\".name,\"user\".username from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
		if(err)
			res.send(err);
		else
			res.send(result.rows[0]);
	});
});

function editTemplate(data){
	var template=`<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<link href="/ui/style.css" rel="stylesheet" />
		<link href="/ui/blog.png" rel="shortcut icon">
		<title>Blog</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>One Page Resume</title>
		<style type="text/css">
			* { margin: 0; padding: 0; }
			body { line-height: 24px;  }
			.clear { clear: both; }
			#page-wrap {  margin: 40px auto 60px; margin-left:5px; margin-right:5px;padding:20px;}        
			h1 { margin: 0 0 16px 0; padding: 0 0 16px 0; font-family:Georgia; font-size: 42px; font-style: italic; }
			h2 { font-size: 20px; margin: 0 0 6px 0; position: relative; }
			h2 span { position: absolute; bottom: 0; right: 0; font-style: italic; font-family: Georgia, Serif; font-size: 16px; color: #999; font-weight: normal; }
			p { margin: 11px 0 16px 0; }        
			#objective { width: 700px; float: left; margin: 0 auto; text-align:justify; margin-bottom:10px; margin-top:10px}
			#objective p { font-family: Georgia, Serif; font-style: italic; color: #666; }
			dt { font-style: italic; font-weight: bold; font-size: 18px; text-align: left; padding: 0 24px 0 0; width: 82px; float: left; height: 100px; border-right: 1px solid #999;  }
			dd { margin-left:115px; font-size: 18px; text-align: justify; padding: 0 26px 0 10; width: 400px; }
			dd.clear { float: none; margin: 0; height: 15px; }
		</style>
	</head>
	<body class="index">	
		<ul class="nav_bar">
			<li><a class="nav" href="/">Home</a></li>
			<li><a class="nav" href="#news">Articles</a></li>
			<li><a class="nav" href="#contact">Blog-Post</a></li>
			<li ><a class="nav" href="/post">Post</a></li>
			<li class="nav" style="float:right"><div id="check-login"><a href="/login">Login</a></div></li>
			<li class="nav" style="float:right"><a class="active" href="/user">Profile</a></li>
		</ul>
		<div id="page-wrap">	
			
			<h1>Profile</h1>
			<hr/>
			
			<div id="objective">
				<p>
				<b>Username :</b> <textarea rows="5" cols="80" style="float:right;" id="username">${data.username}</textarea>
				</p>
				
			</div>
			<div id="objective">
				<p>
				<b>Name :</b> <textarea rows="5" cols="80" style="float:right;" id="name">${data.name}</textarea>
				</p>
				
			</div>
			
			<div id="objective">
				<p>
				<b>Phone No. :</b> <textarea rows="5" cols="80" style="float:right;" id="phone">${data.phone_no}</textarea>
				</p>
				
			</div>
			<div id="objective">
				<p>
				<b>E-mail</b>: <textarea rows="5" cols="80" style="float:right;" id="email">${data.email}</textarea>
				</p>
				
			</div>
			
			<div id="objective">
				<p>
				<b>About me</b>: <textarea rows="5" cols="80" style="float:right;" id="about">${data.description}</textarea>
				</p>
				
			</div>
			
			
			<div id="objective">
				<p>
				<b>Education</b>: <textarea rows="5" cols="80" style="float:right;" id="education">${data.education}</textarea>
				</p>				
			</div>
			
			<div id="objective">
				<p>
				<b>Skills</b>: <textarea rows="5" cols="80" style="float:right;" id="skills">${data.skills}</textarea>
				</p>				
			</div>
			
			<div id="objective">
				<p>
				<b>Experience</b>: <textarea rows="5" cols="80" style="float:right;" id="experience">${data.experience}</textarea>
				</p>				
			</div>			
									
		</div>
		<input type="submit" id="submit-cmt" value=" Update Profile " class="button" style="margin-left:50%; margin-right:50%;"/>
		
	</body>
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
	
	</script>
</head>`;
return template;
}

app.post('/update-user',function(req,res){
	
});

app.get('/edit-profile',function(req,res){
	if(req.session && req.session.auth && req.session.auth.userId){
		var userId=req.session.auth.userId;
		pool.query("select \"userDetails\".*,\"user\".name,\"user\".username,\"user\".id from \"userDetails\",\"user\" where \"userDetails\".user_id=$1 and \"user\".id=$1;",[userId],function(err,result){
			if(err)
				res.send(err);
			else
				res.send(editTemplate(result.rows[0]));
		});
	}
	else
		res.sendFile(path.join(__dirname, 'ui', 'login.html'));	
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
