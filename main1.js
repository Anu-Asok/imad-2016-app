var Pool = require('pg').Pool;
var config={
    user:"anu-asok",
    database:"anu-asok",
    host:"db.imad.hasura-app.io",
    port:"5432",
    password: "db-anu-asok-20933"
};
var pool=new Pool(config);


var button = document.getElementById('click');
        button.onclick=function(){
		 pool.query("UPDATE articles SET likes=likes+1 WHERE title='article-one'",function(err,res){
				res.send("");
		});           
		pool.query("SELECT likes FROM articles WHERE title= 'article-one'",function(err,result){
               if(err)
                res.status(500).send(err.toString());
               else{
                   if(result.rows.length === 0)
                    res.status(404).send("No likes");
                   else{
                       var span=document.getElementById('count');
                       span.innerHTML=result.toString();
                   }
               }    
            });
        };