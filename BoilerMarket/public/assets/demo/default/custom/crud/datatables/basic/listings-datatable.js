var DatatablesBasicBasic = {
    init: function() {
        var e;
        var lol;
        (e = $("#listings_table_1")).DataTable({
            responsive: !0,
            dom: "<'row'<'col-sm-12'tr>>\n\t\t\t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            language: {
                lengthMenu: "Display _MENU_"
            },
            order: [
                [1, "desc"]
            ],
            columnDefs: [{
                targets: -1,
                title: "Actions",
                orderable: !1,
                render: function(e, a, t, n) {
                    return `\n<a href="/listings/view/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-edit"></i>\n                        </a> <a href="/cart/add/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-cart-plus"></i>\n                        </a>`
                }
            }, {
                targets: 4,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "Listed",
                            class: " m-badge--primary"
                        },
                        1: {
                            title: "Bought",
                            class: " m-badge--success"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            }, {
                targets: 5,
                render: function(e, a, t, n) {
                    var s = {
                        1: {
                            title: "Sale",
                            state: "accent"
                        },
                        2: {
                            title: "Rent",
                            state: "primary"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge m-badge--' + s[e].state + ' m-badge--dot"></span>&nbsp;<span class="m--font-bold m--font-' + s[e].state + '">' + s[e].title + "</span>"
                }
            }]
        }),
        (e = $("#my_listings_table_1")).DataTable({
            responsive: !0,
            dom: "<'row'<'col-sm-12'tr>>\n\t\t\t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            language: {
                lengthMenu: "Display _MENU_"
            },
            order: [
                [1, "desc"]
            ],
            columnDefs: [{
                targets: -1,
                title: "Actions",
                orderable: !1,
                render: function(e, a, t, n) {
                    return `\n<a href="/listings/edit/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n<i class="la la-edit"></i>\n</a>`
                }
            }, {
                targets: 4,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "Listed",
                            class: " m-badge--primary"
                        },
                        1: {
                            title: "Bought",
                            class: " m-badge--success"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            }, {
                targets: 5,
                render: function(e, a, t, n) {
                    var s = {
                        1: {
                            title: "Sale",
                            state: "accent"
                        },
                        2: {
                            title: "Rent",
                            state: "primary"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge m-badge--' + s[e].state + ' m-badge--dot"></span>&nbsp;<span class="m--font-bold m--font-' + s[e].state + '">' + s[e].title + "</span>"
                }
            }]
        }),
        (e = $("#my_cart_table_1")).DataTable({
            responsive: !0,
            dom: "<'row'<'col-sm-12'tr>>\n\t\t\t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            language: {
                lengthMenu: "Display _MENU_"
            },
            order: [
                [1, "desc"]
            ],
            columnDefs: [{
                targets: -1,
                title: "Actions",
                orderable: !1,
                render: function(e, a, t, n) {
                    return `\n<a href="/cart/remove/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="Remove">\n<i class="la la-edit"></i>\n</a>\n<a href="/cart/transact/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="Remove">\n<i class="la la-edit"></i>\n</a>`
                }
            }, {
                targets: 4,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "Listed",
                            class: " m-badge--primary"
                        },
                        1: {
                            title: "Bought",
                            class: " m-badge--success"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            }, {
                targets: 5,
                render: function(e, a, t, n) {
                    var s = {
                        1: {
                            title: "Sale",
                            state: "accent"
                        },
                        2: {
                            title: "Rent",
                            state: "primary"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge m-badge--' + s[e].state + ' m-badge--dot"></span>&nbsp;<span class="m--font-bold m--font-' + s[e].state + '">' + s[e].title + "</span>"
                }
            }]
        }),
        (e = $("#transactions_table_1")).DataTable({
            responsive: !0,
            dom: "<'row'<'col-sm-12'tr>>\n\t\t\t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 dataTables_pager'lp>>",
            lengthMenu: [5, 10, 25, 50],
            pageLength: 10,
            language: {
                lengthMenu: "Display _MENU_"
            },
            order: [
                [1, "desc"]
            ],
            columnDefs: [{
                targets: -1,
                title: "Actions",
                orderable: !1,
                render: function(e, a, t, n) {
                    return `\n<a href="/transactions/view/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n<i class="la la-edit"></i>\n</a>`
                }
            }, {
                targets: 4,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "Listed",
                            class: " m-badge--primary"
                        },
                        1: {
                            title: "Bought",
                            class: " m-badge--success"
                        },
                        2: {
                            title: "Rented",
                            class: " m-badge--primary"
                        },
                        3: {
                            title: "Cancelled",
                            class: " m-badge--danger"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            }, {
                targets: 5,
                render: function(e, a, t, n) {
                    var s = {
                        1: {
                            title: "Sale",
                            state: "success"
                        },
                        2: {
                            title: "Rent",
                            state: "primary"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge m-badge--' + s[e].state + ' m-badge--dot"></span>&nbsp;<span class="m--font-bold m--font-' + s[e].state + '">' + s[e].title + "</span>"
                }
            }]
        })
    }
};
jQuery(document).ready(function() {
    DatatablesBasicBasic.init()
});