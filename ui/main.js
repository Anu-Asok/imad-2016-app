var button = document.getElementById('click');
button.onclick=function(){
  var request=new XMLHttpRequest();
        request.onreadystatechange=function(){
          if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
              var counter=request.responseText;
              var span=document.getElementById('count');
              span.innerHTML=counter.toString();
            }
          }
        }
        request.open('GET',"/counter",true);
        request.send(null);
};


var submit=document.getElementById('submit_btn');
submit.onclick=function(){
  var request=new XMLHttpRequest();
  request.onreadystatechange=function(){
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
        var names=request.responseText;
        names=JSON.parse(names);
        var list='';
        for(var i=0;i<names.length;i++)
          list += '<li>'+names[i]+'</li>';
        var ui=document.getElementById('namelist');
        ui.innerHTML=list;
      }
    }
  }
  var nameInput=document.getElementById('name');
  var name=nameInput.value;
  request.open('GET',"/submit-name?name="+name,true);
  request.send(null);
};


var submit_btn=document.getElementById('submit-btn');
submit_btn.onclick=function(){
  var request=new XMLHttpRequest();
  request.onreadystatechange=function(){
    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
		console.log('User logged in');
		alert('Logged in successfully!');
	  }
	  else if(request.status===403){
		alert('Username/password is incorrect');	
		console.log("no entry");
	  }
	  
	  else if(request.status===500){
		alert('Something went wrong!');	
		console.log("Wrong");
	  }
    }
  }
  var username=document.getElementById('username').value;
  var password=document.getElementById('password').value;
  console.log(username);
  console.log(password);
  request.open('POST',"/login",true);
  request.setRequestHeader('Content-Type','application/json');
  request.send(JSON.stringify({username:username,password:password}));
};
