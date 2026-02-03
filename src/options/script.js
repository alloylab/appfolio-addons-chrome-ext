const DEFAULTS = {
    isMarkdownEnabled: true,
    isDarkModeEnabled: true,
};

// When the options page opens
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(DEFAULTS, (settings) => {
        document.getElementById('markdown-toggle').checked = settings.isMarkdownEnabled;
        document.getElementById('darkmode-toggle').checked = settings.isDarkModeEnabled;
    });
});

// Saving updated settings
document.getElementById('save').addEventListener('click', () => {
    const markDownToggle = document.getElementById('markdown-toggle').checked;
    chrome.storage.local.set({ isMarkdownEnabled: markDownToggle });

    const darkModeToggle = document.getElementById('darkmode-toggle').checked;
    chrome.storage.local.set({ isDarkModeEnabled: darkModeToggle });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => {
        status.textContent = '';
    }, 1500);
});
