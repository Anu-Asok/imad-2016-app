function check_login(){		
			var request=new XMLHttpRequest();		
			request.onreadystatechange=function(){
				if(request.status === 200){
						var div=document.getElementById('check-login');					
						div.innerHTML="<li><a href=\"/logout\">Logout</a></li>";
					}
			}
			request.open('GET',"/check-login",true);
			request.send(null);		
		}	
		check_login();
