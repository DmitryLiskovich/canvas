import React, {useRef, useEffect} from 'react';
import logo from './logo.svg';

const mousePosition = [0, 0];
const lines = [];

export function Canvas() {
	const canvas = useRef(null);
	let [width, height] = [window.innerWidth, window.innerHeight];


	useEffect(()=>{
		if(canvas.current) {
			const context = canvas.current.getContext('2d');
			canvas.current.width = width = window.innerWidth;
			canvas.current.height = height = window.innerHeight;
			const x1 = window.innerWidth/2;
			const y1 = window.innerHeight/4;
			lines.push(investigateCanvas(x1, y1, context));
			let countLimit = true;

			canvas.current.addEventListener('mousemove', (e) => {
				let pos = getPos(canvas.current, {x: e.clientX, y: e.clientY});
				if(countLimit) {
					investigateCanvas(pos.x, pos.y, context)
					countLimit = false;
					const countLimitTime = setTimeout(()=>{
						;
						countLimit = true;
						clearTimeout(countLimitTime);
					}, 10);
				}
				
			})
			canvas.current.addEventListener('touchmove', (e) => {
				let pos = getPos(canvas.current, {x: e.touches[0].clientX, y: e.touches[0].clientY})
				investigateCanvas(pos.x, pos.y, context);
			})
		}
	}, [canvas]);

	return(
		<canvas ref={canvas}/>
	)
}

function investigateCanvas(x, y, ctx) {
	const image = new Image();

	image.src = logo;

	ctx.fillStyle = '#111111';
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
	ctx.beginPath();
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.arc(x, y, 3, 0, 360);
	ctx.closePath();
	let counter = 0;
	let fill = 1;
	let animationId;

	function animation() {
		ctx.beginPath();
		ctx.strokeStyle = '#111111';
		ctx.lineWidth = 4;
		ctx.arc(x, y, counter, 0, 360);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = `rgba(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${fill -= 5/100})`;
		counter += 5;
		ctx.arc(x, y, counter, 0, 360);
		ctx.stroke();
		ctx.closePath();
		animationId = requestAnimationFrame(animation);
		if(counter > 100) {
			cancelAnimationFrame(animationId);
		}
	}
	animation();
}

function getPos(canvas, pos) {
  let rect = canvas.getBoundingClientRect()
  return {
    x: Math.round(pos.x - rect.left),
    y: Math.round(pos.y - rect.top)
  }
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
  }