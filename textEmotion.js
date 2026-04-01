const textInput = document.getElementById("textInput");
const languageSelect = document.getElementById("languageSelect");
const textResult = document.getElementById("textResult");

// Unicode ranges for each language
const languageRegex = {
    english: /^[A-Za-z0-9\s.,!?'"()-]*$/,
    sinhala: /^[\u0D80-\u0DFF\s.,!?'"()-]*$/, // Sinhala Unicode range
    tamil: /^[\u0B80-\u0BFF\s.,!?'"()-]*$/   // Tamil Unicode range
};

// Restrict typing based on selected language
textInput.addEventListener("input", (e) => {
    const selectedLang = languageSelect.value;
    const regex = languageRegex[selectedLang];

    // Remove characters not in allowed language
    const filteredText = Array.from(textInput.value)
        .filter(char => regex.test(char))
        .join('');
    
    if (textInput.value !== filteredText) {
        textInput.value = filteredText;
        textResult.innerText = `Only ${selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)} characters are allowed.`;
    } else {
        textResult.innerText = "";
    }
});

// Placeholder for analyzing text emotion
function analyzeText() {
    if(textInput.value.trim() === "") {
        textResult.innerText = "Please enter some text.";
        return;
    }

    // Here you can call backend NLP model
    textResult.innerText = `Detected Emotion: Happy 😊 (Language: ${languageSelect.value})`;
}
