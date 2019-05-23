import {Container,Sprite,Text} from 'pixi.js';
export default class endAn extends Container {
	constructor() {
    	super();
    	console.log("撒花动效");
    	let canvas = document.getElementById("success-canvas");
    	console.log(canvas);
		let context = canvas.getContext("2d");
		let width = canvas.width;
		let height = canvas.height;
		let particle = [],
		particleCount = 0,
		gravity = 0.3,
		colors = [
		        '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
		        '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
		        '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
		        '#FF5722', '#795548'
		    ];
		for (var i = 0; i < 150; i++) {
		    particle.push({
		        x: width / 2,
		        y: height / 2,
		        boxW: randomRange(5, 20),
		        boxH: randomRange(5, 20),
		        velX: randomRange(-8, 8),
		        velY: randomRange(-25, -10),
		        angle: convertToRadians(randomRange(0, 360)),
		        color: colors[Math.floor(Math.random() * colors.length)],
		        anglespin: randomRange(-0.2, 0.2),
		        draw: function() {
		            context.save();
		            context.translate(this.x, this.y);
		            context.rotate(this.angle);
		            context.fillStyle = this.color;
		            context.beginPath();
		            context.fillRect(this.boxW / 2 * -1, this.boxH / 2 * -1, this.boxW, this.boxH);
		            context.fill();
		            context.closePath();
		            context.restore();
		            this.angle += this.anglespin;
		            this.velY *= 0.999;
		            this.velY += 0.3;
		            this.x += this.velX;
		            this.y += this.velY;
		            if (this.y > height) {
		                this.anglespin = 0;
		            };
		            
		        },
		    });
		}
		function drawScreen() {
		    for (var i = 0; i < particle.length; i++) {
		        particle[i].draw();
		    }
		}
		function update() {
		    context.clearRect(0, 0, width, height);
		    drawScreen();
		    requestAnimationFrame(update);
		}
		update();
		function randomRange(min, max) {
		    return min + Math.random() * (max - min);
		}
		function convertToRadians(degree) {
		    return degree * (Math.PI / 180);
		}
    }
}