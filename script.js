// The Forbidden Sector - Scene 65
// Interactive JavaScript with authentication

// Help command to redirect to riddles
const HELP_COMMAND = 'help';
let userInput = '';
let sequenceTimeout;

// DOM elements
const forbiddenPage = document.getElementById('forbidden-page');
const hiddenSite = document.getElementById('hidden-site');
const hint = document.getElementById('hint');
const authButton = document.getElementById('auth-button');

// Initialize the application
function init() {
    setupEventListeners();
    updateHintPeriodically();
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
    window.location.href = '/info.html';
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
    forbiddenPage.style.display = 'none';
    hiddenSite.style.display = 'block';
    
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
    }, 3000);
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