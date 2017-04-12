
var canvas;
var context;

var camera;

var gary;
var blocks = [];
var enemies = [];

var the_one_and_only_audio = new Audio("DONT FUCKING STOP ME.mp3");

the_one_and_only_audio.loop = true;
the_one_and_only_audio.volume = 0.1;

var score = 0;

var game_state = "MENU";

var Mouse = {
	mousex: 0,
    mousey: 0,
    move: function(event){
		console.log("mouse location:");
        this.mousex = event.clientX;
        this.mousey = event.clientY;
	}
}

var Key = {
	pressed: {},
	
	isDown: function(keyCode){return pressed[keyCode];},
	onKeyDown: function(event){ this.pressed[event.keyCode] = true;},
	onKeyUp: function(event){ delete this.pressed[event.keyCode];}
};

window.onload = function(){
    the_one_and_only_audio.play();

	canvas = document.getElementById("game_canvas");
	context = canvas.getContext("2d");
	setInterval(main_loop, 1000 / 60);
	window.addEventListener("keydown", function(event){Key.onKeyDown(event);}, false);
	window.addEventListener("keyup", function(event){Key.onKeyUp(event);}, false);
	window.addEventListener("mousemove", function(event){Mouse.move(event);}, false);

	gary = new Gary();
    camera = new Camera();
    generate_chunk();


}

function main_loop(){
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000"
    context.strokeRect(0, 0, canvas.width, canvas.height);

    if(game_state == "INGAME") {
        // update
        gary.update();
        camera.update();
        for (var i = 0; i < enemies.length; i++) {
            if (!enemies[i].rem) enemies[i].update();
            else enemies.splice(i, 1);
        }
        // render


        for (var i = 0; i < blocks.length; i++) {
            blocks[i].render();
        }

        for (var i = 0; i < enemies.length; i++) {
            enemies[i].render();
        }
        if (Math.floor(Math.random() * 5) == 0) enemies.push(new TypicalEnemy(Math.random() * 10000 * 40, canvas.height - 100));
        gary.render();
    } else {
		render_menu();
	}

}

function Gary(){
	

	var right_stance = "ᕕ( ᐛ )ᕗ";
	var left_stance = "ᕕ( ᐕ )ᕗ";
	var current_stance = "ᕕ( ᐛ )ᕗ";
    var trail = "三";

    this.x = 100;
	this.y = 20;
	this.velx = 0;
	this.vely = 0;
	
	var gravity = 0;
	var grav_acc = 0.08;
	var speed = 0.1;
	var speed_cap = 20;
	var timer = 0;
	var jump_vel = 0;

	this.norm = function(value, min, max){
		return (value - min) / (max - min);
	}

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
		
		if(this.velx < 0) {
            var volume = -this.norm(this.velx, 0, speed_cap);
            if(volume < 0.01) volume = 0.01;
            if(volume > 1) volume = 1;
            the_one_and_only_audio.volume = volume;
            current_stance = left_stance;
        }
		if(this.velx > 0){
			var volume = this.norm(this.velx, 0, speed_cap);
            if(volume < 0.1) volume = 0.1;
			if(volume > 1) volume = 1;
            the_one_and_only_audio.volume = volume;
            current_stance = right_stance;
		}
		
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
		if(x0 < 0) return false;
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
		var y1 = y0 + 1;

		for(var i = 0; i < blocks.length; i++){
			if(x0 < blocks[i].x1 && x1 > blocks[i].x0 &&
			   y0 < blocks[i].y1 && y1 > blocks[i].y0) return true;
		}
		return false;
	}
	
	this.render = function(){
        context.font = "20px Arial";
        context.fillStyle = "#000000";
        if(this.velx > speed_cap / 2)
            context.fillText(trail, this.x - camera.x - 20, this.y - camera.y);
        if(this.velx < -speed_cap / 2)
            context.fillText(trail, this.x - camera.x + 70, this.y - camera.y);
        if(this.velx == speed_cap)
            context.fillText(trail, this.x - camera.x - 20 * 2, this.y - camera.y);
        if(this.velx == -speed_cap)
            context.fillText(trail, this.x - camera.x + 70 + 20, this.y - camera.y);

        context.fillText("Craziness: " + score, 20, 20);
		context.fillText(current_stance, this.x - camera.x, this.y - camera.y);
	}
}

function Block(x, y){
	
	this.x = x;
	this.y = y;
	this.w = 40;
	this.h = 40;
    this.x0 = this.x;
    this.x1 = this.x + this.w;
    this.y0 = this.y - this.h;
    this.y1 = this.y;

	this.render = function(){
        context.font = "40px Arial";
        context.fillStyle = "#000000";
		context.fillText(String.fromCharCode(0xe296a9), this.x - camera.x, this.y - camera.y);
	}
}

function TypicalEnemy(x, y){

	var strings = [
		"ง ( ⌓̈ )ง", "(☞ ᐛ )☞", "(☜ ᐖ )☜", "(´･ω･`)", "( ´･ω･)", "(・ω・)b"
	];

	var random_index = (Math.random() * strings.length) | 0;

	this.can_collide = true;
	this.x = x;
    this.y = y;
    this.velx = 0;
    this.vely = 0;
    this.rem = false;

    var gravity = 0;
    var grav_acc = 0.08;
    var jump_vel = 0;

    var once = 0;

    this.update = function(){
        var grounded = this.on_ground(this.vely);
        if(!grounded){
            gravity += grav_acc;
            this.vely += gravity;
        } else {
            gravity = 0;
            this.vely = 0;
        }

        if(!this.touch_player()){
			if(random_index % 2 == 0) this.velx = 2;
			else this.velx = -2;
		} else {
            this.can_collide = false;
            jump_vel -= 2;
            this.vely += jump_vel;
            if(this.velx != 0 || this.vely != 0) this.move(this.velx, this.vely);
            if(once++ == 0)score++;
            return;
		}

		if(this.y > canvas.height) this.rem = true;

        if(gravity > 20) gravity = 20;
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
    	if(this.can_collide) {
            var x0 = this.x + xa;
            if (x0 < 0) return false;
            var x1 = this.x + strings[random_index].length * 10 + xa;
            var y0 = this.y - 20 + ya;
            var y1 = this.y + ya;

            for (var i = 0; i < blocks.length; i++) {
                if (x0 < blocks[i].x1 && x1 > blocks[i].x0 &&
                    y0 < blocks[i].y1 && y1 > blocks[i].y0) return false;
            }

            for(var i = 0; i < enemies.length; i++){
            	if(enemies[i] != this){
                    var ex0 = enemies[i].x;
                    var ex1 = enemies[i].x + 7 * 10;
                    var ey0 = enemies[i].y - 20;
                    var ey1 = enemies[i].y;

                    if(x0 < ex1 && x1 > ex0 && y0 < ey1 && y1 > ey0) return false;
				}
			}
        }
        return true;
    }

    this.on_ground = function(ya){
    	if(this.can_collide) {
            var x0 = this.x;
            var x1 = this.x + strings[random_index].length * 10;
            var y0 = this.y + ya;
            var y1 = y0 + 1;

            for (var i = 0; i < blocks.length; i++) {
                if (x0 < blocks[i].x1 && x1 > blocks[i].x0 &&
                    y0 < blocks[i].y1 && y1 > blocks[i].y0) return true;
            }
        }
        return false;
    }

    this.touch_player = function(){
        var x0 = this.x;
        var x1 = this.x + strings[random_index].length * 10;
        var y0 = this.y - 20;
        var y1 = this.y;

        var gx0 = gary.x;
        var gx1 = gary.x + 7 * 10;
        var gy0 = gary.y - 20;
        var gy1 = gary.y;

		if(x0 < gx1 && x1 > gx0 && y0 < gy1 && y1 > gy0) return true;
		return false;
	}

    this.render = function(){
        context.font = "20px Arial";
        context.fillStyle = "#000000";
        context.fillText(strings[random_index], this.x - camera.x, this.y - camera.y);
    }


}

function Camera(){

	this.x = 0;
    this.y = 0;

    this.update = function(){
        this.x = gary.x - canvas.width / 2;
        this.y = gary.y - canvas.height / 2 - 120;
    }

}

function generate_chunk(){
	for(var i = 1; i <= 1000; i++){
		if(i % 20 == 0) enemies.push(new TypicalEnemy(i * 40, canvas.height - 100));
		blocks.push(new Block(i * 40, canvas.height - 40));
	}

	for(var i = 0; i <= 10; i++){
        blocks.push(new Block(0, canvas.height - 40 + i * -40));
	}

    for(var i = 0; i <= 10; i++){
        blocks.push(new Block(1000 * 40, canvas.height - 40 + i * -40));
    }
}


function render_menu(){

	// TODO fix the menu(make the mouse work nice) and you are good to go!

	var options = [
		"Start Game", "About"
	];

    context.font = "100px Arial";
    context.fillStyle = "#000000";
    context.fillText("ᕕ( ᐛ )ᕗ", 0, 150);

    context.font = "45px Arial";
    context.fillStyle = "#000000";
	for(var i = 0; i < options.length; i++) {
        context.fillText(options[i], canvas.width / 2 - 250, 300 + i * 48);
    }


}



