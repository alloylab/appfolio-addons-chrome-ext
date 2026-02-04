const observer = new MutationObserver(function () {
    cleanUp();

    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['isDarkModeEnabled'], (result) => {
            if (result.isDarkModeEnabled) {
                enableDarkMode();
            }
        });

        chrome.storage.local.get(['isMarkdownEnabled'], (result) => {
            if (result.isMarkdownEnabled) {
                enableMarkDown();
            }
        });
    }
});
observer.observe(document, {
    childList: true,
    subtree: true
});

function cleanUp() {
    // Change Dashboard Application Link
    let application = document.querySelector('.js-rental-applications-total');

    if (application) {
        application.setAttribute('href', '/rental_applications');
        application.removeAttribute('target');
    }

    //Change Guest Card Link
    const guestCardRows = document.querySelectorAll('#guest_cards_table table tbody tr');

    guestCardRows.forEach(row => {
        const link = row.querySelector('a');

        if (link) {
            const checkbox = row.querySelector('input[type="checkbox"]');

            if (checkbox) {
                const gcId = checkbox.value;

                link.href = '/guest_cards/' + gcId;
            }
        }
    });

    //Hide Signals
    const targetLink = document.querySelector('a[href="/v_plus_services_marketplace/leasing_signals"]');

    if (targetLink) {
        const parentLi = targetLink.closest('li');
        if (parentLi) {
            parentLi.style.display = 'none';
        }
    }
}

function enableDarkMode() {
    const toggle = document.querySelector('#theme-toggle-wrapper');

    if (!toggle) {
        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'theme-toggle-wrapper';

        toggleContainer.innerHTML = `
        <button id="theme-toggle" type="button" aria-label="Toggle theme">
            <svg id="sun-icon" class="theme-icon hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path>
            </svg>
            <svg id="moon-icon" class="theme-icon hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"></path>
            </svg>
        </button>
        `;

        const updateUI = (isDark) => {
            const html = document.documentElement;
            const sun = toggleContainer.querySelector('#sun-icon');
            const moon = toggleContainer.querySelector('#moon-icon');

            if (isDark) {
                html.classList.add('dark-mode');
                sun.classList.remove('hidden');
                moon.classList.add('hidden');
            } else {
                html.classList.remove('dark-mode');
                sun.classList.add('hidden');
                moon.classList.remove('hidden');
            }
        };

        // Initialize State
        let isDark = localStorage.getItem('theme') === 'dark';
        updateUI(isDark);

        // Event Listener
        toggleContainer.querySelector('#theme-toggle').addEventListener('click', () => {
            isDark = !isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateUI(isDark);
        });

        document.body.appendChild(toggleContainer);
    }
}

function enableMarkDown() {
    const notes = document.querySelectorAll('.note__contents');

    notes.forEach((noteContainer) => {
        const noteTextElement = noteContainer.querySelector('.js-note-text');

        if (noteTextElement) {
            const content = noteTextElement.innerHTML
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<\bspan\b>/g, '')
                .replace(/<\/\bspan\b>/g, '')
                .trim();

            noteContainer.outerHTML = DOMPurify.sanitize(marked.parse(content));
        }
    });
}
