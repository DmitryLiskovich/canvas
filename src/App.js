import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import logo from './beyond-better-foods.svg';
import './App.css';

function App() {

	const img = useRef(null);

	function getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	}

	useEffect(()=>{
		// const header = document.querySelector('header');
		// const imgall = document.querySelectorAll('img');
		// const z = [getRandomArbitrary(-50, 0), getRandomArbitrary(-50, 0), getRandomArbitrary(-50, 0)];
		// Array.prototype.forEach.call(imgall, (item, index) => {
		// 	item.style.transitionDelay = index/2;
		// 	item.style.transform = `translateZ(${z[index]}px)`
		// })
		// header.classList.add('active');
		// setTimeout(()=> {
		// 	if(img.current) {
		// 	}
		// }, 1200)
	}, []);

  return (
    <div className="App">
      {/* <header className="App-header">
        <img ref={img} src={logo} className="App-logo first" alt="logo" />
        <img ref={img} src={logo} className="App-logo second" alt="logo" />
        <img ref={img} src={logo} className="App-logo third" alt="logo" />
      </header>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
    </div>
  );
}

export default App;

var container;
var camera, scene, renderer;

var shaderUniforms, shaderAttributes;

var particleSystem;

var imageWidth = 640;
var imageHeight = 360;
var imageData = null;
var animationDelta = 0.03;

init();

	function init() {
	createScene();
	createPixelData();

	window.addEventListener('resize', onWindowResize, false);
	}

function createScene() {
  container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = 200;
  camera.lookAt(scene.position)

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  container.appendChild(renderer.domElement);
}

function mousePosition(e) {
	console.log(e);
}

let mousePositionX;
let mousePositionY;

function createPixelData() {
  var image = document.createElement("img");
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  document.addEventListener('mousemove', (e)=> {
	getPos(canvas, e);
	const y = window.innerHeight/2*0.1 - e.clientY*0.1;
	const x =  window.innerWidth/2*0.1 - e.clientX*0.1;
	if(particleSystem) {
		particleSystem.rotation.x = y*0.001;
		particleSystem.rotation.y = x*0.001;
		particleSystem.position.x = x*.1;
		particleSystem.position.y = y*.1;
	}
})
  
  image.crossOrigin = "Anonymous";
  image.onload = function() {
	imageWidth = canvas.width = image.width;
    imageHeight = canvas.height = image.height;
    
    context.fillStyle = context.createPattern(image, 'no-repeat');
    context.fillRect(0, 0, imageWidth, imageHeight);
    // context.drawImage(image, 0, 0, imageWidth, imageHeight);
    
    imageData = context.getImageData(0, 0, imageWidth, imageHeight).data;

    createPaticles();
  };
  
  image.src = logo;
}

const randomVertexes = [];

function createPaticles() {
	var c = 0;

	var geometry;
	var x, y;

	geometry = new THREE.Geometry();
	geometry.dynamic = false;

	x = imageWidth * -0.5;
	y = imageHeight * 0.5;

	shaderAttributes = {
		vertexColor: {
		type: "c",
		value: []
		}
	};

	shaderUniforms = {
		amplitude: {
			value: 0.5,
		},
		mousePositionX: {value: 0},
		mousePositionY: {value: 0},
		size: 10,
		resolution: { value: new THREE.Vector2() }
	};

	const vertexCoef = [];
	const vertexes = [];
	const colors = [];

	for (var i = 0; i < imageHeight; i++) {
		for (var j = 0; j < imageWidth; j++) {
		colors.push(imageData[c] / 255, imageData[c + 1] / 255, imageData[c + 2] / 255);
		
		vertexes.push(x, y, 0);
		randomVertexes.push(getRandomInt(window.innerWidth, 0)-window.innerWidth/2, getRandomInt(window.innerWidth, 0)-window.innerWidth/2, getRandomInt(1000, 0));
		const amp = [
			vertexes[vertexes.length-3]/randomVertexes[randomVertexes.length-3],
			vertexes[vertexes.length-2]/randomVertexes[randomVertexes.length-2],
		]

		vertexCoef.push(amp[0], amp[1]);

		c += 4;
		x++;
		}

		x = imageWidth * -0.5;
		y--;
	}

	shaderUniforms.mousePositionX.value = mousePositionX;
	shaderUniforms.mousePositionY.value = mousePositionY;

	var BufferGeometry = new THREE.BufferGeometry();
	var verticesRand = new Float32Array(randomVertexes);
	const posXY = new Float32Array(vertexCoef);
	var colorsNew = new Float32Array(colors);
	BufferGeometry.fromGeometry(geometry);
	BufferGeometry.setAttribute('position', new THREE.BufferAttribute(verticesRand, 3));
	BufferGeometry.setAttribute('posXY', new THREE.BufferAttribute(posXY, 2));
	BufferGeometry.setAttribute('vertexColor', new THREE.BufferAttribute(colorsNew, 3));

	var shaderMaterial = new THREE.ShaderMaterial({
		uniforms: shaderUniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
	})
	particleSystem = new THREE.ParticleSystem(BufferGeometry, shaderMaterial);

	let coef = 1;

	function tick() {
		requestAnimationFrame(tick);
		if(shaderUniforms.amplitude.value > 0) {
			shaderUniforms.amplitude.value -= 0.03 * coef;
		} else {
			shaderUniforms.amplitude.value = 0;
		}
		shaderUniforms.mousePositionX.value = mousePositionX;
		shaderUniforms.mousePositionY.value = mousePositionY;
		render();
		coef /= 1.02;
	}
	tick();

	scene.add(particleSystem);
	renderer.render(scene, camera);
}


function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function getPos(canvas, e) {
	let rect = canvas.getBoundingClientRect()
	mousePositionX = Math.round(e.clientX - rect.left) - window.innerWidth/2;
	mousePositionY = window.innerHeight/2 - Math.round(e.clientY - rect.top);
  }