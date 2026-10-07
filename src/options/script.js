// Keep in sync with DEFAULT_SETTINGS in scripts/global.js.
const DEFAULTS = {
    isMarkdownEnabled: true,
    isDarkModeEnabled: true,
};

const toggles = document.querySelectorAll('input[type="checkbox"][data-setting]');
const status = document.getElementById('status');
let statusTimer = null;

const showStatus = (text) => {
    status.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
        status.textContent = '';
    }, 1500);
};

// Load current values
chrome.storage.local.get(DEFAULTS, (settings) => {
    toggles.forEach((toggle) => {
        toggle.checked = Boolean(settings[toggle.dataset.setting]);
    });
});

// Save on change; open Appfolio tabs pick the change up live.
toggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
        chrome.storage.local.set({ [toggle.dataset.setting]: toggle.checked }, () => {
            showStatus(chrome.runtime.lastError ? 'Could not save settings' : 'Settings saved');
        });
    });
});
