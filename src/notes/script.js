//MutationObserver for MarkDown for Notes
const notesObserver = new MutationObserver(function () {
    const notes = document.querySelectorAll('.note__contents');

    notes.forEach((noteContainer) => {
        const noteTextElement = noteContainer.querySelector('.js-note-text');

        if (noteTextElement) {
            let content = noteTextElement.innerHTML
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<\bspan\b>/g, '')
                .replace(/<\/\bspan\b>/g, '')
                .trim();

            const markdownHtml = DOMPurify.sanitize(marked.parse(content));

            noteContainer.outerHTML = markdownHtml;
        }
    });
});
notesObserver.observe(document, {
    childList: true,
    subtree:   true
});
