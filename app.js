// 🔑 PASTE YOUR API KEY HERE
const API_KEY = "AIzaSyBGhwUePpA-kAK481Oi7cUdRFbx3sC5FPI"; 

let sessionHistory = JSON.parse(localStorage.getItem('gcoder_history')) || [];

document.addEventListener('DOMContentLoaded', renderHistory);

async function fixMyCode() {
    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('language').value;
    const outputDiv = document.getElementById('output');
    const btn = document.getElementById('fixBtn');
    const subtitle = document.getElementById('subtitle');

    if (!code.trim()) {
        alert("Please paste some code first!");
        return;
    }

    // Reset UI to default while loading
    document.body.className = 'theme-default';
    outputDiv.innerHTML = "<div class='placeholder-text'>⏳ Uplinking to GCoder Mainframe...</div>";
    subtitle.innerText = "Analyzing syntax...";
    btn.disabled = true;

    // 🧠 The Upgraded Prompt: Forcing the AI to categorize the code!
    const prompt = `You are an expert coding tutor. First, evaluate the code below. 
    If the code contains ANY syntax or logic errors, you MUST start your very first line exactly with the tag [ERROR]. 
    If the code is completely correct and optimal, you MUST start your very first line exactly with the tag [CORRECT]. 
    
    After the tag, analyze this ${language} code:\n\n${code}\n\n
    Provide fixed code if needed, and explain your reasoning simply using Markdown formatting.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let aiResponseRaw = data.candidates[0].content.parts[0].text;
        
        // 🚨 THEME SHIFTING LOGIC 🚨
        if (aiResponseRaw.includes('[ERROR]')) {
            document.body.className = 'theme-error';
            subtitle.innerText = "🚨 Threats Detected. Code requires patching.";
            // Strip the tag out so it doesn't show in the UI
            aiResponseRaw = aiResponseRaw.replace('[ERROR]', '').trim();
        } else if (aiResponseRaw.includes('[CORRECT]')) {
            document.body.className = 'theme-success';
            subtitle.innerText = "✅ Code is pristine. No vulnerabilities found.";
            aiResponseRaw = aiResponseRaw.replace('[CORRECT]', '').trim();
        }

        // Render the Markdown
        outputDiv.innerHTML = marked.parse(aiResponseRaw);

        // Save to History (we save the raw text without the tag)
        saveToHistory(language, code, aiResponseRaw, document.body.className);

    } catch (error) {
        document.body.className = 'theme-error'; // Turn red on API fail!
        outputDiv.innerHTML = `<h3>Network Error</h3><p>${error.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Analyze Code 🚀";
    }
}

// --- History Logic ---
function saveToHistory(language, code, aiResponse, theme) {
    const newItem = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        language: language,
        code: code,
        response: aiResponse,
        theme: theme // Save the theme state!
    };
    sessionHistory.unshift(newItem);
    if (sessionHistory.length > 15) sessionHistory.pop();
    localStorage.setItem('gcoder_history', JSON.stringify(sessionHistory));
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('historyList');
    historyContainer.innerHTML = ''; 
    if (sessionHistory.length === 0) return;

    sessionHistory.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        historyDiv.onclick = () => loadHistoryItem(item.id);

        // Add a dot indicating if it was an error or success in history
        let dotColor = item.theme === 'theme-error' ? '🔴' : (item.theme === 'theme-success' ? '🟢' : '🔵');

        historyDiv.innerHTML = `
            <div style="font-size: 0.8rem; color: #8b949e;">${item.date}</div>
            <div style="margin-top: 5px; font-weight: bold;">${dotColor} ${item.language} Analysis</div>
        `;
        historyContainer.appendChild(historyDiv);
    });
}

function loadHistoryItem(id) {
    const item = sessionHistory.find(i => i.id === id);
    if (item) {
        document.getElementById('language').value = item.language;
        document.getElementById('codeInput').value = item.code;
        document.getElementById('output').innerHTML = marked.parse(item.response); 
        document.body.className = item.theme; // Restore the saved theme!
    }
}