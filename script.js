document.addEventListener('DOMContentLoaded', function() {
    const loadingLines = document.querySelectorAll('.loading-line');
    const warningMessage = document.querySelector('.warning-message');
    const helpLink = document.querySelector('.help-link');
    
    // Animate loading sequence
    loadingLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateX(0)';
        }, index * 800);
    });
    
    // Show warning message after loading
    setTimeout(() => {
        warningMessage.style.opacity = '1';
        warningMessage.style.transform = 'translateY(0)';
    }, loadingLines.length * 800 + 500);
    
    // Show help link after warning
    setTimeout(() => {
        helpLink.style.opacity = '1';
        helpLink.style.transform = 'translateY(0)';
    }, loadingLines.length * 800 + 1500);
    
    // Add authentication button after everything loads
    setTimeout(() => {
        addAuthenticationPrompt();
    }, loadingLines.length * 800 + 2500);
    
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 1000);
    }
    
    // Add glitch effect to ASCII art occasionally
    const asciiArt = document.querySelector('.ascii-art');
    if (asciiArt) {
        setInterval(() => {
            if (Math.random() < 0.25) { // 25% chance every 3 seconds
                asciiArt.classList.add('glitch');
                setTimeout(() => {
                    asciiArt.classList.remove('glitch');
                }, 200);
            }
        }, 3000);
    }
    
    // typing effect to the terminal title
    const terminalTitle = document.querySelector('.terminal-title');
    const originalText = terminalTitle.textContent;
    terminalTitle.textContent = '';
    
    let i = 0;
    function typeTitle() {
        if (i < originalText.length) {
            terminalTitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeTitle, 100);
        }
    }
    
    setTimeout(typeTitle, 1000);
    
    // easter egg reveal (this would be triggered by the server when auth succeeds) at least i really hope so. cannot test bc on mobile
    window.revealEasterEgg = function() {
        const easterEggContent = document.getElementById('easterEggContent');
        const warningMessage = document.querySelector('.warning-message');
        
        if (easterEggContent && warningMessage) {
            warningMessage.style.display = 'none';
            easterEggContent.style.display = 'block';
            easterEggContent.style.opacity = '1';
            easterEggContent.style.transform = 'translateY(0)';
        }
    };
});

function addAuthenticationPrompt() {
    const warningMessage = document.querySelector('.warning-message');
    
    // Add an authentication button to the warning message
    const authButton = document.createElement('button');
    authButton.textContent = '🔐 ATTEMPT AUTHENTICATION';
    authButton.className = 'auth-button';
    authButton.style.cssText = `
        background: #e74c3c;
        color: #fff;
        border: none;
        padding: 1rem 2rem;
        margin-top: 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
        font-weight: bold;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
        display: block;
        margin: 1rem auto 0;
    `;
    
    authButton.addEventListener('click', function() {
        // Create a simple form-based authentication instead of HTTP Basic Auth
        createAuthDialog();
    });
    
    const authRequired = warningMessage.querySelector('.auth-required');
    authRequired.appendChild(authButton);
}

function revealEasterEgg() {
    const easterEggContent = document.getElementById('easterEggContent');
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
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: #1a1a1a;
        border: 2px solid #e74c3c;
        border-radius: 8px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
    `;
    
    dialog.innerHTML = `
        <h3 style="color: #e74c3c; text-align: center; margin-bottom: 1rem; font-family: 'Share Tech Mono', monospace;">
            🔐 AUTHENTICATION REQUIRED
        </h3>
        <p style="color: #fff; text-align: center; margin-bottom: 1.5rem;">
            Enter your expedition credentials to access the forbidden sector:
        </p>
        <form id="authForm">
            <div style="margin-bottom: 1rem;">
                <label style="color: #f39c12; display: block; margin-bottom: 0.5rem; font-family: 'Share Tech Mono', monospace;">Username:</label>
                <input type="text" id="username" style="width: 100%; padding: 0.5rem; background: #000; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; font-family: 'Share Tech Mono', monospace;" required>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <label style="color: #f39c12; display: block; margin-bottom: 0.5rem; font-family: 'Share Tech Mono', monospace;">Password:</label>
                <input type="password" id="password" style="width: 100%; padding: 0.5rem; background: #000; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; font-family: 'Share Tech Mono', monospace;" required>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button type="submit" style="background: #2ecc40; color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-family: 'Share Tech Mono', monospace; font-weight: bold;">ACCESS</button>
                <button type="button" id="cancelAuth" style="background: #95a5a6; color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-family: 'Share Tech Mono', monospace; font-weight: bold;">CANCEL</button>
            </div>
        </form>
        <div id="authError" style="color: #e74c3c; text-align: center; margin-top: 1rem; display: none;"></div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    // Focus on username field
    setTimeout(() => document.getElementById('username').focus(), 100);
    
    // Handle form submission (server-side auth)
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
                revealEasterEgg();
            } else {
                if (result.error) {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                } else {
                    window.location.href = '/info.html';
                }
            }
        } catch (err) {
            errorDiv.textContent = 'Server error. Please try again.';
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