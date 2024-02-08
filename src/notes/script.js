//MutationObserver for JS Rendered Elements
const notesObserver = new MutationObserver(function () {

    //MarkDown for Notes
    let notes = $('.note__contents');
    if (notes.length > 0) {
        notes.each(function () {
            let note = $(this).find('.js-note-text');
            let content = note.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/<\bspan\b>/g, '').replace(/<\/\bspan\b>/g, '').trim();

            let converter = new showdown.Converter();
            let markdown = converter.makeHtml(content);
            $(this).replaceWith(markdown);
        });
    }
});

notesObserver.observe(document, {
    childList: true,
    subtree:   true
});
