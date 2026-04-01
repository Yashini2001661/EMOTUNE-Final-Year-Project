let previewImage = document.getElementById("previewImage");
let faceInput = document.getElementById("faceInput");
let webcam = document.getElementById("webcam");
let canvas = document.getElementById("canvas");
let toggleCameraBtn = document.getElementById("toggleCamera");
let captureBtn = document.getElementById("captureBtn");
let result = document.getElementById("result");
let downloadPdfBtn = document.getElementById("downloadPdf");

let stream;
let cameraOn = false;
let capturedImage = null;

// Upload image preview
faceInput.addEventListener("change", () => {
    const file = faceInput.files[0];
    if (file) {
        previewImage.src = URL.createObjectURL(file);
        capturedImage = file;
    }
});

// Toggle Camera
toggleCameraBtn.addEventListener("click", async () => {
    if (!cameraOn) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcam.srcObject = stream;
        webcam.style.display = "block";
        toggleCameraBtn.innerHTML = '<i class="fa fa-video-slash"></i> Turn Camera Off';
        cameraOn = true;
    } else {
        webcam.srcObject.getTracks().forEach(track => track.stop());
        webcam.style.display = "none";
        toggleCameraBtn.innerHTML = '<i class="fa fa-video"></i> Turn Camera On';
        cameraOn = false;
    }
});

// Capture photo from webcam
captureBtn.addEventListener("click", () => {
    if (cameraOn) {
        canvas.getContext("2d").drawImage(webcam, 0, 0, canvas.width, canvas.height);
        let dataURL = canvas.toDataURL("image/png");
        previewImage.src = dataURL;

        // Convert dataURL to File object for later processing
        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
                capturedImage = new File([blob], "captured.png", { type: "image/png" });
            });
    }
});

// Analyze Face Emotion
function analyzeFace() {
    if (!capturedImage) {
        result.innerText = "Please upload or capture an image first!";
        return;
    }

    // Placeholder for backend emotion + gender detection
    let detectedEmotion = "Happy 😊";
    let detectedGender = "Male"; // Placeholder
    let dateTime = new Date().toLocaleString();

    result.innerHTML = `
        Detected Emotion: ${detectedEmotion} <br>
        Gender: ${detectedGender} <br>
        Date & Time: ${dateTime}
    `;

    // Show Download PDF button
    downloadPdfBtn.style.display = "inline-block";
    downloadPdfBtn.onclick = () => downloadReportPDF(detectedEmotion, detectedGender, dateTime);
}

// Download PDF Report
async function downloadReportPDF(emotion, gender, dateTime) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Face Emotion Analysis Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Date & Time: ${dateTime}`, 20, 30);
    doc.text(`Detected Emotion: ${emotion}`, 20, 40);
    doc.text(`Gender: ${gender}`, 20, 50);

    // Add image
    const img = await fileToDataURL(capturedImage);
    doc.addImage(img, 'PNG', 20, 60, 160, 120);

    doc.save("Face_Emotion_Report.pdf");
}

// Helper: Convert file to dataURL
function fileToDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}
