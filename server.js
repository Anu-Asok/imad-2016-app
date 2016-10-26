var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

var articles={
	'article-one':{
        title:'Article One',
        heading:'Article One | ASP',
        date:'Sep 23 2016',
        content:`<p>
                    This is the first article.This is the first article.This is the first article.
                    This is the first article.This is the first article.This is the first article.
                </p>
                <p>
                    This is the first article.This is the first article.This is the first article.
                    This is the first article.This is the first article.This is the first article.
                </p>
                <p>
                    This is the first article.This is the first article.This is the first article.
                    This is the first article.This is the first article.This is the first article.
                </p>`
	},
	'article-two':{
		'heading':'Article Two | ASP',
        'title':'Article Two',
        'date':'Sep 24 2016',
        'content':`<p>
                This is the second article.
                </p>`
	},
    'article-three':{
		'heading':'Article three | ASP',
        'title':'Article Three',
        'date':'Sep 24 2016',
        'content':`<p>
                This is the third article.
                </p>`
	}
};


function create_template(data){

    var title=data.title;
    var date=data.date;
    var heading=data.heading;
    var content=data.content;
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
            <hr/>
            <h3>
                ${heading}
            </h3>
            <div>
                ${date}
            </div>
            <div>
                ${content}
            </div>
        </div>
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

app.get('/Breaking-Bad',function(req,res){
	res.sendFile(path.join(__dirname,'ui','BreakingBad.html'));
});

app.get('/ui/main.js',function(req,res){
	res.sendFile(path.join(__dirname,'ui','main.js'));
});

app.get('/:user-name',function(req,res){
	res.send(req.params);
});

var counter=0;

app.get('/counter',function(req,res){
    counter = counter + 1;
    res.send(counter.toString());
});

app.get('/download',function(req,res){
	res.download('/home/anupam/IMAD/webapp/imad-2016-app/ui/favicon.png');
});

var names=[];
app.get('/submit-name',function(req,res){
	var name=req.query.name;
	names.push(name);
	res.send(JSON.stringify(names));
});

app.get('/:articleName',function(req,res){
    var articleName=req.params.articleName;
	res.send(create_template(articles[articleName]));
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