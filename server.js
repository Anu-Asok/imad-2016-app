@import url(https://fonts.googleapis.com/css?family=Abel);
@import url(https://fonts.googleapis.com/css?family=Cinzel);


#no-article{
	text-align:center;
  font-family: Cinzel;
	font-weight:bold;
  }
#load{
	margin:0 auto;
	
	text-align:center;
}
#footer{
	padding-top:20px;
	max-width:800px;
	margin: 0 auto;	
	
}


.loader{	/*css for article box*/
	background-color:#f5f5f5;
	word-wrap:break-word;
    border: 0px solid #ab6565;
    margin: 0 auto;
    padding: 20px;
    max-width: 756px;
    margin-bottom: 18px;
	margin-left:0px;
	margin-right:5px;
	font-family:Abel;
	font-size:18px;
    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.2), 0 6px 13px 0 rgba(0, 0, 0, 0.24);
}
.index{
	padding-top:20px;
	max-width:800px;
	margin: 0 auto;	
	margin-top: 50px;
 }
 
 #textarea{		/*css for textarea*/
	min-height:300px;
 }


.input {		/*css for title and heading*/
	margin-top: 1em;
	padding: 0.85em 0.15em;
	max-width: 100px;
	background: transparent;
	color: #595F6E;
	padding: 0.8em;
	width: 100%;
	border: none;
	border-radius: 5px;
	background: white;
	color: #aaa;
	font-weight: bold;
}

#info{
	margin-left:10px;
}


 .comment-box{
	 max-width:793px;
	 
 }
#mceu_13{
	margin-left:10px;
	margin-right:10px;
}


#credit{
	    opacity: 0.7;
    position: relative;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 1rem;
    background-color: #eaeaea;
    text-align: center;
    margin-top: 30px;
	font-family:Abel;
	font-weight:bold;
}
/*Style for navigation bar*/
.button{	
	font-family:Abel;
	font-size:25px;
	color:white;
	margin-top:10px;
	background:#009ed8;
	margin-bottom:10px;
}
body{
	background:url(/ui/rain1.jpg);
}

label{
width:100%;
padding-bottom:7px;
}

.toggle {

        text-decoration: none;
    font-size: 30px;
    color: black;
    position: fixed;
    top: 0px;
    left: 0px;
    padding-left: 21px;
    z-index: 1;
    cursor: pointer;
    transition: all 1s;
    background: #f5f5f5;
	padding-top: 10px;
    opacity: 0.7;
}

.sidebar {
  transition: all 0.45s;
  opacity:0.9;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: -190px;
  width: 120px;
  padding: 30px;
  background: #333;
  z-index: 0;
    cursor:pointer;
}

.sidebar ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar li {
  color: rgba(255, 255, 255, 0.8);
  font-family: Helvetica, Arial, sans-serif;
  font-size: 16px;
  margin-bottom: 26px;
  cursor: pointer;
}


.sidebar li:hover {
  color: green;
  transition: all 0.45s;
}

#sidebartoggler {
  display: none;
}

  #sidebartoggler:checked + .page-wrap .sidebar {
    left: 0px; }

  #sidebartoggler:checked + .page-wrap .toggle {
        left: 122px;
    padding-top: 18px;
    background: none;
    color: white;}

  #sidebartoggler:checked + .page-wrap .page-content {
    padding-left: 180px; }

.main_title{
    color: black;
    display: inline;
    font-size: 18px;
    padding-left: 9px;
    position: absolute;
    padding-top: 10px;
}
.button:hover{
	transition:1s;
	background:white;
	color:#009ed8;
}

#loading{
		width:50px;
		height:50px;
		border: 5px solid #ccc;
		border-top-color:#ff6a00;
		border-radius:100%;
		position:fixed;
		left:0px;
		right:0px;
		bottom:0px;
		top:0px;
		margin:auto;
		animation: round 1.5s cubic-bezier(0.13, 0.03, 0.71, 0.88) infinite;
	}
	@keyframes round{
		from{transform: rotate(0deg)}
		to{transform: rotate(360deg)}
	}

.nav_bar{
	max-width:740px;
    list-style-type: none;
    margin: 0 auto;
    padding: 0;
	margin-left:20px;
	margin-right:20px;
	margin-bottom:32px;
    overflow: hidden;
    border: 1px solid #e7e7e7;
    background-color: #f3f3f3;
}

.nav{
    float: left;
}

.sidebar li a{
	text-decoration:none;
	color:white;
}
.sidebar li a:hover{
	text-decoration:none;
	color:green;
	transition: all 0.45s;
}


a:link{
		text-decoration:none;
		color:#4d469c;
}
a:hover {
    text-decoration: underline;
    cursor: auto;
}


/*Style for navigation bar*/
