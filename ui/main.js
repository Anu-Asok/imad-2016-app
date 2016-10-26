var button = document.getElementById('click');
var url="localhost:8080";
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
        request.open('GET',`http://${url}/counter`,true);
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
  request.open('GET',`http://${url}/submit-name?name=`+name,true);
  request.send(null);
};
