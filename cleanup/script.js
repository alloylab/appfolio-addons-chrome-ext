setTimeout(function () {
    $('.js-rental-applications-total').attr('href', '/rental_applications').removeAttr('target');
    $('a[href="/v_plus_services_marketplace/leasing_signals"]').closest('li').hide();
}, 1000);