// The Forbidden Sector - Scene 65
// Interactive JavaScript for the hidden website

// Secret sequence to unlock the hidden site
const SECRET_SEQUENCE = 'forbidden';
let userInput = '';
let sequenceTimeout;

// Konami code sequence
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiInput = [];

// DOM elements
const forbiddenPage = document.getElementById('forbidden-page');
const hiddenSite = document.getElementById('hidden-site');
const hint = document.getElementById('hint');
const fileModal = document.getElementById('file-modal');
const modalBody = document.getElementById('modal-body');

// Navigation elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.secret-section');

// Sound effects (using Web Audio API)
let audioContext;

// Initialize the application
function init() {
    setupEventListeners();
    initAudioContext();
    updateHintPeriodically();
}

// Setup all event listeners
function setupEventListeners() {
    // Keyboard input for secret sequence
    document.addEventListener('keydown', handleKeyDown);
    
    // Navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
            btn.classList.add('active');
            navButtons.forEach(other => {
                if (other !== btn) other.classList.remove('active');
            });
        });
    });

    // Modal close event
    window.addEventListener('click', (e) => {
        if (e.target === fileModal) {
            closeModal();
        }
    });

    // Self-destruct button with confirmation
    document.getElementById('self-destruct').addEventListener('click', selfDestruct);

    // Add some interactive terminal commands
    setupTerminalInteractivity();
}

// Handle keyboard input
function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Check for Konami code
    handleKonamiCode(event.code);
    
    // Handle secret sequence input only on forbidden page
    if (!hiddenSite.classList.contains('revealed')) {
        userInput += key;
        
        // Clear timeout if it exists
        if (sequenceTimeout) {
            clearTimeout(sequenceTimeout);
        }
        
        // Set timeout to reset input after 3 seconds of inactivity
        sequenceTimeout = setTimeout(() => {
            userInput = '';
        }, 3000);
        
        // Keep only the last characters needed for the sequence
        if (userInput.length > SECRET_SEQUENCE.length) {
            userInput = userInput.slice(-SECRET_SEQUENCE.length);
        }
        
        // Check if sequence matches
        if (userInput === SECRET_SEQUENCE) {
            unlockHiddenSite();
        }
        
        // Visual feedback for typing
        if (key.match(/[a-z]/)) {
            addTypingEffect();
        }
    }
}

// Handle Konami code input
function handleKonamiCode(code) {
    konamiInput.push(code);
    
    // Keep only the last 10 inputs
    if (konamiInput.length > KONAMI_CODE.length) {
        konamiInput.shift();
    }
    
    // Check if Konami code matches
    if (konamiInput.length === KONAMI_CODE.length) {
        const matches = konamiInput.every((code, index) => code === KONAMI_CODE[index]);
        if (matches) {
            triggerKonamiEffect();
            konamiInput = [];
        }
    }
}

// Unlock the hidden site with animation
function unlockHiddenSite() {
    playSound('unlock');
    
    // Add glitch effect to forbidden page
    forbiddenPage.classList.add('shake');
    
    setTimeout(() => {
        forbiddenPage.classList.add('hidden');
        hiddenSite.style.display = 'block';
        
        setTimeout(() => {
            hiddenSite.classList.add('revealed');
            playSound('welcome');
            showUnlockMessage();
        }, 500);
    }, 1000);
}

// Show unlock message
function showUnlockMessage() {
    const accessGranted = document.querySelector('.access-granted');
    accessGranted.style.opacity = '0';
    
    setTimeout(() => {
        accessGranted.style.opacity = '1';
        accessGranted.style.overflow = 'hidden';
        accessGranted.style.whiteSpace = 'nowrap';
        accessGranted.style.borderRight = '2px solid #00ff88';
        
        // Type writer effect
        let text = accessGranted.textContent;
        accessGranted.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            accessGranted.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(typeInterval);
                accessGranted.style.borderRight = 'none';
            }
        }, 100);
    }, 1000);
}

// Switch between sections
function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        playSound('switch');
    }
}

// File system interactions
function openFile(fileName) {
    const files = {
        'project-x': {
            title: 'PROJECT X - CLASSIFIED',
            content: `
                <div class="file-content">
                    <h3>🔒 ULTRA SECRET CLEARANCE REQUIRED</h3>
                    <div class="classified-stamp">CLASSIFIED</div>
                    <p><strong>Project Codename:</strong> X-Factor</p>
                    <p><strong>Status:</strong> Active</p>
                    <p><strong>Location:</strong> [REDACTED]</p>
                    <hr>
                    <p>Subject demonstrates unprecedented abilities including:</p>
                    <ul>
                        <li>Molecular manipulation at quantum level</li>
                        <li>Temporal displacement (limited)</li>
                        <li>Consciousness projection</li>
                        <li>[DATA CORRUPTED]</li>
                    </ul>
                    <p><em>Warning: Subject has breached containment 3 times.</em></p>
                    <div class="danger-box">
                        <strong>⚠️ CONTAINMENT PROTOCOL OMEGA IN EFFECT ⚠️</strong>
                    </div>
                </div>
            `
        },
        'alien-contact': {
            title: 'FIRST CONTACT LOG',
            content: `
                <div class="file-content">
                    <h3>👽 XENOLOGICAL CONTACT REPORT</h3>
                    <p><strong>Date:</strong> 2024-01-15 03:33:33 UTC</p>
                    <p><strong>Location:</strong> Sector 65, Grid Reference: X-999</p>
                    <p><strong>Contact Type:</strong> Peaceful Exchange</p>
                    <hr>
                    <div class="transmission">
                        <h4>TRANSMISSION LOG:</h4>
                        <p><strong>THEM:</strong> "Greetings, inhabitants of the third planet."</p>
                        <p><strong>US:</strong> "Welcome to Earth. We come in peace."</p>
                        <p><strong>THEM:</strong> "We have been observing. Your species shows promise."</p>
                        <p><strong>US:</strong> "What is your purpose here?"</p>
                        <p><strong>THEM:</strong> "To prevent the extinction event. The timeline must be preserved."</p>
                        <p><strong>US:</strong> "What extinction event?"</p>
                        <p><strong>THEM:</strong> "The one that hasn't happened yet. Guard the forbidden sector."</p>
                    </div>
                    <p><em>Contact terminated at 03:47:12 UTC. No further communication attempted.</em></p>
                </div>
            `
        },
        'time-travel': {
            title: 'TEMPORAL RESEARCH DATA',
            content: `
                <div class="file-content">
                    <h3>⏰ CHRONOS PROJECT FINDINGS</h3>
                    <p><strong>Research Lead:</strong> Dr. Sarah Chen</p>
                    <p><strong>Classification:</strong> Time Sensitive</p>
                    <hr>
                    <h4>Key Discoveries:</h4>
                    <ol>
                        <li>Time is not linear but exists in quantum layers</li>
                        <li>Consciousness can navigate between temporal states</li>
                        <li>Paradoxes create alternate reality branches</li>
                        <li>The "Bootstrap Effect" has been successfully replicated</li>
                    </ol>
                    <div class="time-equation">
                        <h4>Temporal Displacement Formula:</h4>
                        <code>Δt = (ψ² × c³) / (E × h)</code>
                        <p>Where ψ = consciousness coefficient</p>
                    </div>
                    <div class="warning-box">
                        <strong>⚠️ WARNING:</strong> Under no circumstances should this technology be used to prevent past events. The temporal paradox could unravel reality itself.
                    </div>
                    <p><em>Last entry: "I've seen the future. We must protect the forbidden sector at all costs. -Dr. Chen (2087)"</em></p>
                </div>
            `
        },
        'quantum': {
            title: 'QUANTUM TECHNOLOGY SPECS',
            content: `
                <div class="file-content">
                    <h3>⚛️ QUANTUM MANIPULATION DEVICE</h3>
                    <p><strong>Version:</strong> QMD-7.42</p>
                    <p><strong>Status:</strong> Prototype Phase</p>
                    <hr>
                    <h4>Technical Specifications:</h4>
                    <ul>
                        <li><strong>Quantum Entanglement Range:</strong> 50 light-years</li>
                        <li><strong>Particle Manipulation Precision:</strong> Planck scale</li>
                        <li><strong>Energy Requirements:</strong> 1.21 Gigawatts</li>
                        <li><strong>Side Effects:</strong> Minor reality distortions</li>
                    </ul>
                    <div class="quantum-code">
                        <h4>Initialization Sequence:</h4>
                        <pre>
quantum.initialize();
reality.suspend(0.001);
particles.entangle(target, destination);
consciousness.bridge();
reality.resume();
                        </pre>
                    </div>
                    <p><strong>Test Results:</strong> Subject successfully teleported 3.7 meters. Minor side effect: Subject aged 0.3 seconds due to temporal displacement.</p>
                    <div class="success-box">
                        ✅ Project approved for Phase 2 testing
                    </div>
                </div>
            `
        }
    };

    const file = files[fileName];
    if (file) {
        modalBody.innerHTML = `
            <h2>${file.title}</h2>
            ${file.content}
        `;
        fileModal.style.display = 'block';
        playSound('fileOpen');
    }
}

// Close modal
function closeModal() {
    fileModal.style.display = 'none';
    playSound('close');
}

// Easter egg functions
function triggerEgg(eggType) {
    switch (eggType) {
        case 'konami':
            showKonamiMessage();
            break;
        case 'matrix':
            triggerMatrixEffect();
            break;
        case 'coffee':
            showCoffeeMessage();
            break;
        case 'space':
            triggerSpaceInvaderMode();
            break;
    }
    playSound('easterEgg');
}

// Konami code effect
function triggerKonamiEffect() {
    document.body.style.transform = 'rotate(360deg)';
    document.body.style.transition = 'transform 2s ease-in-out';
    
    setTimeout(() => {
        document.body.style.transform = 'rotate(0deg)';
        alert('🎮 30 LIVES ACTIVATED! (Just kidding, this is a website)');
    }, 2000);
    
    setTimeout(() => {
        document.body.style.transition = '';
    }, 4000);
}

function showKonamiMessage() {
    alert('🎮 Try entering the actual Konami code: ↑↑↓↓←→←→BA');
}

function triggerMatrixEffect() {
    const choice = confirm('Take the red pill (OK) or the blue pill (Cancel)?');
    if (choice) {
        // Red pill - show "reality"
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        setTimeout(() => {
            alert('Welcome to the real world, Neo.');
            document.body.style.filter = '';
        }, 3000);
    } else {
        // Blue pill - return to normal
        alert('You chose to stay in wonderland. The story ends here.');
    }
}

function showCoffeeMessage() {
    alert('☕ Error 418: I\'m a teapot. This device cannot brew coffee. Please try again with proper tea-making equipment.');
}

function triggerSpaceInvaderMode() {
    // Create temporary space invader effect
    const invader = document.createElement('div');
    invader.innerHTML = '👾';
    invader.style.position = 'fixed';
    invader.style.top = '10px';
    invader.style.left = '10px';
    invader.style.fontSize = '2rem';
    invader.style.zIndex = '9999';
    invader.style.animation = 'moveInvader 3s linear infinite';
    
    // Add keyframes for invader movement
    const style = document.createElement('style');
    style.textContent = `
        @keyframes moveInvader {
            0% { transform: translate(0, 0); }
            25% { transform: translate(200px, 100px); }
            50% { transform: translate(400px, 0); }
            75% { transform: translate(200px, -100px); }
            100% { transform: translate(0, 0); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(invader);
    
    setTimeout(() => {
        document.body.removeChild(invader);
        document.head.removeChild(style);
        alert('🚀 Space Invader destroyed! +100 points');
    }, 3000);
}

// Self destruct sequence
function selfDestruct() {
    const confirmation = confirm('⚠️ DANGER ⚠️\n\nAre you sure you want to initiate the self-destruct sequence?\n\nThis will return you to the forbidden page.');
    
    if (confirmation) {
        const countdown = confirm('Final warning: This action cannot be undone. Proceed with self-destruct?');
        
        if (countdown) {
            // Start countdown
            let count = 5;
            const countdownInterval = setInterval(() => {
                document.body.style.background = count % 2 === 0 ? '#ff0000' : '#000000';
                
                if (count > 0) {
                    alert(`💥 SELF DESTRUCT IN ${count}...`);
                    count--;
                } else {
                    clearInterval(countdownInterval);
                    
                    // Reset to forbidden page
                    hiddenSite.classList.remove('revealed');
                    forbiddenPage.classList.remove('hidden');
                    hiddenSite.style.display = 'none';
                    document.body.style.background = '';
                    userInput = '';
                    
                    setTimeout(() => {
                        alert('💥 BOOM! The hidden sector has been destroyed. The secret sequence has been reset.');
                    }, 500);
                }
            }, 1000);
        }
    }
}

// Terminal interactivity
function setupTerminalInteractivity() {
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.addEventListener('click', () => {
            const newCommand = prompt('Enter a command (try: help, date, whoami, cat, hack):');
            if (newCommand) {
                executeTerminalCommand(newCommand.toLowerCase().trim());
            }
        });
    }
}

function executeTerminalCommand(command) {
    const terminalBody = document.querySelector('.terminal-body');
    const newLine = document.createElement('div');
    newLine.className = 'terminal-line';
    newLine.innerHTML = `<span class="prompt">sector-65@forbidden:~$</span> <span class="command">${command}</span>`;
    
    const output = document.createElement('div');
    output.className = 'terminal-output';
    
    switch (command) {
        case 'help':
            output.innerHTML = 'Available commands: help, date, whoami, cat, hack, clear, matrix, exit';
            break;
        case 'date':
            output.innerHTML = new Date().toString();
            break;
        case 'whoami':
            output.innerHTML = 'forbidden_user';
            break;
        case 'cat forbidden.txt':
        case 'cat':
            output.innerHTML = 'You have successfully infiltrated Sector 65.<br>Mission: Protect the timeline.<br>Status: CLASSIFIED';
            break;
        case 'hack':
            output.innerHTML = 'Hacking mainframe...<br>Access granted to ULTRA_SECRET files.<br>Welcome, Agent.';
            break;
        case 'clear':
            terminalBody.innerHTML = `
                <div class="terminal-line">
                    <span class="prompt">sector-65@forbidden:~$</span>
                    <span class="command cursor-blink">_</span>
                </div>
            `;
            return;
        case 'matrix':
            output.innerHTML = 'Loading Matrix protocol...<br>Reality.exe has stopped working.<br>Wake up, Neo.';
            break;
        case 'exit':
            output.innerHTML = 'You cannot exit the forbidden sector. You are part of it now.';
            break;
        default:
            output.innerHTML = `Command not found: ${command}<br>Type 'help' for available commands.`;
    }
    
    // Remove cursor blink from last line
    const lastCursor = terminalBody.querySelector('.cursor-blink');
    if (lastCursor) {
        lastCursor.classList.remove('cursor-blink');
    }
    
    // Insert before the last line (cursor line)
    const cursorLine = terminalBody.lastElementChild;
    terminalBody.insertBefore(newLine, cursorLine);
    terminalBody.insertBefore(output, cursorLine);
    
    playSound('terminal');
}

// Audio functions
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playSound(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency;
    let duration;
    
    switch (type) {
        case 'unlock':
            frequency = 880;
            duration = 0.5;
            break;
        case 'welcome':
            frequency = 440;
            duration = 1;
            break;
        case 'switch':
            frequency = 660;
            duration = 0.2;
            break;
        case 'fileOpen':
            frequency = 550;
            duration = 0.3;
            break;
        case 'close':
            frequency = 330;
            duration = 0.2;
            break;
        case 'easterEgg':
            frequency = 800;
            duration = 0.4;
            break;
        case 'terminal':
            frequency = 400;
            duration = 0.1;
            break;
        default:
            frequency = 440;
            duration = 0.2;
    }
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Visual effects
function addTypingEffect() {
    hint.classList.add('flash');
    setTimeout(() => {
        hint.classList.remove('flash');
    }, 300);
}

// Update hint periodically
function updateHintPeriodically() {
    const hints = [
        "Perhaps some secrets lie hidden in the shadows...",
        "Try typing something... anything...",
        "The forbidden holds many secrets...",
        "What if you spelled out the forbidden word?",
        "F-O-R-B-I-D-D-E-N... just a thought...",
        "Sometimes the answer is in the name itself..."
    ];
    
    let hintIndex = 0;
    setInterval(() => {
        hint.querySelector('small').textContent = hints[hintIndex];
        hintIndex = (hintIndex + 1) % hints.length;
    }, 10000);
}

// Easter egg: Add secret mouse pattern detection
let mousePattern = [];
document.addEventListener('mousemove', (e) => {
    if (!hiddenSite.classList.contains('revealed')) {
        mousePattern.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        
        // Keep only last 20 movements
        if (mousePattern.length > 20) {
            mousePattern.shift();
        }
        
        // Check for circular pattern
        if (mousePattern.length >= 10) {
            const isCircular = checkCircularPattern();
            if (isCircular) {
                hint.innerHTML = '<small style="color: #ff8800;">🎯 Nice circular motion! Keep trying different patterns...</small>';
                mousePattern = [];
            }
        }
    }
});

function checkCircularPattern() {
    if (mousePattern.length < 10) return false;
    
    const centerX = mousePattern.reduce((sum, point) => sum + point.x, 0) / mousePattern.length;
    const centerY = mousePattern.reduce((sum, point) => sum + point.y, 0) / mousePattern.length;
    
    let isCircular = true;
    const radius = Math.sqrt(Math.pow(mousePattern[0].x - centerX, 2) + Math.pow(mousePattern[0].y - centerY, 2));
    
    for (let point of mousePattern) {
        const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
        if (Math.abs(distance - radius) > 50) {
            isCircular = false;
            break;
        }
    }
    
    return isCircular;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some additional keyboard shortcuts for power users
document.addEventListener('keydown', (e) => {
    // Ctrl + Shift + D for debug mode
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        console.log('🔍 Debug mode activated');
        console.log('Secret sequence:', SECRET_SEQUENCE);
        console.log('Current input:', userInput);
        console.log('Konami progress:', konamiInput.length + '/' + KONAMI_CODE.length);
    }
    
    // Escape key to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add a secret developer console command
window.cheat = function() {
    console.log('🎮 Cheat activated: Auto-unlock enabled');
    unlockHiddenSite();
};

// Export for potential module use
window.ForbiddenSector = {
    unlock: unlockHiddenSite,
    triggerEgg: triggerEgg,
    switchSection: switchSection
};