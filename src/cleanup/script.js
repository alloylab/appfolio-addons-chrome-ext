//MutationObserver for JS Rendered Elements
const cleanupObserver = new MutationObserver(function (mutations, mutationInstance) {

    // Change Dashboard Application Link
    let application = $('.js-rental-applications-total');
    if (application.length > 0) {
        application.attr('href', '/rental_applications').removeAttr('target');
        mutationInstance.disconnect();
    }
});

cleanupObserver.observe(document, {
    childList: true,
    subtree:   true
});

//Hide Signals
$('a[href="/v_plus_services_marketplace/leasing_signals"]').closest('li').hide();

//Hyper Link Payee on Bill Details
if($('.accounting_payable_invoices').length > 0) {
    let base_url = '/remote_search/api/global_search_documents?page[size]=1&filter[section_keys]=people&filter[search_source]=global_search&fields[global_search_documents]=section_key%2Cresult_type%2Chidden&filter[search_term]=';
    let vendor = $('#bill-info-section .datapair__value').first().text();

    $.getJSON(base_url + vendor, function(data) {
        let link = data.data['0'].links.self;
        let payee = $('<a></a>').attr('href',link)
            .append(vendor);

        $('#bill-info-section .datapair__value').first().replaceWith(payee);
    });
}
