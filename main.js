import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

let enterButtonClicked = false;

let ambientAudio = new Audio('ethereal-ambient-atmosphere-210335.mp3');
let isPlaying = false;

function fadeOutAudio(audio, duration) {
    const fadeOutInterval = 50; // Interval in milliseconds
    const fadeOutStep = audio.volume / (duration / fadeOutInterval);

    const fadeAudio = setInterval(() => {
        if (audio.volume > fadeOutStep) {
            audio.volume -= fadeOutStep;
        } else {
            audio.volume = 0;
            clearInterval(fadeAudio);
            audio.pause();
            isPlaying = false;
        }
    }, fadeOutInterval);
}

function fadeInAudio(audio, duration) {
    const fadeInInterval = 50; // Interval in milliseconds
    const maxVolume = 1.0; // Target volume
    const fadeInStep = maxVolume / (duration / fadeInInterval);

    audio.play();

    const fadeAudio = setInterval(() => {
        if (audio.volume < maxVolume - fadeInStep) {
            audio.volume += fadeInStep;
        } else {
            audio.volume = maxVolume;
            clearInterval(fadeAudio);
            isPlaying = true; // Update the isPlaying flag
        }
    }, fadeInInterval);

}


document.addEventListener('DOMContentLoaded', function () {
    const enterButton = document.getElementById('enter-button');
    const maskCircle = document.getElementById('mask-circle');
    const enterScreen = document.getElementById('enter-screen');
    const video = document.getElementById('enter-video');
    const enterNoSoundButton = document.getElementById("enter-no-sound");

    setTimeout(function() {
        video.style.opacity = '0';
        enterButton.classList.add('show');
        enterNoSoundButton.classList.add('show');
        maskCircle.classList.add('show');

    }, 6000);

    enterButton.addEventListener('click', function () {
        enterButton.classList.add('clicked');
        maskCircle.classList.add('expand');

        setTimeout(function () {
            enterScreen.style.display = 'none';
        }, 2000); // Match this duration with the transition duration

        enterButton.classList.remove('show');
        enterNoSoundButton.classList.remove('show');
        video.style.display = 'none';
        enterButtonClicked = true;

        ambientAudio.loop = true; // Loop the audio
        ambientAudio.play();
        isPlaying = true;
        new Audio('little-whoosh.mp3').play();
    });

    enterNoSoundButton.addEventListener('click', function () {
        maskCircle.classList.add('expand');
        setTimeout(function () {
            enterScreen.style.display = 'none';
        }, 2000);

        enterButton.classList.remove('show');
        enterNoSoundButton.classList.remove('show');
        video.style.display = 'none';
        enterButtonClicked = true;

        ambientAudio.loop = true; // Loop the audio
        isPlaying = false;
        document.getElementById('soundButton').classList.toggle('sound-off');

    })
    document.getElementById('soundButton').addEventListener('click', toggleSound);
    document.getElementById('infoButton').addEventListener('click', toggleInfo);

    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = currentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Get browser and device info
    const userAgent = navigator.userAgent;
    const browserInfo = userAgent.match(/(firefox|msie|trident|chrome|safari|opera|opr\/|edg|edge)\/?\s*(\.?\d+(\.\d+)*)/i)[1];
    const deviceInfo = /mobile/i.test(userAgent) ? 'Mobile Device' : 'Desktop Device';

    // Set date, time, and browser info
    document.getElementById('current-date').textContent = dateString;
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('browser-info').textContent = `${browserInfo} (${deviceInfo})`;
});

RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 11.5);
camera.lookAt(0, 3, 0);

const renderer = new THREE.WebGLRenderer({ alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const buttons = [];

const loader = new GLTFLoader()

const clickableObjects = [
    { name: 'Crystal', description: "Luxury Brand-Customer Analytics" },
    { name: 'Hanger', description: "Digitizing Vintage Fashion" },
    { name: 'Alarm', description: "Consignment Fraud Detection" }
];

loader.load('runway.glb', function (gltf) {
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);

    clickableObjects.forEach(({ name, description }) => {
        const object = gltf.scene.getObjectByName(name);
        if (object) {
            object.userData.clickable = true; // Mark the object as clickable
            const button = createButton(object, description);
            buttons.push({ object, button });
        } else {
            console.warn(`Object with name "${name}" not found`);
        }
    });

}, undefined, function (error) {
    console.error(error);
});

const buttonContainer = document.getElementById('button-container');

function createButton(object, description) {
    const button = document.createElement('div');
    button.classList.add('object-button');
    button.style.display = 'none'; // Start hidden
    button.dataset.description = description; // Set data-description attribute
    buttonContainer.appendChild(button); // Append to button-container

    button.addEventListener('mouseenter', () => {
        showTooltip(button);
    });

    button.addEventListener('mouseleave', () => {
        hideTooltip(button);
    });

    button.addEventListener('click', () => {
        openPanel(description);
        buttonContainer.style.display = 'none'; // Hide the button container
        if (isPlaying === true) {
            new Audio('instant-open.mp3').play();
        }
    });

    return button;
}

function showTooltip(button) {
    button.classList.add('show-tooltip');
}

function hideTooltip(button) {
    button.classList.remove('show-tooltip');
}

function updateButtonPositions() {
    buttons.forEach(({ object, button }) => {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

        // Calculate distance from camera to object
        const distance = camera.position.distanceTo(object.position);

        // Adjust button position based on distance
        const buttonOffset = 10; // Fixed offset distance in pixels
        const adjustedX = x + (buttonOffset / distance);
        const adjustedY = y - ((15 * buttonOffset) / distance);

        button.style.left = `${adjustedX}px`;
        button.style.top = `${adjustedY}px`;

        // Show or hide button based on distance and whether the object is in front of the camera
        if (distance < 14.5 && vector.z < 1) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }

    });
}

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 4, 5).normalize();
scene.add(directionalLight);

const runwayLength = 110;
const runwayWidth = 5;
const lightHeight = 2; 
const lightThickness = 2.5;

function addRunwayLights() {
    const lightIntensity = 2; 

    // Left side light
    const leftLight = new THREE.RectAreaLight(0xffffff, lightIntensity, runwayLength, lightThickness);
    leftLight.position.set(-runwayWidth / 2 - lightThickness / 2, lightHeight / 2, 0);
    leftLight.rotation.x = -Math.PI / 2;
    leftLight.rotation.z = Math.PI / 2;
    scene.add(leftLight);

    // Right side light
    const rightLight = new THREE.RectAreaLight(0xffffff, lightIntensity, runwayLength, lightThickness);
    rightLight.position.set(runwayWidth / 2 + lightThickness / 2, lightHeight / 2, 0);
    rightLight.rotation.x = -Math.PI / 2;
    rightLight.rotation.z = -Math.PI / 2;
    scene.add(rightLight);
}
addRunwayLights();

scene.fog = new THREE.Fog(0xcccccc, 4, 15);


let scrollSpeed = 1;
let targetZ = camera.position.z;
let currentZ = camera.position.z;
const startZ = 11.5;
const endZ = -59;
function easeOutQuad(t) {
    return t * (2 - t);
}

let animationStartTime = null;
let initialZ = currentZ;
let isAnimating = false;
const animationDuration = 1000;

window.addEventListener('wheel', onScroll, { passive: false });

function onScroll(event) {
    if (!enterButtonClicked) {
        event.preventDefault();
        return;
    }
    if (document.getElementById('scroll-indicator').style.display = 'block') {
        document.getElementById('scroll-indicator').classList.add('hidden');
    }
    if (isPanelOpen) return;
    event.preventDefault();
    const scrollDirection = Math.sign(event.deltaY);
    targetZ += scrollDirection * scrollSpeed;

    if (targetZ > startZ) {
        targetZ = startZ;
    }

    if (targetZ < endZ) {
        targetZ = startZ;
    }

    animationStartTime = performance.now();
    initialZ = currentZ;
    isAnimating = true;
}

function updateCameraPosition() {
    if (isPanelOpen) return;

    if (isAnimating) {
        const currentTime = performance.now();
        const elapsed = currentTime - animationStartTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = easeOutQuad(progress);

        currentZ = initialZ + (targetZ - initialZ) * easedProgress;
        camera.position.z = currentZ;

        if (progress >= 1) {
            isAnimating = false;
        }
    }
}
let mouseX = 0, mouseY = 0;

function onMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

document.addEventListener('mousemove', onMouseMove, false);

const maxRotation = THREE.MathUtils.degToRad(5); 
const targetRotation = {
    x: 0,
    y: 0
};

function updateCameraRotation() {
    if (isPanelOpen) return;

    const deltaX = -(mouseX - window.innerWidth / 2) / (window.innerWidth / 2);
    const deltaY = -(mouseY - window.innerHeight / 2) / (window.innerHeight / 2);

    const distanceFromCenter = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const sensitivity = 1 - distanceFromCenter;

    targetRotation.y = maxRotation * deltaX * distanceFromCenter; 
    targetRotation.x = maxRotation * deltaY * distanceFromCenter; 

    targetRotation.x = THREE.MathUtils.clamp(targetRotation.x, -maxRotation, maxRotation);
    targetRotation.y = THREE.MathUtils.clamp(targetRotation.y, -maxRotation, maxRotation);

    camera.rotation.y = targetRotation.y;
    camera.rotation.x = targetRotation.x;
}

function animate(timestamp) {
    updateCameraPosition();
    updateCameraRotation();
    updateButtonPositions();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener("DOMContentLoaded", function() {
    renderGraph();
});

function initializeImageModal() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullImage");
    const closeModal = document.getElementsByClassName("close")[0];
    const leftArrow = document.getElementsByClassName("left-arrow")[0];
    const rightArrow = document.getElementsByClassName("right-arrow")[0];

    let currentIndex = -1;
    const images = document.querySelectorAll('.image-item img');

    function openModal(index) {
        currentIndex = index;
        modal.style.display = "block";
        modalImg.src = images[currentIndex].src;
    }

    function closeModalFunction() {
        modal.style.display = "none";
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        modalImg.src = images[currentIndex].src;
    }

    function showPreviousImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        modalImg.src = images[currentIndex].src;
    }

    images.forEach((image, index) => {
        image.onclick = function() {
            openModal(index);
        }
    });

    closeModal.onclick = closeModalFunction;
    leftArrow.onclick = showPreviousImage;
    rightArrow.onclick = showNextImage;

    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModalFunction();
        }
    }

    document.addEventListener('keydown', (event) => {
        if (modal.style.display === "block") {
            if (event.key === 'ArrowRight') {
                showNextImage();
            } else if (event.key === 'ArrowLeft') {
                showPreviousImage();
            } else if (event.key === 'Escape') {
                closeModalFunction();
            }paneltwo
        }
    });
}

let isPanelOpen = false;
function openPanel(description) {
    isPanelOpen = true;
    const panel = document.getElementById('panel');
    const panelContent = document.getElementById('panel-content');

    fadeOutAudio(ambientAudio, 2000);

    switch (description) {
        case 'Luxury Brand-Customer Analytics':
            panelContent.innerHTML = `
                <h1 class="title">Love or Loathe?</h1>
                <div class="graph-container">
                    <canvas id="myChart"></canvas>
                </div>
                <p class="subtitle">The importance of Creative Direction</p>
                <p class="text">Understanding how artistic output influences brand-customer relationships through social media sentiment analysis.</p>
                <a class="call-to-action" href="sentimentreport.pdf" target="_blank" rel="noopener noreferrer">View the full report</a>
            `;
            renderGraph();
            break;
            case 'Digitizing Vintage Fashion':
            panel.classList.add('scrollable');
            panelContent.innerHTML = `
                <h1 class="title">Mini-Museum: Ron Orb</h1>
                <media-controller class="video-controller">
                    <video
                        slot="media"
                        src="RON_ORB.mp4"
                    ></video>
                    <media-control-bar class="video-control-bar">
                        <media-seek-backward-button seekoffset="10"></media-seek-backward-button>
                        <media-play-button></media-play-button>
                        <media-seek-forward-button seekoffset="10"></media-seek-forward-button>
                        <media-time-display></media-time-display>
                        <media-time-range></media-time-range>
                        <media-duration-display></media-duration-display>
                        <media-mute-button></media-mute-button>
                        <media-volume-range></media-volume-range>
                    </media-control-bar>
                </media-controller>
                
                <div class="image-mosaic">
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163063.jpg" alt="Image 1"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163064.jpg" alt="Image 2"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163065.jpg" alt="Image 3"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163066.jpg" alt="Image 4"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163067.jpg" alt="Image 5"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163068.jpg" alt="Image 6"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163069.jpg" alt="Image 7"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163070.jpg" alt="Image 8"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163071.jpg" alt="Image 9"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163072.jpg" alt="Image 10"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163073.jpg" alt="Image 11"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163074.jpg" alt="Image 12"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163077.jpg" alt="Image 13"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163077.jpg" alt="Image 14"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163078.jpg" alt="Image 15"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163079.jpg" alt="Image 16"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163080.jpg" alt="Image 17"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163081.jpg" alt="Image 18"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163083.jpg" alt="Image 19"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163084.jpg" alt="Image 20"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163085.jpg" alt="Image 21"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163086.jpg" alt="Image 22"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163087.jpg" alt="Image 23"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163088.jpg" alt="Image 24"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163089.jpg" alt="Image 25"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163091.jpg" alt="Image 26"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163092.jpg" alt="Image 27"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163093.jpg" alt="Image 28"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163094.jpg" alt="Image 29"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163095.jpg" alt="Image 30"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163096.jpg" alt="Image 31"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163097.jpg" alt="Image 32"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163099.jpg" alt="Image 33"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163101.jpg" alt="Image 34"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163102.jpg" alt="Image 35"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163103.jpg" alt="Image 36"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163104.jpg" alt="Image 37"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163105.jpg" alt="Image 38"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163107.jpg" alt="Image 39"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163108.jpg" alt="Image 40"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163109.jpg" alt="Image 41"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163111.jpg" alt="Image 42"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163112.jpg" alt="Image 43"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163113.jpg" alt="Image 44"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163114.jpg" alt="Image 45"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163116.jpg" alt="Image 46"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163117.jpg" alt="Image 47"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_163118.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152751.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152754.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152756.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152758.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152761.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152764.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152767.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152772.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152776.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152778.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152781.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152784.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152787.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152790.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152793.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152797.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152799.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152802.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152805.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152808.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152811.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152813.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152817.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152821.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152824.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152825.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152829.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152831.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152834.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152836.jpg" alt="Image 48"></div>
                    <div class="image-item"><img src="ronorb_pics/photo_mid_def_152839.jpg" alt="Image 48"></div>
                </div>
                <div id="imageModal" class="modal">
                        <span class="close">&times;</span>
                        <span class="arrow left-arrow">&lsaquo;</span>
                        <span class="arrow right-arrow">&rsaquo;</span>
                        <img class="modal-content" id="fullImage">
                </div>
                <div class="text-spacer">
                    <p class="subtitle">Preserving fashion history</p>
                    <p class="text">In collaboration with the designer himself, Ron Orb archives were digitized and made available online, ensuring accessibility for all, forever.</p>
                </div>
            `;
            initializeImageModal();
            break;
        case 'Consignment Fraud Detection':
            panelContent.innerHTML = `
                <h1 class="title">Spotting Out-liars</h1>
                <media-controller class="audio-controller" audio>
                    <audio
                        slot="media"
                        src="fraud_audio.mp3"
                        crossorigin
                    ></audio>
                    <media-control-bar>
                        <media-seek-backward-button seekoffset="5"></media-seek-backward-button>
                        <media-play-button></media-play-button>
                        <media-seek-forward-button seekoffset="5"></media-seek-forward-button>
                        <media-time-display></media-time-display>
                        <media-time-range></media-time-range>
                        <media-duration-display></media-duration-display>
                        <media-mute-button></media-mute-button>
                        <media-volume-range></media-volume-range>
                    </media-control-bar>
                </media-controller>


                <img class="graphic" src="fraud_workflow.png" alt="Diagram">
                <a class="call-to-action" href="https://github.com/michaelbeihua/fraud" target="_blank" rel="noopener noreferrer">View the project on GitHub</a>
            `;
            
            break;
        default:
            panelContent.textContent = 'Content not available';
            break;
    }

    panel.style.display = 'block';

}

const closeButton = document.getElementById('closeButton');
    closeButton.onclick = () => {
        panel.style.display = 'none';
        buttonContainer.style.display = 'block';
        isPanelOpen = false;
        if (isPlaying) {
            fadeInAudio(ambientAudio, 5000);
        }
    };


function toggleSound() {
    const soundButton = document.getElementById('soundButton');
    soundButton.classList.toggle('sound-off');

    if (isPlaying) {
        ambientAudio.pause();
      } else {
        ambientAudio.play();
      }
      isPlaying = !isPlaying;
}

function toggleInfo() {
    const infoOverlay = document.getElementById('infoOverlay');
    infoOverlay.classList.toggle('active');
    const invitationCard = document.querySelector('.invitation-card');

    infoOverlay.addEventListener('click', (event) => {
        if (!invitationCard.contains(event.target)) {
            closeInfo();
        }
    });

    function closeInfo() {
        infoOverlay.classList.remove('active');
    }
}
// panel open closing sliding, no sound enter option