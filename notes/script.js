setTimeout(function () {
    let decodeHTML = function (html) {
        let txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    let note_contents = document.getElementsByClassName('note__contents');

    for (let i = 0, l = note_contents.length; i < l; i++) {
        let contentElement = note_contents[i].getElementsByClassName('js-note-text')[0];

        let content = decodeHTML(contentElement.innerHTML.replace(/<\bspan\b>/g, '').replace(/<\/\bspan\b>/g, '').trim());

        let converter = new showdown.Converter();
        contentElement.innerHTML = converter.makeHtml(content);
    }
}, 1000);
