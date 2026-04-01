let startBtn = document.getElementById("startBtn");
let pauseBtn = document.getElementById("pauseBtn");
let stopBtn = document.getElementById("stopBtn");
let uploadAudio = document.getElementById("uploadAudio");
let analyzeBtn = document.getElementById("analyzeBtn");
let voiceResult = document.getElementById("voiceResult");
let recordingsList = document.getElementById("recordingsList");

let mediaRecorder;
let audioChunks = [];
let recordings = [];

// Load recordings from localStorage on page load
window.onload = () => {
    const stored = localStorage.getItem("voiceRecordings");
    if (stored) {
        recordings = JSON.parse(stored);
        updateRecordingsList();
    }
};

// Start recording
startBtn.onclick = async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: "audio/mp3" });
            const url = URL.createObjectURL(blob);
            const date = new Date().toLocaleString();
            recordings.push({ name: `Recording ${recordings.length+1}`, date, url, blob });
            saveRecordings();
            updateRecordingsList();
        };

        mediaRecorder.start();
        voiceResult.innerText = "Recording started...";
    }
};

// Pause / Resume
pauseBtn.onclick = () => {
    if (mediaRecorder) {
        if (mediaRecorder.state === "recording") {
            mediaRecorder.pause();
            voiceResult.innerText = "Recording paused...";
        } else if (mediaRecorder.state === "paused") {
            mediaRecorder.resume();
            voiceResult.innerText = "Recording resumed...";
        }
    }
};

// Stop
stopBtn.onclick = () => {
    if (mediaRecorder && (mediaRecorder.state === "recording" || mediaRecorder.state === "paused")) {
        mediaRecorder.stop();
        voiceResult.innerText = "Recording stopped.";
    }
};

// Upload audio
uploadAudio.onchange = () => {
    const file = uploadAudio.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const date = new Date().toLocaleString();
        recordings.push({ name: file.name, date, url, blob: file });
        saveRecordings();
        updateRecordingsList();
        voiceResult.innerText = `Uploaded: ${file.name}`;
    }
};

// Analyze Emotion
analyzeBtn.onclick = () => {
    if (recordings.length === 0) {
        voiceResult.innerText = "No recordings available!";
        return;
    }

    // Placeholder: Just take last recording
    const lastRec = recordings[recordings.length-1];
    const detectedEmotion = "Happy 😊"; // Replace with real backend model
    const dateTime = new Date().toLocaleString();

    voiceResult.innerText = `
        Recording: ${lastRec.name}
        Emotion: ${detectedEmotion}
        Date & Time: ${dateTime}
    `;

    // Generate PDF report
    downloadReportPDF(lastRec, detectedEmotion, dateTime);
};

// Update recordings list
function updateRecordingsList() {
    recordingsList.innerHTML = "";
    recordings.forEach((rec, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${rec.name} (${rec.date}) 
            <a href="${rec.url}" download="${rec.name}">Download</a>
            <button onclick="deleteRecording(${index})">Delete</button>
        `;
        recordingsList.appendChild(li);
    });
}

// Delete recording
function deleteRecording(index) {
    recordings.splice(index, 1);
    saveRecordings();
    updateRecordingsList();
}

// Save to localStorage
function saveRecordings() {
    localStorage.setItem("voiceRecordings", JSON.stringify(recordings));
}

// Generate PDF report
async function downloadReportPDF(recording, emotion, dateTime) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Voice Emotion Analysis Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Recording Name: ${recording.name}`, 20, 30);
    doc.text(`Date & Time: ${dateTime}`, 20, 40);
    doc.text(`Detected Emotion: ${emotion}`, 20, 50);

    doc.save(`${recording.name}_Emotion_Report.pdf`);
}
