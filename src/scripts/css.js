chrome.storage.local.get(['isDarkModeEnabled'], (result) => {
    if (result.isDarkModeEnabled) {
        document.documentElement.classList.toggle('dark-mode');
    }
});
