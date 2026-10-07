// Defaults mirror the options page so a fresh install behaves the way the
// options UI shows it. Settings are read once and cached; chrome.storage is
// not hit on every DOM mutation, and once the extension is reloaded/updated
// while this tab is open every chrome.* call throws
// "Extension context invalidated", so the observer disconnects itself.
const DEFAULT_SETTINGS = {
    isMarkdownEnabled: true,
    isDarkModeEnabled: true,
    theme: 'light',
};

const settings = { ...DEFAULT_SETTINGS };

// Mirror of the theme kept in localStorage purely so the dark-mode class can
// be applied synchronously at document_start, before the first paint.
const THEME_CACHE_KEY = 'afAddonsTheme';
const LEGACY_THEME_KEY = 'theme';

const DARK_CLASS = 'dark-mode';
const PROCESSED_ATTR = 'data-af-addons';

// Apply the cached theme immediately so there is no flash of a light page.
try {
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
    if (cachedTheme === 'dark') {
        document.documentElement.classList.add(DARK_CLASS);
    }
} catch (e) {
    // localStorage can be unavailable (e.g. blocked storage); ignore.
}

const isContextAlive = () => {
    try {
        return Boolean(chrome.runtime && chrome.runtime.id);
    } catch (e) {
        return false;
    }
};

// Coalesce bursts of mutations into a single pass per animation frame.
let applyScheduled = false;

const scheduleApply = () => {
    if (applyScheduled) {
        return;
    }

    applyScheduled = true;
    requestAnimationFrame(() => {
        applyScheduled = false;
        applyFeatures();
    });
};

const applyFeatures = () => {
    cleanUp();

    if (settings.isDarkModeEnabled) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    if (settings.isMarkdownEnabled) {
        enableMarkDown();
    }
};

const observer = new MutationObserver(function () {
    if (!isContextAlive()) {
        // Stale content script from a previous extension load; stop working.
        observer.disconnect();
        return;
    }

    scheduleApply();
});

try {
    chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
        if (chrome.runtime.lastError) {
            return;
        }

        Object.assign(settings, result);
        migrateLegacyTheme();
        applyFeatures();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }

        for (const key of Object.keys(changes)) {
            if (key in settings) {
                settings[key] = changes[key].newValue ?? DEFAULT_SETTINGS[key];
            }
        }

        applyFeatures();
    });
} catch (e) {
    // Extension context already invalidated; leave the page untouched.
}

observer.observe(document, {
    childList: true,
    subtree: true
});

// Older versions kept the theme in localStorage under a generic "theme" key.
// Carry it over once, then drop the old key.
function migrateLegacyTheme() {
    try {
        const legacy = localStorage.getItem(LEGACY_THEME_KEY);

        if (legacy === 'dark' || legacy === 'light') {
            localStorage.removeItem(LEGACY_THEME_KEY);

            if (settings.theme !== legacy) {
                setTheme(legacy);
            }
        }
    } catch (e) {
        // ignore
    }
}

function setTheme(theme) {
    settings.theme = theme;

    try {
        chrome.storage.local.set({ theme });
    } catch (e) {
        // Context invalidated; the local change still applies to this tab.
    }

    applyTheme();
}

function cleanUp() {
    // Change Dashboard Application Link
    const application = document.querySelector(`.js-rental-applications-total:not([${PROCESSED_ATTR}])`);

    if (application) {
        application.setAttribute('href', '/rental_applications');
        application.removeAttribute('target');
        application.setAttribute(PROCESSED_ATTR, 'link');
    }

    // Change Guest Card Link
    const guestCardRows = document.querySelectorAll(`#guest_cards_table table tbody tr:not([${PROCESSED_ATTR}])`);

    guestCardRows.forEach(row => {
        const link = row.querySelector('a');
        const checkbox = row.querySelector('input[type="checkbox"]');

        if (link && checkbox && checkbox.value) {
            link.href = '/guest_cards/' + checkbox.value;
            row.setAttribute(PROCESSED_ATTR, 'guest-card');
        }
    });

    // "Hide Signals" is handled in global.css via li:has(a[href=...]).
}

function applyTheme() {
    const isDark = settings.theme === 'dark';
    const html = document.documentElement;
    const sun = document.querySelector('#sun-icon');
    const moon = document.querySelector('#moon-icon');

    html.classList.toggle(DARK_CLASS, isDark);

    // Keep the early-paint cache current, including for theme changes that
    // arrive from another tab via chrome.storage.onChanged.
    try {
        localStorage.setItem(THEME_CACHE_KEY, settings.theme);
    } catch (e) {
        // ignore
    }

    if (sun && moon) {
        sun.classList.toggle('hidden', !isDark);
        moon.classList.toggle('hidden', isDark);
    }
}

function enableDarkMode() {
    if (!document.querySelector('#theme-toggle-wrapper') && document.body) {
        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'theme-toggle-wrapper';

        toggleContainer.innerHTML = `
        <button id="theme-toggle" type="button" aria-label="Toggle theme">
            <svg id="sun-icon" class="theme-icon hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path>
            </svg>
            <svg id="moon-icon" class="theme-icon hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"></path>
            </svg>
        </button>
        `;

        toggleContainer.querySelector('#theme-toggle').addEventListener('click', () => {
            setTheme(settings.theme === 'dark' ? 'light' : 'dark');
        });

        document.body.appendChild(toggleContainer);
    }

    applyTheme();
}

function disableDarkMode() {
    const toggle = document.querySelector('#theme-toggle-wrapper');

    if (toggle) {
        toggle.remove();
    }

    document.documentElement.classList.remove(DARK_CLASS);

    try {
        localStorage.removeItem(THEME_CACHE_KEY);
    } catch (e) {
        // ignore
    }
}

// Appfolio renders note text with <br> line breaks. Markdown needs real
// newlines, so convert them before reading the plain text.
function noteTextToMarkdown(noteTextElement) {
    const clone = noteTextElement.cloneNode(true);

    clone.querySelectorAll('br').forEach((br) => {
        br.replaceWith('\n');
    });

    return clone.textContent.trim();
}

function enableMarkDown() {
    const notes = document.querySelectorAll(`.note__contents:not([${PROCESSED_ATTR}])`);

    notes.forEach((noteContainer) => {
        const noteTextElement = noteContainer.querySelector('.js-note-text');

        if (!noteTextElement) {
            return;
        }

        const content = noteTextToMarkdown(noteTextElement);

        // Only the text node is replaced; Appfolio's note container and any
        // handlers attached to it are left intact.
        noteTextElement.innerHTML = DOMPurify.sanitize(marked.parse(content));
        noteTextElement.setAttribute(PROCESSED_ATTR, 'markdown');
        noteContainer.setAttribute(PROCESSED_ATTR, 'markdown');
    });
}
