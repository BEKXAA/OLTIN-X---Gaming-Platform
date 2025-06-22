// Global Variables
let currentUser = null;
let isLoggedIn = false;
let isDarkMode = false;

// Audio Elements
const coinSound = document.getElementById('coinSound');
const winSound = document.getElementById('winSound');
const caseSound = document.getElementById('caseSound');

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const mainApp = document.getElementById('mainApp');

// LocalStorage Keys
const STORAGE_KEYS = {
    USER: 'oltinX_user',
    THEME: 'oltinX_theme',
    SETTINGS: 'oltinX_settings'
};

// Dark Mode Functions
function initializeTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

function toggleDarkMode() {
    if (isDarkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeIcon').className = 'fas fa-sun';
    isDarkMode = true;
    localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
}

function disableDarkMode() {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeIcon').className = 'fas fa-moon';
    isDarkMode = false;
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize theme
    initializeTheme();
    
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
        gameHistory: [],
        totalWinnings: 0,
        totalSpent: 0,
        lastLogin: new Date().toISOString()
    };
    isLoggedIn = true;
    saveUserData();
}

function saveUserData() {
    if (currentUser) {
        currentUser.lastLogin = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    }
}

function loadUserData() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            return true;
        } catch (error) {
            console.error('Error loading user data:', error);
            return false;
        }
    }
    return false;
}

function checkAuthStatus() {
    if (!loadUserData()) {
        // Create default user if no user exists or data is corrupted
        createDefaultUser();
    }
    showMainApp();
    updateUserInterface();
}

function showMainApp() {
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
    } else if (section === 'inventory') {
        updateInventorySection();
    } else if (section === 'market') {
        updateMarketSection();
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
        .map(game => {
            let resultClass = game.result;
            if (game.result === 'purchase') {
                resultClass = 'purchase';
            }
            return `
                <div class="history-item ${resultClass}">
                    <div class="history-game">${game.game}</div>
                    <div class="history-amount">${game.amount} coins</div>
                    <div class="history-time">${game.time}</div>
                </div>
            `;
        })
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
        epic: 10000,
        legendary: 5000,
        tekin: 0,
        Neymar: 500,
        best: 1000,
        sigma: 1000,
        john: 1000,
        qol: 6500,
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
    currentUser.totalSpent += price;
    
    // Save data immediately after deduction
    saveUserData();
    
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
        currentUser.totalWinnings += reward;
        
        if (reward > currentUser.biggestWin) {
            currentUser.biggestWin = reward;
        }
        
        // Add to history
        addToHistory('Case Opening', reward, 'win');
        
        // Save data after winning
        saveUserData();
        
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

// Market Functions
function updateMarketSection() {
    if (!currentUser) return;
    document.getElementById('marketBalance').textContent = currentUser.coins;
}

function showMarketCategory(category) {
    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.category-btn').classList.add('active');
    
    // Filter items based on category (for now, show all items)
    // In a real implementation, you would filter items based on category
    const marketGrid = document.getElementById('marketGrid');
    const items = marketGrid.querySelectorAll('.market-item');
    
    items.forEach(item => {
        item.style.display = 'block';
    });
    
    // Add category-specific filtering logic here
    if (category !== 'all') {
        // Example filtering (you can expand this based on your needs)
        items.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            if (category === 'skins' && !itemName.includes('skin')) {
                item.style.display = 'none';
            } else if (category === 'weapons' && !itemName.includes('ak') && !itemName.includes('m4') && !itemName.includes('awp') && !itemName.includes('usp') && !itemName.includes('knife')) {
                item.style.display = 'none';
            } else if (category === 'accessories' && !itemName.includes('gloves')) {
                item.style.display = 'none';
            }
        });
    }
}

function buyItem(itemId, price) {
    if (!currentUser) return;
    
    if (currentUser.coins < price) {
        showNotification('Yetarli coin yo\'q!', 'error');
        return;
    }
    
    // Deduct coins
    currentUser.coins -= price;
    currentUser.totalSpent += price;
    
    // Add to inventory (you can expand this)
    if (!currentUser.inventory) {
        currentUser.inventory = [];
    }
    
    const itemName = event.target.closest('.market-item').querySelector('h3').textContent;
    currentUser.inventory.push({
        id: itemId,
        name: itemName,
        price: price,
        purchasedAt: new Date().toISOString()
    });
    
    // Add to history
    addToHistory('Market Purchase', -price, 'purchase');
    
    // Save data
    saveUserData();
    
    // Update interface
    updateUserInterface();
    updateMarketSection();
    updateInventorySection();
    
    // Show success notification
    showNotification(`${itemName} muvaffaqiyatli sotib olindi va inventarga qo'shildi!`, 'success');
    
    // Play purchase sound
    coinSound.play().catch(e => console.log('Audio play failed'));
}

// Utility Functions
function updateUserInterface() {
    if (!currentUser) return;
    
    document.getElementById('userBalance').textContent = currentUser.coins + ' coins';
    saveUserData();
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
    
    // Save data after adding to history
    saveUserData();
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
        saveUserData();
    }
}, 30000);

// Save data before page unload
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        saveUserData();
    }
});

function initializeGames() {
    // Initialize any necessary game components
}

// Inventory Functions
function updateInventorySection() {
    if (!currentUser) return;
    
    // Initialize inventory if it doesn't exist
    if (!currentUser.inventory) {
        currentUser.inventory = [];
    }
    
    // Update inventory count
    document.getElementById('inventoryCount').textContent = currentUser.inventory.length;
    
    // Update inventory grid
    updateInventoryGrid();
}

function updateInventoryGrid() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    
    if (!currentUser.inventory || currentUser.inventory.length === 0) {
        inventoryGrid.innerHTML = `
            <div class="empty-inventory">
                <i class="fas fa-box-open"></i>
                <h3>Inventar bo'sh</h3>
                <p>Marketdan biror narsa sotib oling!</p>
            </div>
        `;
        return;
    }
    
    const inventoryHTML = currentUser.inventory.map(item => {
        const purchaseDate = new Date(item.purchasedAt).toLocaleDateString();
        return `
            <div class="inventory-item">
                <div class="inventory-item-image">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRugVjumU52B7QAbb9oDKyiTq1ZeqQEwNNDKg&s" alt="${item.name}" class="inventory-item-img" onerror="this.style.display='none'">
                </div>
                <div class="inventory-item-info">
                    <h3>${item.name}</h3>
                    <p class="inventory-item-description">Sotib olingan buyum</p>
                    <div class="inventory-item-details">
                        <span class="inventory-item-price">${item.price} coins</span>
                        <span class="inventory-item-date">${purchaseDate}</span>
                    </div>
                    <div class="inventory-item-actions">
                        <button class="inventory-btn" onclick="sellItem('${item.id}')">
                            <i class="fas fa-coins"></i>
                            <span>Sotish</span>
                        </button>
                        <button class="inventory-btn primary" onclick="useItem('${item.id}')">
                            <i class="fas fa-play"></i>
                            <span>Ishlatish</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    inventoryGrid.innerHTML = inventoryHTML;
}

function showInventoryCategory(category) {
    // Update active category button
    document.querySelectorAll('.inventory-categories .category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.category-btn').classList.add('active');
    
    // Filter inventory items based on category
    const inventoryGrid = document.getElementById('inventoryGrid');
    const items = inventoryGrid.querySelectorAll('.inventory-item');
    
    if (!currentUser.inventory || currentUser.inventory.length === 0) {
        return;
    }
    
    items.forEach(item => {
        item.style.display = 'block';
    });
    
    if (category !== 'all') {
        items.forEach((item, index) => {
            const inventoryItem = currentUser.inventory[index];
            if (inventoryItem) {
                const itemName = inventoryItem.name.toLowerCase();
                if (category === 'skins' && !itemName.includes('skin')) {
                    item.style.display = 'none';
                } else if (category === 'weapons' && !itemName.includes('ak') && !itemName.includes('m4') && !itemName.includes('awp') && !itemName.includes('usp')) {
                    item.style.display = 'none';
                } else if (category === 'accessories' && !itemName.includes('gloves') && !itemName.includes('knife')) {
                    item.style.display = 'none';
                }
            }
        });
    }
}

function sellItem(itemId) {
    if (!currentUser || !currentUser.inventory) return;
    
    const itemIndex = currentUser.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const item = currentUser.inventory[itemIndex];
    const sellPrice = Math.floor(item.price * 0.7); // Sell for 70% of original price
    
    // Remove from inventory
    currentUser.inventory.splice(itemIndex, 1);
    
    // Add coins
    currentUser.coins += sellPrice;
    
    // Add to history
    addToHistory('Item Sold', sellPrice, 'win');
    
    // Save data
    saveUserData();
    
    // Update interface
    updateUserInterface();
    updateInventorySection();
    
    // Show notification
    showNotification(`${item.name} ${sellPrice} coinsga sotildi!`, 'success');
    
    // Play sound
    coinSound.play().catch(e => console.log('Audio play failed'));
}

function useItem(itemId) {
    if (!currentUser || !currentUser.inventory) return;
    
    const item = currentUser.inventory.find(item => item.id === itemId);
    if (!item) return;
    
    // Show notification
    showNotification(`${item.name} ishlatildi!`, 'success');
    
    // Play sound
    winSound.play().catch(e => console.log('Audio play failed'));
}
