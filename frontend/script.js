async function explainCode() {
  const code = document.getElementById("code").value;
  const language = document.getElementById("language").value;
  const output = document.getElementById("output");
  const outputContainer = document.querySelector('.output-container');

  if (!code.trim()) {
    alert("Please paste some code to explain.");
    return;
  }

  // Show loading state
  output.textContent = "Explaining...";
  output.style.display = "block";

  try {
    const response = await fetch("https://explain-this-code.onrender.com/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the AI response properly
    let aiResponse;
    if (data.choices && data.choices[0] && data.choices[0].message) {
      // If it's a model response with choices
      const content = data.choices[0].message.content;
      try {
        // Try to parse as JSON first (if the AI returned JSON as requested)
        aiResponse = JSON.parse(content);
      } catch (e) {
        // If it's not JSON, treat as plain text
        aiResponse = { summary: content };
      }
    } else {
      // Assume the response is already in the expected format
      aiResponse = data;
    }

    // Format the response for display
    let formattedOutput = "";
    
    if (aiResponse.summary) {
      formattedOutput += `<div class="output-section"><div class="output-title">Summary:</div>${aiResponse.summary}</div>`;
    }
    
    if (aiResponse.line_by_line) {
      formattedOutput += `<div class="output-section"><div class="output-title">Line-by-Line Explanation:</div>${formatLineByLine(aiResponse.line_by_line)}</div>`;
    }
    
    if (aiResponse.common_mistakes) {
      formattedOutput += `<div class="output-section"><div class="output-title">Common Mistakes:</div>${formatMistakes(aiResponse.common_mistakes)}</div>`;
    }
    
    if (aiResponse.beginner_tip) {
      formattedOutput += `<div class="output-section"><div class="output-title">Beginner Tip:</div>${aiResponse.beginner_tip}</div>`;
    }
    
    if (!formattedOutput) {
      formattedOutput = `<div class="output-section">Could not format the explanation. Raw response: ${JSON.stringify(data, null, 2)}</div>`;
    }

    // Create output container if it doesn't exist
    if (!outputContainer) {
      const newContainer = document.createElement('div');
      newContainer.className = 'output-container';
      newContainer.innerHTML = formattedOutput;
      document.body.appendChild(newContainer);
    } else {
      outputContainer.innerHTML = formattedOutput;
    }
    
    output.style.display = "none";
  } catch (error) {
    console.error("Error:", error);
    output.textContent = `Error: ${error.message}`;
  }
}

function formatLineByLine(lineByLine) {
  if (Array.isArray(lineByLine)) {
    return lineByLine.map(item => `<div><strong>Line:</strong> ${item.line || item.code || item.number || ''}<br><strong>Explanation:</strong> ${item.explanation || item.meaning || item.description || item}</div>`).join('<br>');
  } else if (typeof lineByLine === 'string') {
    return lineByLine;
  } else {
    return JSON.stringify(lineByLine);
  }
}

function formatMistakes(mistakes) {
  if (Array.isArray(mistakes)) {
    return mistakes.map(mistake => `<div>• ${mistake}</div>`).join('');
  } else if (typeof mistakes === 'string') {
    return mistakes;
  } else {
    return JSON.stringify(mistakes);
  }
}

// Add Enter key support for textarea
document.getElementById('code').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    explainCode();
  }
});