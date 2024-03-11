import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.min.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js";
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/ARButton.js";
import * as TWEEN from "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);

let isVR = false;
document.body.appendChild(VRButton.createButton(renderer));

const ButtonAr = ARButton.createButton(renderer);
document.body.appendChild(ButtonAr)

const cameraMin = 0.0001;

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, cameraMin, 1000);

camera.position.z = 5;

let xrCamera;

const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableRotate = false;
//controls.enablePan = false;
//controls.enableZoom = false;
//controls.enableDamping = false;
//controls.enableKeys = false;

const scene = new THREE.Scene();

scene.add(camera);

const light = new THREE.PointLight(0xffffff, 1, 100);
scene.add(light);
const Ambientlight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(Ambientlight);

const selectable = [];
const selectable2 = [];

function crearCubos() {
  let cubos = new Array(7);

  for (let i = 0; i < cubos.length; i++) {
    const geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshStandardMaterial({ color: getRandomColor() });
    cubos[i] = new THREE.Mesh(geometry, material);

    cubos[i].position.x = (Math.random() - 0.5) * 2;
    cubos[i].position.y = (Math.random() - 0.5) * 2;
    cubos[i].position.z = (Math.random() - 0.5) * 2;

    cubos[i].rotation.x = (Math.random() - 0.5) * 2;
    cubos[i].rotation.y = (Math.random() - 0.5) * 2;
    cubos[i].rotation.z = (Math.random() - 0.5) * 2;

    scene.add(cubos[i]);

    selectable.push({
      selected: false,
      object: cubos[i],
    });
  }
  return cubos;
}

function crearCubos2() {
  let cubos2 = new Array(1);

  for (let i = 0; i < cubos2.length; i++) {
    const geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshStandardMaterial({ color: getRandomColor() });
    cubos2[i] = new THREE.Mesh(geometry, material);

    cubos2[i].position.x = (Math.random() - 0.5) * 4;
    cubos2[i].position.y = (Math.random() - 0.5) * 4;
    cubos2[i].position.z = (Math.random() - 0.5) * 4;

    cubos2[i].rotation.x = (Math.random() - 0.5) * 4;
    cubos2[i].rotation.y = (Math.random() - 0.5) * 4;
    cubos2[i].rotation.z = (Math.random() - 0.5) * 4;

    scene.add(cubos2[i]);

    selectable2.push({
      selected2: true,
      object2: cubos2[i],
    });
   
  }
  return cubos2;
}

// Función para obtener un color RGB aleatorio
function getRandomColor() {
  return Math.random() * 0xffffff;
}

let cubos = crearCubos();
//let cubos2 = crearCubos2();

const cursorGeometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
const cursorMaterial = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );

const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);

cursor.position.z = -0.0001*50;
cursor.scale.set(1, 1, 1); // Escala inicial del cursor

const raycaster = new THREE.Raycaster();
let firstRun = true;

function animate() {
  requestAnimationFrame(animate);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  controls.update();

  cubos.forEach(function (cubo) {
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
    
  });

  cursor.material.color.set(selectable.some(obj => obj.selected) ? new THREE.Color("blue") : new THREE.Color("white"));

  //cursor.material.color.set(selectable2.some(obj2 => obj2.selected) ? new THREE.Color("crimson") : new THREE.Color("white"));
    if (isVR) {
    // Si estás en modo VR, verifica si se está utilizando la cámara estéreo
    if (renderer.xr.getSession()) {
      xrCamera = renderer.xr.getCamera(camera); 
      if (xrCamera instanceof THREE.Camera) {
        console.log('Se está utilizando la cámara estéreo en modo VR');
      }
    }
  }
  
}

////////////////////////////////////////////////////////////////////////////////
function cubosEnEscena(cubos2) {
  for (let i = 0; i < cubos2.length; i++) {
    if (scene.children.includes(cubos2[i])) {
      console.log(`Cubo ${i + 1} está en la escena.`);
    } else {
      console.log(`Cubo ${i + 1} no está en la escena.`);
    }
  }
}

// Crear cubos
//const cubos2 = crearCubos2();

// Verificar si los cubos están en la escena
//cubosEnEscena(cubos2);

/////////////////////////////////////////////////////////
function updateSelection() {
    function onSessionStart() {
      isVR = true;
    }
    
    function onSessionEnd() {
      isVR = false;
  }
    
    let currentCamera;
    const session = renderer.xr.getSession();
    if(session){
      onSessionStart();
      currentCamera = xrCamera;
    } else {
      onSessionEnd();
      currentCamera = camera;
      
    }

    camera.add(cursor);

    for (let i = 0, length = selectable.length; i < length; i++) {
      const camPosition = currentCamera.position.clone();
      const objectPosition = selectable[i].object.position.clone();
  
      raycaster.set(camPosition, currentCamera.getWorldDirection(objectPosition));
      const intersects = raycaster.intersectObject(selectable[i].object);
     // const intersects2 = raycaster.intersectObject(selectable2[i].object2);
      const selected = intersects.length > 0;
      //const selected2 = intersects2.length > 0;
      if (selected) {
        selectable[i].object.material.color.set(0xff9300);
        selectable[i].object.position.x = Math.random() * 10 - 5;
            selectable[i].object.position.y = Math.random() * 10 - 5;
        //dispersarCubo();
        //scene.remove(selectable[i].object);
      } 
      else {
        selectable[i].object.material.color.set(0x00ff00);
      }
      selectable[i].selected = selected;
      
      // if (selected2) {
      //   selectable2[i].object2.material.color.set(0xff9300);
      //   scene.remove(selectable2[i].object2);
      //   //dispersarCubo();
      //   //scene.remove(selectable2[i].object);
      // } 
      // else {
      //   //selectable[i].object.material.color.set(0x00ff00);
      // }
      //selectable2[i].selected = selected;
    }
    
    // Manejo de eventos para cambios en la sesión
    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);  
}

animate();

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
  updateSelection();
});
///////////////////////////////////////
