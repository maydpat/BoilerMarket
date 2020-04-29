var DatatablesBasicBasic = {
    init: function() {
        var e;
        var lol;
        (e = $("#users_table")).DataTable({
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
                    return `\n<a href="/admin/view-user/${t[7]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-edit"></i>`
                }
            }, {
                targets: 4,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "Disabled",
                            class: " m-badge--danger"
                        },
                        1: {
                            title: "Enabled",
                            class: " m-badge--success"
                        },
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            }, {
                targets: 5,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "No",
                            state: "accent"
                        },
                        1: {
                            title: "Yes",
                            state: "primary"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge m-badge--' + s[e].state + ' m-badge--dot"></span>&nbsp;<span class="m--font-bold m--font-' + s[e].state + '">' + s[e].title + "</span>"
                }
            }, {
                targets: 6,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "No",
                            state: "accent"
                        },
                        1: {
                            title: "Yes",
                            state: "danger"
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
                    return `\n<a href="/admin/view-transaction?transaction_id=${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n<i class="la la-edit"></i>\n</a>`
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
                            title: "Complete",
                            class: " m-badge--success"
                        },
                        2: {
                            title: "Rental Ongoing",
                            class: " m-badge--primary"
                        },
                        3: {
                            title: "Cancelled",
                            class: " m-badge--danger"
                        },
                        4: {
                            title: "Pending",
                            class: " m-badge--primary"
                        }, 
                        5: {
                            title: "In Dispute",
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
        }),
        (e = $("#disputes_table")).DataTable({
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
                    return `\n<a href="/admin/view-dispute/${t[5]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n<i class="la la-edit"></i>\n</a>`
                }
            }, {
                targets: 3,
                render: function(e, a, t, n) {
                    var s = {
                        0: {
                            title: "In Dispute",
                            class: " m-badge--danger"
                        },
                        1: {
                            title: "Resolved",
                            class: " m-badge--success"
                        }
                    };
                    return void 0 === s[e] ? e : '<span class="m-badge ' + s[e].class + ' m-badge--wide">' + s[e].title + "</span>"
                }
            },
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
                        return `\n<a href="/admin/edit-listing?listing_id=${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-edit"></i>\n                        </a>`
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
                                title: "Complete",
                                class: " m-badge--success"
                            },
                            2: {
                                title: "Rental Ongoing",
                                class: " m-badge--primary"
                            },
                            3: {
                                title: "Cancelled",
                                class: " m-badge--danger"
                            },
                            4: {
                                title: "Pending",
                                class: " m-badge--primary"
                            }, 
                            5: {
                                title: "In Dispute",
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
            (e = $("#ban-appeals_table")).DataTable({
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
                    title: "Unban",
                    orderable: !1,
                    render: function(e, a, t, n) {
                        return `\n<a href="/admin/unban-user/${t[3]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-edit"></i>\n                        </a>`
                    }
                }]
            })]
        })
    }
};
jQuery(document).ready(function() {
    DatatablesBasicBasic.init()
});