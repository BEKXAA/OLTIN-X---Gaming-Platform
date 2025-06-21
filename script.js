// Global Variables
let currentUser = null;
let isLoggedIn = false;

// Audio Elements
const coinSound = document.getElementById('coinSound');
const winSound = document.getElementById('winSound');
const caseSound = document.getElementById('caseSound');

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const mainApp = document.getElementById('mainApp');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            checkAuthStatus();
        }, 500);
    }, 2000);
}

function createDefaultUser() {
    currentUser = {
        nickname: 'Player',
        coins: 1000,
        openedCases: 0,
        biggestWin: 0,
        joinDate: new Date().toLocaleDateString(),
        gameHistory: []
    };
    isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
    } else {
        // Create default user if no user exists
        createDefaultUser();
    }
    showMainApp();
    updateUserInterface();
}

function createDefaultUser() {
    currentUser = {
        nickname: 'Player',
        coins: 1000,
        openedCases: 0,
        biggestWin: 0,
        joinDate: new Date().toLocaleDateString(),
        gameHistory: []
    };
    isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function showMainApp() {
    authScreen.style.display = 'none';
    mainApp.style.display = 'flex';
    initializeGames();
}

// Navigation Functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    event.target.closest('.nav-btn').classList.add('active');
    
    // Update interface based on section
    if (section === 'profile') {
        updateProfileSection();
    } else if (section === 'case') {
        updateCaseSection();
    }
}

function logout() {
    // Reset to default user
    createDefaultUser();
    updateUserInterface();
    showNotification('Qayta boshlash!', 'info');
}

// Profile Section
function updateProfileSection() {
    if (!currentUser) return;
    
    document.getElementById('profileNickname').textContent = currentUser.nickname;
    document.getElementById('profileBalance').textContent = currentUser.coins + ' coins';
    document.getElementById('openedCases').textContent = currentUser.openedCases;
    document.getElementById('biggestWin').textContent = currentUser.biggestWin + ' coins';
    document.getElementById('joinDate').textContent = currentUser.joinDate;
    
    updateGameHistory();
}

function updateGameHistory() {
    const historyContainer = document.getElementById('gameHistory');
    
    if (currentUser.gameHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">Hali o\'yin tarixi yo\'q</p>';
        return;
    }
    
    const historyHTML = currentUser.gameHistory
        .slice(-10) // Show last 10 games
        .reverse()
        .map(game => `
            <div class="history-item ${game.result === 'win' ? 'win' : 'lose'}">
                <div class="history-game">${game.game}</div>
                <div class="history-amount">${game.amount} coins</div>
                <div class="history-time">${game.time}</div>
            </div>
        `)
        .join('');
    
    historyContainer.innerHTML = historyHTML;
}

// Case Opening Functions
function updateCaseSection() {
    if (!currentUser) return;
    document.getElementById('caseBalance').textContent = currentUser.coins;
}

function openCase(caseType) {
    if (!currentUser) return;
    
    const casePrices = {
        basic: 1000,
        rare: 500,
        epic: 2000,
        legendary: 1500,
        tekin: 0,
        Neymar:500,
        best: 1000,
        sigma:1000,
        jogn:1000,
        qol:6500,
        Village: 1000
    };
    
    const caseRewards = {
        basic: { min: 1, max: 10000 },
        rare: { min: 5, max: 1000 },
        epic: { min: 100, max: 100000 },
        legendary: { min: 50, max: 50000 },
        tekin: { min: 5, max: 100 },
        Neymar: { min: 1, max: 1000 },
        best: { min: 1, max: 2000 },
        sigma: { min: 5, max: 10000 },
        john: { min: 5, max: 3000 },
        qol: { min: 500, max: 10000 },
        Village: { min: 500, max: 1500 }
    };
    
    const price = casePrices[caseType];
    
    if (currentUser.coins < price) {
        showNotification('Yetarli coin yo\'q!', 'error');
        return;
    }
    
    // Deduct coins
    currentUser.coins -= price;
    
    // Show opening animation
    const caseOpening = document.getElementById('caseOpening');
    caseOpening.style.display = 'flex';
    
    // Play case sound
    caseSound.play().catch(e => console.log('Audio play failed'));
    
    setTimeout(() => {
        caseOpening.style.display = 'none';
        
        // Calculate reward
        const reward = Math.floor(Math.random() * (caseRewards[caseType].max - caseRewards[caseType].min + 1)) + caseRewards[caseType].min;
        
        // Add reward
        currentUser.coins += reward;
        currentUser.openedCases++;
        
        if (reward > currentUser.biggestWin) {
            currentUser.biggestWin = reward;
        }
        
        // Add to history
        addToHistory('Case Opening', reward, 'win');
        
        // Show result
        showCaseResult(reward);
        
        // Update interface
        updateUserInterface();
        updateProfileSection();
        
    }, 3000);
}

function showCaseResult(reward) {
    const caseResult = document.getElementById('caseResult');
    document.getElementById('caseReward').textContent = reward;
    caseResult.style.display = 'flex';
    
    // Play win sound
    winSound.play().catch(e => console.log('Audio play failed'));
    
    setTimeout(() => {
        caseResult.style.display = 'none';
    }, 3000);
}

// Utility Functions
function updateUserInterface() {
    if (!currentUser) return;
    
    document.getElementById('userBalance').textContent = currentUser.coins + ' coins';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function addToHistory(game, amount, result) {
    if (!currentUser) return;
    
    const historyEntry = {
        game: game,
        amount: amount,
        result: result,
        time: new Date().toLocaleString()
    };
    
    currentUser.gameHistory.push(historyEntry);
    
    // Keep only last 50 entries
    if (currentUser.gameHistory.length > 50) {
        currentUser.gameHistory = currentUser.gameHistory.slice(-50);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Auto-save user data every 30 seconds
setInterval(() => {
    if (currentUser) {
        updateUserInterface();
    }
}, 30000);

function initializeGames() {
    // Initialize any necessary game components
}
