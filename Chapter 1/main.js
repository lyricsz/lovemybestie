import * as THREE from "three";
import {OrbitControls} from "orbitcontrols";

const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0x000000);
scene.background = new THREE.TextureLoader().load("../bg.jpg");
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

// create a cube
var cubeGeometry = new THREE.TorusGeometry(6, 2.0, 16);

var pm = new THREE.PointsMaterial();
pm.map = new THREE.TextureLoader().load("../cake.png");
pm.blending = THREE.AdditiveBlending;
pm.transparent = true;
pm.size=1.0;
var ps = new THREE.Points(cubeGeometry, pm);
ps.sortParticles = true;
ps.name='cube';
ps.position.x=4.75;
scene.add(ps);

var pm2 = pm.clone();
pm2.map = new THREE.TextureLoader().load("../cake.png");
var ps2 = new THREE.Points(cubeGeometry, pm2);
ps2.sortParticles = true;
ps2.name = 'cube2';
ps2.position.x=-4.75;
scene.add(ps2);

// position and point the camera to te center of the scene
camera.position.x = 0;
camera.position.y = 34;
camera.position.z = 40;
camera.lookAt(scene.position);

setupSound();
window.onload= () => { document.getElementById("startBtn").onclick = start;};
var context;
var sourceNode;
var analyser;
var analyser2;

function updateCubes() {
// get the average for the first channel
var array =  new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(array);
var average = getAverageVolume(array);

// get the average for the second channel
var array2 =  new Uint8Array(analyser2.frequencyBinCount);
analyser2.getByteFrequencyData(array2);
var average2 = getAverageVolume(array2);

// clear the current state
if (scene.getObjectByName('cube')) {
    var cube = scene.getObjectByName('cube');
    var cube2 = scene.getObjectByName('cube2');
    cube.scale.y=average*0.05;
    cube2.scale.y=average2*0.05;
}
}

function setupSound() {
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}
context = new AudioContext();

// setup a analyzer
analyser = context.createAnalyser();
analyser.smoothingTimeConstant = 0.4;
analyser.fftSize = 1024;

analyser2 = context.createAnalyser();
analyser2.smoothingTimeConstant = 0.4;
analyser2.fftSize = 1024;

// create a buffer source node
sourceNode = context.createBufferSource();
var splitter = context.createChannelSplitter();

// connect the source to the analyser and the splitter
sourceNode.connect(splitter);

// connect one of the outputs from the splitter to
// the analyser
splitter.connect(analyser,0);
splitter.connect(analyser2,1);

// and connect to destination
sourceNode.connect(context.destination);
context = new AudioContext();
}

const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const sphereGeo = new THREE.SphereGeometry(6, 10);
const sphereMat = new THREE.MeshStandardMaterial({
    color: "yellow",
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("../cake2.png")
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.x = 1;
sphere.material.transparent = true;
sphere.rotation.y = -0.5 * Math.PI;
sphere.visible = true;

function getAverageVolume(array) {
var values = 0;
var average;

var length = array.length;

// get all the frequency amplitudes
for (var i = 0; i < length; i++) {
    values += array[i];
}

average = values / length;
return average;
}

function playSound(buffer) {
sourceNode.buffer = buffer;
sourceNode.start(0);
sourceNode.loop = true;
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();
}

const mousePosition = new THREE.Vector2();

window.addEventListener("mousemove", function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

const rayCast = new THREE.Raycaster();
const sphereId = sphere.id;

function onError(e) {
    console.log(e);
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);

renderer.domElement.setAttribute("class", "background");

const controls = new OrbitControls(camera, renderer.domElement);

function render() {  
    // and render the scene
    rayCast.setFromCamera(mousePosition, camera);
    const intersects = rayCast.intersectObjects(scene.children);
    for (let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphereId)
            
            //
            intersects[i].object.material.color.set(0xffffff)
    }
    renderer.render(scene, camera);

    updateCubes();
}



function start(){
    document.getElementById("overlay").style.display = "none";
    window.screen.orientation.lock("landscape-primary")
    loadSound("../neo.mp3")
    renderer.setAnimationLoop(render);
    scene.add(sphere);
}

window.onresize = function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight);
}