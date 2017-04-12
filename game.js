
var canvas;
var context;

var gary;
var blocks = [];

var Key = {
	pressed: {},
	
	isDown: function(keyCode){return pressed[keyCode];},
	onKeyDown: function(event){ this.pressed[event.keyCode] = true;},
	onKeyUp: function(event){ delete this.pressed[event.keyCode];}
};

window.onload = function(){
	
	canvas = document.getElementById("game_canvas");
	context = canvas.getContext("2d");
	setInterval(main_loop, 1000 / 60);
	window.addEventListener("keydown", function(event){Key.onKeyDown(event);}, false);
	window.addEventListener("keyup", function(event){Key.onKeyUp(event);}, false);
	
	gary = new Gary();
	for(var x = 0; x < canvas.width / 20; x++) blocks.push(new Block(x * 20, canvas.height - 20));
	for(var x = 5; x < canvas.width / 20; x++) blocks.push(new Block(x * 20, canvas.height - 40));
	for(var x = 10; x < canvas.width / 20; x++) blocks.push(new Block(x * 20, canvas.height - 60));
}

function main_loop(){
	// update
	gary.update();

	// render
	context.fillStyle = "#ffffff"
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < blocks.length; i++){
		blocks[i].render();
	}

	gary.render();
	
}

function Gary(){
	
	context.font = "20px Times New Roman";
	
	var right_stance = "ᕕ( ᐛ )ᕗ";
	var left_stance = "ᕕ( ᐕ )ᕗ";
	var current_stance = "";
	
	this.x = 0;
	this.y = 20;
	this.velx = 0;
	this.vely = 0;
	
	var gravity = 0;
	var grav_acc = 0.08;
	var speed = 0.1;
	var speed_cap = 5;
	var timer = 0;
	var jump_vel = 0;
	
	this.update = function(){
		timer++;
		timer %= 60;
		
		var grounded = this.on_ground(this.vely);
	
		if(!grounded){
			gravity += grav_acc;
			this.vely += gravity;
		} else {
			gravity = 0;
			this.vely = 0;
		}
	
		if(gravity > 20) gravity = 20;
	
		if(Key.pressed[37]) this.velx -= speed;
		else if(this.velx < -speed) this.velx += speed;

		if(Key.pressed[39]) this.velx += speed;
		else if(this.velx > speed) this.velx -= speed;

		if(Key.pressed[38] && grounded){
			jump_vel -= 10;
		} else jump_vel = 0;
		
		if(this.velx < 0) current_stance = left_stance;
		if(this.velx > 0) current_stance = right_stance;
		
		if(this.velx > speed_cap) this.velx = speed_cap;
		if(this.velx < -speed_cap) this.velx = -speed_cap;
		
		
		this.vely += jump_vel;
		if(this.velx != 0 || this.vely != 0) this.move(this.velx, this.vely);
	}

	
	this.move = function(xa, ya){
		if(xa != 0 && ya != 0){
			this.move(xa, 0);
			this.move(0, ya);
			return;
		}
		if(this.can_pass(xa, ya)){
			this.x += xa;
			this.y += ya;
		}
	}
	
	this.can_pass = function(xa, ya){
		var x0 = this.x + xa;
		var x1 = this.x + current_stance.length * 10 + xa;
		var y0 = this.y - 20 + ya;
		var y1 = this.y + ya;
		
		for(var i = 0; i < blocks.length; i++){
			if(x0 < blocks[i].x1 && x1 > blocks[i].x0 &&
			   y0 < blocks[i].y1 && y1 > blocks[i].y0) return false;
		}
		return true;
	}
	
	this.on_ground = function(ya){
		var x0 = this.x;
		var x1 = this.x + current_stance.length * 10;
		var y0 = this.y + ya;
		var y1 = y0 + 5;

		for(var i = 0; i < blocks.length; i++){
			if(x0 < blocks[i].x1 && x1 > blocks[i].x0 &&
			   y0 < blocks[i].y1 && y1 > blocks[i].y0) return true;
		}
		return false;
	}
	
	this.render = function(){
		context.fillStyle = "#000000";
		context.fillText(current_stance, this.x, this.y);
	}
}

function Block(x, y){
	
	this.x = x;
	this.y = y;
	this.w = 20;
	this.h = 20;
	this.x0 = this.x;
	this.x1 = this.x + this.w;
	this.y0 = this.y - this.h;
	this.y1 = this.y;
	
	this.render = function(){
		context.fillStyle = "#000000";
		context.fillText(String.fromCharCode(0xe296a9), this.x, this.y);
	}
}