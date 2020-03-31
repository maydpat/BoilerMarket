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
                    return `\n<a href="/admin/view-user/${t[6]}" class="m-portlet__nav-link btn m-btn m-btn--hover-brand m-btn--icon m-btn--icon-only m-btn--pill" title="View">\n                          <i class="la la-edit"></i>`
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
            }]
        })
    }
};
jQuery(document).ready(function() {
    DatatablesBasicBasic.init()
});