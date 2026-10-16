/* ==========================================
   PROJECT MIRAGE
   Google Gemini AI Backend
   Netlify Serverless Function
========================================== */

exports.handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
    };

    // Only allow POST requests.
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: "Use POST to send a request."
            })
        };
    }

    try {
        // Read the request.
        const body = JSON.parse(event.body || "{}");

        const prompt =
            typeof body.prompt === "string"
                ? body.prompt.trim()
                : "";

        const mode = body.mode || "imagine";

        // Validate the prompt.
        if (!prompt) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Please enter a prompt."
                })
            };
        }

        if (prompt.length > 4000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Keep your prompt under 4,000 characters."
                })
            };
        }

        // Instructions for each MIRAGE mode.
        const modeInstructions = {
            imagine:
                "You are MIRAGE Imagine, a creative AI assistant. " +
                "Help users develop original ideas, designs, stories, " +
                "creative concepts, and practical plans. Give clear, " +
                "useful, imaginative answers.",

            intelligence:
                "You are MIRAGE Intelligence, an AI reasoning assistant. " +
                "Help users understand questions, analyze problems, " +
                "compare possible solutions, and think critically. " +
                "Explain your answers clearly and acknowledge uncertainty.",

            world:
                "You are MIRAGE World Studio, an imaginative world-building " +
                "assistant. Help users create fictional worlds, environments, " +
                "characters, cultures, maps, technologies, histories, " +
                "and interesting settings. Organize the world into useful sections.",

            worlds:
                "You are MIRAGE World Studio, an imaginative world-building " +
                "assistant. Help users create fictional worlds, environments, " +
                "characters, cultures, maps, technologies, histories, " +
                "and interesting settings. Organize the world into useful sections.",

            invention:
                "You are MIRAGE Invention Lab, an invention and problem-solving " +
                "assistant. Help users identify needs, develop original concepts, " +
                "plan safe prototypes, and improve ideas. Consider practicality, " +
                "accessibility, safety, and cost."
        };

        const instructions =
            modeInstructions[mode] ||
            "You are MIRAGE, a helpful creative AI assistant. " +
            "Give clear, useful, accurate answers.";

        // Read the secret from Netlify environment variables.
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error:
                        "GEMINI_API_KEY is missing. Add it to Netlify environment variables."
                })
            };
        }

        // Call Google's Gemini API.
        const apiUrl =
            "https://generativelanguage.googleapis.com/v1beta/" +
            "models/gemini-3.8-flash:generateContent";

        const response = await fetch(apiUrl, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },

            body: JSON.stringify({
                systemInstruction: {
                    parts: [
                        {
                            text: instructions
                        }
                    ]
                },

                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],

                generationConfig: {
                    maxOutputTokens: 800
                }
            })
        });

        const data = await response.json();

        // Return useful error information if Gemini rejects the request.
        if (!response.ok) {
            const apiError = data.error || {};

            console.error("Gemini API error:", {
                status: response.status,
                message: apiError.message,
                statusText: apiError.status
            });

            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error:
                        apiError.message ||
                        "Gemini could not complete your request. Please try again.",
                    code: apiError.status || "GEMINI_REQUEST_FAILED"
                })
            };
        }

        // Extract the generated text.
        const answer = (
            data.candidates?.[0]?.content?.parts || []
        )
            .filter(part => typeof part.text === "string")
            .map(part => part.text)
            .join("\n")
            .trim();

        if (!answer) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error:
                        "Gemini returned no text. Please try another prompt."
                })
            };
        }

        // Send the result back to the MIRAGE website.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                answer: answer,
                provider: "Google Gemini",
                mode: mode
            })
        };

    } catch (error) {
        console.error("MIRAGE backend error:", error.message);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error:
                    "Something went wrong in the MIRAGE backend. Please try again."
            })
        };
    }
};
