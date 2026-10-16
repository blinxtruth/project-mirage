exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json"
  };

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
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt;
    const mode = body.mode || "imagine";

    if (!prompt || typeof prompt !== "string") {
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

    const modes = {
      imagine: "You are MIRAGE Imagine, a creative idea assistant.",
      intelligence: "You are MIRAGE Intelligence, a helpful reasoning assistant.",
      world: "You are MIRAGE World Studio, an imaginative world-building assistant.",
      invention: "You are MIRAGE Invention Lab, an invention and problem-solving assistant."
    };

    const instructions =
      modes[mode] || "You are MIRAGE, a helpful creative AI assistant.";

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "OPENAI_API_KEY is missing from Netlify environment variables."
        })
      };
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "gpt-5",
          instructions: instructions,
          input: prompt,
          max_output_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
    const apiError = data.error || {};

    console.error("OpenAI API error:", {
        status: response.status,
        type: apiError.type,
        code: apiError.code,
        message: apiError.message
    });

    return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
            error: apiError.message ||
                "The AI request failed. Check your API settings.",
            code: apiError.code || "unknown_error"
        })
    };
}

    const answer = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer: answer || "Please try another prompt."
      })
    };

  } catch (error) {
    console.error("MIRAGE function error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Something went wrong while processing your request."
      })
    };
  }
};
