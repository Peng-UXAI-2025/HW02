//Teachable Machine Model
let FACE_MODEL = "https://teachablemachine.withgoogle.com/models/tMANlTdp6/model.json";

let mCamera;
let mModel;

// Tracking Detected Objects
let mDetected = [];
let verifying = false;
const THRESHOLD = 0.95;
const REQUIRED_TIME = 1500;
let successStartTime = null;

//Web-interaction(buttons)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-cta").addEventListener("click", () => showSection("ready-to-verify"));
    document.getElementById("verify-cta").addEventListener("click", verify);
    document.getElementById("finish-button").addEventListener("click", () => showSection("welcome-step"));
});

function verify() {
    showSection("verify-in-progress");
    verifying = true;
    setupP5();
}

//verification based on p5 & ml5
function setupP5() {
    let container = document.getElementById("p5-container");
    container.innerHTML = "";
    new p5((p) => {
        p.setup = function () {
            let canvas = p.createCanvas(1149, 540);
            canvas.parent("p5-container");

            mCamera = p.createCapture(p.VIDEO, { flipped: true });
            mCamera.size(1149, 540);
            mCamera.hide();

            mModel = ml5.imageClassifier(FACE_MODEL, { flipped: true }, startClassification);
        };

        p.draw = function () {
            p.background(200);
            if (mCamera) {
                p.image(mCamera, 0, 0, 1149, 540);
            }
        };
    });
}

function startClassification() {
    mModel.classify(mCamera, updateDetected);
}

function updateDetected(detected) {
    if (!verifying) return;

    mDetected = detected;
    console.log("Detected Labels:", detected);

    let recognized = detected.find(r => r.label.includes("Bernese") || r.label.includes("MountBourne"));
    let progressBar = document.getElementById("progress-bar");

    if (recognized) {
        let confidence = recognized.confidence;
        progressBar.value = Math.round(confidence * 100);

        if (confidence > THRESHOLD) {
            if (successStartTime === null) {
                successStartTime = Date.now();
            } else if (Date.now() - successStartTime >= REQUIRED_TIME) {
                verifying = false;
                showSection("success-page");
                return;
            }
        } else {
            successStartTime = null;
        }
    } else {
        progressBar.value = 0;
        successStartTime = null;
    }

    setTimeout(() => mModel.classify(mCamera, updateDetected), 500);
}

function showSection(sectionId) {
    document.querySelectorAll("section").forEach((section) => {
        section.classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");
}
