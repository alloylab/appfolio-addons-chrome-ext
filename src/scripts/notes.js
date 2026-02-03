chrome.storage.local.get(['isMarkdownEnabled'], (result) => {
    if (result.isMarkdownEnabled) {
        startNotesObserver();
    }
});

function startNotesObserver() {
    const notesObserver = new MutationObserver(function () {
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
    });
    notesObserver.observe(document, {
        childList: true,
        subtree: true
    });
}
