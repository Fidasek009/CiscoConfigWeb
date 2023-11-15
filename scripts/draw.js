/*

====================
is a separator thats separating things from different parts of code

--------------------
is a separator thats separating things in the same code, only for visual clarity

<big space in code>
indicates that the part of code below is not at all connected to the code up top... mby it was only a test or smth

*******************
only temporary for testing / debuging


TODO:
- connect func with interfaces
- for each object to have its own config tab
- calculate ip tables
- replace squares with images
-  

*/


var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth-250;
canvas.height = window.innerHeight-80;

var c = canvas.getContext('2d');

//-------------------------------------
var canvas2 = document.getElementById('canvas2');
canvas2.width = window.innerWidth-250;
canvas2.height = window.innerHeight-80;

var c2 = canvas2.getContext('2d');

//-------------------------------------
var mode = "x";

function btn_router(){
	mode = "router";
}

function btn_switch(){
	mode = "switch";
}

function btn_pc(){
	mode = "pc";
}

function btn_connect(){
	mode = "connect";
}

function btn_remove(){
	mode = "remove";
}

//=======================================================================


var routers = [];
var switches = [];
var pcs = [];
var points = [];
var lines =  [];

var mouse = {
	x: undefined,
	y: undefined
}

var point = {
	x: undefined,
	y: undefined,
	inter: undefined
}

function DrawRouter(x, y){
	this.x = x-210;
	this.y = y-90;
	
	this.show = function(){
		c.fillStyle = "red";
		c.fillRect(this.x, this.y, 20, 20);
		c.fill();
	}
	
	this.check = function(){
		c.fillStyle = "yellow";
		c.fillRect(this.x+8, this.y+8, 4, 4);
		c.fill();
	}
	
	this.clicked = function(mx,my){
		showDialog(11);
	}
	
	this.rem = function(){
		
	}
	
	this.show();
}

//--------------------------------------------------------------------------------------------------------------------------
function DrawSwitch(x, y){
	this.x = x-210;
	this.y = y-90;
	
	this.show = function(){
		c.fillStyle = "blue";
		c.fillRect(this.x, this.y, 20, 20);
		c.fill();
	}
	
	this.check = function(){
		c.fillStyle = "yellow";
		c.fillRect(this.x+8, this.y+8, 4, 4);
		c.fill();
	}
	
	this.clicked = function(mx,my){
		showDialog(12);
	}
	
	this.show();
}

//--------------------------------------------------------------------------------------------------------------------------
function DrawPC(x, y){
	this.x = x-210;
	this.y = y-90;
	
	
	this.show = function() {
		c.fillStyle = "green";
		c.fillRect(this.x, this.y, 20, 20);
		c.fill();
	}
	
	this.check = function() {
		c.fillStyle = "yellow";
		c.fillRect(this.x+8, this.y+8, 4, 4);
		c.fill();
	}
	
	this.clicked = function(mx,my){
		console.log("Clicked PC");
	}
	
	this.show();
}

//--------------------------------------------------------------------------------------------------------------------------

function Lines(x1, y1, x2, y2){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
}

function Conn_point(x, y){
	this.x = x-200;
	this.y = y-80;
	this.pos = [];
	point.x = this.x;
	point.y = this.y;
	this.pos.push(point);
	
}

function conn(){
	var max = points.length - 1;
				
	if(typeof points[max - 1] !== "undefined" && points[max - 1] !== "a") {
		var curr = points[max], prev = points[max - 1];
		lines.push(new Lines(prev.x, prev.y, curr.x, curr.y));
		c2.beginPath();
		c2.moveTo(prev.x, prev.y);
		c2.lineTo(curr.x, curr.y);
		c2.stroke();
		points.push("a");
	}
}

//--------------------------------------------------------------------------------------------------------------------------
canvas.addEventListener('click',
function(event){
	mouse.x = event.x;
	mouse.y = event.y;
	canClick = true;
	

//click on router
	for(var i = 0; i < routers.length; i++){
		r = routers[i];
		
		if((mouse.x-210) - r.x < 11 && (mouse.y-90) - r.y < 11 && (mouse.x-210) - r.x > (-11) && (mouse.y-90) - r.y > (-11)){
			if(mode == "connect"){
				points.push(new Conn_point(mouse.x, mouse.y));
				//dialog
				conn();
			}
			else if(mode == "remove"){
				routers.splice(i, 1);
				c.clearRect(r.x, r.y, 20, 20);
			}
			else{
				r.clicked((mouse.x-210) - r.x, (mouse.y-90) - r.y);
				canClick = false;
				break;
			}
		}
	}
	
//--------------------------------------------------------------------------------------------------------------------------
// click on switch
	for(var i = 0; i < switches.length; i++){
		r = switches[i];
		
		if((mouse.x-210) - r.x < 11 && (mouse.y-90) - r.y < 11 && (mouse.x-210) - r.x > (-11) && (mouse.y-90) - r.y > (-11)){
			if(mode == "connect"){
				points.push(new Conn_point(mouse.x, mouse.y));
				//dialog
				conn();
			}
			else if(mode == "remove"){
				switches.splice(i, 1);
				c.clearRect(r.x, r.y, 20, 20);
			}
			else{
				r.clicked((mouse.x-210) - r.x, (mouse.y-90) - r.y);
				canClick = false;
				break;
			}
		}
	}
	
//--------------------------------------------------------------------------------------------------------------------------
//click on PC
	for(var i = 0; i < pcs.length; i++){
		r = pcs[i];
		
		if((mouse.x-210) - r.x < 11 && (mouse.y-90) - r.y < 11 && (mouse.x-210) - r.x > (-11) && (mouse.y-90) - r.y > (-11)){
			if(mode == "connect"){
				points.push(new Conn_point(mouse.x, mouse.y));
				//dialog
				conn();
			}
			else if(mode == "remove"){
				pcs.splice(i, 1);
				c.clearRect(r.x, r.y, 20, 20);
			}
			else{
				r.clicked((mouse.x-210) - r.x, (mouse.y-90) - r.y);
				canClick = false;
				break;
			}
		}
	}

//--------------------------------------------------------------------------------------------------------------------------
//remove line
	if(mode == "remove"){ 
		for (const line of lines) {
			// Draw the current line on the canvas
			c.strokeStyle = 'red';
			c.beginPath();
			c.moveTo(line.x1, line.y1);
			c.lineTo(line.x2, line.y2);
			console.log('working ' + line.x1 + ', ' + line.y1);
			
			// Check if the point (x, y) is inside the path of the current line
			if (c.isPointInPath(event.x-210, event.y-90)) {
			  // The line was clicked!
			  console.log('Line clicked!');
			  break;
			}
		}
	}
//--------------------------------------------------------------------------------------------------------------------------
//add object on clicked posision
	if(mouse.x < canvas.width+250 && mouse.y < canvas.height+80 && mouse.x > 200 && mouse.y > 80 && canClick && mode !== "connect" && mode != "remove"){
		if(mode=="router"){
			routers.push(new DrawRouter(mouse.x, mouse.y));
		}
		if(mode=="switch"){
			switches.push(new DrawSwitch(mouse.x, mouse.y));
		}
		if(mode=="pc"){
			pcs.push(new DrawPC(mouse.x, mouse.y));
		}
	}
})

//--------------------------------------------------------------------------------------------------------------------------
//on mouse move
window.addEventListener('mousemove',
function(event){
	mouse.x = event.x;
	mouse.y = event.y;
	document.getElementById("device").innerHTML = mode;
	document.getElementById("test").innerHTML = mouse.x-210;
	document.getElementById("test1").innerHTML = mouse.y-90;
	document.getElementById("test2").innerHTML = event.clientX;
	document.getElementById("test3").innerHTML = event.clientY;
	
	for(var i = 0; i < routers.length; i++){
		routers[i].check();
	}
	
	for(var i = 0; i < switches.length; i++){
		switches[i].check();
	}
	
	for(var i = 0; i < pcs.length; i++){
		pcs[i].check();
	}
	
	for(var i = 0; i < routers.length; i++){
		
	}
	
});










//=======================================================================================================
/*
const pointss = [
  { x: 10, y: 20 },
  { x: 50, y: 60 },
  { x: 80, y: 90 }
];

canvas.addEventListener('click', (event) => {
  const x = event.x - 210;
  const y = event.y + 90;

  // Loop through the points and connect them with lines
  c2.beginPath();
  for (let i = 0; i < pointss.length; i++) {
    const point = pointss[i];
    if (i === 0) {
      c2.moveTo(point.x, point.y);
    } else {
      c2.lineTo(point.x, point.y);
    }
	
	var range = 5;
	
    // Check if the click occurred within a certain range of the current line segment
    if (x > point.x - range && x < point.x + range && y > point.y - range && y < point.y + range) {
      console.log('Line clicked!');
	  alert("Line clicked");
      break;
    }
  }
  c2.stroke();
});
*/
//====================================================================================================== TEST STUFF
function getRandomNumberBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

const CONST = 1500; // num of circles
var circles = [];

function Circle(x, y, dx, dy, radius){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.radius = radius;
	this.fill = '#'+Math.floor(Math.random()*16777215).toString(16);
	
	this.draw = function(){
		c2.beginPath();

		c2.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c2.fillStyle = this.fill;
		c2.stroke();
		c2.fill();
	}
	
	this.update = function(){
		if((this.x+this.radius) > canvas2.width-1 || (this.x-this.radius) < 1){
			this.dx = -this.dx;
		}
	
		if((this.y+this.radius) > canvas2.height-1 || (this.y-this.radius) < 1){
			this.dy = -this.dy;
		}
	
		this.x += this.dx;
		this.y += this.dy;
		
		this.draw();
	}
}

for(var i = 0; i < CONST; i++){
		var x = Math.random() * canvas2.width - 10;
		var dx = getRandomNumberBetween(-3, 3);
		var y = Math.random() * canvas2.height - 10;
		var dy = getRandomNumberBetween(-3, 3);
		var radius = getRandomNumberBetween(5, 20);;
		circles.push(new Circle(x, y, dx, dy, radius));
	}

function animate_skryta_funkce(){                                                   //TOTO JE ONO
	requestAnimationFrame(animate_skryta_funkce)
	
	c2.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < CONST; i++){
		circles[i].update();
	}
}
