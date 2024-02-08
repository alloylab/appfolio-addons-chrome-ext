//MutationObserver for JS Rendered Elements
const cleanupObserver = new MutationObserver(function () {

    // Change Dashboard Application Link
    let application = $('.js-rental-applications-total');
    if (application.length > 0) {
        application.attr('href', '/rental_applications').removeAttr('target');
    }
});
cleanupObserver.observe(document, {
    childList: true,
    subtree:   true
});

//Hide Signals
$('a[href="/v_plus_services_marketplace/leasing_signals"]').closest('li').hide();

//Hyper Link Payee on Bill Details
let billDetails = $('#bill-info-section .datapair__value');
if(billDetails.length > 0) {
    let base_url = '/remote_search/api/global_search_documents?page[size]=1&filter[section_keys]=people&filter[search_source]=global_search&fields[global_search_documents]=section_key%2Cresult_type%2Chidden&filter[search_term]=';
    let vendor = billDetails.first().text();

    $.getJSON(base_url + vendor, function(data) {
        let link = data.data['0'].links.self;
        let payee = $('<a></a>').attr('href',link).append(vendor);

        $('#bill-info-section .datapair__value').first().replaceWith(payee);
    });
}
