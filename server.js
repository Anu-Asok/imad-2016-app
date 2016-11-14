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
    password: process.env.DB_PASSWORD
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
<ul>
  <li><a class="active" href="/">Home</a></li>
  <li><a href="#news">Articles</a></li>
  <li><a href="#contact">Blog-Post</a></li>
  <li ><a href="/post">Post</a></li>
  <li style="float:right"><a href="/logout">Logout</a></li>
  <li style="float:right"><a href="/post">Profile</a></li>
</ul>
<br/>
        <div class="container">
            
			<br/>
			
			<div class="article">

            <h2>
                ${heading}
            </h2>
			<hr/>

            <div >
                ${content}
            </div>
			<br/>
				<hr/>
            <div id="author_details">
               
            </div>
       
        <div class="footer">
        <br/>
        <button id="likes" class="button">Click here to like</button> <span id="like">${counter}</span> <span id="person"> Users</span> liked this article.
         </div>
		 <br/>
		 </div>
		 <br/>
		 
		 <textarea id="comment" rows="5" cols="110" placeholder="Add a comment..." style='width:100%'></textarea>
		<br/>
			<input type="submit" id="submit-cmt" value="Post comment" class="button"/>
<br/>
		
				 <div id="show-comment"><div id="gif"><img src="/ui/squares.gif"/></div></div>
		
				
        <script type="text/javascript" >
		if(parseInt(${counter})==1){
			var person=document.getElementById('person');
			person.innerHTML="User";
		}
		var time1 = new Date("${timestamp}");
		var p=document.getElementById('author_details');
		p.innerHTML="Posted by "+"${author}"+" at "+ time1.toLocaleTimeString() + " , "+ time1.toLocaleDateString();
		var button = document.getElementById('likes');
		button.onclick=function(){
			var request=new XMLHttpRequest();
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){										  
					if(!(request.responseText).localeCompare("Error")){
							alert("You already liked this article!");
					}					
					else{
						if(request.status === 403){
							alert("Login to like the article!");
						}
						else{
							var counter=parseInt(request.responseText)+1;
							var span=document.getElementById('like');
							span.innerHTML=counter.toString();		
							var person=document.getElementById('person');
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
							console.log(beg);
							console.log(lst);
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
			var request=new XMLHttpRequest();
			request.onreadystatechange=function(){
				if(request.readyState === XMLHttpRequest.DONE){
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
			}else{
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

app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'test.html'));
});

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
	res.sendFile(path.join(__dirname, 'ui', 'post.html'));	
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
      // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // set cookie with a session id
                // internally, on the server side, it maps the session id to an object
                // { auth: {userId }}
                
					res.send('Correct credentials');
					//	  window.location.href = "http://www.google.com";

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
       // Load the user object
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send('Not Logged In');
           } else {
              res.status(200).send("Logged In");   
           }
       });
   } else {
       res.status(400).send('Not Logged In');
   }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');
});

app.get('/get-article',function(req,res){
	pool.query('select article.*,"user".name from article, "user" where article.user_id="user".id ORDER BY "timestamp" DESC',function(err,result){
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
		

app.get('/articles/:articleName',function(req,res){
    var articleName=req.params.articleName;
	var likes;

    pool.query("SELECT * FROM article WHERE title=$1",[articleName],function(err,result){
       if(err)
        res.status(500).send(err.toString());
       else{
           if(result.rows.length === 0)
            res.status(404).send("Article not found");
           else{
               var articleData=result.rows[0];
				pool.query("SELECT * FROM \"user\" WHERE id="+articleData.user_id,function(err,result){
					var name= result.rows[0].name;
					res.send(create_template(articleData,name));
				});	
           }
       }    
    });
});

app.get('/article-loader',function(req,res){
	res.sendFile(path.join(__dirname, 'ui', 'article-loader.html'));
});

app.get('/ui/:filename',function(req,res){
	var filename=req.params.filename;
	res.sendFile(path.join(__dirname, 'ui', filename));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
