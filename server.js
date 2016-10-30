var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var config={
    user:"anu-asok",
    database:"anu-asok",
    host:"db.imad.hasura-app.io",
    port:"5432",
    password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));


function create_template(data){

    var title=data.title;
    var date=data.date;
    var heading=data.heading;
    var content=data.content;
    var author=data.author;
    var counter=data.likes;
	console.log(title);
    var htmltemplate=
    `<html>
    <head>
        <title>
            ${title}
        </title>
        <meta name='viewport' content='width=device-width,initial-scale=1'/>
        <link href="/ui/style.css" rel="stylesheet" />
    </head>
    <body>
        <div class="container">
            <div>
                <a href="/">Home</a>
            </div>
            <br/>
            <h3>
                ${heading}
            </h3>
            - ${author}
            <hr/>
            <div>
                ${date.toDateString()}
            </div>
            <div>
                ${content}
            </div>
        </div>
        <div class="footer">
        <br/>
        <button id="likes">Like This?</button> -> <span id="like">${counter}</span>
         </div>
        <script type="text/javascript">
        var button = document.getElementById('likes');
        button.onclick=function(){
            
          pool.query("SELECT likes FROM articles WHERE title=$1",[title],function(err,result){
               if(err)
                res.status(500).send(err.toString());
               else{
                   if(result.rows.length === 0)
                    res.status(404).send("No likes");
                   else{
                       var span=document.getElementById('like');
                       span.innerHTML=result.toString();
                   }
               }    
            });
        </script>
};

    </body>
    </html>`;
    return htmltemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var counter=0;
app.get('/counter',function(req,res){
	counter=counter+1;
	res.send(counter.toString());
});

app.get('/icon',function(req,res){
	res.sendFile(path.join(__dirname,'ui','icon.png'));
});

app.get('/ui/main.js',function(req,res){
	res.sendFile(path.join(__dirname,'ui','main.js'));
});

var names=[];
app.get('/submit-name',function(req,res){
	var name=req.query.name;
	names.push(name);
	res.send(JSON.stringify(names));
});

var pool=new Pool(config);
app.get('/test-db',function(req,res){
      pool.query('SELECT * FROM test',function(err,result){
         if(err)
            res.status(500).send(err.toString());
        else
            res.send(JSON.stringify(result.rows));
      });
});

app.get('/:user-name',function(req,res){
	res.send(req.params);
});

var counter=0;

app.get('/counter',function(req,res){
    counter = counter + 1;
    res.send(counter.toString());
});

app.get('/articles/:articleName',function(req,res){
    var articleName=req.params.articleName;
    pool.query("SELECT * FROM articles WHERE title=$1",[articleName],function(err,result){
       if(err)
        res.status(500).send(err.toString());
       else{
           if(result.rows.length === 0)
            res.status(404).send("Article not found");
           else{
               var articleData=result.rows[0];
               res.send(create_template(articleData));
           }
       }    
    });
});


app.get('/article-one',function(req,res){
	res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});