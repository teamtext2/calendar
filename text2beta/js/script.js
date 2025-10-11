document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT CACHING ---
    const elements = {
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        searchResults: document.getElementById('searchResults'),
        notificationBtn: document.querySelector('.taskbar-icon[title="Notifications"]'),
        settingsBtn: document.querySelector('.taskbar-icon[title="Settings"]'),
        refreshBtn: document.getElementById('refreshButton'),
        installPWAButtons: document.querySelectorAll('#installPWA, #settingsInstallPWA'),
        // ... (add other elements here as you refactor)
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        sidebarClose: document.getElementById('sidebarClose'),
        showMoreMainAppsBtn: document.getElementById('showMoreMainApps'),
        mainAppsContainer: document.getElementById('mainApps'),
        socialMediaContainer: document.getElementById('socialMediaApps'),
    };

    // --- STATE MANAGEMENT ---
    let deferredPrompt;
    const APPS_PER_PAGE = 12;

    // --- FUNCTIONS ---

    /**
     * Toggles the sidebar visibility.
     * @param {boolean} show - True to show, false to hide.
     */
    const toggleSidebar = (show) => {
        if (show) {
            elements.sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            elements.sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    /**
     * Performs a search and filters the app icons.
     */
    const performSearch = () => {
        const query = elements.searchInput.value.trim().toLowerCase();
        const apps = elements.mainAppsContainer.querySelectorAll('.icon');
        let matchFound = false;

        apps.forEach(app => {
            const appName = app.querySelector('p').textContent.toLowerCase();
            const shouldShow = appName.includes(query);
            app.style.display = shouldShow ? '' : 'none';
            if (shouldShow) matchFound = true;
        });

        if (!matchFound && query) {
            elements.searchResults.innerHTML = '<p>No apps found.</p>';
            elements.searchResults.classList.add('active');
        } else {
            elements.searchResults.classList.remove('active');
        }
    };
    
    /**
     * Manages the visibility of the "Show More" button for apps.
     */
    const manageAppVisibility = () => {
        const apps = Array.from(elements.mainAppsContainer.children);
        if (apps.length <= APPS_PER_PAGE) {
            elements.showMoreMainAppsBtn.style.display = 'none';
            return;
        }

        apps.forEach((app, index) => {
            app.style.display = index < APPS_PER_PAGE ? '' : 'none';
        });

        elements.showMoreMainAppsBtn.style.display = 'inline-flex';
        elements.showMoreMainAppsBtn.addEventListener('click', () => {
            apps.forEach(app => app.style.display = '');
            elements.showMoreMainAppsBtn.style.display = 'none';
        }, { once: true });
    };

    // --- PWA & SERVICE WORKER ---
    
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                .catch(error => console.error('Service Worker registration failed:', error));
        }
    };

    const handleInstallPrompt = (e) => {
        e.preventDefault();
        deferredPrompt = e;
        elements.installPWAButtons.forEach(btn => {
            btn.style.display = 'flex';
        });
    };

    const installPWA = async () => {
        if (!deferredPrompt) {
            alert('The app can\'t be installed right now.');
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
            elements.installPWAButtons.forEach(btn => btn.style.display = 'none');
        }
        deferredPrompt = null;
    };

    // --- EVENT LISTENERS ---

    const initEventListeners = () => {
        // Search
        elements.searchButton.addEventListener('click', performSearch);
        elements.searchInput.addEventListener('input', performSearch);
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        // Sidebar
        elements.sidebarToggle.addEventListener('click', () => toggleSidebar(true));
        elements.sidebarClose.addEventListener('click', () => toggleSidebar(false));
        document.addEventListener('click', (e) => {
            if (elements.sidebar.classList.contains('active') && !elements.sidebar.contains(e.target) && !elements.sidebarToggle.contains(e.target)) {
                toggleSidebar(false);
            }
        });

        // PWA Installation
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        elements.installPWAButtons.forEach(btn => {
            btn.addEventListener('click', installPWA);
        });
        
        // Refresh button
        elements.refreshBtn.addEventListener('click', () => window.location.reload(true));

        // Hide install button if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            elements.installPWAButtons.forEach(btn => btn.style.display = 'none');
        }
    };
    
    // --- INITIALIZATION ---

    manageAppVisibility();
    initEventListeners();
    registerServiceWorker();
});