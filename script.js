"use strict";

/* ==========================================
   PROJECT MIRAGE — VERSION 1
   Front-end creative workspace
   No AI API is connected in this version.
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
        placeholder: "Describe something you want to imagine, design, or create...",
        action: "Develop Idea ✦"
    },

    intelligence: {
        label: "INTELLIGENCE MODE",
        placeholder: "Describe a question, challenge, or problem you want to explore...",
        action: "Explore Idea ✦"
    },

    worlds: {
        label: "WORLD STUDIO MODE",
        placeholder: "Describe your imaginary world, its environment, people, and technology...",
        action: "Design World ✦"
    },

    invention: {
        label: "INVENTION LAB MODE",
        placeholder: "Describe a problem you want to solve or an invention you want to develop...",
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

/* Safely display user-provided text in HTML */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

/* Scroll to a page section */

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

    scrollToSection("workspace");

    if (ideaInput) {
        setTimeout(function () {
            ideaInput.focus({ preventScroll: true });
        }, 350);
    }
}

/* Connect creative mode cards */

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
   IMAGE UPLOAD
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
            "Image selected. AI image understanding is not connected yet."
        );
    });
}

/* Remove selected image */

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
   IMAGINATION MODE TEMPLATE
========================================== */

function makeImagineResult(idea) {
    return `
        <h3>✨ Your Creative Concept</h3>

        <p><strong>Your idea:</strong> ${escapeHTML(idea)}</p>

        <h3>1. Core Vision</h3>
        <p>Define what makes this idea interesting, what experience it
        should create, and what you want people to discover.</p>

        <h3>2. Design Direction</h3>
        <ul>
            <li>Choose the main features and visual style.</li>
            <li>Decide who the creation is for.</li>
            <li>Describe how someone would interact with it.</li>
        </ul>

        <h3>3. First Prototype</h3>
        <p>Start with a small version that demonstrates the central idea.
        Improve it after testing and collecting feedback.</p>

        <h3>4. Next Step</h3>
        <p>Write down three specific features that would make your concept
        useful, interesting, or different.</p>
    `;
}

/* ==========================================
   INTELLIGENCE MODE TEMPLATE
========================================== */

function makeIntelligenceResult(idea) {
    return `
        <h3>🧠 Problem-Solving Workspace</h3>

        <p><strong>Question or challenge:</strong> ${escapeHTML(idea)}</p>

        <h3>1. Understand the Problem</h3>
        <p>Describe the issue clearly. Identify who experiences it,
        when it happens, and why it matters.</p>

        <h3>2. Explore Possible Solutions</h3>
        <ul>
            <li>Consider a simple solution that can be tested quickly.</li>
            <li>Consider a technology-assisted solution.</li>
            <li>Compare the costs, benefits, and limitations of each idea.</li>
        </ul>

        <h3>3. Test Your Thinking</h3>
        <p>Look for evidence, check assumptions, and ask someone affected
        by the problem for feedback.</p>

        <h3>4. Action Plan</h3>
        <p>Choose one small experiment and define how you will know
        whether it works.</p>
    `;
}

/* ==========================================
   WORLD STUDIO MODE TEMPLATE
========================================== */

function makeWorldResult(idea) {
    return `
        <h3>🌍 World Studio Blueprint</h3>

        <p><strong>World concept:</strong> ${escapeHTML(idea)}</p>

        <h3>1. Environment</h3>
        <p>Define the landscape, climate, buildings, natural resources,
        and distinctive locations.</p>

        <h3>2. Inhabitants</h3>
        <p>Decide who or what lives in this world, how people communicate,
        and what daily life looks like.</p>

        <h3>3. Technology and Systems</h3>
        <ul>
            <li>Transport and communication.</li>
            <li>Energy, food, and water.</li>
            <li>Community spaces and important services.</li>
        </ul>

        <h3>4. Make It Interactive</h3>
        <p>Begin with a simple map or a 2D scene. Add clickable locations,
        information panels, and controls for exploring the environment.</p>

        <p><em>This is a planning template, not a rendered or interactive
        3D world.</em></p>
    `;
}

/* ==========================================
   INVENTION LAB MODE TEMPLATE
========================================== */

function makeInventionResult(idea) {
    return `
        <h3>⚡ Invention Development Blueprint</h3>

        <p><strong>Your invention idea:</strong> ${escapeHTML(idea)}</p>

        <h3>1. Define the Need</h3>
        <p>Identify the problem the invention is intended to solve and
        the people who might benefit.</p>

        <h3>2. Propose a Solution</h3>
        <p>Describe how your idea might work. Identify its main components
        and what makes the approach worth investigating.</p>

        <h3>3. Build a Safe Prototype</h3>
        <ul>
            <li>Sketch the design.</li>
            <li>List the resources required.</li>
            <li>Start with a low-cost digital model or a safe mock-up.</li>
        </ul>

        <h3>4. Test and Improve</h3>
        <p>Establish what success means, test the prototype safely, and
        record problems that need to be addressed.</p>

        <h3>5. Check Feasibility</h3>
        <p>Investigate cost, safety, accessibility, and whether a similar
        solution already exists before committing to development.</p>
    `;
}

/* ==========================================
   RESULT BUILDERS
========================================== */

const resultBuilders = {
    imagine: makeImagineResult,
    intelligence: makeIntelligenceResult,
    worlds: makeWorldResult,
    invention: makeInventionResult
};

/* ==========================================
   DEVELOP IDEA BUTTON
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

const details = modeDetails[currentMode];
const originalLabel = details.action;
if (generateButton) {
generateButton.addEventListener("click", developIdea);
}
resultArea.hidden = false;
resultContent.textContent = "Connecting to MIRAGE AI...";

try {
    const response = await fetch("/.netlify/functions/ai", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: idea,
            mode: currentMode
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "The AI request failed. Please try again."
        );
    }

    if (!data.answer) {
        throw new Error("MIRAGE received an empty answer.");
    }

    const heading = document.createElement("h3");
    heading.textContent = "✨ MIRAGE AI Response";

    const answer = document.createElement("p");
    answer.style.whiteSpace = "pre-wrap";
    answer.textContent = data.answer;

    resultContent.replaceChildren(heading, answer);

    resultArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    showToast("MIRAGE AI has responded!");

} catch (error) {
    console.error("MIRAGE AI error:", error);

    resultContent.textContent =
        "MIRAGE could not complete your request. " +
        error.message +
        " Please check your connection and try again.";

    showToast("AI request failed. Check the result for details.");

} finally {
    if (generateButton) {
        generateButton.disabled = false;
        generateButton.textContent = originalLabel;
    }
}

}
    if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = "Preparing Workspace...";
    }

    setTimeout(function () {
        try {
            const builder = resultBuilders[currentMode];

            if (!builder) {
                showToast("Please select a creation mode.");
                return;
            }

            resultContent.innerHTML = builder(idea);
            resultArea.hidden = false;

            resultArea.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            showToast(
                "Your starter blueprint is ready. This version uses templates, not AI."
            );
        } catch (error) {
            console.error("Project MIRAGE generation error:", error);
            showToast("Something went wrong. Please check the console.");
        } finally {
            if (generateButton) {
                generateButton.disabled = false;
                generateButton.textContent = originalLabel;
            }
        }
    }, 350);
}

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
                "Voice recognition is not supported here. Try a compatible browser or use your keyboard microphone."
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

console.log("PROJECT MIRAGE V1 loaded successfully.");
