/*
 * facedetection.js — demo di face tracking con avatar 3D.
 *
 * Codice adattato dal demo ufficiale MediaPipe "Face Virtual Avatar"
 * (Copyright 2023 The MediaPipe Authors, Apache License 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0), che nel sito originale
 * viveva incollato dentro facedetection.html insieme a script CodePen
 * inutili. Qui è stato spostato nel file (prima vuoto) js/facedetection.js
 * e reso avviabile solo su richiesta esplicita dell'utente, con
 * gli errori mostrati a schermo invece che solo in console.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-16";

function getViewportSizeAtDepth(camera, depth) {
  const viewportHeightAtDepth = 2 * depth * Math.tan(THREE.MathUtils.degToRad(0.5 * camera.fov));
  const viewportWidthAtDepth = viewportHeightAtDepth * camera.aspect;
  return new THREE.Vector2(viewportWidthAtDepth, viewportHeightAtDepth);
}

function createCameraPlaneMesh(camera, depth, material) {
  const viewportSize = getViewportSizeAtDepth(camera, depth);
  const geometry = new THREE.PlaneGeometry(viewportSize.width, viewportSize.height);
  geometry.translate(0, 0, -depth);
  return new THREE.Mesh(geometry, material);
}

class BasicScene {
  constructor(canvas, video) {
    this.lastTime = 0;
    this.callbacks = [];
    this.height = canvas.clientHeight;
    this.width = canvas.clientWidth;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.01, 5000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height, false);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    this.camera.position.z = 0;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    const orbitTarget = this.camera.position.clone();
    orbitTarget.z -= 5;
    this.controls.target = orbitTarget;
    this.controls.update();

    const inputFrameTexture = new THREE.VideoTexture(video);
    const inputFramesPlane = createCameraPlaneMesh(
      this.camera,
      500,
      new THREE.MeshBasicMaterial({ map: inputFrameTexture })
    );
    this.scene.add(inputFramesPlane);

    this.running = true;
    this.render();
    this._onResize = () => this.resize(canvas);
    window.addEventListener("resize", this._onResize);
  }

  resize(canvas) {
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  render(time = this.lastTime) {
    if (!this.running) return;
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    for (const callback of this.callbacks) callback(delta);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.render(t));
  }

  destroy() {
    this.running = false;
    window.removeEventListener("resize", this._onResize);
  }
}

class Avatar {
  constructor(url, scene) {
    this.loader = new GLTFLoader();
    this.morphTargetMeshes = [];
    this.scene = scene;
    this.loadModel(url);
  }

  loadModel(url) {
    this.loader.load(
      url,
      (gltf) => {
        this.gltf = gltf;
        this.scene.add(gltf.scene);
        this.init(gltf);
      },
      undefined,
      (error) => console.error("Errore nel caricamento del modello avatar:", error)
    );
  }

  init(gltf) {
    gltf.scene.traverse((object) => {
      if (object.isBone && !this.root) this.root = object;
      if (!object.isMesh) return;
      object.frustumCulled = false;
      if (!object.morphTargetDictionary || !object.morphTargetInfluences) return;
      this.morphTargetMeshes.push(object);
    });
  }

  updateBlendshapes(blendshapes) {
    for (const mesh of this.morphTargetMeshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) continue;
      for (const [name, value] of blendshapes) {
        if (!(name in mesh.morphTargetDictionary)) continue;
        mesh.morphTargetInfluences[mesh.morphTargetDictionary[name]] = value;
      }
    }
  }

  applyMatrix(matrix, { scale = 1 } = {}) {
    if (!this.gltf) return;
    matrix.scale(new THREE.Vector3(scale, scale, scale));
    this.gltf.scene.matrixAutoUpdate = false;
    this.gltf.scene.matrix.copy(matrix);
  }
}

function retarget(blendshapes) {
  const categories = blendshapes[0].categories;
  const coefsMap = new Map();
  for (const blendshape of categories) {
    if (blendshape.categoryName === "browOuterUpLeft" || blendshape.categoryName === "browOuterUpRight" ||
        blendshape.categoryName === "eyeBlinkLeft" || blendshape.categoryName === "eyeBlinkRight") {
      blendshape.score *= 1.2;
    }
    coefsMap.set(blendshape.categoryName, blendshape.score);
  }
  return coefsMap;
}

function showError(message) {
  const el = document.getElementById("webcam-error");
  if (!el) return;
  el.textContent = message;
  el.setAttribute("data-visible", "true");
}

async function runDemo({ video, canvas, statusEl }) {
  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

  setStatus("Richiesta accesso alla webcam…");
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: "user", width: 1280, height: 720 },
  });
  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => { video.play(); resolve(); };
  });

  const scene = new BasicScene(canvas, video);
  const avatar = new Avatar("https://assets.codepen.io/9177687/raccoon_head.glb", scene.scene);

  setStatus("Carico il modello di face tracking…");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-16/wasm"
  );
  const faceLandmarker = await FaceLandmarker.createFromModelPath(
    vision,
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
  );
  await faceLandmarker.setOptions({
    baseOptions: { delegate: "GPU" },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  setStatus("Attivo — muovi il viso davanti alla webcam.");

  function onVideoFrame(time) {
    const landmarks = faceLandmarker.detectForVideo(video, time);
    const matrices = landmarks.facialTransformationMatrixes;
    if (matrices && matrices.length > 0) {
      avatar.applyMatrix(new THREE.Matrix4().fromArray(matrices[0].data), { scale: 40 });
    }
    const blendshapes = landmarks.faceBlendshapes;
    if (blendshapes && blendshapes.length > 0) {
      avatar.updateBlendshapes(retarget(blendshapes));
    }
    video.requestVideoFrameCallback(onVideoFrame);
  }
  video.requestVideoFrameCallback(onVideoFrame);

  return () => {
    stream.getTracks().forEach((t) => t.stop());
    scene.destroy();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-webcam");
  const video = document.getElementById("video");
  const canvas = document.getElementById("avatar-canvas");
  const statusEl = document.getElementById("webcam-status");
  if (!startBtn || !video || !canvas) return;

  startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;
    document.getElementById("webcam-error")?.setAttribute("data-visible", "false");
    try {
      await runDemo({ video, canvas, statusEl });
      startBtn.textContent = "Demo avviata";
    } catch (err) {
      console.error("Impossibile avviare la demo di face tracking:", err);
      showError(
        "Non è stato possibile accedere alla webcam. Controlla di aver concesso il permesso al browser e riprova, oppure verifica che nessun'altra app la stia già usando."
      );
      startBtn.disabled = false;
      startBtn.textContent = "Riprova ad avviare la webcam";
    }
  });
});
