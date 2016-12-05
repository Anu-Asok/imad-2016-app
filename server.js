
app.get('/ui/:filename',function(req,res){
	var filename=req.params.filename;
	res.sendFile(path.join(__dirname, 'ui', filename));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
