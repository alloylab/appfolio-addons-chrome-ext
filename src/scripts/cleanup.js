const cleanupObserver = new MutationObserver(function () {

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
});
cleanupObserver.observe(document, {
    childList: true,
    subtree:   true
});
