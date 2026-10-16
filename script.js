"use strict";

/* ==========================================
   PROJECT MIRAGE — AI-POWERED WORKSPACE
   Connected to Netlify AI Function
========================================== */

const ideaInput = document.getElementById("ideaInput");
const generateButton = document.getElementById("generateButton");
const resultArea = document.getElementById("resultArea");
const resultContent = document.getElementById("resultContent");
const activeModeLabel = document.getElementById("activeModeLabel");

const uploadButton = document.getElementById("uploadButton");
const imageInput = document.getElementById("imageInput");
const uploadPreview = document.getElementById("uploadPreview");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const removeImageButton = document.getElementById("removeImage");

const voiceButton = document.getElementById("voiceButton");
const copyButton = document.getElementById("copyButton");
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

const startButton = document.getElementById("startButton");
const exploreButton = document.getElementById("exploreButton");
const toast = document.getElementById("toast");

let currentMode = "imagine";
let selectedImage = null;
let previewUrl = null;
let toastTimer = null;
let recognition = null;
let isListening = false;

/* ==========================================
   MODE INFORMATION
========================================== */

const modeDetails = {
    imagine: {
        label: "IMAGINATION MODE",
        placeholder:
            "Describe something you want to imagine, design, or create...",
        action: "Develop Idea ✦"
    },

    intelligence: {
        label: "INTELLIGENCE MODE",
        placeholder:
            "Describe a question, challenge, or problem you want to explore...",
        action: "Explore Idea ✦"
    },

    worlds: {
        label: "WORLD STUDIO MODE",
        placeholder:
            "Describe your imaginary world, its environment, people, and technology...",
        action: "Design World ✦"
    },

    invention: {
        label: "INVENTION LAB MODE",
        placeholder:
            "Describe a problem you want to solve or an invention you want to develop...",
        action: "Develop Invention ✦"
    }
};

/* ==========================================
   BASIC UTILITIES
========================================== */

function showToast(message) {
    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("visible");
    }, 2800);
}

function scrollToSection(id) {
    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* ==========================================
   MODE SELECTION
========================================== */

function selectMode(mode) {
    if (!modeDetails[mode]) {
        return;
    }

    currentMode = mode;

    const details = modeDetails[mode];

    if (activeModeLabel) {
        activeModeLabel.textContent = details.label;
    }

    if (ideaInput) {
        ideaInput.placeholder = details.placeholder;
    }

    if (generateButton) {
        generateButton.textContent = details.action;
    }

    document.querySelectorAll(".mode-card").forEach(function (card) {
        const selected = card.dataset.mode === mode;

        card.setAttribute("aria-pressed", String(selected));

        card.style.borderColor = selected
            ? "rgba(167, 139, 250, 0.7)"
            : "";
    });

    if (ideaInput) {
        ideaInput.focus({ preventScroll: true });
    }
}

document.querySelectorAll(".mode-card").forEach(function (card) {
    card.addEventListener("click", function () {
        selectMode(card.dataset.mode);
    });
});

/* ==========================================
   START AND EXPLORE BUTTONS
========================================== */

if (startButton) {
    startButton.addEventListener("click", function () {
        scrollToSection("workspace");

        setTimeout(function () {
            if (ideaInput) {
                ideaInput.focus({ preventScroll: true });
            }
        }, 350);
    });
}

if (exploreButton) {
    exploreButton.addEventListener("click", function () {
        scrollToSection("modes");
    });
}

/* ==========================================
   MOBILE NAVIGATION
========================================== */

if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
        const isOpen = mobileMenu.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            mobileMenu.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open menu");
        });
    });
}

/* ==========================================
   IMAGE UPLOAD AND PREVIEW
========================================== */

if (uploadButton && imageInput) {
    uploadButton.addEventListener("click", function () {
        imageInput.click();
    });

    imageInput.addEventListener("change", function () {
        const file = imageInput.files && imageInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file.");
            imageInput.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            showToast("Please select an image smaller than 10 MB.");
            imageInput.value = "";
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        selectedImage = file;
        previewUrl = URL.createObjectURL(file);

        if (previewImage) {
            previewImage.src = previewUrl;
        }

        if (fileName) {
            fileName.textContent = file.name;
        }

        if (uploadPreview) {
            uploadPreview.hidden = false;
        }

        showToast(
            "Image selected. Image understanding is not connected yet."
        );
    });
}

/* ==========================================
   REMOVE SELECTED IMAGE
========================================== */

if (removeImageButton) {
    removeImageButton.addEventListener("click", function () {
        selectedImage = null;

        if (imageInput) {
            imageInput.value = "";
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }

        if (previewImage) {
            previewImage.removeAttribute("src");
        }

        if (fileName) {
            fileName.textContent = "";
        }

        if (uploadPreview) {
            uploadPreview.hidden = true;
        }

        showToast("Image removed.");
    });
}

/* ==========================================
   REAL AI GENERATION
========================================== */

async function developIdea() {
    if (!ideaInput || !resultContent || !resultArea) {
        showToast("A required workspace element is missing.");
        return;
    }

    const idea = ideaInput.value.trim();

    if (!idea) {
        showToast("Please describe your idea first.");
        ideaInput.focus();
        return;
    }

    if (idea.length > 4000) {
        showToast("Please keep your prompt under 4,000 characters.");
        return;
    }

    const details = modeDetails[currentMode];

    if (!details) {
        showToast("Please select a creation mode.");
        return;
    }

    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = "MIRAGE is thinking...";
    }

    resultArea.hidden = false;
    resultContent.textContent = "Connecting to MIRAGE AI...";

    try {
        /*
         * The backend uses "world" for World Studio.
         * The website uses "worlds" as its mode name.
         */

        const apiMode =
            currentMode === "worlds" ? "world" : currentMode;

        const response = await fetch("/.netlify/functions/ai", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                prompt: idea,
                mode: apiMode
            })
        });

        let data;

        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error(
                "The server returned an unreadable response. Please try again."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                "The AI request failed. Please try again."
            );
        }

        if (!data.answer) {
            throw new Error(
                "MIRAGE received an empty answer. Please try again."
            );
        }

        /*
         * Display the AI response as text rather than HTML.
         * This prevents returned content from being treated as markup.
         */

        const heading = document.createElement("h3");
        heading.textContent = "✨ MIRAGE AI Response";

        const answer = document.createElement("p");
        answer.textContent = data.answer;
        answer.style.whiteSpace = "pre-wrap";
        answer.style.overflowWrap = "anywhere";

        resultContent.replaceChildren(heading, answer);

        resultArea.hidden = false;

        resultArea.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        showToast("MIRAGE AI has responded!");

    } catch (error) {
        console.error("MIRAGE AI error:", error);

        resultContent.textContent =
            "MIRAGE could not complete your request.\n\n" +
            error.message +
            "\n\nPlease check your internet connection and try again.";

        showToast("AI request failed. Check the displayed message.");

    } finally {
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.textContent = details.action;
        }
    }
}

/* ==========================================
   CONNECT GENERATE BUTTON
   IMPORTANT: This stays OUTSIDE the function.
========================================== */

if (generateButton) {
    generateButton.addEventListener("click", developIdea);
}

/* ==========================================
   VOICE INPUT
========================================== */

function setupVoiceRecognition() {
    if (!voiceButton || !ideaInput) {
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceButton.addEventListener("click", function () {
            showToast(
                "Voice recognition is not supported here. Try a compatible browser or your keyboard microphone."
            );
        });

        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-GH";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = function () {
        isListening = true;
        voiceButton.textContent = "🔴 Listening...";

        showToast("Speak clearly. Your words will appear in the text box.");
    };

    recognition.onresult = function (event) {
        let transcript = "";

        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        ideaInput.value = transcript;
    };

    recognition.onerror = function (event) {
        showToast("Voice input issue: " + event.error);
    };

    recognition.onend = function () {
        isListening = false;
        voiceButton.textContent = "🎙 Voice";
    };

    voiceButton.addEventListener("click", function () {
        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            showToast("Voice input could not start. Try again.");
        }
    });
}

setupVoiceRecognition();

/* ==========================================
   COPY RESULT BUTTON
========================================== */

if (copyButton && resultContent) {
    copyButton.addEventListener("click", async function () {
        const text = resultContent.innerText.trim();

        if (!text) {
            showToast("There is no result to copy.");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showToast("Result copied.");

        } catch (error) {
            const temporary = document.createElement("textarea");

            temporary.value = text;
            temporary.style.position = "fixed";
            temporary.style.opacity = "0";

            document.body.appendChild(temporary);
            temporary.select();

            let copied = false;

            try {
                copied = document.execCommand("copy");
            } catch (copyError) {
                copied = false;
            }

            temporary.remove();

            showToast(
                copied
                    ? "Result copied."
                    : "Copy was blocked. Select the result and copy it manually."
            );
        }
    });
}

/* ==========================================
   INITIALIZE PROJECT MIRAGE
========================================== */

selectMode("imagine");

if (generateButton) {
    generateButton.textContent = modeDetails.imagine.action;
}

console.log("PROJECT MIRAGE AI workspace loaded successfully.");
