setTimeout(function () {
    $('.note__contents').each(function () {
        let note = $(this).find('.js-note-text');
        let content = note.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<\bspan\b>/g, '').replace(/<\/\bspan\b>/g, '').trim();

        let converter = new showdown.Converter();
        let markdown = converter.makeHtml(content);
        $(this).replaceWith(markdown);
    });
}, 1000);
