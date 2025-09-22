// The Forbidden Sector - Scene 65
// Interactive JavaScript with authentication

// Help command to redirect to riddles
const HELP_COMMAND = 'help';
let userInput = '';
let sequenceTimeout;
let sessionId = '';

// DOM elements
const forbiddenPage = document.getElementById('forbidden-page');
const hiddenSite = document.getElementById('hidden-site');
const hint = document.getElementById('hint');
const authButton = document.getElementById('auth-button');

// Initialize the application
function init() {
    setupEventListeners();
    updateHintPeriodically();
    createSession();
}

// Create a session for challenge tracking
async function createSession() {
    try {
        const response = await fetch('/create_session', { method: 'POST' });
        const data = await response.json();
        sessionId = data.session_id;
    } catch (error) {
        console.error('Failed to create session:', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Keyboard input for secret sequence
    document.addEventListener('keydown', handleKeyDown);
    
    // Authentication button
    if (authButton) {
        authButton.addEventListener('click', createAuthDialog);
    }
}

// Handle keyboard input for help command
function handleKeyDown(event) {
    // Only process if on forbidden page
    if (hiddenSite.style.display !== 'none') return;
    
    const char = event.key.toLowerCase();
    
    // Clear previous timeout
    clearTimeout(sequenceTimeout);
    
    // Add character to input
    userInput += char;
    
    // Check if input matches start of help command
    if (HELP_COMMAND.startsWith(userInput)) {
        // If complete match, redirect to info page
        if (userInput === HELP_COMMAND) {
            redirectToInfoPage();
            userInput = '';
            return;
        }
        
        // Set timeout to clear input after 2 seconds of inactivity
        sequenceTimeout = setTimeout(() => {
            userInput = '';
        }, 2000);
    } else {
        // Reset input if no match
        userInput = '';
    }
}

// Redirect to info page with riddles
function redirectToInfoPage() {
    loadDynamicContent('/content/help');
}

// Load dynamic content into the page
async function loadDynamicContent(endpoint, sessionIdParam = null) {
    try {
        let url = endpoint;
        if (sessionIdParam) {
            url += `?session_id=${sessionIdParam}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Authentication required for this content');
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Replace body content with new content
        document.body.innerHTML = data.html;
        
        // Add CSS link to head if not present
        if (!document.querySelector('link[href="style.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'style.css';
            document.head.appendChild(link);
        }
        
        // Initialize challenge handling for info page
        if (endpoint === '/content/help') {
            initializeChallengeHandling();
        }
    } catch (error) {
        console.error('Failed to load content:', error);
    }
}

// Initialize challenge handling for the info page
function initializeChallengeHandling() {
    // Server-side challenge tracking - remove client-side count
    function updateProgress(serverChallengeCount) {
        const progressFill = document.getElementById('progressFill');
        const challengeCount = document.getElementById('challengeCount');
        if (progressFill && challengeCount) {
            const percentage = (serverChallengeCount / 5) * 100;
            progressFill.style.width = percentage + '%';
            challengeCount.textContent = serverChallengeCount;
        }
    }
    
    // Animate challenge boxes
    const challengeBoxes = document.querySelectorAll('.challenge-box');
    challengeBoxes.forEach((box, index) => {
        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(20px)';
            box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            setTimeout(() => {
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
    
    // Glitch effect
    const glitchText = document.getElementById('glitchText');
    if (glitchText) {
        setInterval(() => {
            glitchText.classList.add('glitch-active');
            setTimeout(() => {
                glitchText.classList.remove('glitch-active');
            }, 200);
        }, 3000);
    }
    
    // Handle all challenge forms
    document.querySelectorAll('.answer-form').forEach(form => {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            const type = form.getAttribute('data-type');
            const inputs = form.querySelectorAll('input');
            const solutionDiv = form.querySelector('.solution');
            solutionDiv.style.display = 'none';
            let payload = {};
            if (type === 'final') {
                if (inputs.length < 2) return;
                payload = { type: 'final', username: inputs[0].value, password: inputs[1].value, session_id: sessionId };
            } else {
                payload = { type, value: inputs[0].value, session_id: sessionId };
            }
            try {
                const response = await fetch('/check_answer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.correct) {
                    // Hide the input fields and submit button, but keep the form visible for the success message
                    inputs.forEach(input => input.style.display = 'none');
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.style.display = 'none';
                    
                    solutionDiv.innerHTML = '<strong>✅ Correct!</strong>';
                    solutionDiv.style.display = 'block';
                    
                    // Update progress using server-side count
                    updateProgress(result.challenge_count || 0);
                    
                    if (type === 'final') {
                        setTimeout(() => {
                            const credentialsSummary = document.getElementById('credentialsSummary');
                            if (credentialsSummary) {
                                credentialsSummary.style.display = 'block';
                                credentialsSummary.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 1000);
                    }
                } else {
                    inputs.forEach(input => {
                        input.value = '';
                        input.placeholder = 'Try again!';
                        input.classList.add('wrong');
                    });
                    setTimeout(() => inputs.forEach(input => input.classList.remove('wrong')), 800);
                }
            } catch (err) {
                solutionDiv.innerHTML = '<span style="color:red">Server error. Try again.</span>';
                solutionDiv.style.display = 'block';
            }
        });
    });
}

// Create authentication dialog
function createAuthDialog() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #1a1a1a;
        border: 2px solid #ff4444;
        border-radius: 8px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
        font-family: 'Courier New', monospace;
    `;
    
    dialog.innerHTML = `
        <h3 style="color: #ff4444; text-align: center; margin-bottom: 1rem; font-family: 'Courier New', monospace; font-size: 1.2rem;">
            🔐 AUTHENTICATION REQUIRED
        </h3>
        <p style="color: #fff; text-align: center; margin-bottom: 1.5rem; font-size: 0.9rem;">
            Enter your expedition credentials to access the forbidden sector:
        </p>
        <form id="authForm">
            <div style="margin-bottom: 1rem;">
                <label style="color: #ffaa44; display: block; margin-bottom: 0.5rem; font-family: 'Courier New', monospace; font-size: 0.9rem;">Username:</label>
                <input type="text" id="username" style="width: 100%; padding: 0.5rem; background: #000; color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-family: 'Courier New', monospace;" required>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <label style="color: #ffaa44; display: block; margin-bottom: 0.5rem; font-family: 'Courier New', monospace; font-size: 0.9rem;">Password:</label>
                <input type="password" id="password" style="width: 100%; padding: 0.5rem; background: #000; color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-family: 'Courier New', monospace;" required>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button type="submit" style="background: #ff4444; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold; font-size: 0.9rem;">ACCESS</button>
                <button type="button" id="cancelAuth" style="background: #666; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold; font-size: 0.9rem;">CANCEL</button>
            </div>
        </form>
        <div id="authError" style="color: #ff4444; text-align: center; margin-top: 1rem; display: none; font-size: 0.9rem;"></div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Focus on username field
    setTimeout(() => document.getElementById('username').focus(), 100);
    
    // Handle form submission
    document.getElementById('authForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('authError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        try {
            const response = await fetch('/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            
            if (result.authenticated) {
                // Store the authenticated session ID
                sessionId = result.session_id;
                document.body.removeChild(modal);
                unlockHiddenSite();
            } else {
                errorDiv.textContent = result.error || 'Invalid credentials - access denied';
                errorDiv.style.display = 'block';
                // Clear the form
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('username').focus();
            }
        } catch (err) {
            errorDiv.textContent = 'Connection failed - try again';
            errorDiv.style.display = 'block';
        }
    });
    
    // Handle cancel
    document.getElementById('cancelAuth').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Unlock the hidden site
function unlockHiddenSite() {
    loadDynamicContent('/content/authenticated', sessionId);
    
    // Play unlock sound effect
    playUnlockSound();
}

// Update hint text periodically
// TODO: Add easier hints
function updateHintPeriodically() {
    const hints = [
        "Try type something. Anything...",
        "There might be ways to find assistance...",
        "Some commands might provide direction...",
        "If stuck, one might ask for assistance...",
        "The wise explorer knows when to seek aid...",
        "Remember, help is often just a command away...",
        "H.E.L.P. Hmm, just a thought...",
        "Four letters, one word, starts with H. Just saying...",
        "Maybe you could try look into script.js...",
        "HkddndEhdhdhLhdeahP. Just kidding, or am I?",
        "Come on, it's not that hard...",
        "The answer is RIGHT in front of you...",
        "The source is on GitHub, if you know where to look..."
    ];
    
    let currentHint = 0;
    
    setInterval(() => {
        if (hint && forbiddenPage.style.display !== 'none') {
            hint.innerHTML = `<small>${hints[currentHint]}</small>`;
            currentHint = (currentHint + 1) % hints.length;
        }
    }, 4000);
}

// Play unlock sound effect (simple beep using Web Audio API)
function playUnlockSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Audio context might not be supported
        console.log('Audio not supported');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);