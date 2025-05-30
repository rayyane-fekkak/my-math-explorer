
let attemptedOnline = false;
let attemptedOffline = false;
const LIB_MODE_KEY = 'geo3d_lib_mode';
let currentLibMode = localStorage.getItem(LIB_MODE_KEY) || 'auto';

// Define window-level placeholders for libraries
window.THREE = null;
window.OrbitControls = null; // Actual path will be THREE.OrbitControls
window.anime = null;
window.ANIME_REF = null; // For scripts expecting ANIME_REF


function loadScript(src, isOnline, successCallback, errorCallback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
        console.log(`${src} loaded.`);
        const libStatusElement = document.getElementById('library-status');
        if (isOnline) {
            attemptedOnline = true;
            if (libStatusElement && !libStatusElement.textContent.includes('Error') && !libStatusElement.textContent.includes('Mix')) {
                libStatusElement.textContent = 'Libraries loaded (Online).';
                libStatusElement.className = 'online';
            }
        } else {
            attemptedOffline = true;
            if (libStatusElement && !libStatusElement.textContent.includes('Error') && !libStatusElement.textContent.includes('Mix')) {
                libStatusElement.textContent = 'Libraries loaded (Offline).';
                libStatusElement.className = 'offline';
            }
        }
        successCallback();
    };
    script.onerror = () => {
        console.error(`Failed to load ${src}.`);
        if (isOnline) { attemptedOnline = true; } else { attemptedOffline = true; }
        errorCallback();
    };
    document.head.appendChild(script);
}

function tryLoadLibs(onlineSrc, offlineSrc, isLast, finalSuccess, finalError, appInitializer) {
    const libStatusElement = document.getElementById('library-status');
    const useOnline = currentLibMode === 'online' || (currentLibMode === 'auto' && navigator.onLine);
    const useOffline = currentLibMode === 'offline' || (currentLibMode === 'auto' && !navigator.onLine);
    const libName = onlineSrc.split('/').pop().split('.')[0]; // e.g. "three" or "anime"

    const successHandler = () => {
        finalSuccess(); // Call specific success for this lib (e.g. onAnimeSuccess)
        if (isLast && typeof appInitializer === 'function') {
            // Ensure all critical libraries are actually set on window object
            if (window.THREE && window.THREE.OrbitControls && window.anime) {
                window.ANIME_REF = window.anime; // Set ANIME_REF globally here
                appInitializer(); // This is initializeApp from main.js
            } else {
                console.error("A critical library is missing after load success signal for", libName);
                 if (libStatusElement) {
                    libStatusElement.textContent = 'Error: Critical library not initialized: ' + libName;
                    libStatusElement.className = 'error';
                }
            }
        }
    };
    
    const errorHandler = (primarySourceType, secondarySource, secondaryIsOnline) => {
        const libStatusElement = document.getElementById('library-status'); 
        console.log(`Failed ${primarySourceType} for ${libName}, trying ${secondaryIsOnline ? 'Online' : 'Offline'} fallback.`);
        loadScript(secondarySource, secondaryIsOnline,
            successHandler, // Still call the main success handler chain
            () => { // Fallback error
                if(libStatusElement) {
                    libStatusElement.textContent = `Error: ${libName} not found (Online and Offline attempts failed).`;
                    libStatusElement.className = 'error';
                }
                finalError(); // Call specific error for this lib
            }
        );
    };

    if (useOnline) {
        loadScript(onlineSrc, true, successHandler, () => {
            if (currentLibMode === 'auto' || currentLibMode === 'offline') {
                 errorHandler('Online', offlineSrc, false);
            } else {
                if(libStatusElement) {
                    libStatusElement.textContent = `Error loading ${libName} (Online forced).`;
                    libStatusElement.className = 'error';
                }
                finalError();
            }
        });
    } else if (useOffline) {
        loadScript(offlineSrc, false, successHandler, () => {
            if (currentLibMode === 'auto' || currentLibMode === 'online') {
                errorHandler('Offline', onlineSrc, true);
            } else {
                 if(libStatusElement) {
                    libStatusElement.textContent = `Error loading ${libName} (Offline forced).`;
                    libStatusElement.className = 'error';
                }
                finalError();
            }
        });
    } else { 
        console.warn("Loading mode not determined, trying Online then Offline for", libName);
        loadScript(onlineSrc, true, successHandler, () => errorHandler('Online', offlineSrc, false));
    }
}

// The appInitializer (initializeApp from main.js) is passed through the chain
// and called by the successHandler of the *last* library loaded.
function loadAllLibraries(appInitializer) {
    attemptedOnline = false;
    attemptedOffline = false;
    const libStatusElement = document.getElementById('library-status');

    const onAnimeError = () => {
        if (libStatusElement) {
            libStatusElement.textContent = 'Error: Anime.js missing.';
            libStatusElement.className = 'error';
        }
        console.error("Cannot load Anime.js. Application may not start correctly.");
    };
    const onAnimeSuccess = () => { // Specific success for Anime.js
        if (attemptedOnline && attemptedOffline && libStatusElement && libStatusElement.className !== 'error') {
            libStatusElement.textContent = 'Libraries loaded (Mix online/offline).';
        }
        // The appInitializer is called by tryLoadLibs's successHandler if it's the last lib
    };

    const onOrbitControlsError = () => {
        if (libStatusElement) {
            libStatusElement.textContent = 'Error: OrbitControls not found.';
            libStatusElement.className = 'error';
        }
    };
    const onOrbitControlsSuccess = () => { // Specific success for OrbitControls
        tryLoadLibs(
            "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
            "./anime.min.js",
            true, // isLast
            onAnimeSuccess, // Anime.js specific success
            onAnimeError,   // Anime.js specific error
            appInitializer  // Pass initializeApp to be called by the last success
        );
    };

    const onThreeError = () => {
        if (libStatusElement) {
            libStatusElement.textContent = 'Error: Three.js not found.';
            libStatusElement.className = 'error';
        }
    };
    const onThreeSuccess = () => { // Specific success for Three.js
        tryLoadLibs(
            "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
            "./OrbitControls.js",
            false, // not isLast
            onOrbitControlsSuccess, // OrbitControls specific success
            onOrbitControlsError,   // OrbitControls specific error
            appInitializer          // Pass initializeApp along
        );
    };

    // Start loading Three.js
    tryLoadLibs(
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        "./three.min.js",
        false, // not isLast
        onThreeSuccess,     // Three.js specific success
        onThreeError,       // Three.js specific error
        appInitializer      // Pass initializeApp along
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const libModeSelect = document.getElementById('lib-mode-select');
    if (libModeSelect) libModeSelect.value = currentLibMode;

    const applyLibModeButton = document.getElementById('apply-lib-mode');
    if (applyLibModeButton) {
        applyLibModeButton.addEventListener('click', () => {
            const selectedMode = document.getElementById('lib-mode-select').value;
            localStorage.setItem(LIB_MODE_KEY, selectedMode);
            window.location.reload();
        });
    }
    const libStatusElement = document.getElementById('library-status');
    if (!libStatusElement) {
        console.error("Element #library-status not found. Cannot display library loading status.");
    } else {
        libStatusElement.textContent = "Loading libraries...";
    }

    // Pass initializeApp (from main.js) to loadAllLibraries.
    // initializeApp must be globally accessible or main.js script loaded before this.
    // With 'defer', main.js is parsed and initializeApp will be defined when DOMContentLoaded fires.
    if (typeof initializeApp === "function") {
        loadAllLibraries(initializeApp);
    } else {
        console.error("initializeApp function not found. Ensure main.js is loaded correctly.");
        if (libStatusElement) {
            libStatusElement.textContent = "Error: App initializer not found.";
            libStatusElement.className = 'error';
        }
    }
});
