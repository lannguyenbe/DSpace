function DSpaceSetupAutocomplete(a, b) {
    $(function() {
        null == b.authorityName && (b.authorityName = dspace_makeFieldInput(b.inputName, "_authority"));
        var c = $("#" + a)[0],
            d = c.elements[b.inputName].id,
            e = null;
        null != c.elements[b.authorityName] && (e = c.elements[b.authorityName].id);
        var f = b.contextPath + "/choices/" + b.metadataField,
            g = null == b.collection ? -1 : b.collection;
        f += "?collection=" + g;
        var h = $("#" + d);
        h.autocomplete({
            source: function(a, b) {
                var c = f;
                a && a.term && (c += "&query=" + a.term), $.get(c, function(a) {
                    var c = [],
                        d = [];
                    $(a).find("Choice").each(function() {
                        var a = $(this).attr("value") ? $(this).attr("value") : null,
                            b = $(this).text() ? $(this).text() : a;
                        a || (a = b), null != b && (c.push({
                            label: b,
                            value: a
                        }), d["label: " + b + ", value: " + a] = $(this).attr("authority") ? $(this).attr("authority") : a)
                    }), h.data("authorities", d), b(c)
                })
            },
            select: function(a, c) {
                var d = $("#" + e);
                d = d.length > 0 ? d[0] : null;
                var f = h.data("authorities"),
                    g = f["label: " + c.item.label + ", value: " + c.item.value];
                if (null != d && (d.value = g, null != b.confidenceName)) {
                    var i = d.form.elements[b.confidenceName];
                    null != i && (i.value = "accepted")
                }
                DSpaceUpdateConfidence(document, b.confidenceIndicatorID, null == g || "" == g ? "blank" : "accepted")
            }
        }).autocomplete("widget").addClass("dropdown-menu"), $(".ui-helper-hidden-accessible").hide()
    })
}

function DSpaceChoiceLookup(a, b, c, d, e, f, g, h, i) {
    return a += "?field=" + b + "&formID=" + c + "&valueInput=" + d + "&authorityInput=" + e + "&collection=" + g + "&isName=" + h + "&isRepeating=" + i + "&confIndicatorID=" + f + "&limit=50", $.ajax({
        dataType: "html",
        url: a,
        success: function(a) {
            var b = $('<div class="modal fade">' + a + "</div>");
            $("body").append(b), b.modal();
            var c = document.getElementById("aspect_general_ChoiceLookupTransformer_div_lookup");
            DSpaceChoicesSetup(c), b.on("hidden.bs.modal", function() {
                $(this).remove()
            })
        }
    }), !1
}

function DSpaceChoicesSetup(a) {
    var b = $("#aspect_general_ChoiceLookupTransformer_div_lookup :header:not(.page-header)");
    b.data("template") || b.data("template", b.html()), b.html("Loading..."), DSpaceChoicesLoad(a)
}

function DSpaceChoicesLoad(a) {
    var b = $("*[name = paramField]").val(),
        c = $("*[name = paramValue]").val();
    c || (c = "");
    var d = $("*[name = paramStart]").val(),
        e = $("*[name = paramLimit]").val(),
        f = $("*[name = paramFormID]").val(),
        g = $("*[name = paramCollection]").val(),
        h = "true" == $("*[name = paramIsName]").val(),
        i = "true" == $("*[name = paramIsRepeating]").val(),
        j = "true" == $("*[name = paramIsClosed]").val(),
        k = $("*[name = contextPath]").val(),
        l = $("*[name = paramFail]").val(),
        m = $("*[name = paramValueInput]").val(),
        n = "",
        o = $("*[name = paramNonAuthority]");
    if (o.length > 0 && (n = o.val()), 0 == c.length) {
        var p = $(window.document).find("#" + f);
        c = h ? makePersonName(p.find("*[name = " + dspace_makeFieldInput(m, "_last") + "]").val(), p.find("*[name = " + dspace_makeFieldInput(m, "_first") + "]").val()) : p.find("*[name = " + m + "]").val(), i && (h ? (p.find("*[name = " + dspace_makeFieldInput(m, "_last") + "]").val(""), p.find("*[name = " + dspace_makeFieldInput(m, "_first") + "]").val("")) : p.find("*[name = " + m + "]").val(null)), $("*[name = paramValue]").val(c)
    }
    var q = $("select[name = chooser]:first");
    q.addClass("loading"), $(window).ajaxError(function(a, b, c, d) {
        window.alert(l + " Exception=" + a), null != q && q.removeClass("loading")
    }), $.ajax({
        url: k + "/choices/" + b,
        type: "GET",
        data: {
            query: c,
            collection: g,
            start: d,
            limit: e
        },
        error: function() {
            window.alert(l + " HTTP error resonse"), null != q && q.removeClass("loading")
        },
        success: function(a) {
            var b = $(a).find("Choices"),
                d = b.attr("error");
            null != d && "true" == d && window.alert(l + " Server indicates error in response.");
            var e = b.find("Choice"),
                f = 1 * b.attr("start"),
                g = f + e.length,
                i = b.attr("total"),
                k = b.attr("more");
            null == k || "false" == k ? $("*[name = more]").attr("disabled", "true") : $("*[name = more]").removeAttr("disabled"), $("*[name = paramStart]").val(g), null != q && q.removeClass("loading"), q.find("option").remove();
            var m = q.find("option:last"),
                o = -1,
                p = -1;
            $.each(e, function(a) {
                var b = $(this);
                b.attr("value") == c && (o = a), void 0 != b.attr("selected") && (p = a);
                var d = $('<option value="' + b.attr("value") + '">' + b.text() + "</option>");
                d.data("authority", b.attr("authority")), m.length > 0 ? m.before(d) : q.append(d)
            }), j || q.append(new Option(dspace_formatMessage(n, c), c), null);
            var r = -1;
            if (p >= 0 ? r = p : o >= 0 ? r = o : 1 == q[0].options.length && (r = 0), r >= 0) {
                q[0].options[r].defaultSelected = !0;
                var s = q[0].options[r];
                h ? ($("*[name = text1]").val(lastNameOf(s.value)), $("*[name = text2]").val(firstNameOf(s.value))) : $("*[name = text1]").val(s.value)
            }
            var t = 0 == g ? 0 : f + 1,
                u = $("#aspect_general_ChoiceLookupTransformer_div_lookup :header:not(.page-header)");
            u.html(dspace_formatMessage(u.data("template"), t, g, i, c))
        }
    })
}

function DSpaceChoicesSelectOnChange() {
    var a = $("#aspect_general_ChoiceLookupTransformer_div_lookup"),
        b = a.find("*[name = chooser]"),
        c = "true" == a.find("*[name = paramIsName]").val(),
        d = b.val();
    c ? (a.find("*[name = text1]").val(lastNameOf(d)), a.find("*[name = text2]").val(firstNameOf(d))) : a.find("*[name = text1]").val(d)
}

function DSpaceChoicesAcceptOnClick() {
    var a = $("*[name = chooser]"),
        b = "true" == $("*[name = paramIsName]").val(),
        c = "true" == $("*[name = paramIsRepeating]").val(),
        d = $("*[name = paramValueInput]").val(),
        e = $("*[name = paramAuthorityInput]").val(),
        f = $("*[name = paramFormID]").val(),
        g = $("*[name = paramConfIndicatorID]").length = $("*[name = paramConfIndicatorID]").val();
    if (0 == e.length && (e = dspace_makeFieldInput(d, "_authority")), d.length > 0) {
        var h = $(window.document).find("#" + f);
        if (b ? (h.find("*[name = " + dspace_makeFieldInput(d, "_last") + "]").val($("*[name = text1]").val()), h.find("*[name = " + dspace_makeFieldInput(d, "_first") + "]").val($("*[name = text2]").val())) : h.find("*[name = " + d + "]").val($("*[name = text1]").val()), e.length > 0 && h.find("*[name = " + e + "]").length > 0) {
            var i = "",
                j = e.lastIndexOf("_authority_");
            i = 0 > j ? e.substring(0, e.length - 10) + "_confidence" : e.substring(0, j) + "_confidence_" + e.substring(j + 11);
            var k = null,
                l = a.find(":selected");
            l.length >= 0 && null != l.data("authority") && h.find("*[name = " + e + "]").val(l.data("authority")), h.find("*[name = " + i + "]").val("accepted"), DSpaceUpdateConfidence(window.document, g, null == k || "" == k ? "blank" : "accepted")
        }
        if (c) {
            var m = h.find("*[name = submit_" + d + "_add]");
            m.length > 0 ? m.click() : alert('Sanity check: Cannot find button named "submit_' + d + '_add"')
        }
    }
    return !1
}

function DSpaceChoicesMoreOnClick() {
    var a = document.getElementById("aspect_general_ChoiceLookupTransformer_div_lookup");
    DSpaceChoicesSetup(a)
}

function makePersonName(a, b) {
    return null == b || 0 == b.length ? a : a + ", " + b
}

function firstNameOf(a) {
    var b = a.indexOf(",");
    return 0 > b ? "" : stringTrim(a.substring(b + 1))
}

function lastNameOf(a) {
    var b = a.indexOf(",");
    return stringTrim(0 > b ? a : a.substring(0, b))
}

function stringTrim(a) {
    for (var b = 0, c = a.length;
        " " == a.charAt(b) && c > b; ++b);
    for (; c > b && " " == a.charAt(c - 1); --c);
    return a.slice(b, c)
}

function dspace_formatMessage() {
    var a, b = dspace_formatMessage.arguments[0];
    for (a = 1; a < arguments.length; ++a) {
        var c = "@" + a + "@";
        if (b.search(c) >= 0) {
            var d = dspace_formatMessage.arguments[a];
            void 0 == d && (d = ""), b = b.replace(c, d)
        }
    }
    return b
}

function dspace_makeFieldInput(a, b) {
    var c = a.search("_[0-9]+$");
    return 0 > c ? a + b : a.substr(0, c) + b + a.substr(c)
}

function DSpaceUpdateConfidence(a, b, c) {
    if (null != b && "" != b) {
        var d = a.getElementById(b);
        if (null != d)
            if (null == d.className) d.className = "cf-" + c;
            else {
                for (var e = d.className.split(" "), f = "", g = !1, h = 0; h < e.length; ++h) e[h].match("^cf-[a-zA-Z0-9]+$") ? (f += "cf-" + c + " ", g = !0) : f += e[h] + " ";
                g || (f += "cf-" + c + " "), d.className = f
            }
    }
}

function DSpaceAuthorityOnChange(a, b, c) {
    var d = "accepted";
    if (null != b && "" != b) {
        var e = document.getElementById(b);
        null != e && (e.value = d)
    }
    return DSpaceUpdateConfidence(document, c, d), !1
}

function DSpaceToggleAuthorityLock(a, b) {
    if (null == b || "" == b) return !1;
    var c = document.getElementById(b);
    if (null == c) return !1;
    for (var d = a.className.split(" "), e = "", f = !1, g = !1, h = 0; h < d.length; ++h) "is-locked" == d[h] ? (f = !1, g = !0) : "is-unlocked" == d[h] ? (f = !0, g = !0) : e += d[h] + " ";
    return g ? (a.className = e + (f ? "is-locked" : "is-unlocked") + " ", c.readOnly = f, !1) : !1
}

function AuthorLookup(a, b, c) {
        $(".authorlookup").remove();
        var d = $('<div class="authorlookup modal fade" tabindex="-1" role="dialog" aria-labelledby="personLookupLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="personLookupLabel">Person lookup</h4></div><div class="modal-body"><div title="Person Lookup"><table class="dttable col-xs-4"><thead><th>Name</th></thead><tbody><tr><td>Loading...<td></tr></tbody></table><span class="no-vcard-selected">There\'s no one selected</span><ul class="vcard list-unstyled" style="display: none;"><li><ul class="variable"/></li><li class="vcard-insolr"><label>Items in this repository:&nbsp;</label><span/></li><li class="vcard-add"><input class="ds-button-field btn btn-default" value="Add This Person" type="button"/></li></ul></div></div></div></div></div>'),
            e = '<button id="lookup-more-button" class="btn btn-default">show more</button>',
            f = '<button id="lookup-less-button" class="btn btn-default">show less</button>',
            g = e,
            h = d.find("table.dttable");
        h.dataTable({
            aoColumns: [{
                bSortable: !1,
                sWidth: "200px"
            }, {
                bSortable: !1,
                bSearchable: !1,
                bVisible: !1
            }],
            oLanguage: {
                sInfo: "Showing _START_ to _END_ of _TOTAL_ people",
                sInfoEmpty: "Showing 0 to 0 of 0 people",
                sInfoFiltered: "(filtered from _MAX_ total people)",
                sLengthMenu: "_MENU_ people/page",
                sZeroRecords: "No people found"
            },
            bAutoWidth: !1,
            bJQueryUI: !0,
            bProcessing: !0,
            bSort: !1,
            bPaginate: !1,
            sPaginationType: "two_button",
            bServerSide: !0,
            sAjaxSource: a,
            sDom: '<"H"lfr><"clearfix"t<"vcard-wrapper col-xs-8">><"F"ip>',
            fnInitComplete: function() {
                d.find("table.dttable").show(), d.find("div.vcard-wrapper").append(d.find(".no-vcard-selected")).append(d.find("ul.vcard")), d.modal(), d.find(".dataTables_wrapper").parent().attr("style", "width: auto; min-height: 121px; height: auto;");
                var a = d.find(".dataTables_filter input"),
                    c = "";
                if (-1 != b.indexOf("value_")) c = $("textarea[name=" + b + "]").val();
                else {
                    var e = $("input[name=" + b + "_last]");
                    c = e.size() ? (e.val() + " " + $("input[name=" + b + "_first]").val()).trim() : $("input[name=" + b + "]").val()
                }
                a.val(c), setTimeout(function() {
                    a.trigger($.Event("keyup", {
                        keyCode: 13
                    }))
                }, 50), a.trigger($.Event("keyup", {
                    keyCode: 13
                })), a.addClass("form-control"), d.find(".ui-corner-tr").removeClass(".ui-corner-tr"), d.find(".ui-corner-tl").removeClass(".ui-corner-tl")
            },
            fnInfoCallback: function(a, b, c, d, e, f) {
                return "Showing " + c + " results. " + g
            },
            fnRowCallback: function(a, c, e) {
                c = c[1];
                var f = $(a),
                    g = $(this).closest(".dataTables_wrapper").find(".vcard-wrapper .vcard").data("authorityID");
                return void 0 != g && c.authority == g && f.addClass("current-item"), f.addClass("clickable"), "false" == c.insolr && f.addClass("notinsolr"), f.click(function() {
                    function a(a, b, c) {
                        var d = b.replace(/-/g, " "),
                            e = "";
                        return e += '<li class="vcard-' + b + '"><label>' + d + ": </label>", e += "orcid" == b ? '<span><a target="_blank" href="http://orcid.org/' + a[b] + '">' + a[b] + "</a></span>" : "<span>" + a[b] + "</span>", e += "</li>", c.append(e), d
                    }
                    var e = $(this);
                    e.siblings(".current-item").removeClass("current-item"), e.addClass("current-item");
                    var f = e.closest(".dataTables_wrapper").find(".vcard-wrapper");
                    f.find(".no-vcard-selected:visible").hide();
                    var g = f.find(".vcard");
                    g.data("authorityID", c.authority), g.data("name", c.value);
                    var h = ["insolr", "value", "authority"],
                        i = ["last-name", "first-name"],
                        j = g.find(".variable");
                    j.empty(), i.forEach(function(b) {
                        a(c, b, j)
                    });
                    for (var k in c) c.hasOwnProperty(k) && h.indexOf(k) < 0 && i.indexOf(k) < 0 && a(c, k, j);
                    if ("false" != c.insolr) {
                        var l = window.DSpace.context_path + "/discover?filtertype=author&filter_relational_operator=authority&filter=" + c.insolr;
                        g.find(".vcard-insolr span").empty().append('<a href="' + l + '" target="_new">view items</a>')
                    } else g.find(".vcard-insolr span").text("0");
                    g.find(".vcard-add input").click(function() {
                        if (-1 != b.indexOf("value_")) {
                            $("input[name=" + b + "]").val(g.find(".vcard-last-name span").text() + ", " + g.find(".vcard-first-name span").text());
                            var a = $("input[name=" + b + "_authority]");
                            a.val(g.data("authorityID")), $("textarea[name=" + b + "]").val(g.data("name"))
                        } else {
                            var c = $("input[name=" + b + "_last]");
                            c.size() ? (c.val(g.find(".vcard-last-name span").text()), $("input[name=" + b + "_first]").val(g.find(".vcard-first-name span").text())) : $("input[name=" + b + "]").val(g.data("name")), $("input[name=" + b + "_authority]").val(g.data("authorityID")), $("input[name=submit_" + b + "_add]").click()
                        }
                        d.modal("hide")
                    }), g.show()
                }), a
            },
            fnDrawCallback: function() {
                var a = $(this).closest(".dataTables_wrapper");
                a.find(".current-item").length > 0 ? (a.find(".vcard-wrapper .no-vcard-selected:visible").hide(), a.find(".vcard-wrapper .vcard:hidden").show()) : (a.find(".vcard-wrapper .vcard:visible").hide(), a.find(".vcard-wrapper .no-vcard-selected:hidden").show()), $("#lookup-more-button").click(function() {
                    g = f, h.fnFilter($(".dataTables_filter > input").val())
                }), $("#lookup-less-button").click(function() {
                    g = e, h.fnFilter($(".dataTables_filter > input").val())
                })
            },
            fnServerData: function(a, b, d) {
                var h, i, j, k;
                $.each(b, function() {
                    "sEcho" == this.name ? h = this.value : "sSearch" == this.name ? i = this.value : "iDisplayStart" == this.name ? j = this.value : "iDisplayLength" == this.name && (k = this.value)
                }), void 0 == c && (c = "-1"), void 0 == h && (h = ""), void 0 == i && (i = ""), void 0 == j && (j = "0"), void 0 == k && (k = "0"), g == f && (k = "20"), g == e && (k = "10");
                var l = [];
                l.push({
                    name: "query",
                    value: i
                }), l.push({
                    name: "collection",
                    value: c
                }), l.push({
                    name: "start",
                    value: j
                }), l.push({
                    name: "limit",
                    value: k
                });
                var m = $(this);
                $.ajax({
                    cache: !1,
                    url: a,
                    dataType: "xml",
                    data: l,
                    success: function(a) {
                        var b = $(a),
                            c = [];
                        $.each(b.find("Choice"), function() {
                            for (var a = this, b = [], d = {}, e = 0; e < a.attributes.length; e++) {
                                var f = a.attributes[e];
                                d[f.name] = f.value
                            }
                            b.push(d.value), b.push(d), c.push(b)
                        });
                        var e = b.find("Choices").attr("total"),
                            f = m.data("totalNbPeople");
                        (void 0 == f || 1 > 1 * f) && (f = e, m.data("totalNbPeople", f));
                        var g = {
                            sEcho: h,
                            iTotalRecords: f,
                            iTotalDisplayRecords: e,
                            aaData: c
                        };
                        d(g)
                    }
                })
            }
        })
    }! function(a, b) {
        function c(a) {
            var b = a.length,
                c = ka.type(a);
            return ka.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || "function" !== c && (0 === b || "number" == typeof b && b > 0 && b - 1 in a)
        }

        function d(a) {
            var b = za[a] = {};
            return ka.each(a.match(ma) || [], function(a, c) {
                b[c] = !0
            }), b
        }

        function e(a, c, d, e) {
            if (ka.acceptData(a)) {
                var f, g, h = ka.expando,
                    i = a.nodeType,
                    j = i ? ka.cache : a,
                    k = i ? a[h] : a[h] && h;
                if (k && j[k] && (e || j[k].data) || d !== b || "string" != typeof c) return k || (k = i ? a[h] = ba.pop() || ka.guid++ : h), j[k] || (j[k] = i ? {} : {
                    toJSON: ka.noop
                }), ("object" == typeof c || "function" == typeof c) && (e ? j[k] = ka.extend(j[k], c) : j[k].data = ka.extend(j[k].data, c)), g = j[k], e || (g.data || (g.data = {}), g = g.data), d !== b && (g[ka.camelCase(c)] = d), "string" == typeof c ? (f = g[c], null == f && (f = g[ka.camelCase(c)])) : f = g, f
            }
        }

        function f(a, b, c) {
            if (ka.acceptData(a)) {
                var d, e, f = a.nodeType,
                    g = f ? ka.cache : a,
                    i = f ? a[ka.expando] : ka.expando;
                if (g[i]) {
                    if (b && (d = c ? g[i] : g[i].data)) {
                        ka.isArray(b) ? b = b.concat(ka.map(b, ka.camelCase)) : b in d ? b = [b] : (b = ka.camelCase(b), b = b in d ? [b] : b.split(" ")), e = b.length;
                        for (; e--;) delete d[b[e]];
                        if (c ? !h(d) : !ka.isEmptyObject(d)) return
                    }(c || (delete g[i].data, h(g[i]))) && (f ? ka.cleanData([a], !0) : ka.support.deleteExpando || g != g.window ? delete g[i] : g[i] = null)
                }
            }
        }

        function g(a, c, d) {
            if (d === b && 1 === a.nodeType) {
                var e = "data-" + c.replace(Ba, "-$1").toLowerCase();
                if (d = a.getAttribute(e), "string" == typeof d) {
                    try {
                        d = "true" === d ? !0 : "false" === d ? !1 : "null" === d ? null : +d + "" === d ? +d : Aa.test(d) ? ka.parseJSON(d) : d
                    } catch (f) {}
                    ka.data(a, c, d)
                } else d = b
            }
            return d
        }

        function h(a) {
            var b;
            for (b in a)
                if (("data" !== b || !ka.isEmptyObject(a[b])) && "toJSON" !== b) return !1;
            return !0
        }

        function i() {
            return !0
        }

        function j() {
            return !1
        }

        function k() {
            try {
                return Y.activeElement
            } catch (a) {}
        }

        function l(a, b) {
            do a = a[b]; while (a && 1 !== a.nodeType);
            return a
        }

        function m(a, b, c) {
            if (ka.isFunction(b)) return ka.grep(a, function(a, d) {
                return !!b.call(a, d, a) !== c
            });
            if (b.nodeType) return ka.grep(a, function(a) {
                return a === b !== c
            });
            if ("string" == typeof b) {
                if (Qa.test(b)) return ka.filter(b, a, c);
                b = ka.filter(b, a)
            }
            return ka.grep(a, function(a) {
                return ka.inArray(a, b) >= 0 !== c
            })
        }

        function n(a) {
            var b = Ua.split("|"),
                c = a.createDocumentFragment();
            if (c.createElement)
                for (; b.length;) c.createElement(b.pop());
            return c
        }

        function o(a, b) {
            return ka.nodeName(a, "table") && ka.nodeName(1 === b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
        }

        function p(a) {
            return a.type = (null !== ka.find.attr(a, "type")) + "/" + a.type, a
        }

        function q(a) {
            var b = eb.exec(a.type);
            return b ? a.type = b[1] : a.removeAttribute("type"), a
        }

        function r(a, b) {
            for (var c, d = 0; null != (c = a[d]); d++) ka._data(c, "globalEval", !b || ka._data(b[d], "globalEval"))
        }

        function s(a, b) {
            if (1 === b.nodeType && ka.hasData(a)) {
                var c, d, e, f = ka._data(a),
                    g = ka._data(b, f),
                    h = f.events;
                if (h) {
                    delete g.handle, g.events = {};
                    for (c in h)
                        for (d = 0, e = h[c].length; e > d; d++) ka.event.add(b, c, h[c][d])
                }
                g.data && (g.data = ka.extend({}, g.data))
            }
        }

        function t(a, b) {
            var c, d, e;
            if (1 === b.nodeType) {
                if (c = b.nodeName.toLowerCase(), !ka.support.noCloneEvent && b[ka.expando]) {
                    e = ka._data(b);
                    for (d in e.events) ka.removeEvent(b, d, e.handle);
                    b.removeAttribute(ka.expando)
                }
                "script" === c && b.text !== a.text ? (p(b).text = a.text, q(b)) : "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), ka.support.html5Clone && a.innerHTML && !ka.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && bb.test(a.type) ? (b.defaultChecked = b.checked = a.checked, b.value !== a.value && (b.value = a.value)) : "option" === c ? b.defaultSelected = b.selected = a.defaultSelected : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue)
            }
        }

        function u(a, c) {
            var d, e, f = 0,
                g = typeof a.getElementsByTagName !== W ? a.getElementsByTagName(c || "*") : typeof a.querySelectorAll !== W ? a.querySelectorAll(c || "*") : b;
            if (!g)
                for (g = [], d = a.childNodes || a; null != (e = d[f]); f++) !c || ka.nodeName(e, c) ? g.push(e) : ka.merge(g, u(e, c));
            return c === b || c && ka.nodeName(a, c) ? ka.merge([a], g) : g
        }

        function v(a) {
            bb.test(a.type) && (a.defaultChecked = a.checked)
        }

        function w(a, b) {
            if (b in a) return b;
            for (var c = b.charAt(0).toUpperCase() + b.slice(1), d = b, e = yb.length; e--;)
                if (b = yb[e] + c, b in a) return b;
            return d
        }

        function x(a, b) {
            return a = b || a, "none" === ka.css(a, "display") || !ka.contains(a.ownerDocument, a)
        }

        function y(a, b) {
            for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = ka._data(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && x(d) && (f[g] = ka._data(d, "olddisplay", C(d.nodeName)))) : f[g] || (e = x(d), (c && "none" !== c || !e) && ka._data(d, "olddisplay", e ? c : ka.css(d, "display"))));
            for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
            return a
        }

        function z(a, b, c) {
            var d = rb.exec(b);
            return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b
        }

        function A(a, b, c, d, e) {
            for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += ka.css(a, c + xb[f], !0, e)), d ? ("content" === c && (g -= ka.css(a, "padding" + xb[f], !0, e)), "margin" !== c && (g -= ka.css(a, "border" + xb[f] + "Width", !0, e))) : (g += ka.css(a, "padding" + xb[f], !0, e), "padding" !== c && (g += ka.css(a, "border" + xb[f] + "Width", !0, e)));
            return g
        }

        function B(a, b, c) {
            var d = !0,
                e = "width" === b ? a.offsetWidth : a.offsetHeight,
                f = kb(a),
                g = ka.support.boxSizing && "border-box" === ka.css(a, "boxSizing", !1, f);
            if (0 >= e || null == e) {
                if (e = lb(a, b, f), (0 > e || null == e) && (e = a.style[b]), sb.test(e)) return e;
                d = g && (ka.support.boxSizingReliable || e === a.style[b]), e = parseFloat(e) || 0
            }
            return e + A(a, b, c || (g ? "border" : "content"), d, f) + "px"
        }

        function C(a) {
            var b = Y,
                c = ub[a];
            return c || (c = D(a, b), "none" !== c && c || (jb = (jb || ka("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(b.documentElement), b = (jb[0].contentWindow || jb[0].contentDocument).document, b.write("<!doctype html><html><body>"), b.close(), c = D(a, b), jb.detach()), ub[a] = c), c
        }

        function D(a, b) {
            var c = ka(b.createElement(a)).appendTo(b.body),
                d = ka.css(c[0], "display");
            return c.remove(), d
        }

        function E(a, b, c, d) {
            var e;
            if (ka.isArray(b)) ka.each(b, function(b, e) {
                c || Ab.test(a) ? d(a, e) : E(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d)
            });
            else if (c || "object" !== ka.type(b)) d(a, b);
            else
                for (e in b) E(a + "[" + e + "]", b[e], c, d)
        }

        function F(a) {
            return function(b, c) {
                "string" != typeof b && (c = b, b = "*");
                var d, e = 0,
                    f = b.toLowerCase().match(ma) || [];
                if (ka.isFunction(c))
                    for (; d = f[e++];) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c)
            }
        }

        function G(a, c, d, e) {
            function f(i) {
                var j;
                return g[i] = !0, ka.each(a[i] || [], function(a, i) {
                    var k = i(c, d, e);
                    return "string" != typeof k || h || g[k] ? h ? !(j = k) : b : (c.dataTypes.unshift(k), f(k), !1)
                }), j
            }
            var g = {},
                h = a === Rb;
            return f(c.dataTypes[0]) || !g["*"] && f("*")
        }

        function H(a, c) {
            var d, e, f = ka.ajaxSettings.flatOptions || {};
            for (e in c) c[e] !== b && ((f[e] ? a : d || (d = {}))[e] = c[e]);
            return d && ka.extend(!0, a, d), a
        }

        function I(a, c, d) {
            for (var e, f, g, h, i = a.contents, j = a.dataTypes;
                "*" === j[0];) j.shift(), f === b && (f = a.mimeType || c.getResponseHeader("Content-Type"));
            if (f)
                for (h in i)
                    if (i[h] && i[h].test(f)) {
                        j.unshift(h);
                        break
                    }
            if (j[0] in d) g = j[0];
            else {
                for (h in d) {
                    if (!j[0] || a.converters[h + " " + j[0]]) {
                        g = h;
                        break
                    }
                    e || (e = h)
                }
                g = g || e
            }
            return g ? (g !== j[0] && j.unshift(g), d[g]) : b
        }

        function J(a, b, c, d) {
            var e, f, g, h, i, j = {},
                k = a.dataTypes.slice();
            if (k[1])
                for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
            for (f = k.shift(); f;)
                if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())
                    if ("*" === f) f = i;
                    else if ("*" !== i && i !== f) {
                if (g = j[i + " " + f] || j["* " + f], !g)
                    for (e in j)
                        if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                            g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                            break
                        }
                if (g !== !0)
                    if (g && a["throws"]) b = g(b);
                    else try {
                        b = g(b)
                    } catch (l) {
                        return {
                            state: "parsererror",
                            error: g ? l : "No conversion from " + i + " to " + f
                        }
                    }
            }
            return {
                state: "success",
                data: b
            }
        }

        function K() {
            try {
                return new a.XMLHttpRequest
            } catch (b) {}
        }

        function L() {
            try {
                return new a.ActiveXObject("Microsoft.XMLHTTP")
            } catch (b) {}
        }

        function M() {
            return setTimeout(function() {
                $b = b
            }), $b = ka.now()
        }

        function N(a, b, c) {
            for (var d, e = (ec[b] || []).concat(ec["*"]), f = 0, g = e.length; g > f; f++)
                if (d = e[f].call(c, b, a)) return d
        }

        function O(a, b, c) {
            var d, e, f = 0,
                g = dc.length,
                h = ka.Deferred().always(function() {
                    delete i.elem
                }),
                i = function() {
                    if (e) return !1;
                    for (var b = $b || M(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);
                    return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1)
                },
                j = h.promise({
                    elem: a,
                    props: ka.extend({}, b),
                    opts: ka.extend(!0, {
                        specialEasing: {}
                    }, c),
                    originalProperties: b,
                    originalOptions: c,
                    startTime: $b || M(),
                    duration: c.duration,
                    tweens: [],
                    createTween: function(b, c) {
                        var d = ka.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                        return j.tweens.push(d), d
                    },
                    stop: function(b) {
                        var c = 0,
                            d = b ? j.tweens.length : 0;
                        if (e) return this;
                        for (e = !0; d > c; c++) j.tweens[c].run(1);
                        return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this
                    }
                }),
                k = j.props;
            for (P(k, j.opts.specialEasing); g > f; f++)
                if (d = dc[f].call(j, a, k, j.opts)) return d;
            return ka.map(k, N, j), ka.isFunction(j.opts.start) && j.opts.start.call(a, j), ka.fx.timer(ka.extend(i, {
                elem: a,
                anim: j,
                queue: j.opts.queue
            })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always)
        }

        function P(a, b) {
            var c, d, e, f, g;
            for (c in a)
                if (d = ka.camelCase(c), e = b[d], f = a[c], ka.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = ka.cssHooks[d], g && "expand" in g) {
                    f = g.expand(f), delete a[d];
                    for (c in f) c in a || (a[c] = f[c], b[c] = e)
                } else b[d] = e
        }

        function Q(a, b, c) {
            var d, e, f, g, h, i, j = this,
                k = {},
                l = a.style,
                m = a.nodeType && x(a),
                n = ka._data(a, "fxshow");
            c.queue || (h = ka._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function() {
                h.unqueued || i()
            }), h.unqueued++, j.always(function() {
                j.always(function() {
                    h.unqueued--, ka.queue(a, "fx").length || h.empty.fire()
                })
            })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [l.overflow, l.overflowX, l.overflowY], "inline" === ka.css(a, "display") && "none" === ka.css(a, "float") && (ka.support.inlineBlockNeedsLayout && "inline" !== C(a.nodeName) ? l.zoom = 1 : l.display = "inline-block")), c.overflow && (l.overflow = "hidden", ka.support.shrinkWrapBlocks || j.always(function() {
                l.overflow = c.overflow[0], l.overflowX = c.overflow[1], l.overflowY = c.overflow[2]
            }));
            for (d in b)
                if (e = b[d], ac.exec(e)) {
                    if (delete b[d], f = f || "toggle" === e, e === (m ? "hide" : "show")) continue;
                    k[d] = n && n[d] || ka.style(a, d)
                }
            if (!ka.isEmptyObject(k)) {
                n ? "hidden" in n && (m = n.hidden) : n = ka._data(a, "fxshow", {}), f && (n.hidden = !m), m ? ka(a).show() : j.done(function() {
                    ka(a).hide()
                }), j.done(function() {
                    var b;
                    ka._removeData(a, "fxshow");
                    for (b in k) ka.style(a, b, k[b])
                });
                for (d in k) g = N(m ? n[d] : 0, d, j), d in n || (n[d] = g.start, m && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0))
            }
        }

        function R(a, b, c, d, e) {
            return new R.prototype.init(a, b, c, d, e)
        }

        function S(a, b) {
            var c, d = {
                    height: a
                },
                e = 0;
            for (b = b ? 1 : 0; 4 > e; e += 2 - b) c = xb[e], d["margin" + c] = d["padding" + c] = a;
            return b && (d.opacity = d.width = a), d
        }

        function T(a) {
            return ka.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1
        }
        var U, V, W = typeof b,
            X = a.location,
            Y = a.document,
            Z = Y.documentElement,
            $ = a.jQuery,
            _ = a.$,
            aa = {},
            ba = [],
            ca = "1.10.2",
            da = ba.concat,
            ea = ba.push,
            fa = ba.slice,
            ga = ba.indexOf,
            ha = aa.toString,
            ia = aa.hasOwnProperty,
            ja = ca.trim,
            ka = function(a, b) {
                return new ka.fn.init(a, b, V)
            },
            la = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
            ma = /\S+/g,
            na = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
            oa = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
            pa = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            qa = /^[\],:{}\s]*$/,
            ra = /(?:^|:|,)(?:\s*\[)+/g,
            sa = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
            ta = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
            ua = /^-ms-/,
            va = /-([\da-z])/gi,
            wa = function(a, b) {
                return b.toUpperCase()
            },
            xa = function(a) {
                (Y.addEventListener || "load" === a.type || "complete" === Y.readyState) && (ya(), ka.ready())
            },
            ya = function() {
                Y.addEventListener ? (Y.removeEventListener("DOMContentLoaded", xa, !1), a.removeEventListener("load", xa, !1)) : (Y.detachEvent("onreadystatechange", xa), a.detachEvent("onload", xa))
            };
        ka.fn = ka.prototype = {
                jquery: ca,
                constructor: ka,
                init: function(a, c, d) {
                    var e, f;
                    if (!a) return this;
                    if ("string" == typeof a) {
                        if (e = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [null, a, null] : oa.exec(a), !e || !e[1] && c) return !c || c.jquery ? (c || d).find(a) : this.constructor(c).find(a);
                        if (e[1]) {
                            if (c = c instanceof ka ? c[0] : c, ka.merge(this, ka.parseHTML(e[1], c && c.nodeType ? c.ownerDocument || c : Y, !0)), pa.test(e[1]) && ka.isPlainObject(c))
                                for (e in c) ka.isFunction(this[e]) ? this[e](c[e]) : this.attr(e, c[e]);
                            return this
                        }
                        if (f = Y.getElementById(e[2]), f && f.parentNode) {
                            if (f.id !== e[2]) return d.find(a);
                            this.length = 1, this[0] = f
                        }
                        return this.context = Y, this.selector = a, this
                    }
                    return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : ka.isFunction(a) ? d.ready(a) : (a.selector !== b && (this.selector = a.selector, this.context = a.context), ka.makeArray(a, this))
                },
                selector: "",
                length: 0,
                toArray: function() {
                    return fa.call(this)
                },
                get: function(a) {
                    return null == a ? this.toArray() : 0 > a ? this[this.length + a] : this[a]
                },
                pushStack: function(a) {
                    var b = ka.merge(this.constructor(), a);
                    return b.prevObject = this, b.context = this.context, b
                },
                each: function(a, b) {
                    return ka.each(this, a, b)
                },
                ready: function(a) {
                    return ka.ready.promise().done(a), this
                },
                slice: function() {
                    return this.pushStack(fa.apply(this, arguments))
                },
                first: function() {
                    return this.eq(0)
                },
                last: function() {
                    return this.eq(-1)
                },
                eq: function(a) {
                    var b = this.length,
                        c = +a + (0 > a ? b : 0);
                    return this.pushStack(c >= 0 && b > c ? [this[c]] : [])
                },
                map: function(a) {
                    return this.pushStack(ka.map(this, function(b, c) {
                        return a.call(b, c, b)
                    }))
                },
                end: function() {
                    return this.prevObject || this.constructor(null)
                },
                push: ea,
                sort: [].sort,
                splice: [].splice
            }, ka.fn.init.prototype = ka.fn, ka.extend = ka.fn.extend = function() {
                var a, c, d, e, f, g, h = arguments[0] || {},
                    i = 1,
                    j = arguments.length,
                    k = !1;
                for ("boolean" == typeof h && (k = h, h = arguments[1] || {}, i = 2), "object" == typeof h || ka.isFunction(h) || (h = {}), j === i && (h = this, --i); j > i; i++)
                    if (null != (f = arguments[i]))
                        for (e in f) a = h[e], d = f[e], h !== d && (k && d && (ka.isPlainObject(d) || (c = ka.isArray(d))) ? (c ? (c = !1, g = a && ka.isArray(a) ? a : []) : g = a && ka.isPlainObject(a) ? a : {}, h[e] = ka.extend(k, g, d)) : d !== b && (h[e] = d));
                return h
            }, ka.extend({
                expando: "jQuery" + (ca + Math.random()).replace(/\D/g, ""),
                noConflict: function(b) {
                    return a.$ === ka && (a.$ = _), b && a.jQuery === ka && (a.jQuery = $), ka
                },
                isReady: !1,
                readyWait: 1,
                holdReady: function(a) {
                    a ? ka.readyWait++ : ka.ready(!0)
                },
                ready: function(a) {
                    if (a === !0 ? !--ka.readyWait : !ka.isReady) {
                        if (!Y.body) return setTimeout(ka.ready);
                        ka.isReady = !0, a !== !0 && --ka.readyWait > 0 || (U.resolveWith(Y, [ka]), ka.fn.trigger && ka(Y).trigger("ready").off("ready"))
                    }
                },
                isFunction: function(a) {
                    return "function" === ka.type(a)
                },
                isArray: Array.isArray || function(a) {
                    return "array" === ka.type(a)
                },
                isWindow: function(a) {
                    return null != a && a == a.window
                },
                isNumeric: function(a) {
                    return !isNaN(parseFloat(a)) && isFinite(a)
                },
                type: function(a) {
                    return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? aa[ha.call(a)] || "object" : typeof a
                },
                isPlainObject: function(a) {
                    var c;
                    if (!a || "object" !== ka.type(a) || a.nodeType || ka.isWindow(a)) return !1;
                    try {
                        if (a.constructor && !ia.call(a, "constructor") && !ia.call(a.constructor.prototype, "isPrototypeOf")) return !1
                    } catch (d) {
                        return !1
                    }
                    if (ka.support.ownLast)
                        for (c in a) return ia.call(a, c);
                    for (c in a);
                    return c === b || ia.call(a, c)
                },
                isEmptyObject: function(a) {
                    var b;
                    for (b in a) return !1;
                    return !0
                },
                error: function(a) {
                    throw Error(a)
                },
                parseHTML: function(a, b, c) {
                    if (!a || "string" != typeof a) return null;
                    "boolean" == typeof b && (c = b, b = !1), b = b || Y;
                    var d = pa.exec(a),
                        e = !c && [];
                    return d ? [b.createElement(d[1])] : (d = ka.buildFragment([a], b, e), e && ka(e).remove(), ka.merge([], d.childNodes))
                },
                parseJSON: function(c) {
                    return a.JSON && a.JSON.parse ? a.JSON.parse(c) : null === c ? c : "string" == typeof c && (c = ka.trim(c), c && qa.test(c.replace(sa, "@").replace(ta, "]").replace(ra, ""))) ? Function("return " + c)() : (ka.error("Invalid JSON: " + c), b)
                },
                parseXML: function(c) {
                    var d, e;
                    if (!c || "string" != typeof c) return null;
                    try {
                        a.DOMParser ? (e = new DOMParser, d = e.parseFromString(c, "text/xml")) : (d = new ActiveXObject("Microsoft.XMLDOM"), d.async = "false", d.loadXML(c))
                    } catch (f) {
                        d = b
                    }
                    return d && d.documentElement && !d.getElementsByTagName("parsererror").length || ka.error("Invalid XML: " + c), d
                },
                noop: function() {},
                globalEval: function(b) {
                    b && ka.trim(b) && (a.execScript || function(b) {
                        a.eval.call(a, b)
                    })(b)
                },
                camelCase: function(a) {
                    return a.replace(ua, "ms-").replace(va, wa)
                },
                nodeName: function(a, b) {
                    return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
                },
                each: function(a, b, d) {
                    var e, f = 0,
                        g = a.length,
                        h = c(a);
                    if (d) {
                        if (h)
                            for (; g > f && (e = b.apply(a[f], d), e !== !1); f++);
                        else
                            for (f in a)
                                if (e = b.apply(a[f], d), e === !1) break
                    } else if (h)
                        for (; g > f && (e = b.call(a[f], f, a[f]), e !== !1); f++);
                    else
                        for (f in a)
                            if (e = b.call(a[f], f, a[f]), e === !1) break; return a
                },
                trim: ja && !ja.call("\ufeff� ") ? function(a) {
                    return null == a ? "" : ja.call(a)
                } : function(a) {
                    return null == a ? "" : (a + "").replace(na, "")
                },
                makeArray: function(a, b) {
                    var d = b || [];
                    return null != a && (c(Object(a)) ? ka.merge(d, "string" == typeof a ? [a] : a) : ea.call(d, a)), d
                },
                inArray: function(a, b, c) {
                    var d;
                    if (b) {
                        if (ga) return ga.call(b, a, c);
                        for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++)
                            if (c in b && b[c] === a) return c
                    }
                    return -1
                },
                merge: function(a, c) {
                    var d = c.length,
                        e = a.length,
                        f = 0;
                    if ("number" == typeof d)
                        for (; d > f; f++) a[e++] = c[f];
                    else
                        for (; c[f] !== b;) a[e++] = c[f++];
                    return a.length = e, a
                },
                grep: function(a, b, c) {
                    var d, e = [],
                        f = 0,
                        g = a.length;
                    for (c = !!c; g > f; f++) d = !!b(a[f], f), c !== d && e.push(a[f]);
                    return e
                },
                map: function(a, b, d) {
                    var e, f = 0,
                        g = a.length,
                        h = c(a),
                        i = [];
                    if (h)
                        for (; g > f; f++) e = b(a[f], f, d), null != e && (i[i.length] = e);
                    else
                        for (f in a) e = b(a[f], f, d), null != e && (i[i.length] = e);
                    return da.apply([], i)
                },
                guid: 1,
                proxy: function(a, c) {
                    var d, e, f;
                    return "string" == typeof c && (f = a[c], c = a, a = f), ka.isFunction(a) ? (d = fa.call(arguments, 2), e = function() {
                        return a.apply(c || this, d.concat(fa.call(arguments)))
                    }, e.guid = a.guid = a.guid || ka.guid++, e) : b
                },
                access: function(a, c, d, e, f, g, h) {
                    var i = 0,
                        j = a.length,
                        k = null == d;
                    if ("object" === ka.type(d)) {
                        f = !0;
                        for (i in d) ka.access(a, c, i, d[i], !0, g, h)
                    } else if (e !== b && (f = !0, ka.isFunction(e) || (h = !0), k && (h ? (c.call(a, e), c = null) : (k = c, c = function(a, b, c) {
                            return k.call(ka(a), c)
                        })), c))
                        for (; j > i; i++) c(a[i], d, h ? e : e.call(a[i], i, c(a[i], d)));
                    return f ? a : k ? c.call(a) : j ? c(a[0], d) : g
                },
                now: function() {
                    return (new Date).getTime()
                },
                swap: function(a, b, c, d) {
                    var e, f, g = {};
                    for (f in b) g[f] = a.style[f], a.style[f] = b[f];
                    e = c.apply(a, d || []);
                    for (f in b) a.style[f] = g[f];
                    return e
                }
            }), ka.ready.promise = function(b) {
                if (!U)
                    if (U = ka.Deferred(), "complete" === Y.readyState) setTimeout(ka.ready);
                    else if (Y.addEventListener) Y.addEventListener("DOMContentLoaded", xa, !1), a.addEventListener("load", xa, !1);
                else {
                    Y.attachEvent("onreadystatechange", xa), a.attachEvent("onload", xa);
                    var c = !1;
                    try {
                        c = null == a.frameElement && Y.documentElement
                    } catch (d) {}
                    c && c.doScroll && function e() {
                        if (!ka.isReady) {
                            try {
                                c.doScroll("left")
                            } catch (a) {
                                return setTimeout(e, 50)
                            }
                            ya(), ka.ready()
                        }
                    }()
                }
                return U.promise(b)
            }, ka.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
                aa["[object " + b + "]"] = b.toLowerCase()
            }), V = ka(Y),
            function(a, b) {
                function c(a, b, c, d) {
                    var e, f, g, h, i, j, k, l, o, p;
                    if ((b ? b.ownerDocument || b : O) !== G && F(b), b = b || G, c = c || [], !a || "string" != typeof a) return c;
                    if (1 !== (h = b.nodeType) && 9 !== h) return [];
                    if (I && !d) {
                        if (e = ta.exec(a))
                            if (g = e[1]) {
                                if (9 === h) {
                                    if (f = b.getElementById(g), !f || !f.parentNode) return c;
                                    if (f.id === g) return c.push(f), c
                                } else if (b.ownerDocument && (f = b.ownerDocument.getElementById(g)) && M(b, f) && f.id === g) return c.push(f), c
                            } else {
                                if (e[2]) return aa.apply(c, b.getElementsByTagName(a)), c;
                                if ((g = e[3]) && x.getElementsByClassName && b.getElementsByClassName) return aa.apply(c, b.getElementsByClassName(g)), c
                            }
                        if (x.qsa && (!J || !J.test(a))) {
                            if (l = k = N, o = b, p = 9 === h && a, 1 === h && "object" !== b.nodeName.toLowerCase()) {
                                for (j = m(a), (k = b.getAttribute("id")) ? l = k.replace(wa, "\\$&") : b.setAttribute("id", l), l = "[id='" + l + "'] ", i = j.length; i--;) j[i] = l + n(j[i]);
                                o = na.test(a) && b.parentNode || b, p = j.join(",")
                            }
                            if (p) try {
                                return aa.apply(c, o.querySelectorAll(p)), c
                            } catch (q) {} finally {
                                k || b.removeAttribute("id")
                            }
                        }
                    }
                    return v(a.replace(ja, "$1"), b, c, d)
                }

                function d() {
                    function a(c, d) {
                        return b.push(c += " ") > z.cacheLength && delete a[b.shift()], a[c] = d
                    }
                    var b = [];
                    return a
                }

                function e(a) {
                    return a[N] = !0, a
                }

                function f(a) {
                    var b = G.createElement("div");
                    try {
                        return !!a(b)
                    } catch (c) {
                        return !1
                    } finally {
                        b.parentNode && b.parentNode.removeChild(b), b = null
                    }
                }

                function g(a, b) {
                    for (var c = a.split("|"), d = a.length; d--;) z.attrHandle[c[d]] = b
                }

                function h(a, b) {
                    var c = b && a,
                        d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || X) - (~a.sourceIndex || X);
                    if (d) return d;
                    if (c)
                        for (; c = c.nextSibling;)
                            if (c === b) return -1;
                    return a ? 1 : -1
                }

                function i(a) {
                    return function(b) {
                        var c = b.nodeName.toLowerCase();
                        return "input" === c && b.type === a
                    }
                }

                function j(a) {
                    return function(b) {
                        var c = b.nodeName.toLowerCase();
                        return ("input" === c || "button" === c) && b.type === a
                    }
                }

                function k(a) {
                    return e(function(b) {
                        return b = +b, e(function(c, d) {
                            for (var e, f = a([], c.length, b), g = f.length; g--;) c[e = f[g]] && (c[e] = !(d[e] = c[e]))
                        })
                    })
                }

                function l() {}

                function m(a, b) {
                    var d, e, f, g, h, i, j, k = S[a + " "];
                    if (k) return b ? 0 : k.slice(0);
                    for (h = a, i = [], j = z.preFilter; h;) {
                        (!d || (e = la.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), d = !1, (e = ma.exec(h)) && (d = e.shift(), f.push({
                            value: d,
                            type: e[0].replace(ja, " ")
                        }), h = h.slice(d.length));
                        for (g in z.filter) !(e = ra[g].exec(h)) || j[g] && !(e = j[g](e)) || (d = e.shift(), f.push({
                            value: d,
                            type: g,
                            matches: e
                        }), h = h.slice(d.length));
                        if (!d) break
                    }
                    return b ? h.length : h ? c.error(a) : S(a, i).slice(0)
                }

                function n(a) {
                    for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
                    return d
                }

                function o(a, b, c) {
                    var d = b.dir,
                        e = c && "parentNode" === d,
                        f = Q++;
                    return b.first ? function(b, c, f) {
                        for (; b = b[d];)
                            if (1 === b.nodeType || e) return a(b, c, f)
                    } : function(b, c, g) {
                        var h, i, j, k = P + " " + f;
                        if (g) {
                            for (; b = b[d];)
                                if ((1 === b.nodeType || e) && a(b, c, g)) return !0
                        } else
                            for (; b = b[d];)
                                if (1 === b.nodeType || e)
                                    if (j = b[N] || (b[N] = {}), (i = j[d]) && i[0] === k) {
                                        if ((h = i[1]) === !0 || h === y) return h === !0
                                    } else if (i = j[d] = [k], i[1] = a(b, c, g) || y, i[1] === !0) return !0
                    }
                }

                function p(a) {
                    return a.length > 1 ? function(b, c, d) {
                        for (var e = a.length; e--;)
                            if (!a[e](b, c, d)) return !1;
                        return !0
                    } : a[0]
                }

                function q(a, b, c, d, e) {
                    for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)(f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));
                    return g
                }

                function r(a, b, c, d, f, g) {
                    return d && !d[N] && (d = r(d)), f && !f[N] && (f = r(f, g)), e(function(e, g, h, i) {
                        var j, k, l, m = [],
                            n = [],
                            o = g.length,
                            p = e || u(b || "*", h.nodeType ? [h] : h, []),
                            r = !a || !e && b ? p : q(p, m, a, h, i),
                            s = c ? f || (e ? a : o || d) ? [] : g : r;
                        if (c && c(r, s, h, i), d)
                            for (j = q(s, n), d(j, [], h, i), k = j.length; k--;)(l = j[k]) && (s[n[k]] = !(r[n[k]] = l));
                        if (e) {
                            if (f || a) {
                                if (f) {
                                    for (j = [], k = s.length; k--;)(l = s[k]) && j.push(r[k] = l);
                                    f(null, s = [], j, i)
                                }
                                for (k = s.length; k--;)(l = s[k]) && (j = f ? ca.call(e, l) : m[k]) > -1 && (e[j] = !(g[j] = l))
                            }
                        } else s = q(s === g ? s.splice(o, s.length) : s), f ? f(null, g, s, i) : aa.apply(g, s)
                    })
                }

                function s(a) {
                    for (var b, c, d, e = a.length, f = z.relative[a[0].type], g = f || z.relative[" "], h = f ? 1 : 0, i = o(function(a) {
                            return a === b
                        }, g, !0), j = o(function(a) {
                            return ca.call(b, a) > -1
                        }, g, !0), k = [function(a, c, d) {
                            return !f && (d || c !== D) || ((b = c).nodeType ? i(a, c, d) : j(a, c, d))
                        }]; e > h; h++)
                        if (c = z.relative[a[h].type]) k = [o(p(k), c)];
                        else {
                            if (c = z.filter[a[h].type].apply(null, a[h].matches), c[N]) {
                                for (d = ++h; e > d && !z.relative[a[d].type]; d++);
                                return r(h > 1 && p(k), h > 1 && n(a.slice(0, h - 1).concat({
                                    value: " " === a[h - 2].type ? "*" : ""
                                })).replace(ja, "$1"), c, d > h && s(a.slice(h, d)), e > d && s(a = a.slice(d)), e > d && n(a))
                            }
                            k.push(c)
                        }
                    return p(k)
                }

                function t(a, b) {
                    var d = 0,
                        f = b.length > 0,
                        g = a.length > 0,
                        h = function(e, h, i, j, k) {
                            var l, m, n, o = [],
                                p = 0,
                                r = "0",
                                s = e && [],
                                t = null != k,
                                u = D,
                                v = e || g && z.find.TAG("*", k && h.parentNode || h),
                                w = P += null == u ? 1 : Math.random() || .1;
                            for (t && (D = h !== G && h, y = d); null != (l = v[r]); r++) {
                                if (g && l) {
                                    for (m = 0; n = a[m++];)
                                        if (n(l, h, i)) {
                                            j.push(l);
                                            break
                                        }
                                    t && (P = w, y = ++d)
                                }
                                f && ((l = !n && l) && p--, e && s.push(l))
                            }
                            if (p += r, f && r !== p) {
                                for (m = 0; n = b[m++];) n(s, o, h, i);
                                if (e) {
                                    if (p > 0)
                                        for (; r--;) s[r] || o[r] || (o[r] = $.call(j));
                                    o = q(o)
                                }
                                aa.apply(j, o), t && !e && o.length > 0 && p + b.length > 1 && c.uniqueSort(j)
                            }
                            return t && (P = w, D = u), s
                        };
                    return f ? e(h) : h
                }

                function u(a, b, d) {
                    for (var e = 0, f = b.length; f > e; e++) c(a, b[e], d);
                    return d
                }

                function v(a, b, c, d) {
                    var e, f, g, h, i, j = m(a);
                    if (!d && 1 === j.length) {
                        if (f = j[0] = j[0].slice(0), f.length > 2 && "ID" === (g = f[0]).type && x.getById && 9 === b.nodeType && I && z.relative[f[1].type]) {
                            if (b = (z.find.ID(g.matches[0].replace(xa, ya), b) || [])[0], !b) return c;
                            a = a.slice(f.shift().value.length)
                        }
                        for (e = ra.needsContext.test(a) ? 0 : f.length; e-- && (g = f[e], !z.relative[h = g.type]);)
                            if ((i = z.find[h]) && (d = i(g.matches[0].replace(xa, ya), na.test(f[0].type) && b.parentNode || b))) {
                                if (f.splice(e, 1), a = d.length && n(f), !a) return aa.apply(c, d), c;
                                break
                            }
                    }
                    return C(a, j)(d, b, !I, c, na.test(a)), c
                }
                var w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N = "sizzle" + -new Date,
                    O = a.document,
                    P = 0,
                    Q = 0,
                    R = d(),
                    S = d(),
                    T = d(),
                    U = !1,
                    V = function(a, b) {
                        return a === b ? (U = !0, 0) : 0
                    },
                    W = typeof b,
                    X = 1 << 31,
                    Y = {}.hasOwnProperty,
                    Z = [],
                    $ = Z.pop,
                    _ = Z.push,
                    aa = Z.push,
                    ba = Z.slice,
                    ca = Z.indexOf || function(a) {
                        for (var b = 0, c = this.length; c > b; b++)
                            if (this[b] === a) return b;
                        return -1
                    },
                    da = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
                    ea = "[\\x20\\t\\r\\n\\f]",
                    fa = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
                    ga = fa.replace("w", "w#"),
                    ha = "\\[" + ea + "*(" + fa + ")" + ea + "*(?:([*^$|!~]?=)" + ea + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + ga + ")|)|)" + ea + "*\\]",
                    ia = ":(" + fa + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + ha.replace(3, 8) + ")*)|.*)\\)|)",
                    ja = RegExp("^" + ea + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ea + "+$", "g"),
                    la = RegExp("^" + ea + "*," + ea + "*"),
                    ma = RegExp("^" + ea + "*([>+~]|" + ea + ")" + ea + "*"),
                    na = RegExp(ea + "*[+~]"),
                    oa = RegExp("=" + ea + "*([^\\]'\"]*)" + ea + "*\\]", "g"),
                    pa = RegExp(ia),
                    qa = RegExp("^" + ga + "$"),
                    ra = {
                        ID: RegExp("^#(" + fa + ")"),
                        CLASS: RegExp("^\\.(" + fa + ")"),
                        TAG: RegExp("^(" + fa.replace("w", "w*") + ")"),
                        ATTR: RegExp("^" + ha),
                        PSEUDO: RegExp("^" + ia),
                        CHILD: RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + ea + "*(even|odd|(([+-]|)(\\d*)n|)" + ea + "*(?:([+-]|)" + ea + "*(\\d+)|))" + ea + "*\\)|)", "i"),
                        bool: RegExp("^(?:" + da + ")$", "i"),
                        needsContext: RegExp("^" + ea + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + ea + "*((?:-\\d)?\\d*)" + ea + "*\\)|)(?=[^-]|$)", "i")
                    },
                    sa = /^[^{]+\{\s*\[native \w/,
                    ta = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                    ua = /^(?:input|select|textarea|button)$/i,
                    va = /^h\d$/i,
                    wa = /'|\\/g,
                    xa = RegExp("\\\\([\\da-f]{1,6}" + ea + "?|(" + ea + ")|.)", "ig"),
                    ya = function(a, b, c) {
                        var d = "0x" + b - 65536;
                        return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(55296 | d >> 10, 56320 | 1023 & d)
                    };
                try {
                    aa.apply(Z = ba.call(O.childNodes), O.childNodes), Z[O.childNodes.length].nodeType
                } catch (za) {
                    aa = {
                        apply: Z.length ? function(a, b) {
                            _.apply(a, ba.call(b))
                        } : function(a, b) {
                            for (var c = a.length, d = 0; a[c++] = b[d++];);
                            a.length = c - 1
                        }
                    }
                }
                B = c.isXML = function(a) {
                    var b = a && (a.ownerDocument || a).documentElement;
                    return b ? "HTML" !== b.nodeName : !1
                }, x = c.support = {}, F = c.setDocument = function(a) {
                    var c = a ? a.ownerDocument || a : O,
                        d = c.defaultView;
                    return c !== G && 9 === c.nodeType && c.documentElement ? (G = c, H = c.documentElement, I = !B(c), d && d.attachEvent && d !== d.top && d.attachEvent("onbeforeunload", function() {
                        F()
                    }), x.attributes = f(function(a) {
                        return a.className = "i", !a.getAttribute("className")
                    }), x.getElementsByTagName = f(function(a) {
                        return a.appendChild(c.createComment("")), !a.getElementsByTagName("*").length
                    }), x.getElementsByClassName = f(function(a) {
                        return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 2 === a.getElementsByClassName("i").length
                    }), x.getById = f(function(a) {
                        return H.appendChild(a).id = N, !c.getElementsByName || !c.getElementsByName(N).length
                    }), x.getById ? (z.find.ID = function(a, b) {
                        if (typeof b.getElementById !== W && I) {
                            var c = b.getElementById(a);
                            return c && c.parentNode ? [c] : []
                        }
                    }, z.filter.ID = function(a) {
                        var b = a.replace(xa, ya);
                        return function(a) {
                            return a.getAttribute("id") === b
                        }
                    }) : (delete z.find.ID, z.filter.ID = function(a) {
                        var b = a.replace(xa, ya);
                        return function(a) {
                            var c = typeof a.getAttributeNode !== W && a.getAttributeNode("id");
                            return c && c.value === b
                        }
                    }), z.find.TAG = x.getElementsByTagName ? function(a, c) {
                        return typeof c.getElementsByTagName !== W ? c.getElementsByTagName(a) : b
                    } : function(a, b) {
                        var c, d = [],
                            e = 0,
                            f = b.getElementsByTagName(a);
                        if ("*" === a) {
                            for (; c = f[e++];) 1 === c.nodeType && d.push(c);
                            return d
                        }
                        return f
                    }, z.find.CLASS = x.getElementsByClassName && function(a, c) {
                        return typeof c.getElementsByClassName !== W && I ? c.getElementsByClassName(a) : b
                    }, K = [], J = [], (x.qsa = sa.test(c.querySelectorAll)) && (f(function(a) {
                        a.innerHTML = "<select><option selected=''></option></select>", a.querySelectorAll("[selected]").length || J.push("\\[" + ea + "*(?:value|" + da + ")"), a.querySelectorAll(":checked").length || J.push(":checked")
                    }), f(function(a) {
                        var b = c.createElement("input");
                        b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("t", ""), a.querySelectorAll("[t^='']").length && J.push("[*^$]=" + ea + "*(?:''|\"\")"), a.querySelectorAll(":enabled").length || J.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), J.push(",.*:")
                    })), (x.matchesSelector = sa.test(L = H.webkitMatchesSelector || H.mozMatchesSelector || H.oMatchesSelector || H.msMatchesSelector)) && f(function(a) {
                        x.disconnectedMatch = L.call(a, "div"), L.call(a, "[s!='']:x"), K.push("!=", ia)
                    }), J = J.length && RegExp(J.join("|")), K = K.length && RegExp(K.join("|")), M = sa.test(H.contains) || H.compareDocumentPosition ? function(a, b) {
                        var c = 9 === a.nodeType ? a.documentElement : a,
                            d = b && b.parentNode;
                        return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
                    } : function(a, b) {
                        if (b)
                            for (; b = b.parentNode;)
                                if (b === a) return !0;
                        return !1
                    }, V = H.compareDocumentPosition ? function(a, b) {
                        if (a === b) return U = !0, 0;
                        var d = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b);
                        return d ? 1 & d || !x.sortDetached && b.compareDocumentPosition(a) === d ? a === c || M(O, a) ? -1 : b === c || M(O, b) ? 1 : E ? ca.call(E, a) - ca.call(E, b) : 0 : 4 & d ? -1 : 1 : a.compareDocumentPosition ? -1 : 1
                    } : function(a, b) {
                        var d, e = 0,
                            f = a.parentNode,
                            g = b.parentNode,
                            i = [a],
                            j = [b];
                        if (a === b) return U = !0, 0;
                        if (!f || !g) return a === c ? -1 : b === c ? 1 : f ? -1 : g ? 1 : E ? ca.call(E, a) - ca.call(E, b) : 0;
                        if (f === g) return h(a, b);
                        for (d = a; d = d.parentNode;) i.unshift(d);
                        for (d = b; d = d.parentNode;) j.unshift(d);
                        for (; i[e] === j[e];) e++;
                        return e ? h(i[e], j[e]) : i[e] === O ? -1 : j[e] === O ? 1 : 0
                    }, c) : G
                }, c.matches = function(a, b) {
                    return c(a, null, null, b)
                }, c.matchesSelector = function(a, b) {
                    if ((a.ownerDocument || a) !== G && F(a), b = b.replace(oa, "='$1']"), !(!x.matchesSelector || !I || K && K.test(b) || J && J.test(b))) try {
                        var d = L.call(a, b);
                        if (d || x.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d
                    } catch (e) {}
                    return c(b, G, null, [a]).length > 0
                }, c.contains = function(a, b) {
                    return (a.ownerDocument || a) !== G && F(a), M(a, b)
                }, c.attr = function(a, c) {
                    (a.ownerDocument || a) !== G && F(a);
                    var d = z.attrHandle[c.toLowerCase()],
                        e = d && Y.call(z.attrHandle, c.toLowerCase()) ? d(a, c, !I) : b;
                    return e === b ? x.attributes || !I ? a.getAttribute(c) : (e = a.getAttributeNode(c)) && e.specified ? e.value : null : e
                }, c.error = function(a) {
                    throw Error("Syntax error, unrecognized expression: " + a)
                }, c.uniqueSort = function(a) {
                    var b, c = [],
                        d = 0,
                        e = 0;
                    if (U = !x.detectDuplicates, E = !x.sortStable && a.slice(0), a.sort(V), U) {
                        for (; b = a[e++];) b === a[e] && (d = c.push(e));
                        for (; d--;) a.splice(c[d], 1)
                    }
                    return a
                }, A = c.getText = function(a) {
                    var b, c = "",
                        d = 0,
                        e = a.nodeType;
                    if (e) {
                        if (1 === e || 9 === e || 11 === e) {
                            if ("string" == typeof a.textContent) return a.textContent;
                            for (a = a.firstChild; a; a = a.nextSibling) c += A(a)
                        } else if (3 === e || 4 === e) return a.nodeValue
                    } else
                        for (; b = a[d]; d++) c += A(b);
                    return c
                }, z = c.selectors = {
                    cacheLength: 50,
                    createPseudo: e,
                    match: ra,
                    attrHandle: {},
                    find: {},
                    relative: {
                        ">": {
                            dir: "parentNode",
                            first: !0
                        },
                        " ": {
                            dir: "parentNode"
                        },
                        "+": {
                            dir: "previousSibling",
                            first: !0
                        },
                        "~": {
                            dir: "previousSibling"
                        }
                    },
                    preFilter: {
                        ATTR: function(a) {
                            return a[1] = a[1].replace(xa, ya), a[3] = (a[4] || a[5] || "").replace(xa, ya), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
                        },
                        CHILD: function(a) {
                            return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || c.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && c.error(a[0]), a
                        },
                        PSEUDO: function(a) {
                            var c, d = !a[5] && a[2];
                            return ra.CHILD.test(a[0]) ? null : (a[3] && a[4] !== b ? a[2] = a[4] : d && pa.test(d) && (c = m(d, !0)) && (c = d.indexOf(")", d.length - c) - d.length) && (a[0] = a[0].slice(0, c), a[2] = d.slice(0, c)), a.slice(0, 3))
                        }
                    },
                    filter: {
                        TAG: function(a) {
                            var b = a.replace(xa, ya).toLowerCase();
                            return "*" === a ? function() {
                                return !0
                            } : function(a) {
                                return a.nodeName && a.nodeName.toLowerCase() === b
                            }
                        },
                        CLASS: function(a) {
                            var b = R[a + " "];
                            return b || (b = RegExp("(^|" + ea + ")" + a + "(" + ea + "|$)")) && R(a, function(a) {
                                return b.test("string" == typeof a.className && a.className || typeof a.getAttribute !== W && a.getAttribute("class") || "")
                            })
                        },
                        ATTR: function(a, b, d) {
                            return function(e) {
                                var f = c.attr(e, a);
                                return null == f ? "!=" === b : b ? (f += "", "=" === b ? f === d : "!=" === b ? f !== d : "^=" === b ? d && 0 === f.indexOf(d) : "*=" === b ? d && f.indexOf(d) > -1 : "$=" === b ? d && f.slice(-d.length) === d : "~=" === b ? (" " + f + " ").indexOf(d) > -1 : "|=" === b ? f === d || f.slice(0, d.length + 1) === d + "-" : !1) : !0
                            }
                        },
                        CHILD: function(a, b, c, d, e) {
                            var f = "nth" !== a.slice(0, 3),
                                g = "last" !== a.slice(-4),
                                h = "of-type" === b;
                            return 1 === d && 0 === e ? function(a) {
                                return !!a.parentNode
                            } : function(b, c, i) {
                                var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling",
                                    q = b.parentNode,
                                    r = h && b.nodeName.toLowerCase(),
                                    s = !i && !h;
                                if (q) {
                                    if (f) {
                                        for (; p;) {
                                            for (l = b; l = l[p];)
                                                if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
                                            o = p = "only" === a && !o && "nextSibling"
                                        }
                                        return !0
                                    }
                                    if (o = [g ? q.firstChild : q.lastChild], g && s) {
                                        for (k = q[N] || (q[N] = {}), j = k[a] || [], n = j[0] === P && j[1], m = j[0] === P && j[2], l = n && q.childNodes[n]; l = ++n && l && l[p] || (m = n = 0) || o.pop();)
                                            if (1 === l.nodeType && ++m && l === b) {
                                                k[a] = [P, n, m];
                                                break
                                            }
                                    } else if (s && (j = (b[N] || (b[N] = {}))[a]) && j[0] === P) m = j[1];
                                    else
                                        for (;
                                            (l = ++n && l && l[p] || (m = n = 0) || o.pop()) && ((h ? l.nodeName.toLowerCase() !== r : 1 !== l.nodeType) || !++m || (s && ((l[N] || (l[N] = {}))[a] = [P, m]), l !== b)););
                                    return m -= e, m === d || 0 === m % d && m / d >= 0
                                }
                            }
                        },
                        PSEUDO: function(a, b) {
                            var d, f = z.pseudos[a] || z.setFilters[a.toLowerCase()] || c.error("unsupported pseudo: " + a);
                            return f[N] ? f(b) : f.length > 1 ? (d = [a, a, "", b], z.setFilters.hasOwnProperty(a.toLowerCase()) ? e(function(a, c) {
                                for (var d, e = f(a, b), g = e.length; g--;) d = ca.call(a, e[g]), a[d] = !(c[d] = e[g])
                            }) : function(a) {
                                return f(a, 0, d)
                            }) : f
                        }
                    },
                    pseudos: {
                        not: e(function(a) {
                            var b = [],
                                c = [],
                                d = C(a.replace(ja, "$1"));
                            return d[N] ? e(function(a, b, c, e) {
                                for (var f, g = d(a, null, e, []), h = a.length; h--;)(f = g[h]) && (a[h] = !(b[h] = f))
                            }) : function(a, e, f) {
                                return b[0] = a, d(b, null, f, c), !c.pop()
                            }
                        }),
                        has: e(function(a) {
                            return function(b) {
                                return c(a, b).length > 0
                            }
                        }),
                        contains: e(function(a) {
                            return function(b) {
                                return (b.textContent || b.innerText || A(b)).indexOf(a) > -1
                            }
                        }),
                        lang: e(function(a) {
                            return qa.test(a || "") || c.error("unsupported lang: " + a), a = a.replace(xa, ya).toLowerCase(),
                                function(b) {
                                    var c;
                                    do
                                        if (c = I ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-");
                                    while ((b = b.parentNode) && 1 === b.nodeType);
                                    return !1
                                }
                        }),
                        target: function(b) {
                            var c = a.location && a.location.hash;
                            return c && c.slice(1) === b.id
                        },
                        root: function(a) {
                            return a === H
                        },
                        focus: function(a) {
                            return a === G.activeElement && (!G.hasFocus || G.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
                        },
                        enabled: function(a) {
                            return a.disabled === !1
                        },
                        disabled: function(a) {
                            return a.disabled === !0
                        },
                        checked: function(a) {
                            var b = a.nodeName.toLowerCase();
                            return "input" === b && !!a.checked || "option" === b && !!a.selected
                        },
                        selected: function(a) {
                            return a.parentNode && a.parentNode.selectedIndex, a.selected === !0
                        },
                        empty: function(a) {
                            for (a = a.firstChild; a; a = a.nextSibling)
                                if (a.nodeName > "@" || 3 === a.nodeType || 4 === a.nodeType) return !1;
                            return !0
                        },
                        parent: function(a) {
                            return !z.pseudos.empty(a)
                        },
                        header: function(a) {
                            return va.test(a.nodeName)
                        },
                        input: function(a) {
                            return ua.test(a.nodeName)
                        },
                        button: function(a) {
                            var b = a.nodeName.toLowerCase();
                            return "input" === b && "button" === a.type || "button" === b
                        },
                        text: function(a) {
                            var b;
                            return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || b.toLowerCase() === a.type)
                        },
                        first: k(function() {
                            return [0]
                        }),
                        last: k(function(a, b) {
                            return [b - 1]
                        }),
                        eq: k(function(a, b, c) {
                            return [0 > c ? c + b : c]
                        }),
                        even: k(function(a, b) {
                            for (var c = 0; b > c; c += 2) a.push(c);
                            return a
                        }),
                        odd: k(function(a, b) {
                            for (var c = 1; b > c; c += 2) a.push(c);
                            return a
                        }),
                        lt: k(function(a, b, c) {
                            for (var d = 0 > c ? c + b : c; --d >= 0;) a.push(d);
                            return a
                        }),
                        gt: k(function(a, b, c) {
                            for (var d = 0 > c ? c + b : c; b > ++d;) a.push(d);
                            return a
                        })
                    }
                }, z.pseudos.nth = z.pseudos.eq;
                for (w in {
                        radio: !0,
                        checkbox: !0,
                        file: !0,
                        password: !0,
                        image: !0
                    }) z.pseudos[w] = i(w);
                for (w in {
                        submit: !0,
                        reset: !0
                    }) z.pseudos[w] = j(w);
                l.prototype = z.filters = z.pseudos, z.setFilters = new l, C = c.compile = function(a, b) {
                    var c, d = [],
                        e = [],
                        f = T[a + " "];
                    if (!f) {
                        for (b || (b = m(a)), c = b.length; c--;) f = s(b[c]), f[N] ? d.push(f) : e.push(f);
                        f = T(a, t(e, d))
                    }
                    return f
                }, x.sortStable = N.split("").sort(V).join("") === N, x.detectDuplicates = U, F(), x.sortDetached = f(function(a) {
                    return 1 & a.compareDocumentPosition(G.createElement("div"))
                }), f(function(a) {
                    return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
                }) || g("type|href|height|width", function(a, c, d) {
                    return d ? b : a.getAttribute(c, "type" === c.toLowerCase() ? 1 : 2)
                }), x.attributes && f(function(a) {
                    return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
                }) || g("value", function(a, c, d) {
                    return d || "input" !== a.nodeName.toLowerCase() ? b : a.defaultValue
                }), f(function(a) {
                    return null == a.getAttribute("disabled")
                }) || g(da, function(a, c, d) {
                    var e;
                    return d ? b : (e = a.getAttributeNode(c)) && e.specified ? e.value : a[c] === !0 ? c.toLowerCase() : null
                }), ka.find = c, ka.expr = c.selectors, ka.expr[":"] = ka.expr.pseudos, ka.unique = c.uniqueSort, ka.text = c.getText, ka.isXMLDoc = c.isXML, ka.contains = c.contains
            }(a);
        var za = {};
        ka.Callbacks = function(a) {
            a = "string" == typeof a ? za[a] || d(a) : ka.extend({}, a);
            var c, e, f, g, h, i, j = [],
                k = !a.once && [],
                l = function(b) {
                    for (e = a.memory && b, f = !0, h = i || 0, i = 0, g = j.length, c = !0; j && g > h; h++)
                        if (j[h].apply(b[0], b[1]) === !1 && a.stopOnFalse) {
                            e = !1;
                            break
                        }
                    c = !1, j && (k ? k.length && l(k.shift()) : e ? j = [] : m.disable())
                },
                m = {
                    add: function() {
                        if (j) {
                            var b = j.length;
                            ! function d(b) {
                                ka.each(b, function(b, c) {
                                    var e = ka.type(c);
                                    "function" === e ? a.unique && m.has(c) || j.push(c) : c && c.length && "string" !== e && d(c)
                                })
                            }(arguments), c ? g = j.length : e && (i = b, l(e))
                        }
                        return this
                    },
                    remove: function() {
                        return j && ka.each(arguments, function(a, b) {
                            for (var d;
                                (d = ka.inArray(b, j, d)) > -1;) j.splice(d, 1), c && (g >= d && g--, h >= d && h--)
                        }), this
                    },
                    has: function(a) {
                        return a ? ka.inArray(a, j) > -1 : !(!j || !j.length)
                    },
                    empty: function() {
                        return j = [], g = 0, this
                    },
                    disable: function() {
                        return j = k = e = b, this
                    },
                    disabled: function() {
                        return !j
                    },
                    lock: function() {
                        return k = b, e || m.disable(), this
                    },
                    locked: function() {
                        return !k
                    },
                    fireWith: function(a, b) {
                        return !j || f && !k || (b = b || [], b = [a, b.slice ? b.slice() : b], c ? k.push(b) : l(b)), this
                    },
                    fire: function() {
                        return m.fireWith(this, arguments), this
                    },
                    fired: function() {
                        return !!f
                    }
                };
            return m
        }, ka.extend({
            Deferred: function(a) {
                var b = [
                        ["resolve", "done", ka.Callbacks("once memory"), "resolved"],
                        ["reject", "fail", ka.Callbacks("once memory"), "rejected"],
                        ["notify", "progress", ka.Callbacks("memory")]
                    ],
                    c = "pending",
                    d = {
                        state: function() {
                            return c
                        },
                        always: function() {
                            return e.done(arguments).fail(arguments), this
                        },
                        then: function() {
                            var a = arguments;
                            return ka.Deferred(function(c) {
                                ka.each(b, function(b, f) {
                                    var g = f[0],
                                        h = ka.isFunction(a[b]) && a[b];
                                    e[f[1]](function() {
                                        var a = h && h.apply(this, arguments);
                                        a && ka.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[g + "With"](this === d ? c.promise() : this, h ? [a] : arguments)
                                    })
                                }), a = null
                            }).promise()
                        },
                        promise: function(a) {
                            return null != a ? ka.extend(a, d) : d
                        }
                    },
                    e = {};
                return d.pipe = d.then, ka.each(b, function(a, f) {
                    var g = f[2],
                        h = f[3];
                    d[f[1]] = g.add, h && g.add(function() {
                        c = h
                    }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function() {
                        return e[f[0] + "With"](this === e ? d : this, arguments), this
                    }, e[f[0] + "With"] = g.fireWith
                }), d.promise(e), a && a.call(e, e), e
            },
            when: function(a) {
                var b, c, d, e = 0,
                    f = fa.call(arguments),
                    g = f.length,
                    h = 1 !== g || a && ka.isFunction(a.promise) ? g : 0,
                    i = 1 === h ? a : ka.Deferred(),
                    j = function(a, c, d) {
                        return function(e) {
                            c[a] = this, d[a] = arguments.length > 1 ? fa.call(arguments) : e, d === b ? i.notifyWith(c, d) : --h || i.resolveWith(c, d)
                        }
                    };
                if (g > 1)
                    for (b = Array(g), c = Array(g), d = Array(g); g > e; e++) f[e] && ka.isFunction(f[e].promise) ? f[e].promise().done(j(e, d, f)).fail(i.reject).progress(j(e, c, b)) : --h;
                return h || i.resolveWith(d, f), i.promise()
            }
        }), ka.support = function(b) {
            var c, d, e, f, g, h, i, j, k, l = Y.createElement("div");
            if (l.setAttribute("className", "t"), l.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", c = l.getElementsByTagName("*") || [], d = l.getElementsByTagName("a")[0], !d || !d.style || !c.length) return b;
            f = Y.createElement("select"), h = f.appendChild(Y.createElement("option")), e = l.getElementsByTagName("input")[0], d.style.cssText = "top:1px;float:left;opacity:.5", b.getSetAttribute = "t" !== l.className, b.leadingWhitespace = 3 === l.firstChild.nodeType, b.tbody = !l.getElementsByTagName("tbody").length, b.htmlSerialize = !!l.getElementsByTagName("link").length, b.style = /top/.test(d.getAttribute("style")), b.hrefNormalized = "/a" === d.getAttribute("href"), b.opacity = /^0.5/.test(d.style.opacity), b.cssFloat = !!d.style.cssFloat, b.checkOn = !!e.value, b.optSelected = h.selected, b.enctype = !!Y.createElement("form").enctype, b.html5Clone = "<:nav></:nav>" !== Y.createElement("nav").cloneNode(!0).outerHTML, b.inlineBlockNeedsLayout = !1, b.shrinkWrapBlocks = !1, b.pixelPosition = !1, b.deleteExpando = !0, b.noCloneEvent = !0, b.reliableMarginRight = !0, b.boxSizingReliable = !0, e.checked = !0, b.noCloneChecked = e.cloneNode(!0).checked, f.disabled = !0, b.optDisabled = !h.disabled;
            try {
                delete l.test
            } catch (m) {
                b.deleteExpando = !1
            }
            e = Y.createElement("input"), e.setAttribute("value", ""), b.input = "" === e.getAttribute("value"), e.value = "t", e.setAttribute("type", "radio"), b.radioValue = "t" === e.value, e.setAttribute("checked", "t"), e.setAttribute("name", "t"), g = Y.createDocumentFragment(), g.appendChild(e), b.appendChecked = e.checked, b.checkClone = g.cloneNode(!0).cloneNode(!0).lastChild.checked, l.attachEvent && (l.attachEvent("onclick", function() {
                b.noCloneEvent = !1
            }), l.cloneNode(!0).click());
            for (k in {
                    submit: !0,
                    change: !0,
                    focusin: !0
                }) l.setAttribute(i = "on" + k, "t"), b[k + "Bubbles"] = i in a || l.attributes[i].expando === !1;
            l.style.backgroundClip = "content-box", l.cloneNode(!0).style.backgroundClip = "", b.clearCloneStyle = "content-box" === l.style.backgroundClip;
            for (k in ka(b)) break;
            return b.ownLast = "0" !== k, ka(function() {
                var c, d, e, f = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
                    g = Y.getElementsByTagName("body")[0];
                g && (c = Y.createElement("div"), c.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", g.appendChild(c).appendChild(l), l.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", e = l.getElementsByTagName("td"), e[0].style.cssText = "padding:0;margin:0;border:0;display:none", j = 0 === e[0].offsetHeight, e[0].style.display = "", e[1].style.display = "none", b.reliableHiddenOffsets = j && 0 === e[0].offsetHeight, l.innerHTML = "", l.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", ka.swap(g, null != g.style.zoom ? {
                    zoom: 1
                } : {}, function() {
                    b.boxSizing = 4 === l.offsetWidth
                }), a.getComputedStyle && (b.pixelPosition = "1%" !== (a.getComputedStyle(l, null) || {}).top, b.boxSizingReliable = "4px" === (a.getComputedStyle(l, null) || {
                    width: "4px"
                }).width, d = l.appendChild(Y.createElement("div")), d.style.cssText = l.style.cssText = f, d.style.marginRight = d.style.width = "0", l.style.width = "1px", b.reliableMarginRight = !parseFloat((a.getComputedStyle(d, null) || {}).marginRight)), typeof l.style.zoom !== W && (l.innerHTML = "", l.style.cssText = f + "width:1px;padding:1px;display:inline;zoom:1", b.inlineBlockNeedsLayout = 3 === l.offsetWidth, l.style.display = "block", l.innerHTML = "<div></div>", l.firstChild.style.width = "5px", b.shrinkWrapBlocks = 3 !== l.offsetWidth, b.inlineBlockNeedsLayout && (g.style.zoom = 1)), g.removeChild(c), c = l = e = d = null)
            }), c = f = g = h = d = e = null, b
        }({});
        var Aa = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
            Ba = /([A-Z])/g;
        ka.extend({
            cache: {},
            noData: {
                applet: !0,
                embed: !0,
                object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
            },
            hasData: function(a) {
                return a = a.nodeType ? ka.cache[a[ka.expando]] : a[ka.expando], !!a && !h(a)
            },
            data: function(a, b, c) {
                return e(a, b, c)
            },
            removeData: function(a, b) {
                return f(a, b)
            },
            _data: function(a, b, c) {
                return e(a, b, c, !0)
            },
            _removeData: function(a, b) {
                return f(a, b, !0)
            },
            acceptData: function(a) {
                if (a.nodeType && 1 !== a.nodeType && 9 !== a.nodeType) return !1;
                var b = a.nodeName && ka.noData[a.nodeName.toLowerCase()];
                return !b || b !== !0 && a.getAttribute("classid") === b
            }
        }), ka.fn.extend({
            data: function(a, c) {
                var d, e, f = null,
                    h = 0,
                    i = this[0];
                if (a === b) {
                    if (this.length && (f = ka.data(i), 1 === i.nodeType && !ka._data(i, "parsedAttrs"))) {
                        for (d = i.attributes; d.length > h; h++) e = d[h].name, 0 === e.indexOf("data-") && (e = ka.camelCase(e.slice(5)), g(i, e, f[e]));
                        ka._data(i, "parsedAttrs", !0)
                    }
                    return f
                }
                return "object" == typeof a ? this.each(function() {
                    ka.data(this, a)
                }) : arguments.length > 1 ? this.each(function() {
                    ka.data(this, a, c)
                }) : i ? g(i, a, ka.data(i, a)) : null
            },
            removeData: function(a) {
                return this.each(function() {
                    ka.removeData(this, a)
                })
            }
        }), ka.extend({
            queue: function(a, c, d) {
                var e;
                return a ? (c = (c || "fx") + "queue", e = ka._data(a, c), d && (!e || ka.isArray(d) ? e = ka._data(a, c, ka.makeArray(d)) : e.push(d)), e || []) : b
            },
            dequeue: function(a, b) {
                b = b || "fx";
                var c = ka.queue(a, b),
                    d = c.length,
                    e = c.shift(),
                    f = ka._queueHooks(a, b),
                    g = function() {
                        ka.dequeue(a, b)
                    };
                "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire()
            },
            _queueHooks: function(a, b) {
                var c = b + "queueHooks";
                return ka._data(a, c) || ka._data(a, c, {
                    empty: ka.Callbacks("once memory").add(function() {
                        ka._removeData(a, b + "queue"), ka._removeData(a, c)
                    })
                })
            }
        }), ka.fn.extend({
            queue: function(a, c) {
                var d = 2;
                return "string" != typeof a && (c = a, a = "fx", d--), d > arguments.length ? ka.queue(this[0], a) : c === b ? this : this.each(function() {
                    var b = ka.queue(this, a, c);
                    ka._queueHooks(this, a), "fx" === a && "inprogress" !== b[0] && ka.dequeue(this, a)
                })
            },
            dequeue: function(a) {
                return this.each(function() {
                    ka.dequeue(this, a)
                })
            },
            delay: function(a, b) {
                return a = ka.fx ? ka.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
                    var d = setTimeout(b, a);
                    c.stop = function() {
                        clearTimeout(d)
                    }
                })
            },
            clearQueue: function(a) {
                return this.queue(a || "fx", [])
            },
            promise: function(a, c) {
                var d, e = 1,
                    f = ka.Deferred(),
                    g = this,
                    h = this.length,
                    i = function() {
                        --e || f.resolveWith(g, [g])
                    };
                for ("string" != typeof a && (c = a, a = b), a = a || "fx"; h--;) d = ka._data(g[h], a + "queueHooks"), d && d.empty && (e++, d.empty.add(i));
                return i(), f.promise(c)
            }
        });
        var Ca, Da, Ea = /[\t\r\n\f]/g,
            Fa = /\r/g,
            Ga = /^(?:input|select|textarea|button|object)$/i,
            Ha = /^(?:a|area)$/i,
            Ia = /^(?:checked|selected)$/i,
            Ja = ka.support.getSetAttribute,
            Ka = ka.support.input;
        ka.fn.extend({
            attr: function(a, b) {
                return ka.access(this, ka.attr, a, b, arguments.length > 1)
            },
            removeAttr: function(a) {
                return this.each(function() {
                    ka.removeAttr(this, a)
                })
            },
            prop: function(a, b) {
                return ka.access(this, ka.prop, a, b, arguments.length > 1)
            },
            removeProp: function(a) {
                return a = ka.propFix[a] || a, this.each(function() {
                    try {
                        this[a] = b, delete this[a]
                    } catch (c) {}
                })
            },
            addClass: function(a) {
                var b, c, d, e, f, g = 0,
                    h = this.length,
                    i = "string" == typeof a && a;
                if (ka.isFunction(a)) return this.each(function(b) {
                    ka(this).addClass(a.call(this, b, this.className))
                });
                if (i)
                    for (b = (a || "").match(ma) || []; h > g; g++)
                        if (c = this[g], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(Ea, " ") : " ")) {
                            for (f = 0; e = b[f++];) 0 > d.indexOf(" " + e + " ") && (d += e + " ");
                            c.className = ka.trim(d)
                        }
                return this
            },
            removeClass: function(a) {
                var b, c, d, e, f, g = 0,
                    h = this.length,
                    i = 0 === arguments.length || "string" == typeof a && a;
                if (ka.isFunction(a)) return this.each(function(b) {
                    ka(this).removeClass(a.call(this, b, this.className))
                });
                if (i)
                    for (b = (a || "").match(ma) || []; h > g; g++)
                        if (c = this[g], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(Ea, " ") : "")) {
                            for (f = 0; e = b[f++];)
                                for (; d.indexOf(" " + e + " ") >= 0;) d = d.replace(" " + e + " ", " ");
                            c.className = a ? ka.trim(d) : ""
                        }
                return this
            },
            toggleClass: function(a, b) {
                var c = typeof a;
                return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(ka.isFunction(a) ? function(c) {
                    ka(this).toggleClass(a.call(this, c, this.className, b), b)
                } : function() {
                    if ("string" === c)
                        for (var b, d = 0, e = ka(this), f = a.match(ma) || []; b = f[d++];) e.hasClass(b) ? e.removeClass(b) : e.addClass(b);
                    else(c === W || "boolean" === c) && (this.className && ka._data(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : ka._data(this, "__className__") || "")
                })
            },
            hasClass: function(a) {
                for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++)
                    if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(Ea, " ").indexOf(b) >= 0) return !0;
                return !1
            },
            val: function(a) {
                var c, d, e, f = this[0];
                return arguments.length ? (e = ka.isFunction(a), this.each(function(c) {
                    var f;
                    1 === this.nodeType && (f = e ? a.call(this, c, ka(this).val()) : a, null == f ? f = "" : "number" == typeof f ? f += "" : ka.isArray(f) && (f = ka.map(f, function(a) {
                        return null == a ? "" : a + ""
                    })), d = ka.valHooks[this.type] || ka.valHooks[this.nodeName.toLowerCase()], d && "set" in d && d.set(this, f, "value") !== b || (this.value = f))
                })) : f ? (d = ka.valHooks[f.type] || ka.valHooks[f.nodeName.toLowerCase()], d && "get" in d && (c = d.get(f, "value")) !== b ? c : (c = f.value, "string" == typeof c ? c.replace(Fa, "") : null == c ? "" : c)) : void 0
            }
        }), ka.extend({
            valHooks: {
                option: {
                    get: function(a) {
                        var b = ka.find.attr(a, "value");
                        return null != b ? b : a.text
                    }
                },
                select: {
                    get: function(a) {
                        for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)
                            if (c = d[i], !(!c.selected && i !== e || (ka.support.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && ka.nodeName(c.parentNode, "optgroup"))) {
                                if (b = ka(c).val(), f) return b;
                                g.push(b)
                            }
                        return g
                    },
                    set: function(a, b) {
                        for (var c, d, e = a.options, f = ka.makeArray(b), g = e.length; g--;) d = e[g], (d.selected = ka.inArray(ka(d).val(), f) >= 0) && (c = !0);
                        return c || (a.selectedIndex = -1), f
                    }
                }
            },
            attr: function(a, c, d) {
                var e, f, g = a.nodeType;
                return a && 3 !== g && 8 !== g && 2 !== g ? typeof a.getAttribute === W ? ka.prop(a, c, d) : (1 === g && ka.isXMLDoc(a) || (c = c.toLowerCase(), e = ka.attrHooks[c] || (ka.expr.match.bool.test(c) ? Da : Ca)), d === b ? e && "get" in e && null !== (f = e.get(a, c)) ? f : (f = ka.find.attr(a, c), null == f ? b : f) : null !== d ? e && "set" in e && (f = e.set(a, d, c)) !== b ? f : (a.setAttribute(c, d + ""), d) : (ka.removeAttr(a, c), b)) : void 0
            },
            removeAttr: function(a, b) {
                var c, d, e = 0,
                    f = b && b.match(ma);
                if (f && 1 === a.nodeType)
                    for (; c = f[e++];) d = ka.propFix[c] || c, ka.expr.match.bool.test(c) ? Ka && Ja || !Ia.test(c) ? a[d] = !1 : a[ka.camelCase("default-" + c)] = a[d] = !1 : ka.attr(a, c, ""), a.removeAttribute(Ja ? c : d)
            },
            attrHooks: {
                type: {
                    set: function(a, b) {
                        if (!ka.support.radioValue && "radio" === b && ka.nodeName(a, "input")) {
                            var c = a.value;
                            return a.setAttribute("type", b), c && (a.value = c), b
                        }
                    }
                }
            },
            propFix: {
                "for": "htmlFor",
                "class": "className"
            },
            prop: function(a, c, d) {
                var e, f, g, h = a.nodeType;
                return a && 3 !== h && 8 !== h && 2 !== h ? (g = 1 !== h || !ka.isXMLDoc(a), g && (c = ka.propFix[c] || c, f = ka.propHooks[c]), d !== b ? f && "set" in f && (e = f.set(a, d, c)) !== b ? e : a[c] = d : f && "get" in f && null !== (e = f.get(a, c)) ? e : a[c]) : void 0
            },
            propHooks: {
                tabIndex: {
                    get: function(a) {
                        var b = ka.find.attr(a, "tabindex");
                        return b ? parseInt(b, 10) : Ga.test(a.nodeName) || Ha.test(a.nodeName) && a.href ? 0 : -1
                    }
                }
            }
        }), Da = {
            set: function(a, b, c) {
                return b === !1 ? ka.removeAttr(a, c) : Ka && Ja || !Ia.test(c) ? a.setAttribute(!Ja && ka.propFix[c] || c, c) : a[ka.camelCase("default-" + c)] = a[c] = !0, c
            }
        }, ka.each(ka.expr.match.bool.source.match(/\w+/g), function(a, c) {
            var d = ka.expr.attrHandle[c] || ka.find.attr;
            ka.expr.attrHandle[c] = Ka && Ja || !Ia.test(c) ? function(a, c, e) {
                var f = ka.expr.attrHandle[c],
                    g = e ? b : (ka.expr.attrHandle[c] = b) != d(a, c, e) ? c.toLowerCase() : null;
                return ka.expr.attrHandle[c] = f, g
            } : function(a, c, d) {
                return d ? b : a[ka.camelCase("default-" + c)] ? c.toLowerCase() : null
            }
        }), Ka && Ja || (ka.attrHooks.value = {
            set: function(a, c, d) {
                return ka.nodeName(a, "input") ? (a.defaultValue = c, b) : Ca && Ca.set(a, c, d)
            }
        }), Ja || (Ca = {
            set: function(a, c, d) {
                var e = a.getAttributeNode(d);
                return e || a.setAttributeNode(e = a.ownerDocument.createAttribute(d)), e.value = c += "", "value" === d || c === a.getAttribute(d) ? c : b
            }
        }, ka.expr.attrHandle.id = ka.expr.attrHandle.name = ka.expr.attrHandle.coords = function(a, c, d) {
            var e;
            return d ? b : (e = a.getAttributeNode(c)) && "" !== e.value ? e.value : null
        }, ka.valHooks.button = {
            get: function(a, c) {
                var d = a.getAttributeNode(c);
                return d && d.specified ? d.value : b
            },
            set: Ca.set
        }, ka.attrHooks.contenteditable = {
            set: function(a, b, c) {
                Ca.set(a, "" === b ? !1 : b, c)
            }
        }, ka.each(["width", "height"], function(a, c) {
            ka.attrHooks[c] = {
                set: function(a, d) {
                    return "" === d ? (a.setAttribute(c, "auto"), d) : b
                }
            }
        })), ka.support.hrefNormalized || ka.each(["href", "src"], function(a, b) {
            ka.propHooks[b] = {
                get: function(a) {
                    return a.getAttribute(b, 4)
                }
            }
        }), ka.support.style || (ka.attrHooks.style = {
            get: function(a) {
                return a.style.cssText || b
            },
            set: function(a, b) {
                return a.style.cssText = b + ""
            }
        }), ka.support.optSelected || (ka.propHooks.selected = {
            get: function(a) {
                var b = a.parentNode;
                return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null
            }
        }), ka.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
            ka.propFix[this.toLowerCase()] = this
        }), ka.support.enctype || (ka.propFix.enctype = "encoding"), ka.each(["radio", "checkbox"], function() {
            ka.valHooks[this] = {
                set: function(a, c) {
                    return ka.isArray(c) ? a.checked = ka.inArray(ka(a).val(), c) >= 0 : b
                }
            }, ka.support.checkOn || (ka.valHooks[this].get = function(a) {
                return null === a.getAttribute("value") ? "on" : a.value
            })
        });
        var La = /^(?:input|select|textarea)$/i,
            Ma = /^key/,
            Na = /^(?:mouse|contextmenu)|click/,
            Oa = /^(?:focusinfocus|focusoutblur)$/,
            Pa = /^([^.]*)(?:\.(.+)|)$/;
        ka.event = {
            global: {},
            add: function(a, c, d, e, f) {
                var g, h, i, j, k, l, m, n, o, p, q, r = ka._data(a);
                if (r) {
                    for (d.handler && (j = d, d = j.handler, f = j.selector), d.guid || (d.guid = ka.guid++), (h = r.events) || (h = r.events = {}), (l = r.handle) || (l = r.handle = function(a) {
                            return typeof ka === W || a && ka.event.triggered === a.type ? b : ka.event.dispatch.apply(l.elem, arguments)
                        }, l.elem = a), c = (c || "").match(ma) || [""], i = c.length; i--;) g = Pa.exec(c[i]) || [], o = q = g[1], p = (g[2] || "").split(".").sort(), o && (k = ka.event.special[o] || {}, o = (f ? k.delegateType : k.bindType) || o, k = ka.event.special[o] || {}, m = ka.extend({
                        type: o,
                        origType: q,
                        data: e,
                        handler: d,
                        guid: d.guid,
                        selector: f,
                        needsContext: f && ka.expr.match.needsContext.test(f),
                        namespace: p.join(".")
                    }, j), (n = h[o]) || (n = h[o] = [], n.delegateCount = 0, k.setup && k.setup.call(a, e, p, l) !== !1 || (a.addEventListener ? a.addEventListener(o, l, !1) : a.attachEvent && a.attachEvent("on" + o, l))), k.add && (k.add.call(a, m), m.handler.guid || (m.handler.guid = d.guid)), f ? n.splice(n.delegateCount++, 0, m) : n.push(m), ka.event.global[o] = !0);
                    a = null
                }
            },
            remove: function(a, b, c, d, e) {
                var f, g, h, i, j, k, l, m, n, o, p, q = ka.hasData(a) && ka._data(a);
                if (q && (k = q.events)) {
                    for (b = (b || "").match(ma) || [""], j = b.length; j--;)
                        if (h = Pa.exec(b[j]) || [], n = p = h[1], o = (h[2] || "").split(".").sort(), n) {
                            for (l = ka.event.special[n] || {}, n = (d ? l.delegateType : l.bindType) || n, m = k[n] || [], h = h[2] && RegExp("(^|\\.)" + o.join("\\.(?:.*\\.|)") + "(\\.|$)"), i = f = m.length; f--;) g = m[f], !e && p !== g.origType || c && c.guid !== g.guid || h && !h.test(g.namespace) || d && d !== g.selector && ("**" !== d || !g.selector) || (m.splice(f, 1), g.selector && m.delegateCount--, l.remove && l.remove.call(a, g));
                            i && !m.length && (l.teardown && l.teardown.call(a, o, q.handle) !== !1 || ka.removeEvent(a, n, q.handle), delete k[n])
                        } else
                            for (n in k) ka.event.remove(a, n + b[j], c, d, !0);
                    ka.isEmptyObject(k) && (delete q.handle, ka._removeData(a, "events"))
                }
            },
            trigger: function(c, d, e, f) {
                var g, h, i, j, k, l, m, n = [e || Y],
                    o = ia.call(c, "type") ? c.type : c,
                    p = ia.call(c, "namespace") ? c.namespace.split(".") : [];
                if (i = l = e = e || Y, 3 !== e.nodeType && 8 !== e.nodeType && !Oa.test(o + ka.event.triggered) && (o.indexOf(".") >= 0 && (p = o.split("."), o = p.shift(), p.sort()), h = 0 > o.indexOf(":") && "on" + o, c = c[ka.expando] ? c : new ka.Event(o, "object" == typeof c && c), c.isTrigger = f ? 2 : 3, c.namespace = p.join("."), c.namespace_re = c.namespace ? RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, c.result = b, c.target || (c.target = e), d = null == d ? [c] : ka.makeArray(d, [c]), k = ka.event.special[o] || {}, f || !k.trigger || k.trigger.apply(e, d) !== !1)) {
                    if (!f && !k.noBubble && !ka.isWindow(e)) {
                        for (j = k.delegateType || o, Oa.test(j + o) || (i = i.parentNode); i; i = i.parentNode) n.push(i), l = i;
                        l === (e.ownerDocument || Y) && n.push(l.defaultView || l.parentWindow || a)
                    }
                    for (m = 0;
                        (i = n[m++]) && !c.isPropagationStopped();) c.type = m > 1 ? j : k.bindType || o, g = (ka._data(i, "events") || {})[c.type] && ka._data(i, "handle"), g && g.apply(i, d), g = h && i[h], g && ka.acceptData(i) && g.apply && g.apply(i, d) === !1 && c.preventDefault();
                    if (c.type = o, !f && !c.isDefaultPrevented() && (!k._default || k._default.apply(n.pop(), d) === !1) && ka.acceptData(e) && h && e[o] && !ka.isWindow(e)) {
                        l = e[h], l && (e[h] = null), ka.event.triggered = o;
                        try {
                            e[o]()
                        } catch (q) {}
                        ka.event.triggered = b, l && (e[h] = l)
                    }
                    return c.result
                }
            },
            dispatch: function(a) {
                a = ka.event.fix(a);
                var c, d, e, f, g, h = [],
                    i = fa.call(arguments),
                    j = (ka._data(this, "events") || {})[a.type] || [],
                    k = ka.event.special[a.type] || {};
                if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
                    for (h = ka.event.handlers.call(this, a, j), c = 0;
                        (f = h[c++]) && !a.isPropagationStopped();)
                        for (a.currentTarget = f.elem, g = 0;
                            (e = f.handlers[g++]) && !a.isImmediatePropagationStopped();)(!a.namespace_re || a.namespace_re.test(e.namespace)) && (a.handleObj = e, a.data = e.data, d = ((ka.event.special[e.origType] || {}).handle || e.handler).apply(f.elem, i), d !== b && (a.result = d) === !1 && (a.preventDefault(), a.stopPropagation()));
                    return k.postDispatch && k.postDispatch.call(this, a), a.result
                }
            },
            handlers: function(a, c) {
                var d, e, f, g, h = [],
                    i = c.delegateCount,
                    j = a.target;
                if (i && j.nodeType && (!a.button || "click" !== a.type))
                    for (; j != this; j = j.parentNode || this)
                        if (1 === j.nodeType && (j.disabled !== !0 || "click" !== a.type)) {
                            for (f = [], g = 0; i > g; g++) e = c[g], d = e.selector + " ", f[d] === b && (f[d] = e.needsContext ? ka(d, this).index(j) >= 0 : ka.find(d, this, null, [j]).length), f[d] && f.push(e);
                            f.length && h.push({
                                elem: j,
                                handlers: f
                            })
                        }
                return c.length > i && h.push({
                    elem: this,
                    handlers: c.slice(i)
                }), h
            },
            fix: function(a) {
                if (a[ka.expando]) return a;
                var b, c, d, e = a.type,
                    f = a,
                    g = this.fixHooks[e];
                for (g || (this.fixHooks[e] = g = Na.test(e) ? this.mouseHooks : Ma.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new ka.Event(f), b = d.length; b--;) c = d[b], a[c] = f[c];
                return a.target || (a.target = f.srcElement || Y), 3 === a.target.nodeType && (a.target = a.target.parentNode), a.metaKey = !!a.metaKey, g.filter ? g.filter(a, f) : a
            },
            props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
            fixHooks: {},
            keyHooks: {
                props: "char charCode key keyCode".split(" "),
                filter: function(a, b) {
                    return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a
                }
            },
            mouseHooks: {
                props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                filter: function(a, c) {
                    var d, e, f, g = c.button,
                        h = c.fromElement;
                    return null == a.pageX && null != c.clientX && (e = a.target.ownerDocument || Y, f = e.documentElement, d = e.body, a.pageX = c.clientX + (f && f.scrollLeft || d && d.scrollLeft || 0) - (f && f.clientLeft || d && d.clientLeft || 0), a.pageY = c.clientY + (f && f.scrollTop || d && d.scrollTop || 0) - (f && f.clientTop || d && d.clientTop || 0)), !a.relatedTarget && h && (a.relatedTarget = h === a.target ? c.toElement : h), a.which || g === b || (a.which = 1 & g ? 1 : 2 & g ? 3 : 4 & g ? 2 : 0), a
                }
            },
            special: {
                load: {
                    noBubble: !0
                },
                focus: {
                    trigger: function() {
                        if (this !== k() && this.focus) try {
                            return this.focus(), !1
                        } catch (a) {}
                    },
                    delegateType: "focusin"
                },
                blur: {
                    trigger: function() {
                        return this === k() && this.blur ? (this.blur(), !1) : b
                    },
                    delegateType: "focusout"
                },
                click: {
                    trigger: function() {
                        return ka.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), !1) : b
                    },
                    _default: function(a) {
                        return ka.nodeName(a.target, "a")
                    }
                },
                beforeunload: {
                    postDispatch: function(a) {
                        a.result !== b && (a.originalEvent.returnValue = a.result)
                    }
                }
            },
            simulate: function(a, b, c, d) {
                var e = ka.extend(new ka.Event, c, {
                    type: a,
                    isSimulated: !0,
                    originalEvent: {}
                });
                d ? ka.event.trigger(e, null, b) : ka.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault()
            }
        }, ka.removeEvent = Y.removeEventListener ? function(a, b, c) {
            a.removeEventListener && a.removeEventListener(b, c, !1)
        } : function(a, b, c) {
            var d = "on" + b;
            a.detachEvent && (typeof a[d] === W && (a[d] = null), a.detachEvent(d, c))
        }, ka.Event = function(a, c) {
            return this instanceof ka.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault() ? i : j) : this.type = a, c && ka.extend(this, c), this.timeStamp = a && a.timeStamp || ka.now(), this[ka.expando] = !0, b) : new ka.Event(a, c)
        }, ka.Event.prototype = {
            isDefaultPrevented: j,
            isPropagationStopped: j,
            isImmediatePropagationStopped: j,
            preventDefault: function() {
                var a = this.originalEvent;
                this.isDefaultPrevented = i, a && (a.preventDefault ? a.preventDefault() : a.returnValue = !1)
            },
            stopPropagation: function() {
                var a = this.originalEvent;
                this.isPropagationStopped = i, a && (a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0)
            },
            stopImmediatePropagation: function() {
                this.isImmediatePropagationStopped = i, this.stopPropagation()
            }
        }, ka.each({
            mouseenter: "mouseover",
            mouseleave: "mouseout"
        }, function(a, b) {
            ka.event.special[a] = {
                delegateType: b,
                bindType: b,
                handle: function(a) {
                    var c, d = this,
                        e = a.relatedTarget,
                        f = a.handleObj;
                    return (!e || e !== d && !ka.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c
                }
            }
        }), ka.support.submitBubbles || (ka.event.special.submit = {
            setup: function() {
                return ka.nodeName(this, "form") ? !1 : (ka.event.add(this, "click._submit keypress._submit", function(a) {
                    var c = a.target,
                        d = ka.nodeName(c, "input") || ka.nodeName(c, "button") ? c.form : b;
                    d && !ka._data(d, "submitBubbles") && (ka.event.add(d, "submit._submit", function(a) {
                        a._submit_bubble = !0
                    }), ka._data(d, "submitBubbles", !0))
                }), b)
            },
            postDispatch: function(a) {
                a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && ka.event.simulate("submit", this.parentNode, a, !0))
            },
            teardown: function() {
                return ka.nodeName(this, "form") ? !1 : (ka.event.remove(this, "._submit"), b)
            }
        }), ka.support.changeBubbles || (ka.event.special.change = {
            setup: function() {
                return La.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (ka.event.add(this, "propertychange._change", function(a) {
                    "checked" === a.originalEvent.propertyName && (this._just_changed = !0)
                }), ka.event.add(this, "click._change", function(a) {
                    this._just_changed && !a.isTrigger && (this._just_changed = !1), ka.event.simulate("change", this, a, !0)
                })), !1) : (ka.event.add(this, "beforeactivate._change", function(a) {
                    var b = a.target;
                    La.test(b.nodeName) && !ka._data(b, "changeBubbles") && (ka.event.add(b, "change._change", function(a) {
                        !this.parentNode || a.isSimulated || a.isTrigger || ka.event.simulate("change", this.parentNode, a, !0)
                    }), ka._data(b, "changeBubbles", !0))
                }), b)
            },
            handle: function(a) {
                var c = a.target;
                return this !== c || a.isSimulated || a.isTrigger || "radio" !== c.type && "checkbox" !== c.type ? a.handleObj.handler.apply(this, arguments) : b
            },
            teardown: function() {
                return ka.event.remove(this, "._change"), !La.test(this.nodeName)
            }
        }), ka.support.focusinBubbles || ka.each({
            focus: "focusin",
            blur: "focusout"
        }, function(a, b) {
            var c = 0,
                d = function(a) {
                    ka.event.simulate(b, a.target, ka.event.fix(a), !0)
                };
            ka.event.special[b] = {
                setup: function() {
                    0 === c++ && Y.addEventListener(a, d, !0)
                },
                teardown: function() {
                    0 === --c && Y.removeEventListener(a, d, !0)
                }
            }
        }), ka.fn.extend({
            on: function(a, c, d, e, f) {
                var g, h;
                if ("object" == typeof a) {
                    "string" != typeof c && (d = d || c, c = b);
                    for (g in a) this.on(g, c, d, a[g], f);
                    return this
                }
                if (null == d && null == e ? (e = c, d = c = b) : null == e && ("string" == typeof c ? (e = d, d = b) : (e = d, d = c, c = b)), e === !1) e = j;
                else if (!e) return this;
                return 1 === f && (h = e, e = function(a) {
                    return ka().off(a), h.apply(this, arguments)
                }, e.guid = h.guid || (h.guid = ka.guid++)), this.each(function() {
                    ka.event.add(this, a, e, d, c)
                })
            },
            one: function(a, b, c, d) {
                return this.on(a, b, c, d, 1)
            },
            off: function(a, c, d) {
                var e, f;
                if (a && a.preventDefault && a.handleObj) return e = a.handleObj, ka(a.delegateTarget).off(e.namespace ? e.origType + "." + e.namespace : e.origType, e.selector, e.handler), this;
                if ("object" == typeof a) {
                    for (f in a) this.off(f, c, a[f]);
                    return this
                }
                return (c === !1 || "function" == typeof c) && (d = c, c = b), d === !1 && (d = j), this.each(function() {
                    ka.event.remove(this, a, d, c)
                })
            },
            trigger: function(a, b) {
                return this.each(function() {
                    ka.event.trigger(a, b, this)
                })
            },
            triggerHandler: function(a, c) {
                var d = this[0];
                return d ? ka.event.trigger(a, c, d, !0) : b
            }
        });
        var Qa = /^.[^:#\[\.,]*$/,
            Ra = /^(?:parents|prev(?:Until|All))/,
            Sa = ka.expr.match.needsContext,
            Ta = {
                children: !0,
                contents: !0,
                next: !0,
                prev: !0
            };
        ka.fn.extend({
            find: function(a) {
                var b, c = [],
                    d = this,
                    e = d.length;
                if ("string" != typeof a) return this.pushStack(ka(a).filter(function() {
                    for (b = 0; e > b; b++)
                        if (ka.contains(d[b], this)) return !0
                }));
                for (b = 0; e > b; b++) ka.find(a, d[b], c);
                return c = this.pushStack(e > 1 ? ka.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, c
            },
            has: function(a) {
                var b, c = ka(a, this),
                    d = c.length;
                return this.filter(function() {
                    for (b = 0; d > b; b++)
                        if (ka.contains(this, c[b])) return !0
                })
            },
            not: function(a) {
                return this.pushStack(m(this, a || [], !0))
            },
            filter: function(a) {
                return this.pushStack(m(this, a || [], !1))
            },
            is: function(a) {
                return !!m(this, "string" == typeof a && Sa.test(a) ? ka(a) : a || [], !1).length
            },
            closest: function(a, b) {
                for (var c, d = 0, e = this.length, f = [], g = Sa.test(a) || "string" != typeof a ? ka(a, b || this.context) : 0; e > d; d++)
                    for (c = this[d]; c && c !== b; c = c.parentNode)
                        if (11 > c.nodeType && (g ? g.index(c) > -1 : 1 === c.nodeType && ka.find.matchesSelector(c, a))) {
                            c = f.push(c);
                            break
                        }
                return this.pushStack(f.length > 1 ? ka.unique(f) : f)
            },
            index: function(a) {
                return a ? "string" == typeof a ? ka.inArray(this[0], ka(a)) : ka.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
            },
            add: function(a, b) {
                var c = "string" == typeof a ? ka(a, b) : ka.makeArray(a && a.nodeType ? [a] : a),
                    d = ka.merge(this.get(), c);
                return this.pushStack(ka.unique(d))
            },
            addBack: function(a) {
                return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
            }
        }), ka.each({
            parent: function(a) {
                var b = a.parentNode;
                return b && 11 !== b.nodeType ? b : null
            },
            parents: function(a) {
                return ka.dir(a, "parentNode")
            },
            parentsUntil: function(a, b, c) {
                return ka.dir(a, "parentNode", c)
            },
            next: function(a) {
                return l(a, "nextSibling")
            },
            prev: function(a) {
                return l(a, "previousSibling")
            },
            nextAll: function(a) {
                return ka.dir(a, "nextSibling")
            },
            prevAll: function(a) {
                return ka.dir(a, "previousSibling")
            },
            nextUntil: function(a, b, c) {
                return ka.dir(a, "nextSibling", c)
            },
            prevUntil: function(a, b, c) {
                return ka.dir(a, "previousSibling", c)
            },
            siblings: function(a) {
                return ka.sibling((a.parentNode || {}).firstChild, a)
            },
            children: function(a) {
                return ka.sibling(a.firstChild)
            },
            contents: function(a) {
                return ka.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : ka.merge([], a.childNodes)
            }
        }, function(a, b) {
            ka.fn[a] = function(c, d) {
                var e = ka.map(this, b, c);
                return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = ka.filter(d, e)), this.length > 1 && (Ta[a] || (e = ka.unique(e)), Ra.test(a) && (e = e.reverse())), this.pushStack(e)
            }
        }), ka.extend({
            filter: function(a, b, c) {
                var d = b[0];
                return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? ka.find.matchesSelector(d, a) ? [d] : [] : ka.find.matches(a, ka.grep(b, function(a) {
                    return 1 === a.nodeType
                }))
            },
            dir: function(a, c, d) {
                for (var e = [], f = a[c]; f && 9 !== f.nodeType && (d === b || 1 !== f.nodeType || !ka(f).is(d));) 1 === f.nodeType && e.push(f), f = f[c];
                return e
            },
            sibling: function(a, b) {
                for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
                return c
            }
        });
        var Ua = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
            Va = / jQuery\d+="(?:null|\d+)"/g,
            Wa = RegExp("<(?:" + Ua + ")[\\s/>]", "i"),
            Xa = /^\s+/,
            Ya = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            Za = /<([\w:]+)/,
            $a = /<tbody/i,
            _a = /<|&#?\w+;/,
            ab = /<(?:script|style|link)/i,
            bb = /^(?:checkbox|radio)$/i,
            cb = /checked\s*(?:[^=]|=\s*.checked.)/i,
            db = /^$|\/(?:java|ecma)script/i,
            eb = /^true\/(.*)/,
            fb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
            gb = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                legend: [1, "<fieldset>", "</fieldset>"],
                area: [1, "<map>", "</map>"],
                param: [1, "<object>", "</object>"],
                thead: [1, "<table>", "</table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                _default: ka.support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
            },
            hb = n(Y),
            ib = hb.appendChild(Y.createElement("div"));
        gb.optgroup = gb.option, gb.tbody = gb.tfoot = gb.colgroup = gb.caption = gb.thead, gb.th = gb.td, ka.fn.extend({
            text: function(a) {
                return ka.access(this, function(a) {
                    return a === b ? ka.text(this) : this.empty().append((this[0] && this[0].ownerDocument || Y).createTextNode(a))
                }, null, a, arguments.length)
            },
            append: function() {
                return this.domManip(arguments, function(a) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var b = o(this, a);
                        b.appendChild(a)
                    }
                })
            },
            prepend: function() {
                return this.domManip(arguments, function(a) {
                    if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var b = o(this, a);
                        b.insertBefore(a, b.firstChild)
                    }
                })
            },
            before: function() {
                return this.domManip(arguments, function(a) {
                    this.parentNode && this.parentNode.insertBefore(a, this)
                })
            },
            after: function() {
                return this.domManip(arguments, function(a) {
                    this.parentNode && this.parentNode.insertBefore(a, this.nextSibling)
                })
            },
            remove: function(a, b) {
                for (var c, d = a ? ka.filter(a, this) : this, e = 0; null != (c = d[e]); e++) b || 1 !== c.nodeType || ka.cleanData(u(c)), c.parentNode && (b && ka.contains(c.ownerDocument, c) && r(u(c, "script")), c.parentNode.removeChild(c));
                return this
            },
            empty: function() {
                for (var a, b = 0; null != (a = this[b]); b++) {
                    for (1 === a.nodeType && ka.cleanData(u(a, !1)); a.firstChild;) a.removeChild(a.firstChild);
                    a.options && ka.nodeName(a, "select") && (a.options.length = 0)
                }
                return this
            },
            clone: function(a, b) {
                return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
                    return ka.clone(this, a, b)
                })
            },
            html: function(a) {
                return ka.access(this, function(a) {
                    var c = this[0] || {},
                        d = 0,
                        e = this.length;
                    if (a === b) return 1 === c.nodeType ? c.innerHTML.replace(Va, "") : b;
                    if (!("string" != typeof a || ab.test(a) || !ka.support.htmlSerialize && Wa.test(a) || !ka.support.leadingWhitespace && Xa.test(a) || gb[(Za.exec(a) || ["", ""])[1].toLowerCase()])) {
                        a = a.replace(Ya, "<$1></$2>");
                        try {
                            for (; e > d; d++) c = this[d] || {}, 1 === c.nodeType && (ka.cleanData(u(c, !1)), c.innerHTML = a);
                            c = 0
                        } catch (f) {}
                    }
                    c && this.empty().append(a)
                }, null, a, arguments.length)
            },
            replaceWith: function() {
                var a = ka.map(this, function(a) {
                        return [a.nextSibling, a.parentNode]
                    }),
                    b = 0;
                return this.domManip(arguments, function(c) {
                    var d = a[b++],
                        e = a[b++];
                    e && (d && d.parentNode !== e && (d = this.nextSibling), ka(this).remove(), e.insertBefore(c, d))
                }, !0), b ? this : this.remove()
            },
            detach: function(a) {
                return this.remove(a, !0)
            },
            domManip: function(a, b, c) {
                a = da.apply([], a);
                var d, e, f, g, h, i, j = 0,
                    k = this.length,
                    l = this,
                    m = k - 1,
                    n = a[0],
                    o = ka.isFunction(n);
                if (o || !(1 >= k || "string" != typeof n || ka.support.checkClone) && cb.test(n)) return this.each(function(d) {
                    var e = l.eq(d);
                    o && (a[0] = n.call(this, d, e.html())), e.domManip(a, b, c)
                });
                if (k && (i = ka.buildFragment(a, this[0].ownerDocument, !1, !c && this), d = i.firstChild, 1 === i.childNodes.length && (i = d), d)) {
                    for (g = ka.map(u(i, "script"), p), f = g.length; k > j; j++) e = i, j !== m && (e = ka.clone(e, !0, !0), f && ka.merge(g, u(e, "script"))), b.call(this[j], e, j);
                    if (f)
                        for (h = g[g.length - 1].ownerDocument, ka.map(g, q), j = 0; f > j; j++) e = g[j], db.test(e.type || "") && !ka._data(e, "globalEval") && ka.contains(h, e) && (e.src ? ka._evalUrl(e.src) : ka.globalEval((e.text || e.textContent || e.innerHTML || "").replace(fb, "")));
                    i = d = null
                }
                return this
            }
        }), ka.each({
            appendTo: "append",
            prependTo: "prepend",
            insertBefore: "before",
            insertAfter: "after",
            replaceAll: "replaceWith"
        }, function(a, b) {
            ka.fn[a] = function(a) {
                for (var c, d = 0, e = [], f = ka(a), g = f.length - 1; g >= d; d++) c = d === g ? this : this.clone(!0), ka(f[d])[b](c), ea.apply(e, c.get());
                return this.pushStack(e)
            }
        }), ka.extend({
            clone: function(a, b, c) {
                var d, e, f, g, h, i = ka.contains(a.ownerDocument, a);
                if (ka.support.html5Clone || ka.isXMLDoc(a) || !Wa.test("<" + a.nodeName + ">") ? f = a.cloneNode(!0) : (ib.innerHTML = a.outerHTML, ib.removeChild(f = ib.firstChild)), !(ka.support.noCloneEvent && ka.support.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || ka.isXMLDoc(a)))
                    for (d = u(f), h = u(a), g = 0; null != (e = h[g]); ++g) d[g] && t(e, d[g]);
                if (b)
                    if (c)
                        for (h = h || u(a), d = d || u(f), g = 0; null != (e = h[g]); g++) s(e, d[g]);
                    else s(a, f);
                return d = u(f, "script"), d.length > 0 && r(d, !i && u(a, "script")), d = h = e = null, f
            },
            buildFragment: function(a, b, c, d) {
                for (var e, f, g, h, i, j, k, l = a.length, m = n(b), o = [], p = 0; l > p; p++)
                    if (f = a[p], f || 0 === f)
                        if ("object" === ka.type(f)) ka.merge(o, f.nodeType ? [f] : f);
                        else if (_a.test(f)) {
                    for (h = h || m.appendChild(b.createElement("div")), i = (Za.exec(f) || ["", ""])[1].toLowerCase(), k = gb[i] || gb._default, h.innerHTML = k[1] + f.replace(Ya, "<$1></$2>") + k[2], e = k[0]; e--;) h = h.lastChild;
                    if (!ka.support.leadingWhitespace && Xa.test(f) && o.push(b.createTextNode(Xa.exec(f)[0])), !ka.support.tbody)
                        for (f = "table" !== i || $a.test(f) ? "<table>" !== k[1] || $a.test(f) ? 0 : h : h.firstChild, e = f && f.childNodes.length; e--;) ka.nodeName(j = f.childNodes[e], "tbody") && !j.childNodes.length && f.removeChild(j);
                    for (ka.merge(o, h.childNodes), h.textContent = ""; h.firstChild;) h.removeChild(h.firstChild);
                    h = m.lastChild
                } else o.push(b.createTextNode(f));
                for (h && m.removeChild(h), ka.support.appendChecked || ka.grep(u(o, "input"), v), p = 0; f = o[p++];)
                    if ((!d || -1 === ka.inArray(f, d)) && (g = ka.contains(f.ownerDocument, f), h = u(m.appendChild(f), "script"), g && r(h), c))
                        for (e = 0; f = h[e++];) db.test(f.type || "") && c.push(f);
                return h = null, m
            },
            cleanData: function(a, b) {
                for (var c, d, e, f, g = 0, h = ka.expando, i = ka.cache, j = ka.support.deleteExpando, k = ka.event.special; null != (c = a[g]); g++)
                    if ((b || ka.acceptData(c)) && (e = c[h], f = e && i[e])) {
                        if (f.events)
                            for (d in f.events) k[d] ? ka.event.remove(c, d) : ka.removeEvent(c, d, f.handle);
                        i[e] && (delete i[e], j ? delete c[h] : typeof c.removeAttribute !== W ? c.removeAttribute(h) : c[h] = null, ba.push(e))
                    }
            },
            _evalUrl: function(a) {
                return ka.ajax({
                    url: a,
                    type: "GET",
                    dataType: "script",
                    async: !1,
                    global: !1,
                    "throws": !0
                })
            }
        }), ka.fn.extend({
            wrapAll: function(a) {
                if (ka.isFunction(a)) return this.each(function(b) {
                    ka(this).wrapAll(a.call(this, b))
                });
                if (this[0]) {
                    var b = ka(a, this[0].ownerDocument).eq(0).clone(!0);
                    this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                        for (var a = this; a.firstChild && 1 === a.firstChild.nodeType;) a = a.firstChild;
                        return a
                    }).append(this)
                }
                return this
            },
            wrapInner: function(a) {
                return this.each(ka.isFunction(a) ? function(b) {
                    ka(this).wrapInner(a.call(this, b))
                } : function() {
                    var b = ka(this),
                        c = b.contents();
                    c.length ? c.wrapAll(a) : b.append(a)
                })
            },
            wrap: function(a) {
                var b = ka.isFunction(a);
                return this.each(function(c) {
                    ka(this).wrapAll(b ? a.call(this, c) : a)
                })
            },
            unwrap: function() {
                return this.parent().each(function() {
                    ka.nodeName(this, "body") || ka(this).replaceWith(this.childNodes)
                }).end()
            }
        });
        var jb, kb, lb, mb = /alpha\([^)]*\)/i,
            nb = /opacity\s*=\s*([^)]*)/,
            ob = /^(top|right|bottom|left)$/,
            pb = /^(none|table(?!-c[ea]).+)/,
            qb = /^margin/,
            rb = RegExp("^(" + la + ")(.*)$", "i"),
            sb = RegExp("^(" + la + ")(?!px)[a-z%]+$", "i"),
            tb = RegExp("^([+-])=(" + la + ")", "i"),
            ub = {
                BODY: "block"
            },
            vb = {
                position: "absolute",
                visibility: "hidden",
                display: "block"
            },
            wb = {
                letterSpacing: 0,
                fontWeight: 400
            },
            xb = ["Top", "Right", "Bottom", "Left"],
            yb = ["Webkit", "O", "Moz", "ms"];
        ka.fn.extend({
            css: function(a, c) {
                return ka.access(this, function(a, c, d) {
                    var e, f, g = {},
                        h = 0;
                    if (ka.isArray(c)) {
                        for (f = kb(a), e = c.length; e > h; h++) g[c[h]] = ka.css(a, c[h], !1, f);
                        return g
                    }
                    return d !== b ? ka.style(a, c, d) : ka.css(a, c)
                }, a, c, arguments.length > 1)
            },
            show: function() {
                return y(this, !0)
            },
            hide: function() {
                return y(this)
            },
            toggle: function(a) {
                return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
                    x(this) ? ka(this).show() : ka(this).hide()
                })
            }
        }), ka.extend({
            cssHooks: {
                opacity: {
                    get: function(a, b) {
                        if (b) {
                            var c = lb(a, "opacity");
                            return "" === c ? "1" : c
                        }
                    }
                }
            },
            cssNumber: {
                columnCount: !0,
                fillOpacity: !0,
                fontWeight: !0,
                lineHeight: !0,
                opacity: !0,
                order: !0,
                orphans: !0,
                widows: !0,
                zIndex: !0,
                zoom: !0
            },
            cssProps: {
                "float": ka.support.cssFloat ? "cssFloat" : "styleFloat"
            },
            style: function(a, c, d, e) {
                if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
                    var f, g, h, i = ka.camelCase(c),
                        j = a.style;
                    if (c = ka.cssProps[i] || (ka.cssProps[i] = w(j, i)), h = ka.cssHooks[c] || ka.cssHooks[i], d === b) return h && "get" in h && (f = h.get(a, !1, e)) !== b ? f : j[c];
                    if (g = typeof d, "string" === g && (f = tb.exec(d)) && (d = (f[1] + 1) * f[2] + parseFloat(ka.css(a, c)), g = "number"), !(null == d || "number" === g && isNaN(d) || ("number" !== g || ka.cssNumber[i] || (d += "px"), ka.support.clearCloneStyle || "" !== d || 0 !== c.indexOf("background") || (j[c] = "inherit"), h && "set" in h && (d = h.set(a, d, e)) === b))) try {
                        j[c] = d
                    } catch (k) {}
                }
            },
            css: function(a, c, d, e) {
                var f, g, h, i = ka.camelCase(c);
                return c = ka.cssProps[i] || (ka.cssProps[i] = w(a.style, i)), h = ka.cssHooks[c] || ka.cssHooks[i], h && "get" in h && (g = h.get(a, !0, d)), g === b && (g = lb(a, c, e)), "normal" === g && c in wb && (g = wb[c]), "" === d || d ? (f = parseFloat(g), d === !0 || ka.isNumeric(f) ? f || 0 : g) : g
            }
        }), a.getComputedStyle ? (kb = function(b) {
            return a.getComputedStyle(b, null)
        }, lb = function(a, c, d) {
            var e, f, g, h = d || kb(a),
                i = h ? h.getPropertyValue(c) || h[c] : b,
                j = a.style;
            return h && ("" !== i || ka.contains(a.ownerDocument, a) || (i = ka.style(a, c)), sb.test(i) && qb.test(c) && (e = j.width, f = j.minWidth, g = j.maxWidth, j.minWidth = j.maxWidth = j.width = i, i = h.width, j.width = e, j.minWidth = f, j.maxWidth = g)), i
        }) : Y.documentElement.currentStyle && (kb = function(a) {
            return a.currentStyle
        }, lb = function(a, c, d) {
            var e, f, g, h = d || kb(a),
                i = h ? h[c] : b,
                j = a.style;
            return null == i && j && j[c] && (i = j[c]), sb.test(i) && !ob.test(c) && (e = j.left, f = a.runtimeStyle, g = f && f.left, g && (f.left = a.currentStyle.left), j.left = "fontSize" === c ? "1em" : i, i = j.pixelLeft + "px", j.left = e, g && (f.left = g)), "" === i ? "auto" : i
        }), ka.each(["height", "width"], function(a, c) {
            ka.cssHooks[c] = {
                get: function(a, d, e) {
                    return d ? 0 === a.offsetWidth && pb.test(ka.css(a, "display")) ? ka.swap(a, vb, function() {
                        return B(a, c, e)
                    }) : B(a, c, e) : b
                },
                set: function(a, b, d) {
                    var e = d && kb(a);
                    return z(a, b, d ? A(a, c, d, ka.support.boxSizing && "border-box" === ka.css(a, "boxSizing", !1, e), e) : 0)
                }
            }
        }), ka.support.opacity || (ka.cssHooks.opacity = {
            get: function(a, b) {
                return nb.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : ""
            },
            set: function(a, b) {
                var c = a.style,
                    d = a.currentStyle,
                    e = ka.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "",
                    f = d && d.filter || c.filter || "";
                c.zoom = 1, (b >= 1 || "" === b) && "" === ka.trim(f.replace(mb, "")) && c.removeAttribute && (c.removeAttribute("filter"), "" === b || d && !d.filter) || (c.filter = mb.test(f) ? f.replace(mb, e) : f + " " + e)
            }
        }), ka(function() {
            ka.support.reliableMarginRight || (ka.cssHooks.marginRight = {
                get: function(a, c) {
                    return c ? ka.swap(a, {
                        display: "inline-block"
                    }, lb, [a, "marginRight"]) : b
                }
            }), !ka.support.pixelPosition && ka.fn.position && ka.each(["top", "left"], function(a, c) {
                ka.cssHooks[c] = {
                    get: function(a, d) {
                        return d ? (d = lb(a, c), sb.test(d) ? ka(a).position()[c] + "px" : d) : b
                    }
                }
            })
        }), ka.expr && ka.expr.filters && (ka.expr.filters.hidden = function(a) {
            return 0 >= a.offsetWidth && 0 >= a.offsetHeight || !ka.support.reliableHiddenOffsets && "none" === (a.style && a.style.display || ka.css(a, "display"))
        }, ka.expr.filters.visible = function(a) {
            return !ka.expr.filters.hidden(a)
        }), ka.each({
            margin: "",
            padding: "",
            border: "Width"
        }, function(a, b) {
            ka.cssHooks[a + b] = {
                expand: function(c) {
                    for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++) e[a + xb[d] + b] = f[d] || f[d - 2] || f[0];
                    return e
                }
            }, qb.test(a) || (ka.cssHooks[a + b].set = z)
        });
        var zb = /%20/g,
            Ab = /\[\]$/,
            Bb = /\r?\n/g,
            Cb = /^(?:submit|button|image|reset|file)$/i,
            Db = /^(?:input|select|textarea|keygen)/i;
        ka.fn.extend({
            serialize: function() {
                return ka.param(this.serializeArray())
            },
            serializeArray: function() {
                return this.map(function() {
                    var a = ka.prop(this, "elements");
                    return a ? ka.makeArray(a) : this
                }).filter(function() {
                    var a = this.type;
                    return this.name && !ka(this).is(":disabled") && Db.test(this.nodeName) && !Cb.test(a) && (this.checked || !bb.test(a))
                }).map(function(a, b) {
                    var c = ka(this).val();
                    return null == c ? null : ka.isArray(c) ? ka.map(c, function(a) {
                        return {
                            name: b.name,
                            value: a.replace(Bb, "\r\n")
                        }
                    }) : {
                        name: b.name,
                        value: c.replace(Bb, "\r\n")
                    }
                }).get()
            }
        }), ka.param = function(a, c) {
            var d, e = [],
                f = function(a, b) {
                    b = ka.isFunction(b) ? b() : null == b ? "" : b, e[e.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b)
                };
            if (c === b && (c = ka.ajaxSettings && ka.ajaxSettings.traditional), ka.isArray(a) || a.jquery && !ka.isPlainObject(a)) ka.each(a, function() {
                f(this.name, this.value)
            });
            else
                for (d in a) E(d, a[d], c, f);
            return e.join("&").replace(zb, "+")
        }, ka.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
            ka.fn[b] = function(a, c) {
                return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
            }
        }), ka.fn.extend({
            hover: function(a, b) {
                return this.mouseenter(a).mouseleave(b || a)
            },
            bind: function(a, b, c) {
                return this.on(a, null, b, c)
            },
            unbind: function(a, b) {
                return this.off(a, null, b)
            },
            delegate: function(a, b, c, d) {
                return this.on(b, a, c, d)
            },
            undelegate: function(a, b, c) {
                return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c)
            }
        });
        var Eb, Fb, Gb = ka.now(),
            Hb = /\?/,
            Ib = /#.*$/,
            Jb = /([?&])_=[^&]*/,
            Kb = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
            Lb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
            Mb = /^(?:GET|HEAD)$/,
            Nb = /^\/\//,
            Ob = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
            Pb = ka.fn.load,
            Qb = {},
            Rb = {},
            Sb = "*/".concat("*");
        try {
            Fb = X.href
        } catch (Tb) {
            Fb = Y.createElement("a"), Fb.href = "", Fb = Fb.href
        }
        Eb = Ob.exec(Fb.toLowerCase()) || [], ka.fn.load = function(a, c, d) {
            if ("string" != typeof a && Pb) return Pb.apply(this, arguments);
            var e, f, g, h = this,
                i = a.indexOf(" ");
            return i >= 0 && (e = a.slice(i, a.length), a = a.slice(0, i)), ka.isFunction(c) ? (d = c, c = b) : c && "object" == typeof c && (g = "POST"), h.length > 0 && ka.ajax({
                url: a,
                type: g,
                dataType: "html",
                data: c
            }).done(function(a) {
                f = arguments, h.html(e ? ka("<div>").append(ka.parseHTML(a)).find(e) : a)
            }).complete(d && function(a, b) {
                h.each(d, f || [a.responseText, b, a])
            }), this
        }, ka.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(a, b) {
            ka.fn[b] = function(a) {
                return this.on(b, a)
            }
        }), ka.extend({
            active: 0,
            lastModified: {},
            etag: {},
            ajaxSettings: {
                url: Fb,
                type: "GET",
                isLocal: Lb.test(Eb[1]),
                global: !0,
                processData: !0,
                async: !0,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                accepts: {
                    "*": Sb,
                    text: "text/plain",
                    html: "text/html",
                    xml: "application/xml, text/xml",
                    json: "application/json, text/javascript"
                },
                contents: {
                    xml: /xml/,
                    html: /html/,
                    json: /json/
                },
                responseFields: {
                    xml: "responseXML",
                    text: "responseText",
                    json: "responseJSON"
                },
                converters: {
                    "* text": String,
                    "text html": !0,
                    "text json": ka.parseJSON,
                    "text xml": ka.parseXML
                },
                flatOptions: {
                    url: !0,
                    context: !0
                }
            },
            ajaxSetup: function(a, b) {
                return b ? H(H(a, ka.ajaxSettings), b) : H(ka.ajaxSettings, a)
            },
            ajaxPrefilter: F(Qb),
            ajaxTransport: F(Rb),
            ajax: function(a, c) {
                function d(a, c, d, e) {
                    var f, l, s, t, v, x = c;
                    2 !== u && (u = 2, i && clearTimeout(i), k = b, h = e || "", w.readyState = a > 0 ? 4 : 0, f = a >= 200 && 300 > a || 304 === a, d && (t = I(m, w, d)), t = J(m, t, w, f), f ? (m.ifModified && (v = w.getResponseHeader("Last-Modified"), v && (ka.lastModified[g] = v), v = w.getResponseHeader("etag"), v && (ka.etag[g] = v)), 204 === a || "HEAD" === m.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = t.state, l = t.data, s = t.error, f = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), w.status = a, w.statusText = (c || x) + "", f ? p.resolveWith(n, [l, x, w]) : p.rejectWith(n, [w, x, s]), w.statusCode(r), r = b, j && o.trigger(f ? "ajaxSuccess" : "ajaxError", [w, m, f ? l : s]), q.fireWith(n, [w, x]), j && (o.trigger("ajaxComplete", [w, m]), --ka.active || ka.event.trigger("ajaxStop")))
                }
                "object" == typeof a && (c = a, a = b), c = c || {};
                var e, f, g, h, i, j, k, l, m = ka.ajaxSetup({}, c),
                    n = m.context || m,
                    o = m.context && (n.nodeType || n.jquery) ? ka(n) : ka.event,
                    p = ka.Deferred(),
                    q = ka.Callbacks("once memory"),
                    r = m.statusCode || {},
                    s = {},
                    t = {},
                    u = 0,
                    v = "canceled",
                    w = {
                        readyState: 0,
                        getResponseHeader: function(a) {
                            var b;
                            if (2 === u) {
                                if (!l)
                                    for (l = {}; b = Kb.exec(h);) l[b[1].toLowerCase()] = b[2];
                                b = l[a.toLowerCase()]
                            }
                            return null == b ? null : b
                        },
                        getAllResponseHeaders: function() {
                            return 2 === u ? h : null
                        },
                        setRequestHeader: function(a, b) {
                            var c = a.toLowerCase();
                            return u || (a = t[c] = t[c] || a, s[a] = b), this
                        },
                        overrideMimeType: function(a) {
                            return u || (m.mimeType = a), this
                        },
                        statusCode: function(a) {
                            var b;
                            if (a)
                                if (2 > u)
                                    for (b in a) r[b] = [r[b], a[b]];
                                else w.always(a[w.status]);
                            return this
                        },
                        abort: function(a) {
                            var b = a || v;
                            return k && k.abort(b), d(0, b), this
                        }
                    };
                if (p.promise(w).complete = q.add, w.success = w.done, w.error = w.fail, m.url = ((a || m.url || Fb) + "").replace(Ib, "").replace(Nb, Eb[1] + "//"), m.type = c.method || c.type || m.method || m.type, m.dataTypes = ka.trim(m.dataType || "*").toLowerCase().match(ma) || [""], null == m.crossDomain && (e = Ob.exec(m.url.toLowerCase()), m.crossDomain = !(!e || e[1] === Eb[1] && e[2] === Eb[2] && (e[3] || ("http:" === e[1] ? "80" : "443")) === (Eb[3] || ("http:" === Eb[1] ? "80" : "443")))), m.data && m.processData && "string" != typeof m.data && (m.data = ka.param(m.data, m.traditional)), G(Qb, m, c, w), 2 === u) return w;
                j = m.global, j && 0 === ka.active++ && ka.event.trigger("ajaxStart"), m.type = m.type.toUpperCase(), m.hasContent = !Mb.test(m.type), g = m.url, m.hasContent || (m.data && (g = m.url += (Hb.test(g) ? "&" : "?") + m.data, delete m.data), m.cache === !1 && (m.url = Jb.test(g) ? g.replace(Jb, "$1_=" + Gb++) : g + (Hb.test(g) ? "&" : "?") + "_=" + Gb++)), m.ifModified && (ka.lastModified[g] && w.setRequestHeader("If-Modified-Since", ka.lastModified[g]), ka.etag[g] && w.setRequestHeader("If-None-Match", ka.etag[g])), (m.data && m.hasContent && m.contentType !== !1 || c.contentType) && w.setRequestHeader("Content-Type", m.contentType), w.setRequestHeader("Accept", m.dataTypes[0] && m.accepts[m.dataTypes[0]] ? m.accepts[m.dataTypes[0]] + ("*" !== m.dataTypes[0] ? ", " + Sb + "; q=0.01" : "") : m.accepts["*"]);
                for (f in m.headers) w.setRequestHeader(f, m.headers[f]);
                if (m.beforeSend && (m.beforeSend.call(n, w, m) === !1 || 2 === u)) return w.abort();
                v = "abort";
                for (f in {
                        success: 1,
                        error: 1,
                        complete: 1
                    }) w[f](m[f]);
                if (k = G(Rb, m, c, w)) {
                    w.readyState = 1, j && o.trigger("ajaxSend", [w, m]), m.async && m.timeout > 0 && (i = setTimeout(function() {
                        w.abort("timeout")
                    }, m.timeout));
                    try {
                        u = 1, k.send(s, d)
                    } catch (x) {
                        if (!(2 > u)) throw x;
                        d(-1, x)
                    }
                } else d(-1, "No Transport");
                return w
            },
            getJSON: function(a, b, c) {
                return ka.get(a, b, c, "json")
            },
            getScript: function(a, c) {
                return ka.get(a, b, c, "script")
            }
        }), ka.each(["get", "post"], function(a, c) {
            ka[c] = function(a, d, e, f) {
                return ka.isFunction(d) && (f = f || e, e = d, d = b), ka.ajax({
                    url: a,
                    type: c,
                    dataType: f,
                    data: d,
                    success: e
                })
            }
        }), ka.ajaxSetup({
            accepts: {
                script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
            },
            contents: {
                script: /(?:java|ecma)script/
            },
            converters: {
                "text script": function(a) {
                    return ka.globalEval(a), a
                }
            }
        }), ka.ajaxPrefilter("script", function(a) {
            a.cache === b && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1)
        }), ka.ajaxTransport("script", function(a) {
            if (a.crossDomain) {
                var c, d = Y.head || ka("head")[0] || Y.documentElement;
                return {
                    send: function(b, e) {
                        c = Y.createElement("script"), c.async = !0, a.scriptCharset && (c.charset = a.scriptCharset), c.src = a.url, c.onload = c.onreadystatechange = function(a, b) {
                            (b || !c.readyState || /loaded|complete/.test(c.readyState)) && (c.onload = c.onreadystatechange = null, c.parentNode && c.parentNode.removeChild(c), c = null, b || e(200, "success"))
                        }, d.insertBefore(c, d.firstChild)
                    },
                    abort: function() {
                        c && c.onload(b, !0)
                    }
                }
            }
        });
        var Ub = [],
            Vb = /(=)\?(?=&|$)|\?\?/;
        ka.ajaxSetup({
            jsonp: "callback",
            jsonpCallback: function() {
                var a = Ub.pop() || ka.expando + "_" + Gb++;
                return this[a] = !0, a
            }
        }), ka.ajaxPrefilter("json jsonp", function(c, d, e) {
            var f, g, h, i = c.jsonp !== !1 && (Vb.test(c.url) ? "url" : "string" == typeof c.data && !(c.contentType || "").indexOf("application/x-www-form-urlencoded") && Vb.test(c.data) && "data");
            return i || "jsonp" === c.dataTypes[0] ? (f = c.jsonpCallback = ka.isFunction(c.jsonpCallback) ? c.jsonpCallback() : c.jsonpCallback, i ? c[i] = c[i].replace(Vb, "$1" + f) : c.jsonp !== !1 && (c.url += (Hb.test(c.url) ? "&" : "?") + c.jsonp + "=" + f), c.converters["script json"] = function() {
                return h || ka.error(f + " was not called"), h[0]
            }, c.dataTypes[0] = "json", g = a[f], a[f] = function() {
                h = arguments
            }, e.always(function() {
                a[f] = g, c[f] && (c.jsonpCallback = d.jsonpCallback, Ub.push(f)), h && ka.isFunction(g) && g(h[0]), h = g = b
            }), "script") : b
        });
        var Wb, Xb, Yb = 0,
            Zb = a.ActiveXObject && function() {
                var a;
                for (a in Wb) Wb[a](b, !0)
            };
        ka.ajaxSettings.xhr = a.ActiveXObject ? function() {
            return !this.isLocal && K() || L()
        } : K, Xb = ka.ajaxSettings.xhr(), ka.support.cors = !!Xb && "withCredentials" in Xb, Xb = ka.support.ajax = !!Xb, Xb && ka.ajaxTransport(function(c) {
            if (!c.crossDomain || ka.support.cors) {
                var d;
                return {
                    send: function(e, f) {
                        var g, h, i = c.xhr();
                        if (c.username ? i.open(c.type, c.url, c.async, c.username, c.password) : i.open(c.type, c.url, c.async), c.xhrFields)
                            for (h in c.xhrFields) i[h] = c.xhrFields[h];
                        c.mimeType && i.overrideMimeType && i.overrideMimeType(c.mimeType), c.crossDomain || e["X-Requested-With"] || (e["X-Requested-With"] = "XMLHttpRequest");
                        try {
                            for (h in e) i.setRequestHeader(h, e[h])
                        } catch (j) {}
                        i.send(c.hasContent && c.data || null), d = function(a, e) {
                            var h, j, k, l;
                            try {
                                if (d && (e || 4 === i.readyState))
                                    if (d = b, g && (i.onreadystatechange = ka.noop, Zb && delete Wb[g]), e) 4 !== i.readyState && i.abort();
                                    else {
                                        l = {}, h = i.status, j = i.getAllResponseHeaders(), "string" == typeof i.responseText && (l.text = i.responseText);
                                        try {
                                            k = i.statusText
                                        } catch (m) {
                                            k = ""
                                        }
                                        h || !c.isLocal || c.crossDomain ? 1223 === h && (h = 204) : h = l.text ? 200 : 404
                                    }
                            } catch (n) {
                                e || f(-1, n)
                            }
                            l && f(h, k, l, j)
                        }, c.async ? 4 === i.readyState ? setTimeout(d) : (g = ++Yb, Zb && (Wb || (Wb = {}, ka(a).unload(Zb)), Wb[g] = d), i.onreadystatechange = d) : d()
                    },
                    abort: function() {
                        d && d(b, !0)
                    }
                }
            }
        });
        var $b, _b, ac = /^(?:toggle|show|hide)$/,
            bc = RegExp("^(?:([+-])=|)(" + la + ")([a-z%]*)$", "i"),
            cc = /queueHooks$/,
            dc = [Q],
            ec = {
                "*": [function(a, b) {
                    var c = this.createTween(a, b),
                        d = c.cur(),
                        e = bc.exec(b),
                        f = e && e[3] || (ka.cssNumber[a] ? "" : "px"),
                        g = (ka.cssNumber[a] || "px" !== f && +d) && bc.exec(ka.css(c.elem, a)),
                        h = 1,
                        i = 20;
                    if (g && g[3] !== f) {
                        f = f || g[3], e = e || [], g = +d || 1;
                        do h = h || ".5", g /= h, ka.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i)
                    }
                    return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c
                }]
            };
        ka.Animation = ka.extend(O, {
            tweener: function(a, b) {
                ka.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" ");
                for (var c, d = 0, e = a.length; e > d; d++) c = a[d], ec[c] = ec[c] || [], ec[c].unshift(b)
            },
            prefilter: function(a, b) {
                b ? dc.unshift(a) : dc.push(a)
            }
        }), ka.Tween = R, R.prototype = {
            constructor: R,
            init: function(a, b, c, d, e, f) {
                this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (ka.cssNumber[c] ? "" : "px")
            },
            cur: function() {
                var a = R.propHooks[this.prop];
                return a && a.get ? a.get(this) : R.propHooks._default.get(this)
            },
            run: function(a) {
                var b, c = R.propHooks[this.prop];
                return this.pos = b = this.options.duration ? ka.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : R.propHooks._default.set(this), this
            }
        }, R.prototype.init.prototype = R.prototype, R.propHooks = {
            _default: {
                get: function(a) {
                    var b;
                    return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = ka.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop]
                },
                set: function(a) {
                    ka.fx.step[a.prop] ? ka.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[ka.cssProps[a.prop]] || ka.cssHooks[a.prop]) ? ka.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now
                }
            }
        }, R.propHooks.scrollTop = R.propHooks.scrollLeft = {
            set: function(a) {
                a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now)
            }
        }, ka.each(["toggle", "show", "hide"], function(a, b) {
            var c = ka.fn[b];
            ka.fn[b] = function(a, d, e) {
                return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(S(b, !0), a, d, e)
            }
        }), ka.fn.extend({
            fadeTo: function(a, b, c, d) {
                return this.filter(x).css("opacity", 0).show().end().animate({
                    opacity: b
                }, a, c, d)
            },
            animate: function(a, b, c, d) {
                var e = ka.isEmptyObject(a),
                    f = ka.speed(b, c, d),
                    g = function() {
                        var b = O(this, ka.extend({}, a), f);
                        (e || ka._data(this, "finish")) && b.stop(!0)
                    };
                return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g)
            },
            stop: function(a, c, d) {
                var e = function(a) {
                    var b = a.stop;
                    delete a.stop, b(d)
                };
                return "string" != typeof a && (d = c, c = a, a = b), c && a !== !1 && this.queue(a || "fx", []), this.each(function() {
                    var b = !0,
                        c = null != a && a + "queueHooks",
                        f = ka.timers,
                        g = ka._data(this);
                    if (c) g[c] && g[c].stop && e(g[c]);
                    else
                        for (c in g) g[c] && g[c].stop && cc.test(c) && e(g[c]);
                    for (c = f.length; c--;) f[c].elem !== this || null != a && f[c].queue !== a || (f[c].anim.stop(d), b = !1, f.splice(c, 1));
                    (b || !d) && ka.dequeue(this, a)
                })
            },
            finish: function(a) {
                return a !== !1 && (a = a || "fx"), this.each(function() {
                    var b, c = ka._data(this),
                        d = c[a + "queue"],
                        e = c[a + "queueHooks"],
                        f = ka.timers,
                        g = d ? d.length : 0;
                    for (c.finish = !0, ka.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
                    for (b = 0; g > b; b++) d[b] && d[b].finish && d[b].finish.call(this);
                    delete c.finish
                })
            }
        }), ka.each({
            slideDown: S("show"),
            slideUp: S("hide"),
            slideToggle: S("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function(a, b) {
            ka.fn[a] = function(a, c, d) {
                return this.animate(b, a, c, d)
            }
        }), ka.speed = function(a, b, c) {
            var d = a && "object" == typeof a ? ka.extend({}, a) : {
                complete: c || !c && b || ka.isFunction(a) && a,
                duration: a,
                easing: c && b || b && !ka.isFunction(b) && b
            };
            return d.duration = ka.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in ka.fx.speeds ? ka.fx.speeds[d.duration] : ka.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function() {
                ka.isFunction(d.old) && d.old.call(this), d.queue && ka.dequeue(this, d.queue)
            }, d
        }, ka.easing = {
            linear: function(a) {
                return a
            },
            swing: function(a) {
                return .5 - Math.cos(a * Math.PI) / 2
            }
        }, ka.timers = [], ka.fx = R.prototype.init, ka.fx.tick = function() {
            var a, c = ka.timers,
                d = 0;
            for ($b = ka.now(); c.length > d; d++) a = c[d], a() || c[d] !== a || c.splice(d--, 1);
            c.length || ka.fx.stop(), $b = b
        }, ka.fx.timer = function(a) {
            a() && ka.timers.push(a) && ka.fx.start()
        }, ka.fx.interval = 13, ka.fx.start = function() {
            _b || (_b = setInterval(ka.fx.tick, ka.fx.interval))
        }, ka.fx.stop = function() {
            clearInterval(_b), _b = null
        }, ka.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        }, ka.fx.step = {}, ka.expr && ka.expr.filters && (ka.expr.filters.animated = function(a) {
            return ka.grep(ka.timers, function(b) {
                return a === b.elem
            }).length
        }), ka.fn.offset = function(a) {
            if (arguments.length) return a === b ? this : this.each(function(b) {
                ka.offset.setOffset(this, a, b)
            });
            var c, d, e = {
                    top: 0,
                    left: 0
                },
                f = this[0],
                g = f && f.ownerDocument;
            return g ? (c = g.documentElement, ka.contains(c, f) ? (typeof f.getBoundingClientRect !== W && (e = f.getBoundingClientRect()), d = T(g), {
                top: e.top + (d.pageYOffset || c.scrollTop) - (c.clientTop || 0),
                left: e.left + (d.pageXOffset || c.scrollLeft) - (c.clientLeft || 0)
            }) : e) : void 0
        }, ka.offset = {
            setOffset: function(a, b, c) {
                var d = ka.css(a, "position");
                "static" === d && (a.style.position = "relative");
                var e, f, g = ka(a),
                    h = g.offset(),
                    i = ka.css(a, "top"),
                    j = ka.css(a, "left"),
                    k = ("absolute" === d || "fixed" === d) && ka.inArray("auto", [i, j]) > -1,
                    l = {},
                    m = {};
                k ? (m = g.position(), e = m.top, f = m.left) : (e = parseFloat(i) || 0, f = parseFloat(j) || 0), ka.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (l.top = b.top - h.top + e), null != b.left && (l.left = b.left - h.left + f), "using" in b ? b.using.call(a, l) : g.css(l)
            }
        }, ka.fn.extend({
            position: function() {
                if (this[0]) {
                    var a, b, c = {
                            top: 0,
                            left: 0
                        },
                        d = this[0];
                    return "fixed" === ka.css(d, "position") ? b = d.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), ka.nodeName(a[0], "html") || (c = a.offset()), c.top += ka.css(a[0], "borderTopWidth", !0), c.left += ka.css(a[0], "borderLeftWidth", !0)), {
                        top: b.top - c.top - ka.css(d, "marginTop", !0),
                        left: b.left - c.left - ka.css(d, "marginLeft", !0)
                    }
                }
            },
            offsetParent: function() {
                return this.map(function() {
                    for (var a = this.offsetParent || Z; a && !ka.nodeName(a, "html") && "static" === ka.css(a, "position");) a = a.offsetParent;
                    return a || Z
                })
            }
        }), ka.each({
            scrollLeft: "pageXOffset",
            scrollTop: "pageYOffset"
        }, function(a, c) {
            var d = /Y/.test(c);
            ka.fn[a] = function(e) {
                return ka.access(this, function(a, e, f) {
                    var g = T(a);
                    return f === b ? g ? c in g ? g[c] : g.document.documentElement[e] : a[e] : (g ? g.scrollTo(d ? ka(g).scrollLeft() : f, d ? f : ka(g).scrollTop()) : a[e] = f, b)
                }, a, e, arguments.length, null)
            }
        }), ka.each({
            Height: "height",
            Width: "width"
        }, function(a, c) {
            ka.each({
                padding: "inner" + a,
                content: c,
                "": "outer" + a
            }, function(d, e) {
                ka.fn[e] = function(e, f) {
                    var g = arguments.length && (d || "boolean" != typeof e),
                        h = d || (e === !0 || f === !0 ? "margin" : "border");
                    return ka.access(this, function(c, d, e) {
                        var f;
                        return ka.isWindow(c) ? c.document.documentElement["client" + a] : 9 === c.nodeType ? (f = c.documentElement, Math.max(c.body["scroll" + a], f["scroll" + a], c.body["offset" + a], f["offset" + a], f["client" + a])) : e === b ? ka.css(c, d, h) : ka.style(c, d, e, h)
                    }, c, g ? e : b, g, null)
                }
            })
        }), ka.fn.size = function() {
            return this.length
        }, ka.fn.andSelf = ka.fn.addBack, "object" == typeof module && module && "object" == typeof module.exports ? module.exports = ka : (a.jQuery = a.$ = ka, "function" == typeof define && define.amd && define("jquery", [], function() {
            return ka
        }))
    }(window),
    function(a, b) {
        function c(b, c) {
            var e, f, g, h = b.nodeName.toLowerCase();
            return "area" === h ? (e = b.parentNode, f = e.name, b.href && f && "map" === e.nodeName.toLowerCase() ? (g = a("img[usemap=#" + f + "]")[0], !!g && d(g)) : !1) : (/input|select|textarea|button|object/.test(h) ? !b.disabled : "a" === h ? b.href || c : c) && d(b)
        }

        function d(b) {
            return a.expr.filters.visible(b) && !a(b).parents().addBack().filter(function() {
                return "hidden" === a.css(this, "visibility")
            }).length
        }
        var e = 0,
            f = /^ui-id-\d+$/;
        a.ui = a.ui || {}, a.extend(a.ui, {
            version: "1.10.3",
            keyCode: {
                BACKSPACE: 8,
                COMMA: 188,
                DELETE: 46,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                ESCAPE: 27,
                HOME: 36,
                LEFT: 37,
                NUMPAD_ADD: 107,
                NUMPAD_DECIMAL: 110,
                NUMPAD_DIVIDE: 111,
                NUMPAD_ENTER: 108,
                NUMPAD_MULTIPLY: 106,
                NUMPAD_SUBTRACT: 109,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                PERIOD: 190,
                RIGHT: 39,
                SPACE: 32,
                TAB: 9,
                UP: 38
            }
        }), a.fn.extend({
            focus: function(b) {
                return function(c, d) {
                    return "number" == typeof c ? this.each(function() {
                        var b = this;
                        setTimeout(function() {
                            a(b).focus(), d && d.call(b)
                        }, c)
                    }) : b.apply(this, arguments)
                }
            }(a.fn.focus),
            scrollParent: function() {
                var b;
                return b = a.ui.ie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position")) ? this.parents().filter(function() {
                    return /(relative|absolute|fixed)/.test(a.css(this, "position")) && /(auto|scroll)/.test(a.css(this, "overflow") + a.css(this, "overflow-y") + a.css(this, "overflow-x"))
                }).eq(0) : this.parents().filter(function() {
                    return /(auto|scroll)/.test(a.css(this, "overflow") + a.css(this, "overflow-y") + a.css(this, "overflow-x"))
                }).eq(0), /fixed/.test(this.css("position")) || !b.length ? a(document) : b
            },
            zIndex: function(c) {
                if (c !== b) return this.css("zIndex", c);
                if (this.length)
                    for (var d, e, f = a(this[0]); f.length && f[0] !== document;) {
                        if (d = f.css("position"), ("absolute" === d || "relative" === d || "fixed" === d) && (e = parseInt(f.css("zIndex"), 10), !isNaN(e) && 0 !== e)) return e;
                        f = f.parent()
                    }
                return 0
            },
            uniqueId: function() {
                return this.each(function() {
                    this.id || (this.id = "ui-id-" + ++e)
                })
            },
            removeUniqueId: function() {
                return this.each(function() {
                    f.test(this.id) && a(this).removeAttr("id")
                })
            }
        }), a.extend(a.expr[":"], {
            data: a.expr.createPseudo ? a.expr.createPseudo(function(b) {
                return function(c) {
                    return !!a.data(c, b)
                }
            }) : function(b, c, d) {
                return !!a.data(b, d[3])
            },
            focusable: function(b) {
                return c(b, !isNaN(a.attr(b, "tabindex")))
            },
            tabbable: function(b) {
                var d = a.attr(b, "tabindex"),
                    e = isNaN(d);
                return (e || d >= 0) && c(b, !e)
            }
        }), a("<a>").outerWidth(1).jquery || a.each(["Width", "Height"], function(c, d) {
            function e(b, c, d, e) {
                return a.each(f, function() {
                    c -= parseFloat(a.css(b, "padding" + this)) || 0, d && (c -= parseFloat(a.css(b, "border" + this + "Width")) || 0), e && (c -= parseFloat(a.css(b, "margin" + this)) || 0)
                }), c
            }
            var f = "Width" === d ? ["Left", "Right"] : ["Top", "Bottom"],
                g = d.toLowerCase(),
                h = {
                    innerWidth: a.fn.innerWidth,
                    innerHeight: a.fn.innerHeight,
                    outerWidth: a.fn.outerWidth,
                    outerHeight: a.fn.outerHeight
                };
            a.fn["inner" + d] = function(c) {
                return c === b ? h["inner" + d].call(this) : this.each(function() {
                    a(this).css(g, e(this, c) + "px")
                })
            }, a.fn["outer" + d] = function(b, c) {
                return "number" != typeof b ? h["outer" + d].call(this, b) : this.each(function() {
                    a(this).css(g, e(this, b, !0, c) + "px")
                })
            }
        }), a.fn.addBack || (a.fn.addBack = function(a) {
            return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
        }), a("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (a.fn.removeData = function(b) {
            return function(c) {
                return arguments.length ? b.call(this, a.camelCase(c)) : b.call(this)
            }
        }(a.fn.removeData)), a.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), a.support.selectstart = "onselectstart" in document.createElement("div"), a.fn.extend({
            disableSelection: function() {
                return this.bind((a.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(a) {
                    a.preventDefault()
                })
            },
            enableSelection: function() {
                return this.unbind(".ui-disableSelection")
            }
        }), a.extend(a.ui, {
            plugin: {
                add: function(b, c, d) {
                    var e, f = a.ui[b].prototype;
                    for (e in d) f.plugins[e] = f.plugins[e] || [], f.plugins[e].push([c, d[e]])
                },
                call: function(a, b, c) {
                    var d, e = a.plugins[b];
                    if (e && a.element[0].parentNode && 11 !== a.element[0].parentNode.nodeType)
                        for (d = 0; d < e.length; d++) a.options[e[d][0]] && e[d][1].apply(a.element, c)
                }
            },
            hasScroll: function(b, c) {
                if ("hidden" === a(b).css("overflow")) return !1;
                var d = c && "left" === c ? "scrollLeft" : "scrollTop",
                    e = !1;
                return b[d] > 0 ? !0 : (b[d] = 1, e = b[d] > 0, b[d] = 0, e)
            }
        })
    }(jQuery),
    function(a, b) {
        function c() {
            this._curInst = null, this._keyEvent = !1, this._disabledInputs = [], this._datepickerShowing = !1, this._inDialog = !1, this._mainDivId = "ui-datepicker-div", this._inlineClass = "ui-datepicker-inline", this._appendClass = "ui-datepicker-append", this._triggerClass = "ui-datepicker-trigger", this._dialogClass = "ui-datepicker-dialog", this._disableClass = "ui-datepicker-disabled", this._unselectableClass = "ui-datepicker-unselectable", this._currentClass = "ui-datepicker-current-day", this._dayOverClass = "ui-datepicker-days-cell-over", this.regional = [], this.regional[""] = {
                closeText: "Done",
                prevText: "Prev",
                nextText: "Next",
                currentText: "Today",
                monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                weekHeader: "Wk",
                dateFormat: "mm/dd/yy",
                firstDay: 0,
                isRTL: !1,
                showMonthAfterYear: !1,
                yearSuffix: ""
            }, this._defaults = {
                showOn: "focus",
                showAnim: "fadeIn",
                showOptions: {},
                defaultDate: null,
                appendText: "",
                buttonText: "...",
                buttonImage: "",
                buttonImageOnly: !1,
                hideIfNoPrevNext: !1,
                navigationAsDateFormat: !1,
                gotoCurrent: !1,
                changeMonth: !1,
                changeYear: !1,
                yearRange: "c-10:c+10",
                showOtherMonths: !1,
                selectOtherMonths: !1,
                showWeek: !1,
                calculateWeek: this.iso8601Week,
                shortYearCutoff: "+10",
                minDate: null,
                maxDate: null,
                duration: "fast",
                beforeShowDay: null,
                beforeShow: null,
                onSelect: null,
                onChangeMonthYear: null,
                onClose: null,
                numberOfMonths: 1,
                showCurrentAtPos: 0,
                stepMonths: 1,
                stepBigMonths: 12,
                altField: "",
                altFormat: "",
                constrainInput: !0,
                showButtonPanel: !1,
                autoSize: !1,
                disabled: !1
            }, a.extend(this._defaults, this.regional[""]), this.dpDiv = d(a("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))
        }

        function d(b) {
            var c = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
            return b.delegate(c, "mouseout", function() {
                a(this).removeClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && a(this).removeClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && a(this).removeClass("ui-datepicker-next-hover")
            }).delegate(c, "mouseover", function() {
                a.datepicker._isDisabledDatepicker(f.inline ? b.parent()[0] : f.input[0]) || (a(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"), a(this).addClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && a(this).addClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && a(this).addClass("ui-datepicker-next-hover"))
            })
        }

        function e(b, c) {
            a.extend(b, c);
            for (var d in c) null == c[d] && (b[d] = c[d]);
            return b
        }
        a.extend(a.ui, {
            datepicker: {
                version: "1.10.3"
            }
        });
        var f, g = "datepicker";
        a.extend(c.prototype, {
            markerClassName: "hasDatepicker",
            maxRows: 4,
            _widgetDatepicker: function() {
                return this.dpDiv
            },
            setDefaults: function(a) {
                return e(this._defaults, a || {}), this
            },
            _attachDatepicker: function(b, c) {
                var d, e, f;
                d = b.nodeName.toLowerCase(), e = "div" === d || "span" === d, b.id || (this.uuid += 1, b.id = "dp" + this.uuid), f = this._newInst(a(b), e), f.settings = a.extend({}, c || {}), "input" === d ? this._connectDatepicker(b, f) : e && this._inlineDatepicker(b, f)
            },
            _newInst: function(b, c) {
                var e = b[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1");
                return {
                    id: e,
                    input: b,
                    selectedDay: 0,
                    selectedMonth: 0,
                    selectedYear: 0,
                    drawMonth: 0,
                    drawYear: 0,
                    inline: c,
                    dpDiv: c ? d(a("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) : this.dpDiv
                }
            },
            _connectDatepicker: function(b, c) {
                var d = a(b);
                c.append = a([]), c.trigger = a([]), d.hasClass(this.markerClassName) || (this._attachments(d, c), d.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp), this._autoSize(c), a.data(b, g, c), c.settings.disabled && this._disableDatepicker(b))
            },
            _attachments: function(b, c) {
                var d, e, f, g = this._get(c, "appendText"),
                    h = this._get(c, "isRTL");
                c.append && c.append.remove(), g && (c.append = a("<span class='" + this._appendClass + "'>" + g + "</span>"), b[h ? "before" : "after"](c.append)), b.unbind("focus", this._showDatepicker), c.trigger && c.trigger.remove(), d = this._get(c, "showOn"), ("focus" === d || "both" === d) && b.focus(this._showDatepicker), ("button" === d || "both" === d) && (e = this._get(c, "buttonText"), f = this._get(c, "buttonImage"), c.trigger = a(this._get(c, "buttonImageOnly") ? a("<img/>").addClass(this._triggerClass).attr({
                    src: f,
                    alt: e,
                    title: e
                }) : a("<button type='button'></button>").addClass(this._triggerClass).html(f ? a("<img/>").attr({
                    src: f,
                    alt: e,
                    title: e
                }) : e)), b[h ? "before" : "after"](c.trigger), c.trigger.click(function() {
                    return a.datepicker._datepickerShowing && a.datepicker._lastInput === b[0] ? a.datepicker._hideDatepicker() : a.datepicker._datepickerShowing && a.datepicker._lastInput !== b[0] ? (a.datepicker._hideDatepicker(), a.datepicker._showDatepicker(b[0])) : a.datepicker._showDatepicker(b[0]), !1
                }))
            },
            _autoSize: function(a) {
                if (this._get(a, "autoSize") && !a.inline) {
                    var b, c, d, e, f = new Date(2009, 11, 20),
                        g = this._get(a, "dateFormat");
                    g.match(/[DM]/) && (b = function(a) {
                        for (c = 0, d = 0, e = 0; e < a.length; e++) a[e].length > c && (c = a[e].length, d = e);
                        return d
                    }, f.setMonth(b(this._get(a, g.match(/MM/) ? "monthNames" : "monthNamesShort"))), f.setDate(b(this._get(a, g.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - f.getDay())), a.input.attr("size", this._formatDate(a, f).length)
                }
            },
            _inlineDatepicker: function(b, c) {
                var d = a(b);
                d.hasClass(this.markerClassName) || (d.addClass(this.markerClassName).append(c.dpDiv), a.data(b, g, c), this._setDate(c, this._getDefaultDate(c), !0), this._updateDatepicker(c), this._updateAlternate(c), c.settings.disabled && this._disableDatepicker(b), c.dpDiv.css("display", "block"))
            },
            _dialogDatepicker: function(b, c, d, f, h) {
                var i, j, k, l, m, n = this._dialogInst;
                return n || (this.uuid += 1, i = "dp" + this.uuid, this._dialogInput = a("<input type='text' id='" + i + "' style='position: absolute; top: -100px; width: 0px;'/>"), this._dialogInput.keydown(this._doKeyDown), a("body").append(this._dialogInput), n = this._dialogInst = this._newInst(this._dialogInput, !1), n.settings = {}, a.data(this._dialogInput[0], g, n)), e(n.settings, f || {}), c = c && c.constructor === Date ? this._formatDate(n, c) : c, this._dialogInput.val(c), this._pos = h ? h.length ? h : [h.pageX, h.pageY] : null, this._pos || (j = document.documentElement.clientWidth, k = document.documentElement.clientHeight, l = document.documentElement.scrollLeft || document.body.scrollLeft, m = document.documentElement.scrollTop || document.body.scrollTop, this._pos = [j / 2 - 100 + l, k / 2 - 150 + m]), this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px"), n.settings.onSelect = d, this._inDialog = !0, this.dpDiv.addClass(this._dialogClass), this._showDatepicker(this._dialogInput[0]), a.blockUI && a.blockUI(this.dpDiv), a.data(this._dialogInput[0], g, n), this
            },
            _destroyDatepicker: function(b) {
                var c, d = a(b),
                    e = a.data(b, g);
                d.hasClass(this.markerClassName) && (c = b.nodeName.toLowerCase(), a.removeData(b, g), "input" === c ? (e.append.remove(), e.trigger.remove(), d.removeClass(this.markerClassName).unbind("focus", this._showDatepicker).unbind("keydown", this._doKeyDown).unbind("keypress", this._doKeyPress).unbind("keyup", this._doKeyUp)) : ("div" === c || "span" === c) && d.removeClass(this.markerClassName).empty())
            },
            _enableDatepicker: function(b) {
                var c, d, e = a(b),
                    f = a.data(b, g);
                e.hasClass(this.markerClassName) && (c = b.nodeName.toLowerCase(), "input" === c ? (b.disabled = !1, f.trigger.filter("button").each(function() {
                    this.disabled = !1
                }).end().filter("img").css({
                    opacity: "1.0",
                    cursor: ""
                })) : ("div" === c || "span" === c) && (d = e.children("." + this._inlineClass), d.children().removeClass("ui-state-disabled"), d.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !1)), this._disabledInputs = a.map(this._disabledInputs, function(a) {
                    return a === b ? null : a
                }))
            },
            _disableDatepicker: function(b) {
                var c, d, e = a(b),
                    f = a.data(b, g);
                e.hasClass(this.markerClassName) && (c = b.nodeName.toLowerCase(), "input" === c ? (b.disabled = !0, f.trigger.filter("button").each(function() {
                    this.disabled = !0
                }).end().filter("img").css({
                    opacity: "0.5",
                    cursor: "default"
                })) : ("div" === c || "span" === c) && (d = e.children("." + this._inlineClass), d.children().addClass("ui-state-disabled"), d.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !0)), this._disabledInputs = a.map(this._disabledInputs, function(a) {
                    return a === b ? null : a
                }), this._disabledInputs[this._disabledInputs.length] = b)
            },
            _isDisabledDatepicker: function(a) {
                if (!a) return !1;
                for (var b = 0; b < this._disabledInputs.length; b++)
                    if (this._disabledInputs[b] === a) return !0;
                return !1
            },
            _getInst: function(b) {
                try {
                    return a.data(b, g)
                } catch (c) {
                    throw "Missing instance data for this datepicker"
                }
            },
            _optionDatepicker: function(c, d, f) {
                var g, h, i, j, k = this._getInst(c);
                return 2 === arguments.length && "string" == typeof d ? "defaults" === d ? a.extend({}, a.datepicker._defaults) : k ? "all" === d ? a.extend({}, k.settings) : this._get(k, d) : null : (g = d || {}, "string" == typeof d && (g = {}, g[d] = f), void(k && (this._curInst === k && this._hideDatepicker(), h = this._getDateDatepicker(c, !0), i = this._getMinMaxDate(k, "min"), j = this._getMinMaxDate(k, "max"), e(k.settings, g), null !== i && g.dateFormat !== b && g.minDate === b && (k.settings.minDate = this._formatDate(k, i)), null !== j && g.dateFormat !== b && g.maxDate === b && (k.settings.maxDate = this._formatDate(k, j)), "disabled" in g && (g.disabled ? this._disableDatepicker(c) : this._enableDatepicker(c)), this._attachments(a(c), k), this._autoSize(k), this._setDate(k, h), this._updateAlternate(k), this._updateDatepicker(k))))
            },
            _changeDatepicker: function(a, b, c) {
                this._optionDatepicker(a, b, c)
            },
            _refreshDatepicker: function(a) {
                var b = this._getInst(a);
                b && this._updateDatepicker(b)
            },
            _setDateDatepicker: function(a, b) {
                var c = this._getInst(a);
                c && (this._setDate(c, b), this._updateDatepicker(c), this._updateAlternate(c))
            },
            _getDateDatepicker: function(a, b) {
                var c = this._getInst(a);
                return c && !c.inline && this._setDateFromField(c, b), c ? this._getDate(c) : null
            },
            _doKeyDown: function(b) {
                var c, d, e, f = a.datepicker._getInst(b.target),
                    g = !0,
                    h = f.dpDiv.is(".ui-datepicker-rtl");
                if (f._keyEvent = !0, a.datepicker._datepickerShowing) switch (b.keyCode) {
                    case 9:
                        a.datepicker._hideDatepicker(), g = !1;
                        break;
                    case 13:
                        return e = a("td." + a.datepicker._dayOverClass + ":not(." + a.datepicker._currentClass + ")", f.dpDiv), e[0] && a.datepicker._selectDay(b.target, f.selectedMonth, f.selectedYear, e[0]), c = a.datepicker._get(f, "onSelect"), c ? (d = a.datepicker._formatDate(f), c.apply(f.input ? f.input[0] : null, [d, f])) : a.datepicker._hideDatepicker(), !1;
                    case 27:
                        a.datepicker._hideDatepicker();
                        break;
                    case 33:
                        a.datepicker._adjustDate(b.target, b.ctrlKey ? -a.datepicker._get(f, "stepBigMonths") : -a.datepicker._get(f, "stepMonths"), "M");
                        break;
                    case 34:
                        a.datepicker._adjustDate(b.target, b.ctrlKey ? +a.datepicker._get(f, "stepBigMonths") : +a.datepicker._get(f, "stepMonths"), "M");
                        break;
                    case 35:
                        (b.ctrlKey || b.metaKey) && a.datepicker._clearDate(b.target), g = b.ctrlKey || b.metaKey;
                        break;
                    case 36:
                        (b.ctrlKey || b.metaKey) && a.datepicker._gotoToday(b.target), g = b.ctrlKey || b.metaKey;
                        break;
                    case 37:
                        (b.ctrlKey || b.metaKey) && a.datepicker._adjustDate(b.target, h ? 1 : -1, "D"), g = b.ctrlKey || b.metaKey, b.originalEvent.altKey && a.datepicker._adjustDate(b.target, b.ctrlKey ? -a.datepicker._get(f, "stepBigMonths") : -a.datepicker._get(f, "stepMonths"), "M");
                        break;
                    case 38:
                        (b.ctrlKey || b.metaKey) && a.datepicker._adjustDate(b.target, -7, "D"), g = b.ctrlKey || b.metaKey;
                        break;
                    case 39:
                        (b.ctrlKey || b.metaKey) && a.datepicker._adjustDate(b.target, h ? -1 : 1, "D"), g = b.ctrlKey || b.metaKey, b.originalEvent.altKey && a.datepicker._adjustDate(b.target, b.ctrlKey ? +a.datepicker._get(f, "stepBigMonths") : +a.datepicker._get(f, "stepMonths"), "M");
                        break;
                    case 40:
                        (b.ctrlKey || b.metaKey) && a.datepicker._adjustDate(b.target, 7, "D"), g = b.ctrlKey || b.metaKey;
                        break;
                    default:
                        g = !1
                } else 36 === b.keyCode && b.ctrlKey ? a.datepicker._showDatepicker(this) : g = !1;
                g && (b.preventDefault(), b.stopPropagation())
            },
            _doKeyPress: function(b) {
                var c, d, e = a.datepicker._getInst(b.target);
                return a.datepicker._get(e, "constrainInput") ? (c = a.datepicker._possibleChars(a.datepicker._get(e, "dateFormat")), d = String.fromCharCode(null == b.charCode ? b.keyCode : b.charCode), b.ctrlKey || b.metaKey || " " > d || !c || c.indexOf(d) > -1) : void 0
            },
            _doKeyUp: function(b) {
                var c, d = a.datepicker._getInst(b.target);
                if (d.input.val() !== d.lastVal) try {
                    c = a.datepicker.parseDate(a.datepicker._get(d, "dateFormat"), d.input ? d.input.val() : null, a.datepicker._getFormatConfig(d)), c && (a.datepicker._setDateFromField(d), a.datepicker._updateAlternate(d), a.datepicker._updateDatepicker(d))
                } catch (e) {}
                return !0
            },
            _showDatepicker: function(b) {
                if (b = b.target || b, "input" !== b.nodeName.toLowerCase() && (b = a("input", b.parentNode)[0]), !a.datepicker._isDisabledDatepicker(b) && a.datepicker._lastInput !== b) {
                    var c, d, f, g, h, i, j;
                    c = a.datepicker._getInst(b), a.datepicker._curInst && a.datepicker._curInst !== c && (a.datepicker._curInst.dpDiv.stop(!0, !0), c && a.datepicker._datepickerShowing && a.datepicker._hideDatepicker(a.datepicker._curInst.input[0])), d = a.datepicker._get(c, "beforeShow"), f = d ? d.apply(b, [b, c]) : {}, f !== !1 && (e(c.settings, f), c.lastVal = null, a.datepicker._lastInput = b, a.datepicker._setDateFromField(c), a.datepicker._inDialog && (b.value = ""), a.datepicker._pos || (a.datepicker._pos = a.datepicker._findPos(b), a.datepicker._pos[1] += b.offsetHeight), g = !1, a(b).parents().each(function() {
                        return g |= "fixed" === a(this).css("position"), !g
                    }), h = {
                        left: a.datepicker._pos[0],
                        top: a.datepicker._pos[1]
                    }, a.datepicker._pos = null, c.dpDiv.empty(), c.dpDiv.css({
                        position: "absolute",
                        display: "block",
                        top: "-1000px"
                    }), a.datepicker._updateDatepicker(c), h = a.datepicker._checkOffset(c, h, g), c.dpDiv.css({
                        position: a.datepicker._inDialog && a.blockUI ? "static" : g ? "fixed" : "absolute",
                        display: "none",
                        left: h.left + "px",
                        top: h.top + "px"
                    }), c.inline || (i = a.datepicker._get(c, "showAnim"), j = a.datepicker._get(c, "duration"), c.dpDiv.zIndex(a(b).zIndex() + 1), a.datepicker._datepickerShowing = !0, a.effects && a.effects.effect[i] ? c.dpDiv.show(i, a.datepicker._get(c, "showOptions"), j) : c.dpDiv[i || "show"](i ? j : null), a.datepicker._shouldFocusInput(c) && c.input.focus(), a.datepicker._curInst = c))
                }
            },
            _updateDatepicker: function(b) {
                this.maxRows = 4, f = b, b.dpDiv.empty().append(this._generateHTML(b)), this._attachHandlers(b), b.dpDiv.find("." + this._dayOverClass + " a").mouseover();
                var c, d = this._getNumberOfMonths(b),
                    e = d[1],
                    g = 17;
                b.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""), e > 1 && b.dpDiv.addClass("ui-datepicker-multi-" + e).css("width", g * e + "em"), b.dpDiv[(1 !== d[0] || 1 !== d[1] ? "add" : "remove") + "Class"]("ui-datepicker-multi"), b.dpDiv[(this._get(b, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl"), b === a.datepicker._curInst && a.datepicker._datepickerShowing && a.datepicker._shouldFocusInput(b) && b.input.focus(), b.yearshtml && (c = b.yearshtml, setTimeout(function() {
                    c === b.yearshtml && b.yearshtml && b.dpDiv.find("select.ui-datepicker-year:first").replaceWith(b.yearshtml), c = b.yearshtml = null
                }, 0))
            },
            _shouldFocusInput: function(a) {
                return a.input && a.input.is(":visible") && !a.input.is(":disabled") && !a.input.is(":focus")
            },
            _checkOffset: function(b, c, d) {
                var e = b.dpDiv.outerWidth(),
                    f = b.dpDiv.outerHeight(),
                    g = b.input ? b.input.outerWidth() : 0,
                    h = b.input ? b.input.outerHeight() : 0,
                    i = document.documentElement.clientWidth + (d ? 0 : a(document).scrollLeft()),
                    j = document.documentElement.clientHeight + (d ? 0 : a(document).scrollTop());
                return c.left -= this._get(b, "isRTL") ? e - g : 0, c.left -= d && c.left === b.input.offset().left ? a(document).scrollLeft() : 0, c.top -= d && c.top === b.input.offset().top + h ? a(document).scrollTop() : 0, c.left -= Math.min(c.left, c.left + e > i && i > e ? Math.abs(c.left + e - i) : 0), c.top -= Math.min(c.top, c.top + f > j && j > f ? Math.abs(f + h) : 0), c
            },
            _findPos: function(b) {
                for (var c, d = this._getInst(b), e = this._get(d, "isRTL"); b && ("hidden" === b.type || 1 !== b.nodeType || a.expr.filters.hidden(b));) b = b[e ? "previousSibling" : "nextSibling"];
                return c = a(b).offset(), [c.left, c.top]
            },
            _hideDatepicker: function(b) {
                var c, d, e, f, h = this._curInst;
                !h || b && h !== a.data(b, g) || this._datepickerShowing && (c = this._get(h, "showAnim"), d = this._get(h, "duration"), e = function() {
                    a.datepicker._tidyDialog(h)
                }, a.effects && (a.effects.effect[c] || a.effects[c]) ? h.dpDiv.hide(c, a.datepicker._get(h, "showOptions"), d, e) : h.dpDiv["slideDown" === c ? "slideUp" : "fadeIn" === c ? "fadeOut" : "hide"](c ? d : null, e), c || e(), this._datepickerShowing = !1, f = this._get(h, "onClose"), f && f.apply(h.input ? h.input[0] : null, [h.input ? h.input.val() : "", h]), this._lastInput = null, this._inDialog && (this._dialogInput.css({
                    position: "absolute",
                    left: "0",
                    top: "-100px"
                }), a.blockUI && (a.unblockUI(), a("body").append(this.dpDiv))), this._inDialog = !1)
            },
            _tidyDialog: function(a) {
                a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")
            },
            _checkExternalClick: function(b) {
                if (a.datepicker._curInst) {
                    var c = a(b.target),
                        d = a.datepicker._getInst(c[0]);
                    (c[0].id !== a.datepicker._mainDivId && 0 === c.parents("#" + a.datepicker._mainDivId).length && !c.hasClass(a.datepicker.markerClassName) && !c.closest("." + a.datepicker._triggerClass).length && a.datepicker._datepickerShowing && (!a.datepicker._inDialog || !a.blockUI) || c.hasClass(a.datepicker.markerClassName) && a.datepicker._curInst !== d) && a.datepicker._hideDatepicker();

                }
            },
            _adjustDate: function(b, c, d) {
                var e = a(b),
                    f = this._getInst(e[0]);
                this._isDisabledDatepicker(e[0]) || (this._adjustInstDate(f, c + ("M" === d ? this._get(f, "showCurrentAtPos") : 0), d), this._updateDatepicker(f))
            },
            _gotoToday: function(b) {
                var c, d = a(b),
                    e = this._getInst(d[0]);
                this._get(e, "gotoCurrent") && e.currentDay ? (e.selectedDay = e.currentDay, e.drawMonth = e.selectedMonth = e.currentMonth, e.drawYear = e.selectedYear = e.currentYear) : (c = new Date, e.selectedDay = c.getDate(), e.drawMonth = e.selectedMonth = c.getMonth(), e.drawYear = e.selectedYear = c.getFullYear()), this._notifyChange(e), this._adjustDate(d)
            },
            _selectMonthYear: function(b, c, d) {
                var e = a(b),
                    f = this._getInst(e[0]);
                f["selected" + ("M" === d ? "Month" : "Year")] = f["draw" + ("M" === d ? "Month" : "Year")] = parseInt(c.options[c.selectedIndex].value, 10), this._notifyChange(f), this._adjustDate(e)
            },
            _selectDay: function(b, c, d, e) {
                var f, g = a(b);
                a(e).hasClass(this._unselectableClass) || this._isDisabledDatepicker(g[0]) || (f = this._getInst(g[0]), f.selectedDay = f.currentDay = a("a", e).html(), f.selectedMonth = f.currentMonth = c, f.selectedYear = f.currentYear = d, this._selectDate(b, this._formatDate(f, f.currentDay, f.currentMonth, f.currentYear)))
            },
            _clearDate: function(b) {
                var c = a(b);
                this._selectDate(c, "")
            },
            _selectDate: function(b, c) {
                var d, e = a(b),
                    f = this._getInst(e[0]);
                c = null != c ? c : this._formatDate(f), f.input && f.input.val(c), this._updateAlternate(f), d = this._get(f, "onSelect"), d ? d.apply(f.input ? f.input[0] : null, [c, f]) : f.input && f.input.trigger("change"), f.inline ? this._updateDatepicker(f) : (this._hideDatepicker(), this._lastInput = f.input[0], "object" != typeof f.input[0] && f.input.focus(), this._lastInput = null)
            },
            _updateAlternate: function(b) {
                var c, d, e, f = this._get(b, "altField");
                f && (c = this._get(b, "altFormat") || this._get(b, "dateFormat"), d = this._getDate(b), e = this.formatDate(c, d, this._getFormatConfig(b)), a(f).each(function() {
                    a(this).val(e)
                }))
            },
            noWeekends: function(a) {
                var b = a.getDay();
                return [b > 0 && 6 > b, ""]
            },
            iso8601Week: function(a) {
                var b, c = new Date(a.getTime());
                return c.setDate(c.getDate() + 4 - (c.getDay() || 7)), b = c.getTime(), c.setMonth(0), c.setDate(1), Math.floor(Math.round((b - c) / 864e5) / 7) + 1
            },
            parseDate: function(b, c, d) {
                if (null == b || null == c) throw "Invalid arguments";
                if (c = "object" == typeof c ? c.toString() : c + "", "" === c) return null;
                var e, f, g, h, i = 0,
                    j = (d ? d.shortYearCutoff : null) || this._defaults.shortYearCutoff,
                    k = "string" != typeof j ? j : (new Date).getFullYear() % 100 + parseInt(j, 10),
                    l = (d ? d.dayNamesShort : null) || this._defaults.dayNamesShort,
                    m = (d ? d.dayNames : null) || this._defaults.dayNames,
                    n = (d ? d.monthNamesShort : null) || this._defaults.monthNamesShort,
                    o = (d ? d.monthNames : null) || this._defaults.monthNames,
                    p = -1,
                    q = -1,
                    r = -1,
                    s = -1,
                    t = !1,
                    u = function(a) {
                        var c = e + 1 < b.length && b.charAt(e + 1) === a;
                        return c && e++, c
                    },
                    v = function(a) {
                        var b = u(a),
                            d = "@" === a ? 14 : "!" === a ? 20 : "y" === a && b ? 4 : "o" === a ? 3 : 2,
                            e = new RegExp("^\\d{1," + d + "}"),
                            f = c.substring(i).match(e);
                        if (!f) throw "Missing number at position " + i;
                        return i += f[0].length, parseInt(f[0], 10)
                    },
                    w = function(b, d, e) {
                        var f = -1,
                            g = a.map(u(b) ? e : d, function(a, b) {
                                return [
                                    [b, a]
                                ]
                            }).sort(function(a, b) {
                                return -(a[1].length - b[1].length)
                            });
                        if (a.each(g, function(a, b) {
                                var d = b[1];
                                return c.substr(i, d.length).toLowerCase() === d.toLowerCase() ? (f = b[0], i += d.length, !1) : void 0
                            }), -1 !== f) return f + 1;
                        throw "Unknown name at position " + i
                    },
                    x = function() {
                        if (c.charAt(i) !== b.charAt(e)) throw "Unexpected literal at position " + i;
                        i++
                    };
                for (e = 0; e < b.length; e++)
                    if (t) "'" !== b.charAt(e) || u("'") ? x() : t = !1;
                    else switch (b.charAt(e)) {
                        case "d":
                            r = v("d");
                            break;
                        case "D":
                            w("D", l, m);
                            break;
                        case "o":
                            s = v("o");
                            break;
                        case "m":
                            q = v("m");
                            break;
                        case "M":
                            q = w("M", n, o);
                            break;
                        case "y":
                            p = v("y");
                            break;
                        case "@":
                            h = new Date(v("@")), p = h.getFullYear(), q = h.getMonth() + 1, r = h.getDate();
                            break;
                        case "!":
                            h = new Date((v("!") - this._ticksTo1970) / 1e4), p = h.getFullYear(), q = h.getMonth() + 1, r = h.getDate();
                            break;
                        case "'":
                            u("'") ? x() : t = !0;
                            break;
                        default:
                            x()
                    }
                    if (i < c.length && (g = c.substr(i), !/^\s+/.test(g))) throw "Extra/unparsed characters found in date: " + g;
                if (-1 === p ? p = (new Date).getFullYear() : 100 > p && (p += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (k >= p ? 0 : -100)), s > -1)
                    for (q = 1, r = s;;) {
                        if (f = this._getDaysInMonth(p, q - 1), f >= r) break;
                        q++, r -= f
                    }
                if (h = this._daylightSavingAdjust(new Date(p, q - 1, r)), h.getFullYear() !== p || h.getMonth() + 1 !== q || h.getDate() !== r) throw "Invalid date";
                return h
            },
            ATOM: "yy-mm-dd",
            COOKIE: "D, dd M yy",
            ISO_8601: "yy-mm-dd",
            RFC_822: "D, d M y",
            RFC_850: "DD, dd-M-y",
            RFC_1036: "D, d M y",
            RFC_1123: "D, d M yy",
            RFC_2822: "D, d M yy",
            RSS: "D, d M y",
            TICKS: "!",
            TIMESTAMP: "@",
            W3C: "yy-mm-dd",
            _ticksTo1970: 24 * (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)) * 60 * 60 * 1e7,
            formatDate: function(a, b, c) {
                if (!b) return "";
                var d, e = (c ? c.dayNamesShort : null) || this._defaults.dayNamesShort,
                    f = (c ? c.dayNames : null) || this._defaults.dayNames,
                    g = (c ? c.monthNamesShort : null) || this._defaults.monthNamesShort,
                    h = (c ? c.monthNames : null) || this._defaults.monthNames,
                    i = function(b) {
                        var c = d + 1 < a.length && a.charAt(d + 1) === b;
                        return c && d++, c
                    },
                    j = function(a, b, c) {
                        var d = "" + b;
                        if (i(a))
                            for (; d.length < c;) d = "0" + d;
                        return d
                    },
                    k = function(a, b, c, d) {
                        return i(a) ? d[b] : c[b]
                    },
                    l = "",
                    m = !1;
                if (b)
                    for (d = 0; d < a.length; d++)
                        if (m) "'" !== a.charAt(d) || i("'") ? l += a.charAt(d) : m = !1;
                        else switch (a.charAt(d)) {
                            case "d":
                                l += j("d", b.getDate(), 2);
                                break;
                            case "D":
                                l += k("D", b.getDay(), e, f);
                                break;
                            case "o":
                                l += j("o", Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() - new Date(b.getFullYear(), 0, 0).getTime()) / 864e5), 3);
                                break;
                            case "m":
                                l += j("m", b.getMonth() + 1, 2);
                                break;
                            case "M":
                                l += k("M", b.getMonth(), g, h);
                                break;
                            case "y":
                                l += i("y") ? b.getFullYear() : (b.getYear() % 100 < 10 ? "0" : "") + b.getYear() % 100;
                                break;
                            case "@":
                                l += b.getTime();
                                break;
                            case "!":
                                l += 1e4 * b.getTime() + this._ticksTo1970;
                                break;
                            case "'":
                                i("'") ? l += "'" : m = !0;
                                break;
                            default:
                                l += a.charAt(d)
                        }
                        return l
            },
            _possibleChars: function(a) {
                var b, c = "",
                    d = !1,
                    e = function(c) {
                        var d = b + 1 < a.length && a.charAt(b + 1) === c;
                        return d && b++, d
                    };
                for (b = 0; b < a.length; b++)
                    if (d) "'" !== a.charAt(b) || e("'") ? c += a.charAt(b) : d = !1;
                    else switch (a.charAt(b)) {
                        case "d":
                        case "m":
                        case "y":
                        case "@":
                            c += "0123456789";
                            break;
                        case "D":
                        case "M":
                            return null;
                        case "'":
                            e("'") ? c += "'" : d = !0;
                            break;
                        default:
                            c += a.charAt(b)
                    }
                    return c
            },
            _get: function(a, c) {
                return a.settings[c] !== b ? a.settings[c] : this._defaults[c]
            },
            _setDateFromField: function(a, b) {
                if (a.input.val() !== a.lastVal) {
                    var c = this._get(a, "dateFormat"),
                        d = a.lastVal = a.input ? a.input.val() : null,
                        e = this._getDefaultDate(a),
                        f = e,
                        g = this._getFormatConfig(a);
                    try {
                        f = this.parseDate(c, d, g) || e
                    } catch (h) {
                        d = b ? "" : d
                    }
                    a.selectedDay = f.getDate(), a.drawMonth = a.selectedMonth = f.getMonth(), a.drawYear = a.selectedYear = f.getFullYear(), a.currentDay = d ? f.getDate() : 0, a.currentMonth = d ? f.getMonth() : 0, a.currentYear = d ? f.getFullYear() : 0, this._adjustInstDate(a)
                }
            },
            _getDefaultDate: function(a) {
                return this._restrictMinMax(a, this._determineDate(a, this._get(a, "defaultDate"), new Date))
            },
            _determineDate: function(b, c, d) {
                var e = function(a) {
                        var b = new Date;
                        return b.setDate(b.getDate() + a), b
                    },
                    f = function(c) {
                        try {
                            return a.datepicker.parseDate(a.datepicker._get(b, "dateFormat"), c, a.datepicker._getFormatConfig(b))
                        } catch (d) {}
                        for (var e = (c.toLowerCase().match(/^c/) ? a.datepicker._getDate(b) : null) || new Date, f = e.getFullYear(), g = e.getMonth(), h = e.getDate(), i = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, j = i.exec(c); j;) {
                            switch (j[2] || "d") {
                                case "d":
                                case "D":
                                    h += parseInt(j[1], 10);
                                    break;
                                case "w":
                                case "W":
                                    h += 7 * parseInt(j[1], 10);
                                    break;
                                case "m":
                                case "M":
                                    g += parseInt(j[1], 10), h = Math.min(h, a.datepicker._getDaysInMonth(f, g));
                                    break;
                                case "y":
                                case "Y":
                                    f += parseInt(j[1], 10), h = Math.min(h, a.datepicker._getDaysInMonth(f, g))
                            }
                            j = i.exec(c)
                        }
                        return new Date(f, g, h)
                    },
                    g = null == c || "" === c ? d : "string" == typeof c ? f(c) : "number" == typeof c ? isNaN(c) ? d : e(c) : new Date(c.getTime());
                return g = g && "Invalid Date" === g.toString() ? d : g, g && (g.setHours(0), g.setMinutes(0), g.setSeconds(0), g.setMilliseconds(0)), this._daylightSavingAdjust(g)
            },
            _daylightSavingAdjust: function(a) {
                return a ? (a.setHours(a.getHours() > 12 ? a.getHours() + 2 : 0), a) : null
            },
            _setDate: function(a, b, c) {
                var d = !b,
                    e = a.selectedMonth,
                    f = a.selectedYear,
                    g = this._restrictMinMax(a, this._determineDate(a, b, new Date));
                a.selectedDay = a.currentDay = g.getDate(), a.drawMonth = a.selectedMonth = a.currentMonth = g.getMonth(), a.drawYear = a.selectedYear = a.currentYear = g.getFullYear(), e === a.selectedMonth && f === a.selectedYear || c || this._notifyChange(a), this._adjustInstDate(a), a.input && a.input.val(d ? "" : this._formatDate(a))
            },
            _getDate: function(a) {
                var b = !a.currentYear || a.input && "" === a.input.val() ? null : this._daylightSavingAdjust(new Date(a.currentYear, a.currentMonth, a.currentDay));
                return b
            },
            _attachHandlers: function(b) {
                var c = this._get(b, "stepMonths"),
                    d = "#" + b.id.replace(/\\\\/g, "\\");
                b.dpDiv.find("[data-handler]").map(function() {
                    var b = {
                        prev: function() {
                            a.datepicker._adjustDate(d, -c, "M")
                        },
                        next: function() {
                            a.datepicker._adjustDate(d, +c, "M")
                        },
                        hide: function() {
                            a.datepicker._hideDatepicker()
                        },
                        today: function() {
                            a.datepicker._gotoToday(d)
                        },
                        selectDay: function() {
                            return a.datepicker._selectDay(d, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this), !1
                        },
                        selectMonth: function() {
                            return a.datepicker._selectMonthYear(d, this, "M"), !1
                        },
                        selectYear: function() {
                            return a.datepicker._selectMonthYear(d, this, "Y"), !1
                        }
                    };
                    a(this).bind(this.getAttribute("data-event"), b[this.getAttribute("data-handler")])
                })
            },
            _generateHTML: function(a) {
                var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O = new Date,
                    P = this._daylightSavingAdjust(new Date(O.getFullYear(), O.getMonth(), O.getDate())),
                    Q = this._get(a, "isRTL"),
                    R = this._get(a, "showButtonPanel"),
                    S = this._get(a, "hideIfNoPrevNext"),
                    T = this._get(a, "navigationAsDateFormat"),
                    U = this._getNumberOfMonths(a),
                    V = this._get(a, "showCurrentAtPos"),
                    W = this._get(a, "stepMonths"),
                    X = 1 !== U[0] || 1 !== U[1],
                    Y = this._daylightSavingAdjust(a.currentDay ? new Date(a.currentYear, a.currentMonth, a.currentDay) : new Date(9999, 9, 9)),
                    Z = this._getMinMaxDate(a, "min"),
                    $ = this._getMinMaxDate(a, "max"),
                    _ = a.drawMonth - V,
                    aa = a.drawYear;
                if (0 > _ && (_ += 12, aa--), $)
                    for (b = this._daylightSavingAdjust(new Date($.getFullYear(), $.getMonth() - U[0] * U[1] + 1, $.getDate())), b = Z && Z > b ? Z : b; this._daylightSavingAdjust(new Date(aa, _, 1)) > b;) _--, 0 > _ && (_ = 11, aa--);
                for (a.drawMonth = _, a.drawYear = aa, c = this._get(a, "prevText"), c = T ? this.formatDate(c, this._daylightSavingAdjust(new Date(aa, _ - W, 1)), this._getFormatConfig(a)) : c, d = this._canAdjustMonth(a, -1, aa, _) ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='" + c + "'><span class='ui-icon ui-icon-circle-triangle-" + (Q ? "e" : "w") + "'>" + c + "</span></a>" : S ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + c + "'><span class='ui-icon ui-icon-circle-triangle-" + (Q ? "e" : "w") + "'>" + c + "</span></a>", e = this._get(a, "nextText"), e = T ? this.formatDate(e, this._daylightSavingAdjust(new Date(aa, _ + W, 1)), this._getFormatConfig(a)) : e, f = this._canAdjustMonth(a, 1, aa, _) ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='" + e + "'><span class='ui-icon ui-icon-circle-triangle-" + (Q ? "w" : "e") + "'>" + e + "</span></a>" : S ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + e + "'><span class='ui-icon ui-icon-circle-triangle-" + (Q ? "w" : "e") + "'>" + e + "</span></a>", g = this._get(a, "currentText"), h = this._get(a, "gotoCurrent") && a.currentDay ? Y : P, g = T ? this.formatDate(g, h, this._getFormatConfig(a)) : g, i = a.inline ? "" : "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" + this._get(a, "closeText") + "</button>", j = R ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (Q ? i : "") + (this._isInRange(a, h) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>" + g + "</button>" : "") + (Q ? "" : i) + "</div>" : "", k = parseInt(this._get(a, "firstDay"), 10), k = isNaN(k) ? 0 : k, l = this._get(a, "showWeek"), m = this._get(a, "dayNames"), n = this._get(a, "dayNamesMin"), o = this._get(a, "monthNames"), p = this._get(a, "monthNamesShort"), q = this._get(a, "beforeShowDay"), r = this._get(a, "showOtherMonths"), s = this._get(a, "selectOtherMonths"), t = this._getDefaultDate(a), u = "", w = 0; w < U[0]; w++) {
                    for (x = "", this.maxRows = 4, y = 0; y < U[1]; y++) {
                        if (z = this._daylightSavingAdjust(new Date(aa, _, a.selectedDay)), A = " ui-corner-all", B = "", X) {
                            if (B += "<div class='ui-datepicker-group", U[1] > 1) switch (y) {
                                case 0:
                                    B += " ui-datepicker-group-first", A = " ui-corner-" + (Q ? "right" : "left");
                                    break;
                                case U[1] - 1:
                                    B += " ui-datepicker-group-last", A = " ui-corner-" + (Q ? "left" : "right");
                                    break;
                                default:
                                    B += " ui-datepicker-group-middle", A = ""
                            }
                            B += "'>"
                        }
                        for (B += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + A + "'>" + (/all|left/.test(A) && 0 === w ? Q ? f : d : "") + (/all|right/.test(A) && 0 === w ? Q ? d : f : "") + this._generateMonthYearHeader(a, _, aa, Z, $, w > 0 || y > 0, o, p) + "</div><table class='ui-datepicker-calendar'><thead><tr>", C = l ? "<th class='ui-datepicker-week-col'>" + this._get(a, "weekHeader") + "</th>" : "", v = 0; 7 > v; v++) D = (v + k) % 7, C += "<th" + ((v + k + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + "><span title='" + m[D] + "'>" + n[D] + "</span></th>";
                        for (B += C + "</tr></thead><tbody>", E = this._getDaysInMonth(aa, _), aa === a.selectedYear && _ === a.selectedMonth && (a.selectedDay = Math.min(a.selectedDay, E)), F = (this._getFirstDayOfMonth(aa, _) - k + 7) % 7, G = Math.ceil((F + E) / 7), H = X && this.maxRows > G ? this.maxRows : G, this.maxRows = H, I = this._daylightSavingAdjust(new Date(aa, _, 1 - F)), J = 0; H > J; J++) {
                            for (B += "<tr>", K = l ? "<td class='ui-datepicker-week-col'>" + this._get(a, "calculateWeek")(I) + "</td>" : "", v = 0; 7 > v; v++) L = q ? q.apply(a.input ? a.input[0] : null, [I]) : [!0, ""], M = I.getMonth() !== _, N = M && !s || !L[0] || Z && Z > I || $ && I > $, K += "<td class='" + ((v + k + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + (M ? " ui-datepicker-other-month" : "") + (I.getTime() === z.getTime() && _ === a.selectedMonth && a._keyEvent || t.getTime() === I.getTime() && t.getTime() === z.getTime() ? " " + this._dayOverClass : "") + (N ? " " + this._unselectableClass + " ui-state-disabled" : "") + (M && !r ? "" : " " + L[1] + (I.getTime() === Y.getTime() ? " " + this._currentClass : "") + (I.getTime() === P.getTime() ? " ui-datepicker-today" : "")) + "'" + (M && !r || !L[2] ? "" : " title='" + L[2].replace(/'/g, "&#39;") + "'") + (N ? "" : " data-handler='selectDay' data-event='click' data-month='" + I.getMonth() + "' data-year='" + I.getFullYear() + "'") + ">" + (M && !r ? "&#xa0;" : N ? "<span class='ui-state-default'>" + I.getDate() + "</span>" : "<a class='ui-state-default" + (I.getTime() === P.getTime() ? " ui-state-highlight" : "") + (I.getTime() === Y.getTime() ? " ui-state-active" : "") + (M ? " ui-priority-secondary" : "") + "' href='#'>" + I.getDate() + "</a>") + "</td>", I.setDate(I.getDate() + 1), I = this._daylightSavingAdjust(I);
                            B += K + "</tr>"
                        }
                        _++, _ > 11 && (_ = 0, aa++), B += "</tbody></table>" + (X ? "</div>" + (U[0] > 0 && y === U[1] - 1 ? "<div class='ui-datepicker-row-break'></div>" : "") : ""), x += B
                    }
                    u += x
                }
                return u += j, a._keyEvent = !1, u
            },
            _generateMonthYearHeader: function(a, b, c, d, e, f, g, h) {
                var i, j, k, l, m, n, o, p, q = this._get(a, "changeMonth"),
                    r = this._get(a, "changeYear"),
                    s = this._get(a, "showMonthAfterYear"),
                    t = "<div class='ui-datepicker-title'>",
                    u = "";
                if (f || !q) u += "<span class='ui-datepicker-month'>" + g[b] + "</span>";
                else {
                    for (i = d && d.getFullYear() === c, j = e && e.getFullYear() === c, u += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>", k = 0; 12 > k; k++)(!i || k >= d.getMonth()) && (!j || k <= e.getMonth()) && (u += "<option value='" + k + "'" + (k === b ? " selected='selected'" : "") + ">" + h[k] + "</option>");
                    u += "</select>"
                }
                if (s || (t += u + (!f && q && r ? "" : "&#xa0;")), !a.yearshtml)
                    if (a.yearshtml = "", f || !r) t += "<span class='ui-datepicker-year'>" + c + "</span>";
                    else {
                        for (l = this._get(a, "yearRange").split(":"), m = (new Date).getFullYear(), n = function(a) {
                                var b = a.match(/c[+\-].*/) ? c + parseInt(a.substring(1), 10) : a.match(/[+\-].*/) ? m + parseInt(a, 10) : parseInt(a, 10);
                                return isNaN(b) ? m : b
                            }, o = n(l[0]), p = Math.max(o, n(l[1] || "")), o = d ? Math.max(o, d.getFullYear()) : o, p = e ? Math.min(p, e.getFullYear()) : p, a.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>"; p >= o; o++) a.yearshtml += "<option value='" + o + "'" + (o === c ? " selected='selected'" : "") + ">" + o + "</option>";
                        a.yearshtml += "</select>", t += a.yearshtml, a.yearshtml = null
                    }
                return t += this._get(a, "yearSuffix"), s && (t += (!f && q && r ? "" : "&#xa0;") + u), t += "</div>"
            },
            _adjustInstDate: function(a, b, c) {
                var d = a.drawYear + ("Y" === c ? b : 0),
                    e = a.drawMonth + ("M" === c ? b : 0),
                    f = Math.min(a.selectedDay, this._getDaysInMonth(d, e)) + ("D" === c ? b : 0),
                    g = this._restrictMinMax(a, this._daylightSavingAdjust(new Date(d, e, f)));
                a.selectedDay = g.getDate(), a.drawMonth = a.selectedMonth = g.getMonth(), a.drawYear = a.selectedYear = g.getFullYear(), ("M" === c || "Y" === c) && this._notifyChange(a)
            },
            _restrictMinMax: function(a, b) {
                var c = this._getMinMaxDate(a, "min"),
                    d = this._getMinMaxDate(a, "max"),
                    e = c && c > b ? c : b;
                return d && e > d ? d : e
            },
            _notifyChange: function(a) {
                var b = this._get(a, "onChangeMonthYear");
                b && b.apply(a.input ? a.input[0] : null, [a.selectedYear, a.selectedMonth + 1, a])
            },
            _getNumberOfMonths: function(a) {
                var b = this._get(a, "numberOfMonths");
                return null == b ? [1, 1] : "number" == typeof b ? [1, b] : b
            },
            _getMinMaxDate: function(a, b) {
                return this._determineDate(a, this._get(a, b + "Date"), null)
            },
            _getDaysInMonth: function(a, b) {
                return 32 - this._daylightSavingAdjust(new Date(a, b, 32)).getDate()
            },
            _getFirstDayOfMonth: function(a, b) {
                return new Date(a, b, 1).getDay()
            },
            _canAdjustMonth: function(a, b, c, d) {
                var e = this._getNumberOfMonths(a),
                    f = this._daylightSavingAdjust(new Date(c, d + (0 > b ? b : e[0] * e[1]), 1));
                return 0 > b && f.setDate(this._getDaysInMonth(f.getFullYear(), f.getMonth())), this._isInRange(a, f)
            },
            _isInRange: function(a, b) {
                var c, d, e = this._getMinMaxDate(a, "min"),
                    f = this._getMinMaxDate(a, "max"),
                    g = null,
                    h = null,
                    i = this._get(a, "yearRange");
                return i && (c = i.split(":"), d = (new Date).getFullYear(), g = parseInt(c[0], 10), h = parseInt(c[1], 10), c[0].match(/[+\-].*/) && (g += d), c[1].match(/[+\-].*/) && (h += d)), (!e || b.getTime() >= e.getTime()) && (!f || b.getTime() <= f.getTime()) && (!g || b.getFullYear() >= g) && (!h || b.getFullYear() <= h)
            },
            _getFormatConfig: function(a) {
                var b = this._get(a, "shortYearCutoff");
                return b = "string" != typeof b ? b : (new Date).getFullYear() % 100 + parseInt(b, 10), {
                    shortYearCutoff: b,
                    dayNamesShort: this._get(a, "dayNamesShort"),
                    dayNames: this._get(a, "dayNames"),
                    monthNamesShort: this._get(a, "monthNamesShort"),
                    monthNames: this._get(a, "monthNames")
                }
            },
            _formatDate: function(a, b, c, d) {
                b || (a.currentDay = a.selectedDay, a.currentMonth = a.selectedMonth, a.currentYear = a.selectedYear);
                var e = b ? "object" == typeof b ? b : this._daylightSavingAdjust(new Date(d, c, b)) : this._daylightSavingAdjust(new Date(a.currentYear, a.currentMonth, a.currentDay));
                return this.formatDate(this._get(a, "dateFormat"), e, this._getFormatConfig(a))
            }
        }), a.fn.datepicker = function(b) {
            if (!this.length) return this;
            a.datepicker.initialized || (a(document).mousedown(a.datepicker._checkExternalClick), a.datepicker.initialized = !0), 0 === a("#" + a.datepicker._mainDivId).length && a("body").append(a.datepicker.dpDiv);
            var c = Array.prototype.slice.call(arguments, 1);
            return "string" != typeof b || "isDisabled" !== b && "getDate" !== b && "widget" !== b ? "option" === b && 2 === arguments.length && "string" == typeof arguments[1] ? a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this[0]].concat(c)) : this.each(function() {
                "string" == typeof b ? a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this].concat(c)) : a.datepicker._attachDatepicker(this, b)
            }) : a.datepicker["_" + b + "Datepicker"].apply(a.datepicker, [this[0]].concat(c))
        }, a.datepicker = new c, a.datepicker.initialized = !1, a.datepicker.uuid = (new Date).getTime(), a.datepicker.version = "1.10.3"
    }(jQuery),
    function(a, b) {
        "function" == typeof define && define.amd ? define([], b) : "object" == typeof exports ? module.exports = b() : a.Handlebars = a.Handlebars || b()
    }(this, function() {
        var a = function() {
                "use strict";

                function a(a) {
                    this.string = a
                }
                var b;
                return a.prototype.toString = function() {
                    return "" + this.string
                }, b = a
            }(),
            b = function(a) {
                "use strict";

                function b(a) {
                    return i[a]
                }

                function c(a) {
                    for (var b = 1; b < arguments.length; b++)
                        for (var c in arguments[b]) Object.prototype.hasOwnProperty.call(arguments[b], c) && (a[c] = arguments[b][c]);
                    return a
                }

                function d(a) {
                    return a instanceof h ? a.toString() : null == a ? "" : a ? (a = "" + a, k.test(a) ? a.replace(j, b) : a) : a + ""
                }

                function e(a) {
                    return a || 0 === a ? n(a) && 0 === a.length ? !0 : !1 : !0
                }

                function f(a, b) {
                    return (a ? a + "." : "") + b
                }
                var g = {},
                    h = a,
                    i = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#x27;",
                        "`": "&#x60;"
                    },
                    j = /[&<>"'`]/g,
                    k = /[&<>"'`]/;
                g.extend = c;
                var l = Object.prototype.toString;
                g.toString = l;
                var m = function(a) {
                    return "function" == typeof a
                };
                m(/x/) && (m = function(a) {
                    return "function" == typeof a && "[object Function]" === l.call(a)
                });
                var m;
                g.isFunction = m;
                var n = Array.isArray || function(a) {
                    return a && "object" == typeof a ? "[object Array]" === l.call(a) : !1
                };
                return g.isArray = n, g.escapeExpression = d, g.isEmpty = e, g.appendContextPath = f, g
            }(a),
            c = function() {
                "use strict";

                function a(a, b) {
                    var d;
                    b && b.firstLine && (d = b.firstLine, a += " - " + d + ":" + b.firstColumn);
                    for (var e = Error.prototype.constructor.call(this, a), f = 0; f < c.length; f++) this[c[f]] = e[c[f]];
                    d && (this.lineNumber = d, this.column = b.firstColumn)
                }
                var b, c = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
                return a.prototype = new Error, b = a
            }(),
            d = function(a, b) {
                "use strict";

                function c(a, b) {
                    this.helpers = a || {}, this.partials = b || {}, d(this)
                }

                function d(a) {
                    a.registerHelper("helperMissing", function() {
                        if (1 === arguments.length) return void 0;
                        throw new g("Missing helper: '" + arguments[arguments.length - 1].name + "'")
                    }), a.registerHelper("blockHelperMissing", function(b, c) {
                        var d = c.inverse,
                            e = c.fn;
                        if (b === !0) return e(this);
                        if (b === !1 || null == b) return d(this);
                        if (k(b)) return b.length > 0 ? (c.ids && (c.ids = [c.name]), a.helpers.each(b, c)) : d(this);
                        if (c.data && c.ids) {
                            var g = q(c.data);
                            g.contextPath = f.appendContextPath(c.data.contextPath, c.name), c = {
                                data: g
                            }
                        }
                        return e(b, c)
                    }), a.registerHelper("each", function(a, b) {
                        if (!b) throw new g("Must pass iterator to #each");
                        var c, d, e = b.fn,
                            h = b.inverse,
                            i = 0,
                            j = "";
                        if (b.data && b.ids && (d = f.appendContextPath(b.data.contextPath, b.ids[0]) + "."), l(a) && (a = a.call(this)), b.data && (c = q(b.data)), a && "object" == typeof a)
                            if (k(a))
                                for (var m = a.length; m > i; i++) c && (c.index = i, c.first = 0 === i, c.last = i === a.length - 1, d && (c.contextPath = d + i)), j += e(a[i], {
                                    data: c
                                });
                            else
                                for (var n in a) a.hasOwnProperty(n) && (c && (c.key = n, c.index = i, c.first = 0 === i, d && (c.contextPath = d + n)), j += e(a[n], {
                                    data: c
                                }), i++);
                        return 0 === i && (j = h(this)), j
                    }), a.registerHelper("if", function(a, b) {
                        return l(a) && (a = a.call(this)), !b.hash.includeZero && !a || f.isEmpty(a) ? b.inverse(this) : b.fn(this)
                    }), a.registerHelper("unless", function(b, c) {
                        return a.helpers["if"].call(this, b, {
                            fn: c.inverse,
                            inverse: c.fn,
                            hash: c.hash
                        })
                    }), a.registerHelper("with", function(a, b) {
                        l(a) && (a = a.call(this));
                        var c = b.fn;
                        if (f.isEmpty(a)) return b.inverse(this);
                        if (b.data && b.ids) {
                            var d = q(b.data);
                            d.contextPath = f.appendContextPath(b.data.contextPath, b.ids[0]), b = {
                                data: d
                            }
                        }
                        return c(a, b)
                    }), a.registerHelper("log", function(b, c) {
                        var d = c.data && null != c.data.level ? parseInt(c.data.level, 10) : 1;
                        a.log(d, b)
                    }), a.registerHelper("lookup", function(a, b) {
                        return a && a[b]
                    })
                }
                var e = {},
                    f = a,
                    g = b,
                    h = "2.0.0";
                e.VERSION = h;
                var i = 6;
                e.COMPILER_REVISION = i;
                var j = {
                    1: "<= 1.0.rc.2",
                    2: "== 1.0.0-rc.3",
                    3: "== 1.0.0-rc.4",
                    4: "== 1.x.x",
                    5: "== 2.0.0-alpha.x",
                    6: ">= 2.0.0-beta.1"
                };
                e.REVISION_CHANGES = j;
                var k = f.isArray,
                    l = f.isFunction,
                    m = f.toString,
                    n = "[object Object]";
                e.HandlebarsEnvironment = c, c.prototype = {
                    constructor: c,
                    logger: o,
                    log: p,
                    registerHelper: function(a, b) {
                        if (m.call(a) === n) {
                            if (b) throw new g("Arg not supported with multiple helpers");
                            f.extend(this.helpers, a)
                        } else this.helpers[a] = b
                    },
                    unregisterHelper: function(a) {
                        delete this.helpers[a]
                    },
                    registerPartial: function(a, b) {
                        m.call(a) === n ? f.extend(this.partials, a) : this.partials[a] = b
                    },
                    unregisterPartial: function(a) {
                        delete this.partials[a]
                    }
                };
                var o = {
                    methodMap: {
                        0: "debug",
                        1: "info",
                        2: "warn",
                        3: "error"
                    },
                    DEBUG: 0,
                    INFO: 1,
                    WARN: 2,
                    ERROR: 3,
                    level: 3,
                    log: function(a, b) {
                        if (o.level <= a) {
                            var c = o.methodMap[a];
                            "undefined" != typeof console && console[c] && console[c].call(console, b)
                        }
                    }
                };
                e.logger = o;
                var p = o.log;
                e.log = p;
                var q = function(a) {
                    var b = f.extend({}, a);
                    return b._parent = a, b
                };
                return e.createFrame = q, e
            }(b, c),
            e = function(a, b, c) {
                "use strict";

                function d(a) {
                    var b = a && a[0] || 1,
                        c = m;
                    if (b !== c) {
                        if (c > b) {
                            var d = n[c],
                                e = n[b];
                            throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + d + ") or downgrade your runtime to an older version (" + e + ").")
                        }
                        throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + a[1] + ").")
                    }
                }

                function e(a, b) {
                    if (!b) throw new l("No environment passed to template");
                    if (!a || !a.main) throw new l("Unknown template object: " + typeof a);
                    b.VM.checkRevision(a.compiler);
                    var c = function(c, d, e, f, g, h, i, j, m) {
                            g && (f = k.extend({}, f, g));
                            var n = b.VM.invokePartial.call(this, c, e, f, h, i, j, m);
                            if (null == n && b.compile) {
                                var o = {
                                    helpers: h,
                                    partials: i,
                                    data: j,
                                    depths: m
                                };
                                i[e] = b.compile(c, {
                                    data: void 0 !== j,
                                    compat: a.compat
                                }, b), n = i[e](f, o)
                            }
                            if (null != n) {
                                if (d) {
                                    for (var p = n.split("\n"), q = 0, r = p.length; r > q && (p[q] || q + 1 !== r); q++) p[q] = d + p[q];
                                    n = p.join("\n")
                                }
                                return n
                            }
                            throw new l("The partial " + e + " could not be compiled when running in runtime-only mode")
                        },
                        d = {
                            lookup: function(a, b) {
                                for (var c = a.length, d = 0; c > d; d++)
                                    if (a[d] && null != a[d][b]) return a[d][b]
                            },
                            lambda: function(a, b) {
                                return "function" == typeof a ? a.call(b) : a
                            },
                            escapeExpression: k.escapeExpression,
                            invokePartial: c,
                            fn: function(b) {
                                return a[b]
                            },
                            programs: [],
                            program: function(a, b, c) {
                                var d = this.programs[a],
                                    e = this.fn(a);
                                return b || c ? d = f(this, a, e, b, c) : d || (d = this.programs[a] = f(this, a, e)), d
                            },
                            data: function(a, b) {
                                for (; a && b--;) a = a._parent;
                                return a
                            },
                            merge: function(a, b) {
                                var c = a || b;
                                return a && b && a !== b && (c = k.extend({}, b, a)), c
                            },
                            noop: b.VM.noop,
                            compilerInfo: a.compiler
                        },
                        e = function(b, c) {
                            c = c || {};
                            var f = c.data;
                            e._setup(c), !c.partial && a.useData && (f = i(b, f));
                            var g;
                            return a.useDepths && (g = c.depths ? [b].concat(c.depths) : [b]), a.main.call(d, b, d.helpers, d.partials, f, g)
                        };
                    return e.isTop = !0, e._setup = function(c) {
                        c.partial ? (d.helpers = c.helpers, d.partials = c.partials) : (d.helpers = d.merge(c.helpers, b.helpers), a.usePartial && (d.partials = d.merge(c.partials, b.partials)))
                    }, e._child = function(b, c, e) {
                        if (a.useDepths && !e) throw new l("must pass parent depths");
                        return f(d, b, a[b], c, e)
                    }, e
                }

                function f(a, b, c, d, e) {
                    var f = function(b, f) {
                        return f = f || {}, c.call(a, b, a.helpers, a.partials, f.data || d, e && [b].concat(e))
                    };
                    return f.program = b, f.depth = e ? e.length : 0, f
                }

                function g(a, b, c, d, e, f, g) {
                    var h = {
                        partial: !0,
                        helpers: d,
                        partials: e,
                        data: f,
                        depths: g
                    };
                    if (void 0 === a) throw new l("The partial " + b + " could not be found");
                    return a instanceof Function ? a(c, h) : void 0
                }

                function h() {
                    return ""
                }

                function i(a, b) {
                    return b && "root" in b || (b = b ? o(b) : {}, b.root = a), b
                }
                var j = {},
                    k = a,
                    l = b,
                    m = c.COMPILER_REVISION,
                    n = c.REVISION_CHANGES,
                    o = c.createFrame;
                return j.checkRevision = d, j.template = e, j.program = f, j.invokePartial = g, j.noop = h, j
            }(b, c, d),
            f = function(a, b, c, d, e) {
                "use strict";
                var f, g = a,
                    h = b,
                    i = c,
                    j = d,
                    k = e,
                    l = function() {
                        var a = new g.HandlebarsEnvironment;
                        return j.extend(a, g), a.SafeString = h, a.Exception = i, a.Utils = j, a.escapeExpression = j.escapeExpression, a.VM = k, a.template = function(b) {
                            return k.template(b, a)
                        }, a
                    },
                    m = l();
                return m.create = l, m["default"] = m, f = m
            }(d, a, c, b, e),
            g = function(a) {
                "use strict";

                function b(a) {
                    a = a || {}, this.firstLine = a.first_line, this.firstColumn = a.first_column, this.lastColumn = a.last_column, this.lastLine = a.last_line
                }
                var c, d = a,
                    e = {
                        ProgramNode: function(a, c, d) {
                            b.call(this, d), this.type = "program", this.statements = a, this.strip = c
                        },
                        MustacheNode: function(a, c, d, f, g) {
                            if (b.call(this, g), this.type = "mustache", this.strip = f, null != d && d.charAt) {
                                var h = d.charAt(3) || d.charAt(2);
                                this.escaped = "{" !== h && "&" !== h
                            } else this.escaped = !!d;
                            this.sexpr = a instanceof e.SexprNode ? a : new e.SexprNode(a, c), this.id = this.sexpr.id, this.params = this.sexpr.params, this.hash = this.sexpr.hash, this.eligibleHelper = this.sexpr.eligibleHelper, this.isHelper = this.sexpr.isHelper
                        },
                        SexprNode: function(a, c, d) {
                            b.call(this, d), this.type = "sexpr", this.hash = c;
                            var e = this.id = a[0],
                                f = this.params = a.slice(1);
                            this.isHelper = !(!f.length && !c), this.eligibleHelper = this.isHelper || e.isSimple
                        },
                        PartialNode: function(a, c, d, e, f) {
                            b.call(this, f), this.type = "partial", this.partialName = a, this.context = c, this.hash = d, this.strip = e, this.strip.inlineStandalone = !0
                        },
                        BlockNode: function(a, c, d, e, f) {
                            b.call(this, f), this.type = "block", this.mustache = a, this.program = c, this.inverse = d, this.strip = e, d && !c && (this.isInverse = !0)
                        },
                        RawBlockNode: function(a, c, f, g) {
                            if (b.call(this, g), a.sexpr.id.original !== f) throw new d(a.sexpr.id.original + " doesn't match " + f, this);
                            c = new e.ContentNode(c, g), this.type = "block", this.mustache = a, this.program = new e.ProgramNode([c], {}, g)
                        },
                        ContentNode: function(a, c) {
                            b.call(this, c), this.type = "content", this.original = this.string = a
                        },
                        HashNode: function(a, c) {
                            b.call(this, c), this.type = "hash", this.pairs = a
                        },
                        IdNode: function(a, c) {
                            b.call(this, c), this.type = "ID";
                            for (var e = "", f = [], g = 0, h = "", i = 0, j = a.length; j > i; i++) {
                                var k = a[i].part;
                                if (e += (a[i].separator || "") + k, ".." === k || "." === k || "this" === k) {
                                    if (f.length > 0) throw new d("Invalid path: " + e, this);
                                    ".." === k ? (g++, h += "../") : this.isScoped = !0
                                } else f.push(k)
                            }
                            this.original = e, this.parts = f, this.string = f.join("."), this.depth = g, this.idName = h + this.string, this.isSimple = 1 === a.length && !this.isScoped && 0 === g, this.stringModeValue = this.string
                        },
                        PartialNameNode: function(a, c) {
                            b.call(this, c), this.type = "PARTIAL_NAME", this.name = a.original
                        },
                        DataNode: function(a, c) {
                            b.call(this, c), this.type = "DATA", this.id = a, this.stringModeValue = a.stringModeValue, this.idName = "@" + a.stringModeValue
                        },
                        StringNode: function(a, c) {
                            b.call(this, c), this.type = "STRING", this.original = this.string = this.stringModeValue = a
                        },
                        NumberNode: function(a, c) {
                            b.call(this, c), this.type = "NUMBER", this.original = this.number = a, this.stringModeValue = Number(a)
                        },
                        BooleanNode: function(a, c) {
                            b.call(this, c), this.type = "BOOLEAN", this.bool = a, this.stringModeValue = "true" === a
                        },
                        CommentNode: function(a, c) {
                            b.call(this, c), this.type = "comment", this.comment = a, this.strip = {
                                inlineStandalone: !0
                            }
                        }
                    };
                return c = e
            }(c),
            h = function() {
                "use strict";
                var a, b = function() {
                    function a() {
                        this.yy = {}
                    }
                    var b = {
                            trace: function() {},
                            yy: {},
                            symbols_: {
                                error: 2,
                                root: 3,
                                program: 4,
                                EOF: 5,
                                program_repetition0: 6,
                                statement: 7,
                                mustache: 8,
                                block: 9,
                                rawBlock: 10,
                                partial: 11,
                                CONTENT: 12,
                                COMMENT: 13,
                                openRawBlock: 14,
                                END_RAW_BLOCK: 15,
                                OPEN_RAW_BLOCK: 16,
                                sexpr: 17,
                                CLOSE_RAW_BLOCK: 18,
                                openBlock: 19,
                                block_option0: 20,
                                closeBlock: 21,
                                openInverse: 22,
                                block_option1: 23,
                                OPEN_BLOCK: 24,
                                CLOSE: 25,
                                OPEN_INVERSE: 26,
                                inverseAndProgram: 27,
                                INVERSE: 28,
                                OPEN_ENDBLOCK: 29,
                                path: 30,
                                OPEN: 31,
                                OPEN_UNESCAPED: 32,
                                CLOSE_UNESCAPED: 33,
                                OPEN_PARTIAL: 34,
                                partialName: 35,
                                param: 36,
                                partial_option0: 37,
                                partial_option1: 38,
                                sexpr_repetition0: 39,
                                sexpr_option0: 40,
                                dataName: 41,
                                STRING: 42,
                                NUMBER: 43,
                                BOOLEAN: 44,
                                OPEN_SEXPR: 45,
                                CLOSE_SEXPR: 46,
                                hash: 47,
                                hash_repetition_plus0: 48,
                                hashSegment: 49,
                                ID: 50,
                                EQUALS: 51,
                                DATA: 52,
                                pathSegments: 53,
                                SEP: 54,
                                $accept: 0,
                                $end: 1
                            },
                            terminals_: {
                                2: "error",
                                5: "EOF",
                                12: "CONTENT",
                                13: "COMMENT",
                                15: "END_RAW_BLOCK",
                                16: "OPEN_RAW_BLOCK",
                                18: "CLOSE_RAW_BLOCK",
                                24: "OPEN_BLOCK",
                                25: "CLOSE",
                                26: "OPEN_INVERSE",
                                28: "INVERSE",
                                29: "OPEN_ENDBLOCK",
                                31: "OPEN",
                                32: "OPEN_UNESCAPED",
                                33: "CLOSE_UNESCAPED",
                                34: "OPEN_PARTIAL",
                                42: "STRING",
                                43: "NUMBER",
                                44: "BOOLEAN",
                                45: "OPEN_SEXPR",
                                46: "CLOSE_SEXPR",
                                50: "ID",
                                51: "EQUALS",
                                52: "DATA",
                                54: "SEP"
                            },
                            productions_: [0, [3, 2],
                                [4, 1],
                                [7, 1],
                                [7, 1],
                                [7, 1],
                                [7, 1],
                                [7, 1],
                                [7, 1],
                                [10, 3],
                                [14, 3],
                                [9, 4],
                                [9, 4],
                                [19, 3],
                                [22, 3],
                                [27, 2],
                                [21, 3],
                                [8, 3],
                                [8, 3],
                                [11, 5],
                                [11, 4],
                                [17, 3],
                                [17, 1],
                                [36, 1],
                                [36, 1],
                                [36, 1],
                                [36, 1],
                                [36, 1],
                                [36, 3],
                                [47, 1],
                                [49, 3],
                                [35, 1],
                                [35, 1],
                                [35, 1],
                                [41, 2],
                                [30, 1],
                                [53, 3],
                                [53, 1],
                                [6, 0],
                                [6, 2],
                                [20, 0],
                                [20, 1],
                                [23, 0],
                                [23, 1],
                                [37, 0],
                                [37, 1],
                                [38, 0],
                                [38, 1],
                                [39, 0],
                                [39, 2],
                                [40, 0],
                                [40, 1],
                                [48, 1],
                                [48, 2]
                            ],
                            performAction: function(a, b, c, d, e, f, g) {
                                var h = f.length - 1;
                                switch (e) {
                                    case 1:
                                        return d.prepareProgram(f[h - 1].statements, !0), f[h - 1];
                                    case 2:
                                        this.$ = new d.ProgramNode(d.prepareProgram(f[h]), {}, this._$);
                                        break;
                                    case 3:
                                        this.$ = f[h];
                                        break;
                                    case 4:
                                        this.$ = f[h];
                                        break;
                                    case 5:
                                        this.$ = f[h];
                                        break;
                                    case 6:
                                        this.$ = f[h];
                                        break;
                                    case 7:
                                        this.$ = new d.ContentNode(f[h], this._$);
                                        break;
                                    case 8:
                                        this.$ = new d.CommentNode(f[h], this._$);
                                        break;
                                    case 9:
                                        this.$ = new d.RawBlockNode(f[h - 2], f[h - 1], f[h], this._$);
                                        break;
                                    case 10:
                                        this.$ = new d.MustacheNode(f[h - 1], null, "", "", this._$);
                                        break;
                                    case 11:
                                        this.$ = d.prepareBlock(f[h - 3], f[h - 2], f[h - 1], f[h], !1, this._$);
                                        break;
                                    case 12:
                                        this.$ = d.prepareBlock(f[h - 3], f[h - 2], f[h - 1], f[h], !0, this._$);
                                        break;
                                    case 13:
                                        this.$ = new d.MustacheNode(f[h - 1], null, f[h - 2], d.stripFlags(f[h - 2], f[h]), this._$);
                                        break;
                                    case 14:
                                        this.$ = new d.MustacheNode(f[h - 1], null, f[h - 2], d.stripFlags(f[h - 2], f[h]), this._$);
                                        break;
                                    case 15:
                                        this.$ = {
                                            strip: d.stripFlags(f[h - 1], f[h - 1]),
                                            program: f[h]
                                        };
                                        break;
                                    case 16:
                                        this.$ = {
                                            path: f[h - 1],
                                            strip: d.stripFlags(f[h - 2], f[h])
                                        };
                                        break;
                                    case 17:
                                        this.$ = new d.MustacheNode(f[h - 1], null, f[h - 2], d.stripFlags(f[h - 2], f[h]), this._$);
                                        break;
                                    case 18:
                                        this.$ = new d.MustacheNode(f[h - 1], null, f[h - 2], d.stripFlags(f[h - 2], f[h]), this._$);
                                        break;
                                    case 19:
                                        this.$ = new d.PartialNode(f[h - 3], f[h - 2], f[h - 1], d.stripFlags(f[h - 4], f[h]), this._$);
                                        break;
                                    case 20:
                                        this.$ = new d.PartialNode(f[h - 2], void 0, f[h - 1], d.stripFlags(f[h - 3], f[h]), this._$);
                                        break;
                                    case 21:
                                        this.$ = new d.SexprNode([f[h - 2]].concat(f[h - 1]), f[h], this._$);

                                        break;
                                    case 22:
                                        this.$ = new d.SexprNode([f[h]], null, this._$);
                                        break;
                                    case 23:
                                        this.$ = f[h];
                                        break;
                                    case 24:
                                        this.$ = new d.StringNode(f[h], this._$);
                                        break;
                                    case 25:
                                        this.$ = new d.NumberNode(f[h], this._$);
                                        break;
                                    case 26:
                                        this.$ = new d.BooleanNode(f[h], this._$);
                                        break;
                                    case 27:
                                        this.$ = f[h];
                                        break;
                                    case 28:
                                        f[h - 1].isHelper = !0, this.$ = f[h - 1];
                                        break;
                                    case 29:
                                        this.$ = new d.HashNode(f[h], this._$);
                                        break;
                                    case 30:
                                        this.$ = [f[h - 2], f[h]];
                                        break;
                                    case 31:
                                        this.$ = new d.PartialNameNode(f[h], this._$);
                                        break;
                                    case 32:
                                        this.$ = new d.PartialNameNode(new d.StringNode(f[h], this._$), this._$);
                                        break;
                                    case 33:
                                        this.$ = new d.PartialNameNode(new d.NumberNode(f[h], this._$));
                                        break;
                                    case 34:
                                        this.$ = new d.DataNode(f[h], this._$);
                                        break;
                                    case 35:
                                        this.$ = new d.IdNode(f[h], this._$);
                                        break;
                                    case 36:
                                        f[h - 2].push({
                                            part: f[h],
                                            separator: f[h - 1]
                                        }), this.$ = f[h - 2];
                                        break;
                                    case 37:
                                        this.$ = [{
                                            part: f[h]
                                        }];
                                        break;
                                    case 38:
                                        this.$ = [];
                                        break;
                                    case 39:
                                        f[h - 1].push(f[h]);
                                        break;
                                    case 48:
                                        this.$ = [];
                                        break;
                                    case 49:
                                        f[h - 1].push(f[h]);
                                        break;
                                    case 52:
                                        this.$ = [f[h]];
                                        break;
                                    case 53:
                                        f[h - 1].push(f[h])
                                }
                            },
                            table: [{
                                3: 1,
                                4: 2,
                                5: [2, 38],
                                6: 3,
                                12: [2, 38],
                                13: [2, 38],
                                16: [2, 38],
                                24: [2, 38],
                                26: [2, 38],
                                31: [2, 38],
                                32: [2, 38],
                                34: [2, 38]
                            }, {
                                1: [3]
                            }, {
                                5: [1, 4]
                            }, {
                                5: [2, 2],
                                7: 5,
                                8: 6,
                                9: 7,
                                10: 8,
                                11: 9,
                                12: [1, 10],
                                13: [1, 11],
                                14: 16,
                                16: [1, 20],
                                19: 14,
                                22: 15,
                                24: [1, 18],
                                26: [1, 19],
                                28: [2, 2],
                                29: [2, 2],
                                31: [1, 12],
                                32: [1, 13],
                                34: [1, 17]
                            }, {
                                1: [2, 1]
                            }, {
                                5: [2, 39],
                                12: [2, 39],
                                13: [2, 39],
                                16: [2, 39],
                                24: [2, 39],
                                26: [2, 39],
                                28: [2, 39],
                                29: [2, 39],
                                31: [2, 39],
                                32: [2, 39],
                                34: [2, 39]
                            }, {
                                5: [2, 3],
                                12: [2, 3],
                                13: [2, 3],
                                16: [2, 3],
                                24: [2, 3],
                                26: [2, 3],
                                28: [2, 3],
                                29: [2, 3],
                                31: [2, 3],
                                32: [2, 3],
                                34: [2, 3]
                            }, {
                                5: [2, 4],
                                12: [2, 4],
                                13: [2, 4],
                                16: [2, 4],
                                24: [2, 4],
                                26: [2, 4],
                                28: [2, 4],
                                29: [2, 4],
                                31: [2, 4],
                                32: [2, 4],
                                34: [2, 4]
                            }, {
                                5: [2, 5],
                                12: [2, 5],
                                13: [2, 5],
                                16: [2, 5],
                                24: [2, 5],
                                26: [2, 5],
                                28: [2, 5],
                                29: [2, 5],
                                31: [2, 5],
                                32: [2, 5],
                                34: [2, 5]
                            }, {
                                5: [2, 6],
                                12: [2, 6],
                                13: [2, 6],
                                16: [2, 6],
                                24: [2, 6],
                                26: [2, 6],
                                28: [2, 6],
                                29: [2, 6],
                                31: [2, 6],
                                32: [2, 6],
                                34: [2, 6]
                            }, {
                                5: [2, 7],
                                12: [2, 7],
                                13: [2, 7],
                                16: [2, 7],
                                24: [2, 7],
                                26: [2, 7],
                                28: [2, 7],
                                29: [2, 7],
                                31: [2, 7],
                                32: [2, 7],
                                34: [2, 7]
                            }, {
                                5: [2, 8],
                                12: [2, 8],
                                13: [2, 8],
                                16: [2, 8],
                                24: [2, 8],
                                26: [2, 8],
                                28: [2, 8],
                                29: [2, 8],
                                31: [2, 8],
                                32: [2, 8],
                                34: [2, 8]
                            }, {
                                17: 21,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                17: 27,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                4: 28,
                                6: 3,
                                12: [2, 38],
                                13: [2, 38],
                                16: [2, 38],
                                24: [2, 38],
                                26: [2, 38],
                                28: [2, 38],
                                29: [2, 38],
                                31: [2, 38],
                                32: [2, 38],
                                34: [2, 38]
                            }, {
                                4: 29,
                                6: 3,
                                12: [2, 38],
                                13: [2, 38],
                                16: [2, 38],
                                24: [2, 38],
                                26: [2, 38],
                                28: [2, 38],
                                29: [2, 38],
                                31: [2, 38],
                                32: [2, 38],
                                34: [2, 38]
                            }, {
                                12: [1, 30]
                            }, {
                                30: 32,
                                35: 31,
                                42: [1, 33],
                                43: [1, 34],
                                50: [1, 26],
                                53: 24
                            }, {
                                17: 35,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                17: 36,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                17: 37,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                25: [1, 38]
                            }, {
                                18: [2, 48],
                                25: [2, 48],
                                33: [2, 48],
                                39: 39,
                                42: [2, 48],
                                43: [2, 48],
                                44: [2, 48],
                                45: [2, 48],
                                46: [2, 48],
                                50: [2, 48],
                                52: [2, 48]
                            }, {
                                18: [2, 22],
                                25: [2, 22],
                                33: [2, 22],
                                46: [2, 22]
                            }, {
                                18: [2, 35],
                                25: [2, 35],
                                33: [2, 35],
                                42: [2, 35],
                                43: [2, 35],
                                44: [2, 35],
                                45: [2, 35],
                                46: [2, 35],
                                50: [2, 35],
                                52: [2, 35],
                                54: [1, 40]
                            }, {
                                30: 41,
                                50: [1, 26],
                                53: 24
                            }, {
                                18: [2, 37],
                                25: [2, 37],
                                33: [2, 37],
                                42: [2, 37],
                                43: [2, 37],
                                44: [2, 37],
                                45: [2, 37],
                                46: [2, 37],
                                50: [2, 37],
                                52: [2, 37],
                                54: [2, 37]
                            }, {
                                33: [1, 42]
                            }, {
                                20: 43,
                                27: 44,
                                28: [1, 45],
                                29: [2, 40]
                            }, {
                                23: 46,
                                27: 47,
                                28: [1, 45],
                                29: [2, 42]
                            }, {
                                15: [1, 48]
                            }, {
                                25: [2, 46],
                                30: 51,
                                36: 49,
                                38: 50,
                                41: 55,
                                42: [1, 52],
                                43: [1, 53],
                                44: [1, 54],
                                45: [1, 56],
                                47: 57,
                                48: 58,
                                49: 60,
                                50: [1, 59],
                                52: [1, 25],
                                53: 24
                            }, {
                                25: [2, 31],
                                42: [2, 31],
                                43: [2, 31],
                                44: [2, 31],
                                45: [2, 31],
                                50: [2, 31],
                                52: [2, 31]
                            }, {
                                25: [2, 32],
                                42: [2, 32],
                                43: [2, 32],
                                44: [2, 32],
                                45: [2, 32],
                                50: [2, 32],
                                52: [2, 32]
                            }, {
                                25: [2, 33],
                                42: [2, 33],
                                43: [2, 33],
                                44: [2, 33],
                                45: [2, 33],
                                50: [2, 33],
                                52: [2, 33]
                            }, {
                                25: [1, 61]
                            }, {
                                25: [1, 62]
                            }, {
                                18: [1, 63]
                            }, {
                                5: [2, 17],
                                12: [2, 17],
                                13: [2, 17],
                                16: [2, 17],
                                24: [2, 17],
                                26: [2, 17],
                                28: [2, 17],
                                29: [2, 17],
                                31: [2, 17],
                                32: [2, 17],
                                34: [2, 17]
                            }, {
                                18: [2, 50],
                                25: [2, 50],
                                30: 51,
                                33: [2, 50],
                                36: 65,
                                40: 64,
                                41: 55,
                                42: [1, 52],
                                43: [1, 53],
                                44: [1, 54],
                                45: [1, 56],
                                46: [2, 50],
                                47: 66,
                                48: 58,
                                49: 60,
                                50: [1, 59],
                                52: [1, 25],
                                53: 24
                            }, {
                                50: [1, 67]
                            }, {
                                18: [2, 34],
                                25: [2, 34],
                                33: [2, 34],
                                42: [2, 34],
                                43: [2, 34],
                                44: [2, 34],
                                45: [2, 34],
                                46: [2, 34],
                                50: [2, 34],
                                52: [2, 34]
                            }, {
                                5: [2, 18],
                                12: [2, 18],
                                13: [2, 18],
                                16: [2, 18],
                                24: [2, 18],
                                26: [2, 18],
                                28: [2, 18],
                                29: [2, 18],
                                31: [2, 18],
                                32: [2, 18],
                                34: [2, 18]
                            }, {
                                21: 68,
                                29: [1, 69]
                            }, {
                                29: [2, 41]
                            }, {
                                4: 70,
                                6: 3,
                                12: [2, 38],
                                13: [2, 38],
                                16: [2, 38],
                                24: [2, 38],
                                26: [2, 38],
                                29: [2, 38],
                                31: [2, 38],
                                32: [2, 38],
                                34: [2, 38]
                            }, {
                                21: 71,
                                29: [1, 69]
                            }, {
                                29: [2, 43]
                            }, {
                                5: [2, 9],
                                12: [2, 9],
                                13: [2, 9],
                                16: [2, 9],
                                24: [2, 9],
                                26: [2, 9],
                                28: [2, 9],
                                29: [2, 9],
                                31: [2, 9],
                                32: [2, 9],
                                34: [2, 9]
                            }, {
                                25: [2, 44],
                                37: 72,
                                47: 73,
                                48: 58,
                                49: 60,
                                50: [1, 74]
                            }, {
                                25: [1, 75]
                            }, {
                                18: [2, 23],
                                25: [2, 23],
                                33: [2, 23],
                                42: [2, 23],
                                43: [2, 23],
                                44: [2, 23],
                                45: [2, 23],
                                46: [2, 23],
                                50: [2, 23],
                                52: [2, 23]
                            }, {
                                18: [2, 24],
                                25: [2, 24],
                                33: [2, 24],
                                42: [2, 24],
                                43: [2, 24],
                                44: [2, 24],
                                45: [2, 24],
                                46: [2, 24],
                                50: [2, 24],
                                52: [2, 24]
                            }, {
                                18: [2, 25],
                                25: [2, 25],
                                33: [2, 25],
                                42: [2, 25],
                                43: [2, 25],
                                44: [2, 25],
                                45: [2, 25],
                                46: [2, 25],
                                50: [2, 25],
                                52: [2, 25]
                            }, {
                                18: [2, 26],
                                25: [2, 26],
                                33: [2, 26],
                                42: [2, 26],
                                43: [2, 26],
                                44: [2, 26],
                                45: [2, 26],
                                46: [2, 26],
                                50: [2, 26],
                                52: [2, 26]
                            }, {
                                18: [2, 27],
                                25: [2, 27],
                                33: [2, 27],
                                42: [2, 27],
                                43: [2, 27],
                                44: [2, 27],
                                45: [2, 27],
                                46: [2, 27],
                                50: [2, 27],
                                52: [2, 27]
                            }, {
                                17: 76,
                                30: 22,
                                41: 23,
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                25: [2, 47]
                            }, {
                                18: [2, 29],
                                25: [2, 29],
                                33: [2, 29],
                                46: [2, 29],
                                49: 77,
                                50: [1, 74]
                            }, {
                                18: [2, 37],
                                25: [2, 37],
                                33: [2, 37],
                                42: [2, 37],
                                43: [2, 37],
                                44: [2, 37],
                                45: [2, 37],
                                46: [2, 37],
                                50: [2, 37],
                                51: [1, 78],
                                52: [2, 37],
                                54: [2, 37]
                            }, {
                                18: [2, 52],
                                25: [2, 52],
                                33: [2, 52],
                                46: [2, 52],
                                50: [2, 52]
                            }, {
                                12: [2, 13],
                                13: [2, 13],
                                16: [2, 13],
                                24: [2, 13],
                                26: [2, 13],
                                28: [2, 13],
                                29: [2, 13],
                                31: [2, 13],
                                32: [2, 13],
                                34: [2, 13]
                            }, {
                                12: [2, 14],
                                13: [2, 14],
                                16: [2, 14],
                                24: [2, 14],
                                26: [2, 14],
                                28: [2, 14],
                                29: [2, 14],
                                31: [2, 14],
                                32: [2, 14],
                                34: [2, 14]
                            }, {
                                12: [2, 10]
                            }, {
                                18: [2, 21],
                                25: [2, 21],
                                33: [2, 21],
                                46: [2, 21]
                            }, {
                                18: [2, 49],
                                25: [2, 49],
                                33: [2, 49],
                                42: [2, 49],
                                43: [2, 49],
                                44: [2, 49],
                                45: [2, 49],
                                46: [2, 49],
                                50: [2, 49],
                                52: [2, 49]
                            }, {
                                18: [2, 51],
                                25: [2, 51],
                                33: [2, 51],
                                46: [2, 51]
                            }, {
                                18: [2, 36],
                                25: [2, 36],
                                33: [2, 36],
                                42: [2, 36],
                                43: [2, 36],
                                44: [2, 36],
                                45: [2, 36],
                                46: [2, 36],
                                50: [2, 36],
                                52: [2, 36],
                                54: [2, 36]
                            }, {
                                5: [2, 11],
                                12: [2, 11],
                                13: [2, 11],
                                16: [2, 11],
                                24: [2, 11],
                                26: [2, 11],
                                28: [2, 11],
                                29: [2, 11],
                                31: [2, 11],
                                32: [2, 11],
                                34: [2, 11]
                            }, {
                                30: 79,
                                50: [1, 26],
                                53: 24
                            }, {
                                29: [2, 15]
                            }, {
                                5: [2, 12],
                                12: [2, 12],
                                13: [2, 12],
                                16: [2, 12],
                                24: [2, 12],
                                26: [2, 12],
                                28: [2, 12],
                                29: [2, 12],
                                31: [2, 12],
                                32: [2, 12],
                                34: [2, 12]
                            }, {
                                25: [1, 80]
                            }, {
                                25: [2, 45]
                            }, {
                                51: [1, 78]
                            }, {
                                5: [2, 20],
                                12: [2, 20],
                                13: [2, 20],
                                16: [2, 20],
                                24: [2, 20],
                                26: [2, 20],
                                28: [2, 20],
                                29: [2, 20],
                                31: [2, 20],
                                32: [2, 20],
                                34: [2, 20]
                            }, {
                                46: [1, 81]
                            }, {
                                18: [2, 53],
                                25: [2, 53],
                                33: [2, 53],
                                46: [2, 53],
                                50: [2, 53]
                            }, {
                                30: 51,
                                36: 82,
                                41: 55,
                                42: [1, 52],
                                43: [1, 53],
                                44: [1, 54],
                                45: [1, 56],
                                50: [1, 26],
                                52: [1, 25],
                                53: 24
                            }, {
                                25: [1, 83]
                            }, {
                                5: [2, 19],
                                12: [2, 19],
                                13: [2, 19],
                                16: [2, 19],
                                24: [2, 19],
                                26: [2, 19],
                                28: [2, 19],
                                29: [2, 19],
                                31: [2, 19],
                                32: [2, 19],
                                34: [2, 19]
                            }, {
                                18: [2, 28],
                                25: [2, 28],
                                33: [2, 28],
                                42: [2, 28],
                                43: [2, 28],
                                44: [2, 28],
                                45: [2, 28],
                                46: [2, 28],
                                50: [2, 28],
                                52: [2, 28]
                            }, {
                                18: [2, 30],
                                25: [2, 30],
                                33: [2, 30],
                                46: [2, 30],
                                50: [2, 30]
                            }, {
                                5: [2, 16],
                                12: [2, 16],
                                13: [2, 16],
                                16: [2, 16],
                                24: [2, 16],
                                26: [2, 16],
                                28: [2, 16],
                                29: [2, 16],
                                31: [2, 16],
                                32: [2, 16],
                                34: [2, 16]
                            }],
                            defaultActions: {
                                4: [2, 1],
                                44: [2, 41],
                                47: [2, 43],
                                57: [2, 47],
                                63: [2, 10],
                                70: [2, 15],
                                73: [2, 45]
                            },
                            parseError: function(a, b) {
                                throw new Error(a)
                            },
                            parse: function(a) {
                                function b() {
                                    var a;
                                    return a = c.lexer.lex() || 1, "number" != typeof a && (a = c.symbols_[a] || a), a
                                }
                                var c = this,
                                    d = [0],
                                    e = [null],
                                    f = [],
                                    g = this.table,
                                    h = "",
                                    i = 0,
                                    j = 0,
                                    k = 0;
                                this.lexer.setInput(a), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, this.yy.parser = this, "undefined" == typeof this.lexer.yylloc && (this.lexer.yylloc = {});
                                var l = this.lexer.yylloc;
                                f.push(l);
                                var m = this.lexer.options && this.lexer.options.ranges;
                                "function" == typeof this.yy.parseError && (this.parseError = this.yy.parseError);
                                for (var n, o, p, q, r, s, t, u, v, w = {};;) {
                                    if (p = d[d.length - 1], this.defaultActions[p] ? q = this.defaultActions[p] : ((null === n || "undefined" == typeof n) && (n = b()), q = g[p] && g[p][n]), "undefined" == typeof q || !q.length || !q[0]) {
                                        var x = "";
                                        if (!k) {
                                            v = [];
                                            for (s in g[p]) this.terminals_[s] && s > 2 && v.push("'" + this.terminals_[s] + "'");
                                            x = this.lexer.showPosition ? "Parse error on line " + (i + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + v.join(", ") + ", got '" + (this.terminals_[n] || n) + "'" : "Parse error on line " + (i + 1) + ": Unexpected " + (1 == n ? "end of input" : "'" + (this.terminals_[n] || n) + "'"), this.parseError(x, {
                                                text: this.lexer.match,
                                                token: this.terminals_[n] || n,
                                                line: this.lexer.yylineno,
                                                loc: l,
                                                expected: v
                                            })
                                        }
                                    }
                                    if (q[0] instanceof Array && q.length > 1) throw new Error("Parse Error: multiple actions possible at state: " + p + ", token: " + n);
                                    switch (q[0]) {
                                        case 1:
                                            d.push(n), e.push(this.lexer.yytext), f.push(this.lexer.yylloc), d.push(q[1]), n = null, o ? (n = o, o = null) : (j = this.lexer.yyleng, h = this.lexer.yytext, i = this.lexer.yylineno, l = this.lexer.yylloc, k > 0 && k--);
                                            break;
                                        case 2:
                                            if (t = this.productions_[q[1]][1], w.$ = e[e.length - t], w._$ = {
                                                    first_line: f[f.length - (t || 1)].first_line,
                                                    last_line: f[f.length - 1].last_line,
                                                    first_column: f[f.length - (t || 1)].first_column,
                                                    last_column: f[f.length - 1].last_column
                                                }, m && (w._$.range = [f[f.length - (t || 1)].range[0], f[f.length - 1].range[1]]), r = this.performAction.call(w, h, j, i, this.yy, q[1], e, f), "undefined" != typeof r) return r;
                                            t && (d = d.slice(0, -1 * t * 2), e = e.slice(0, -1 * t), f = f.slice(0, -1 * t)), d.push(this.productions_[q[1]][0]), e.push(w.$), f.push(w._$), u = g[d[d.length - 2]][d[d.length - 1]], d.push(u);
                                            break;
                                        case 3:
                                            return !0
                                    }
                                }
                                return !0
                            }
                        },
                        c = function() {
                            var a = {
                                EOF: 1,
                                parseError: function(a, b) {
                                    if (!this.yy.parser) throw new Error(a);
                                    this.yy.parser.parseError(a, b)
                                },
                                setInput: function(a) {
                                    return this._input = a, this._more = this._less = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = {
                                        first_line: 1,
                                        first_column: 0,
                                        last_line: 1,
                                        last_column: 0
                                    }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this
                                },
                                input: function() {
                                    var a = this._input[0];
                                    this.yytext += a, this.yyleng++, this.offset++, this.match += a, this.matched += a;
                                    var b = a.match(/(?:\r\n?|\n).*/g);
                                    return b ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), a
                                },
                                unput: function(a) {
                                    var b = a.length,
                                        c = a.split(/(?:\r\n?|\n)/g);
                                    this._input = a + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - b - 1), this.offset -= b;
                                    var d = this.match.split(/(?:\r\n?|\n)/g);
                                    this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), c.length - 1 && (this.yylineno -= c.length - 1);
                                    var e = this.yylloc.range;
                                    return this.yylloc = {
                                        first_line: this.yylloc.first_line,
                                        last_line: this.yylineno + 1,
                                        first_column: this.yylloc.first_column,
                                        last_column: c ? (c.length === d.length ? this.yylloc.first_column : 0) + d[d.length - c.length].length - c[0].length : this.yylloc.first_column - b
                                    }, this.options.ranges && (this.yylloc.range = [e[0], e[0] + this.yyleng - b]), this
                                },
                                more: function() {
                                    return this._more = !0, this
                                },
                                less: function(a) {
                                    this.unput(this.match.slice(a))
                                },
                                pastInput: function() {
                                    var a = this.matched.substr(0, this.matched.length - this.match.length);
                                    return (a.length > 20 ? "..." : "") + a.substr(-20).replace(/\n/g, "")
                                },
                                upcomingInput: function() {
                                    var a = this.match;
                                    return a.length < 20 && (a += this._input.substr(0, 20 - a.length)), (a.substr(0, 20) + (a.length > 20 ? "..." : "")).replace(/\n/g, "")
                                },
                                showPosition: function() {
                                    var a = this.pastInput(),
                                        b = new Array(a.length + 1).join("-");
                                    return a + this.upcomingInput() + "\n" + b + "^"
                                },
                                next: function() {
                                    if (this.done) return this.EOF;
                                    this._input || (this.done = !0);
                                    var a, b, c, d, e;
                                    this._more || (this.yytext = "", this.match = "");
                                    for (var f = this._currentRules(), g = 0; g < f.length && (c = this._input.match(this.rules[f[g]]), !c || b && !(c[0].length > b[0].length) || (b = c, d = g, this.options.flex)); g++);
                                    return b ? (e = b[0].match(/(?:\r\n?|\n).*/g), e && (this.yylineno += e.length), this.yylloc = {
                                        first_line: this.yylloc.last_line,
                                        last_line: this.yylineno + 1,
                                        first_column: this.yylloc.last_column,
                                        last_column: e ? e[e.length - 1].length - e[e.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + b[0].length
                                    }, this.yytext += b[0], this.match += b[0], this.matches = b, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._input = this._input.slice(b[0].length), this.matched += b[0], a = this.performAction.call(this, this.yy, this, f[d], this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), a ? a : void 0) : "" === this._input ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                                        text: "",
                                        token: null,
                                        line: this.yylineno
                                    })
                                },
                                lex: function() {
                                    var a = this.next();
                                    return "undefined" != typeof a ? a : this.lex()
                                },
                                begin: function(a) {
                                    this.conditionStack.push(a)
                                },
                                popState: function() {
                                    return this.conditionStack.pop()
                                },
                                _currentRules: function() {
                                    return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules
                                },
                                topState: function() {
                                    return this.conditionStack[this.conditionStack.length - 2]
                                },
                                pushState: function(a) {
                                    this.begin(a)
                                }
                            };
                            return a.options = {}, a.performAction = function(a, b, c, d) {
                                function e(a, c) {
                                    return b.yytext = b.yytext.substr(a, b.yyleng - c)
                                }
                                switch (c) {
                                    case 0:
                                        if ("\\\\" === b.yytext.slice(-2) ? (e(0, 1), this.begin("mu")) : "\\" === b.yytext.slice(-1) ? (e(0, 1), this.begin("emu")) : this.begin("mu"), b.yytext) return 12;
                                        break;
                                    case 1:
                                        return 12;
                                    case 2:
                                        return this.popState(), 12;
                                    case 3:
                                        return b.yytext = b.yytext.substr(5, b.yyleng - 9), this.popState(), 15;
                                    case 4:
                                        return 12;
                                    case 5:
                                        return e(0, 4), this.popState(), 13;
                                    case 6:
                                        return 45;
                                    case 7:
                                        return 46;
                                    case 8:
                                        return 16;
                                    case 9:
                                        return this.popState(), this.begin("raw"), 18;
                                    case 10:
                                        return 34;
                                    case 11:
                                        return 24;
                                    case 12:
                                        return 29;
                                    case 13:
                                        return this.popState(), 28;
                                    case 14:
                                        return this.popState(), 28;
                                    case 15:
                                        return 26;
                                    case 16:
                                        return 26;
                                    case 17:
                                        return 32;
                                    case 18:
                                        return 31;
                                    case 19:
                                        this.popState(), this.begin("com");
                                        break;
                                    case 20:
                                        return e(3, 5), this.popState(), 13;
                                    case 21:
                                        return 31;
                                    case 22:
                                        return 51;
                                    case 23:
                                        return 50;
                                    case 24:
                                        return 50;
                                    case 25:
                                        return 54;
                                    case 26:
                                        break;
                                    case 27:
                                        return this.popState(), 33;
                                    case 28:
                                        return this.popState(), 25;
                                    case 29:
                                        return b.yytext = e(1, 2).replace(/\\"/g, '"'), 42;
                                    case 30:
                                        return b.yytext = e(1, 2).replace(/\\'/g, "'"), 42;
                                    case 31:
                                        return 52;
                                    case 32:
                                        return 44;
                                    case 33:
                                        return 44;
                                    case 34:
                                        return 43;
                                    case 35:
                                        return 50;
                                    case 36:
                                        return b.yytext = e(1, 2), 50;
                                    case 37:
                                        return "INVALID";
                                    case 38:
                                        return 5
                                }
                            }, a.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/], a.conditions = {
                                mu: {
                                    rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
                                    inclusive: !1
                                },
                                emu: {
                                    rules: [2],
                                    inclusive: !1
                                },
                                com: {
                                    rules: [5],
                                    inclusive: !1
                                },
                                raw: {
                                    rules: [3, 4],
                                    inclusive: !1
                                },
                                INITIAL: {
                                    rules: [0, 1, 38],
                                    inclusive: !0
                                }
                            }, a
                        }();
                    return b.lexer = c, a.prototype = b, b.Parser = a, new a
                }();
                return a = b
            }(),
            i = function(a) {
                "use strict";

                function b(a, b) {
                    return {
                        left: "~" === a.charAt(2),
                        right: "~" === b.charAt(b.length - 3)
                    }
                }

                function c(a, b, c, d, i, k) {
                    if (a.sexpr.id.original !== d.path.original) throw new j(a.sexpr.id.original + " doesn't match " + d.path.original, a);
                    var l = c && c.program,
                        m = {
                            left: a.strip.left,
                            right: d.strip.right,
                            openStandalone: f(b.statements),
                            closeStandalone: e((l || b).statements)
                        };
                    if (a.strip.right && g(b.statements, null, !0), l) {
                        var n = c.strip;
                        n.left && h(b.statements, null, !0), n.right && g(l.statements, null, !0), d.strip.left && h(l.statements, null, !0), e(b.statements) && f(l.statements) && (h(b.statements), g(l.statements))
                    } else d.strip.left && h(b.statements, null, !0);
                    return i ? new this.BlockNode(a, l, b, m, k) : new this.BlockNode(a, b, l, m, k)
                }

                function d(a, b) {
                    for (var c = 0, d = a.length; d > c; c++) {
                        var i = a[c],
                            j = i.strip;
                        if (j) {
                            var k = e(a, c, b, "partial" === i.type),
                                l = f(a, c, b),
                                m = j.openStandalone && k,
                                n = j.closeStandalone && l,
                                o = j.inlineStandalone && k && l;
                            j.right && g(a, c, !0), j.left && h(a, c, !0), o && (g(a, c), h(a, c) && "partial" === i.type && (i.indent = /([ \t]+$)/.exec(a[c - 1].original) ? RegExp.$1 : "")), m && (g((i.program || i.inverse).statements), h(a, c)), n && (g(a, c), h((i.inverse || i.program).statements))
                        }
                    }
                    return a
                }

                function e(a, b, c) {
                    void 0 === b && (b = a.length);
                    var d = a[b - 1],
                        e = a[b - 2];
                    return d ? "content" === d.type ? (e || !c ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(d.original) : void 0 : c
                }

                function f(a, b, c) {
                    void 0 === b && (b = -1);
                    var d = a[b + 1],
                        e = a[b + 2];
                    return d ? "content" === d.type ? (e || !c ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(d.original) : void 0 : c
                }

                function g(a, b, c) {
                    var d = a[null == b ? 0 : b + 1];
                    if (d && "content" === d.type && (c || !d.rightStripped)) {
                        var e = d.string;
                        d.string = d.string.replace(c ? /^\s+/ : /^[ \t]*\r?\n?/, ""), d.rightStripped = d.string !== e
                    }
                }

                function h(a, b, c) {
                    var d = a[null == b ? a.length - 1 : b - 1];
                    if (d && "content" === d.type && (c || !d.leftStripped)) {
                        var e = d.string;
                        return d.string = d.string.replace(c ? /\s+$/ : /[ \t]+$/, ""), d.leftStripped = d.string !== e, d.leftStripped
                    }
                }
                var i = {},
                    j = a;
                return i.stripFlags = b, i.prepareBlock = c, i.prepareProgram = d, i
            }(c),
            j = function(a, b, c, d) {
                "use strict";

                function e(a) {
                    return a.constructor === h.ProgramNode ? a : (g.yy = k, g.parse(a))
                }
                var f = {},
                    g = a,
                    h = b,
                    i = c,
                    j = d.extend;
                f.parser = g;
                var k = {};
                return j(k, i, h), f.parse = e, f
            }(h, g, i, b),
            k = function(a, b) {
                "use strict";

                function c() {}

                function d(a, b, c) {
                    if (null == a || "string" != typeof a && a.constructor !== c.AST.ProgramNode) throw new h("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + a);
                    b = b || {}, "data" in b || (b.data = !0), b.compat && (b.useDepths = !0);
                    var d = c.parse(a),
                        e = (new c.Compiler).compile(d, b);
                    return (new c.JavaScriptCompiler).compile(e, b)
                }

                function e(a, b, c) {
                    function d() {
                        var d = c.parse(a),
                            e = (new c.Compiler).compile(d, b),
                            f = (new c.JavaScriptCompiler).compile(e, b, void 0, !0);
                        return c.template(f)
                    }
                    if (null == a || "string" != typeof a && a.constructor !== c.AST.ProgramNode) throw new h("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + a);
                    b = b || {}, "data" in b || (b.data = !0), b.compat && (b.useDepths = !0);
                    var e, f = function(a, b) {
                        return e || (e = d()), e.call(this, a, b)
                    };
                    return f._setup = function(a) {
                        return e || (e = d()), e._setup(a)
                    }, f._child = function(a, b, c) {
                        return e || (e = d()), e._child(a, b, c)
                    }, f
                }

                function f(a, b) {
                    if (a === b) return !0;
                    if (i(a) && i(b) && a.length === b.length) {
                        for (var c = 0; c < a.length; c++)
                            if (!f(a[c], b[c])) return !1;
                        return !0
                    }
                }
                var g = {},
                    h = a,
                    i = b.isArray,
                    j = [].slice;
                return g.Compiler = c, c.prototype = {
                    compiler: c,
                    equals: function(a) {
                        var b = this.opcodes.length;
                        if (a.opcodes.length !== b) return !1;
                        for (var c = 0; b > c; c++) {
                            var d = this.opcodes[c],
                                e = a.opcodes[c];
                            if (d.opcode !== e.opcode || !f(d.args, e.args)) return !1
                        }
                        for (b = this.children.length, c = 0; b > c; c++)
                            if (!this.children[c].equals(a.children[c])) return !1;
                        return !0
                    },
                    guid: 0,
                    compile: function(a, b) {
                        this.opcodes = [], this.children = [], this.depths = {
                            list: []
                        }, this.options = b, this.stringParams = b.stringParams, this.trackIds = b.trackIds;
                        var c = this.options.knownHelpers;
                        if (this.options.knownHelpers = {
                                helperMissing: !0,
                                blockHelperMissing: !0,
                                each: !0,
                                "if": !0,
                                unless: !0,
                                "with": !0,
                                log: !0,
                                lookup: !0
                            }, c)
                            for (var d in c) this.options.knownHelpers[d] = c[d];
                        return this.accept(a)
                    },
                    accept: function(a) {
                        return this[a.type](a)
                    },
                    program: function(a) {
                        for (var b = a.statements, c = 0, d = b.length; d > c; c++) this.accept(b[c]);
                        return this.isSimple = 1 === d, this.depths.list = this.depths.list.sort(function(a, b) {
                            return a - b
                        }), this
                    },
                    compileProgram: function(a) {
                        var b, c = (new this.compiler).compile(a, this.options),
                            d = this.guid++;
                        this.usePartial = this.usePartial || c.usePartial, this.children[d] = c;
                        for (var e = 0, f = c.depths.list.length; f > e; e++) b = c.depths.list[e], 2 > b || this.addDepth(b - 1);
                        return d
                    },
                    block: function(a) {
                        var b = a.mustache,
                            c = a.program,
                            d = a.inverse;
                        c && (c = this.compileProgram(c)), d && (d = this.compileProgram(d));
                        var e = b.sexpr,
                            f = this.classifySexpr(e);
                        "helper" === f ? this.helperSexpr(e, c, d) : "simple" === f ? (this.simpleSexpr(e), this.opcode("pushProgram", c), this.opcode("pushProgram", d), this.opcode("emptyHash"), this.opcode("blockValue", e.id.original)) : (this.ambiguousSexpr(e, c, d), this.opcode("pushProgram", c), this.opcode("pushProgram", d), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue")), this.opcode("append")
                    },
                    hash: function(a) {
                        var b, c, d = a.pairs;
                        for (this.opcode("pushHash"), b = 0, c = d.length; c > b; b++) this.pushParam(d[b][1]);
                        for (; b--;) this.opcode("assignToHash", d[b][0]);
                        this.opcode("popHash")
                    },
                    partial: function(a) {
                        var b = a.partialName;
                        this.usePartial = !0, a.hash ? this.accept(a.hash) : this.opcode("push", "undefined"), a.context ? this.accept(a.context) : (this.opcode("getContext", 0), this.opcode("pushContext")), this.opcode("invokePartial", b.name, a.indent || ""), this.opcode("append")
                    },
                    content: function(a) {
                        a.string && this.opcode("appendContent", a.string)
                    },
                    mustache: function(a) {
                        this.sexpr(a.sexpr), this.opcode(a.escaped && !this.options.noEscape ? "appendEscaped" : "append")
                    },
                    ambiguousSexpr: function(a, b, c) {
                        var d = a.id,
                            e = d.parts[0],
                            f = null != b || null != c;
                        this.opcode("getContext", d.depth), this.opcode("pushProgram", b), this.opcode("pushProgram", c), this.ID(d), this.opcode("invokeAmbiguous", e, f)
                    },
                    simpleSexpr: function(a) {
                        var b = a.id;
                        "DATA" === b.type ? this.DATA(b) : b.parts.length ? this.ID(b) : (this.addDepth(b.depth), this.opcode("getContext", b.depth), this.opcode("pushContext")), this.opcode("resolvePossibleLambda")
                    },
                    helperSexpr: function(a, b, c) {
                        var d = this.setupFullMustacheParams(a, b, c),
                            e = a.id,
                            f = e.parts[0];
                        if (this.options.knownHelpers[f]) this.opcode("invokeKnownHelper", d.length, f);
                        else {
                            if (this.options.knownHelpersOnly) throw new h("You specified knownHelpersOnly, but used the unknown helper " + f, a);
                            e.falsy = !0, this.ID(e), this.opcode("invokeHelper", d.length, e.original, e.isSimple)
                        }
                    },
                    sexpr: function(a) {
                        var b = this.classifySexpr(a);
                        "simple" === b ? this.simpleSexpr(a) : "helper" === b ? this.helperSexpr(a) : this.ambiguousSexpr(a)
                    },
                    ID: function(a) {
                        this.addDepth(a.depth), this.opcode("getContext", a.depth);
                        var b = a.parts[0];
                        b ? this.opcode("lookupOnContext", a.parts, a.falsy, a.isScoped) : this.opcode("pushContext")
                    },
                    DATA: function(a) {
                        this.options.data = !0, this.opcode("lookupData", a.id.depth, a.id.parts)
                    },
                    STRING: function(a) {
                        this.opcode("pushString", a.string)
                    },
                    NUMBER: function(a) {
                        this.opcode("pushLiteral", a.number)
                    },
                    BOOLEAN: function(a) {
                        this.opcode("pushLiteral", a.bool)
                    },
                    comment: function() {},
                    opcode: function(a) {
                        this.opcodes.push({
                            opcode: a,
                            args: j.call(arguments, 1)
                        })
                    },
                    addDepth: function(a) {
                        0 !== a && (this.depths[a] || (this.depths[a] = !0, this.depths.list.push(a)))
                    },
                    classifySexpr: function(a) {
                        var b = a.isHelper,
                            c = a.eligibleHelper,
                            d = this.options;
                        if (c && !b) {
                            var e = a.id.parts[0];
                            d.knownHelpers[e] ? b = !0 : d.knownHelpersOnly && (c = !1)
                        }
                        return b ? "helper" : c ? "ambiguous" : "simple"
                    },
                    pushParams: function(a) {
                        for (var b = 0, c = a.length; c > b; b++) this.pushParam(a[b])
                    },
                    pushParam: function(a) {
                        this.stringParams ? (a.depth && this.addDepth(a.depth), this.opcode("getContext", a.depth || 0), this.opcode("pushStringParam", a.stringModeValue, a.type), "sexpr" === a.type && this.sexpr(a)) : (this.trackIds && this.opcode("pushId", a.type, a.idName || a.stringModeValue), this.accept(a))
                    },
                    setupFullMustacheParams: function(a, b, c) {
                        var d = a.params;
                        return this.pushParams(d), this.opcode("pushProgram", b), this.opcode("pushProgram", c), a.hash ? this.hash(a.hash) : this.opcode("emptyHash"), d
                    }
                }, g.precompile = d, g.compile = e, g
            }(c, b),
            l = function(a, b) {
                "use strict";

                function c(a) {
                    this.value = a
                }

                function d() {}
                var e, f = a.COMPILER_REVISION,
                    g = a.REVISION_CHANGES,
                    h = b;
                d.prototype = {
                    nameLookup: function(a, b) {
                        return d.isValidJavaScriptVariableName(b) ? a + "." + b : a + "['" + b + "']"
                    },
                    depthedLookup: function(a) {
                        return this.aliases.lookup = "this.lookup", 'lookup(depths, "' + a + '")'
                    },
                    compilerInfo: function() {
                        var a = f,
                            b = g[a];
                        return [a, b]
                    },
                    appendToBuffer: function(a) {
                        return this.environment.isSimple ? "return " + a + ";" : {
                            appendToBuffer: !0,
                            content: a,
                            toString: function() {
                                return "buffer += " + a + ";"
                            }
                        }
                    },
                    initializeBuffer: function() {
                        return this.quotedString("")
                    },
                    namespace: "Handlebars",
                    compile: function(a, b, c, d) {
                        this.environment = a, this.options = b, this.stringParams = this.options.stringParams, this.trackIds = this.options.trackIds, this.precompile = !d, this.name = this.environment.name, this.isChild = !!c, this.context = c || {
                            programs: [],
                            environments: []
                        }, this.preamble(), this.stackSlot = 0, this.stackVars = [], this.aliases = {}, this.registers = {
                            list: []
                        }, this.hashes = [], this.compileStack = [], this.inlineStack = [], this.compileChildren(a, b), this.useDepths = this.useDepths || a.depths.list.length || this.options.compat;
                        var e, f, g, i = a.opcodes;
                        for (f = 0, g = i.length; g > f; f++) e = i[f], this[e.opcode].apply(this, e.args);
                        if (this.pushSource(""), this.stackSlot || this.inlineStack.length || this.compileStack.length) throw new h("Compile completed with content left on stack");
                        var j = this.createFunctionContext(d);
                        if (this.isChild) return j;
                        var k = {
                                compiler: this.compilerInfo(),
                                main: j
                            },
                            l = this.context.programs;
                        for (f = 0, g = l.length; g > f; f++) l[f] && (k[f] = l[f]);
                        return this.environment.usePartial && (k.usePartial = !0), this.options.data && (k.useData = !0), this.useDepths && (k.useDepths = !0), this.options.compat && (k.compat = !0), d || (k.compiler = JSON.stringify(k.compiler), k = this.objectLiteral(k)), k
                    },
                    preamble: function() {
                        this.lastContext = 0, this.source = []
                    },
                    createFunctionContext: function(a) {
                        var b = "",
                            c = this.stackVars.concat(this.registers.list);
                        c.length > 0 && (b += ", " + c.join(", "));
                        for (var d in this.aliases) this.aliases.hasOwnProperty(d) && (b += ", " + d + "=" + this.aliases[d]);
                        var e = ["depth0", "helpers", "partials", "data"];
                        this.useDepths && e.push("depths");
                        var f = this.mergeSource(b);
                        return a ? (e.push(f), Function.apply(this, e)) : "function(" + e.join(",") + ") {\n  " + f + "}"
                    },
                    mergeSource: function(a) {
                        for (var b, c, d = "", e = !this.forceBuffer, f = 0, g = this.source.length; g > f; f++) {
                            var h = this.source[f];
                            h.appendToBuffer ? b = b ? b + "\n    + " + h.content : h.content : (b && (d ? d += "buffer += " + b + ";\n  " : (c = !0, d = b + ";\n  "), b = void 0), d += h + "\n  ", this.environment.isSimple || (e = !1))
                        }
                        return e ? (b || !d) && (d += "return " + (b || '""') + ";\n") : (a += ", buffer = " + (c ? "" : this.initializeBuffer()), d += b ? "return buffer + " + b + ";\n" : "return buffer;\n"), a && (d = "var " + a.substring(2) + (c ? "" : ";\n  ") + d), d
                    },
                    blockValue: function(a) {
                        this.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                        var b = [this.contextName(0)];
                        this.setupParams(a, 0, b);
                        var c = this.popStack();
                        b.splice(1, 0, c), this.push("blockHelperMissing.call(" + b.join(", ") + ")")
                    },
                    ambiguousBlockValue: function() {
                        this.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                        var a = [this.contextName(0)];
                        this.setupParams("", 0, a, !0), this.flushInline();
                        var b = this.topStack();
                        a.splice(1, 0, b), this.pushSource("if (!" + this.lastHelper + ") { " + b + " = blockHelperMissing.call(" + a.join(", ") + "); }")
                    },
                    appendContent: function(a) {
                        this.pendingContent && (a = this.pendingContent + a), this.pendingContent = a
                    },
                    append: function() {
                        this.flushInline();
                        var a = this.popStack();
                        this.pushSource("if (" + a + " != null) { " + this.appendToBuffer(a) + " }"), this.environment.isSimple && this.pushSource("else { " + this.appendToBuffer("''") + " }")
                    },
                    appendEscaped: function() {
                        this.aliases.escapeExpression = "this.escapeExpression", this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"))
                    },
                    getContext: function(a) {
                        this.lastContext = a
                    },
                    pushContext: function() {
                        this.pushStackLiteral(this.contextName(this.lastContext))
                    },
                    lookupOnContext: function(a, b, c) {
                        var d = 0,
                            e = a.length;
                        for (c || !this.options.compat || this.lastContext ? this.pushContext() : this.push(this.depthedLookup(a[d++])); e > d; d++) this.replaceStack(function(c) {
                            var e = this.nameLookup(c, a[d], "context");
                            return b ? " && " + e : " != null ? " + e + " : " + c
                        })
                    },
                    lookupData: function(a, b) {
                        this.pushStackLiteral(a ? "this.data(data, " + a + ")" : "data");
                        for (var c = b.length, d = 0; c > d; d++) this.replaceStack(function(a) {
                            return " && " + this.nameLookup(a, b[d], "data")
                        })
                    },
                    resolvePossibleLambda: function() {
                        this.aliases.lambda = "this.lambda", this.push("lambda(" + this.popStack() + ", " + this.contextName(0) + ")")
                    },
                    pushStringParam: function(a, b) {
                        this.pushContext(), this.pushString(b), "sexpr" !== b && ("string" == typeof a ? this.pushString(a) : this.pushStackLiteral(a))
                    },
                    emptyHash: function() {
                        this.pushStackLiteral("{}"), this.trackIds && this.push("{}"), this.stringParams && (this.push("{}"), this.push("{}"))
                    },
                    pushHash: function() {
                        this.hash && this.hashes.push(this.hash), this.hash = {
                            values: [],
                            types: [],
                            contexts: [],
                            ids: []
                        }
                    },
                    popHash: function() {
                        var a = this.hash;
                        this.hash = this.hashes.pop(), this.trackIds && this.push("{" + a.ids.join(",") + "}"), this.stringParams && (this.push("{" + a.contexts.join(",") + "}"), this.push("{" + a.types.join(",") + "}")), this.push("{\n    " + a.values.join(",\n    ") + "\n  }")
                    },
                    pushString: function(a) {
                        this.pushStackLiteral(this.quotedString(a))
                    },
                    push: function(a) {
                        return this.inlineStack.push(a), a
                    },
                    pushLiteral: function(a) {
                        this.pushStackLiteral(a)
                    },
                    pushProgram: function(a) {
                        this.pushStackLiteral(null != a ? this.programExpression(a) : null)
                    },
                    invokeHelper: function(a, b, c) {
                        this.aliases.helperMissing = "helpers.helperMissing";
                        var d = this.popStack(),
                            e = this.setupHelper(a, b),
                            f = (c ? e.name + " || " : "") + d + " || helperMissing";
                        this.push("((" + f + ").call(" + e.callParams + "))")
                    },
                    invokeKnownHelper: function(a, b) {
                        var c = this.setupHelper(a, b);
                        this.push(c.name + ".call(" + c.callParams + ")")
                    },
                    invokeAmbiguous: function(a, b) {
                        this.aliases.functionType = '"function"', this.aliases.helperMissing = "helpers.helperMissing", this.useRegister("helper");
                        var c = this.popStack();
                        this.emptyHash();
                        var d = this.setupHelper(0, a, b),
                            e = this.lastHelper = this.nameLookup("helpers", a, "helper");
                        this.push("((helper = (helper = " + e + " || " + c + ") != null ? helper : helperMissing" + (d.paramsInit ? "),(" + d.paramsInit : "") + "),(typeof helper === functionType ? helper.call(" + d.callParams + ") : helper))")
                    },
                    invokePartial: function(a, b) {
                        var c = [this.nameLookup("partials", a, "partial"), "'" + b + "'", "'" + a + "'", this.popStack(), this.popStack(), "helpers", "partials"];
                        this.options.data ? c.push("data") : this.options.compat && c.push("undefined"), this.options.compat && c.push("depths"), this.push("this.invokePartial(" + c.join(", ") + ")")
                    },
                    assignToHash: function(a) {
                        var b, c, d, e = this.popStack();
                        this.trackIds && (d = this.popStack()), this.stringParams && (c = this.popStack(), b = this.popStack());
                        var f = this.hash;
                        b && f.contexts.push("'" + a + "': " + b), c && f.types.push("'" + a + "': " + c), d && f.ids.push("'" + a + "': " + d), f.values.push("'" + a + "': (" + e + ")")
                    },
                    pushId: function(a, b) {
                        "ID" === a || "DATA" === a ? this.pushString(b) : this.pushStackLiteral("sexpr" === a ? "true" : "null")
                    },
                    compiler: d,
                    compileChildren: function(a, b) {
                        for (var c, d, e = a.children, f = 0, g = e.length; g > f; f++) {
                            c = e[f], d = new this.compiler;
                            var h = this.matchExistingProgram(c);
                            null == h ? (this.context.programs.push(""), h = this.context.programs.length, c.index = h, c.name = "program" + h, this.context.programs[h] = d.compile(c, b, this.context, !this.precompile), this.context.environments[h] = c, this.useDepths = this.useDepths || d.useDepths) : (c.index = h, c.name = "program" + h)
                        }
                    },
                    matchExistingProgram: function(a) {
                        for (var b = 0, c = this.context.environments.length; c > b; b++) {
                            var d = this.context.environments[b];
                            if (d && d.equals(a)) return b
                        }
                    },
                    programExpression: function(a) {
                        var b = this.environment.children[a],
                            c = (b.depths.list, this.useDepths),
                            d = [b.index, "data"];
                        return c && d.push("depths"), "this.program(" + d.join(", ") + ")"
                    },
                    useRegister: function(a) {
                        this.registers[a] || (this.registers[a] = !0, this.registers.list.push(a))
                    },
                    pushStackLiteral: function(a) {
                        return this.push(new c(a))
                    },
                    pushSource: function(a) {
                        this.pendingContent && (this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))), this.pendingContent = void 0), a && this.source.push(a)
                    },
                    pushStack: function(a) {
                        this.flushInline();
                        var b = this.incrStack();
                        return this.pushSource(b + " = " + a + ";"), this.compileStack.push(b), b
                    },
                    replaceStack: function(a) {
                        {
                            var b, d, e, f = "";
                            this.isInline()
                        }
                        if (!this.isInline()) throw new h("replaceStack on non-inline");
                        var g = this.popStack(!0);
                        if (g instanceof c) f = b = g.value, e = !0;
                        else {
                            d = !this.stackSlot;
                            var i = d ? this.incrStack() : this.topStackName();
                            f = "(" + this.push(i) + " = " + g + ")", b = this.topStack()
                        }
                        var j = a.call(this, b);
                        e || this.popStack(), d && this.stackSlot--, this.push("(" + f + j + ")")
                    },
                    incrStack: function() {
                        return this.stackSlot++, this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot), this.topStackName()
                    },
                    topStackName: function() {
                        return "stack" + this.stackSlot
                    },
                    flushInline: function() {
                        var a = this.inlineStack;
                        if (a.length) {
                            this.inlineStack = [];
                            for (var b = 0, d = a.length; d > b; b++) {
                                var e = a[b];
                                e instanceof c ? this.compileStack.push(e) : this.pushStack(e)
                            }
                        }
                    },
                    isInline: function() {
                        return this.inlineStack.length
                    },
                    popStack: function(a) {
                        var b = this.isInline(),
                            d = (b ? this.inlineStack : this.compileStack).pop();
                        if (!a && d instanceof c) return d.value;
                        if (!b) {
                            if (!this.stackSlot) throw new h("Invalid stack pop");
                            this.stackSlot--
                        }
                        return d
                    },
                    topStack: function() {
                        var a = this.isInline() ? this.inlineStack : this.compileStack,
                            b = a[a.length - 1];
                        return b instanceof c ? b.value : b
                    },
                    contextName: function(a) {
                        return this.useDepths && a ? "depths[" + a + "]" : "depth" + a
                    },
                    quotedString: function(a) {
                        return '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';

                    },
                    objectLiteral: function(a) {
                        var b = [];
                        for (var c in a) a.hasOwnProperty(c) && b.push(this.quotedString(c) + ":" + a[c]);
                        return "{" + b.join(",") + "}"
                    },
                    setupHelper: function(a, b, c) {
                        var d = [],
                            e = this.setupParams(b, a, d, c),
                            f = this.nameLookup("helpers", b, "helper");
                        return {
                            params: d,
                            paramsInit: e,
                            name: f,
                            callParams: [this.contextName(0)].concat(d).join(", ")
                        }
                    },
                    setupOptions: function(a, b, c) {
                        var d, e, f, g = {},
                            h = [],
                            i = [],
                            j = [];
                        g.name = this.quotedString(a), g.hash = this.popStack(), this.trackIds && (g.hashIds = this.popStack()), this.stringParams && (g.hashTypes = this.popStack(), g.hashContexts = this.popStack()), e = this.popStack(), f = this.popStack(), (f || e) && (f || (f = "this.noop"), e || (e = "this.noop"), g.fn = f, g.inverse = e);
                        for (var k = b; k--;) d = this.popStack(), c[k] = d, this.trackIds && (j[k] = this.popStack()), this.stringParams && (i[k] = this.popStack(), h[k] = this.popStack());
                        return this.trackIds && (g.ids = "[" + j.join(",") + "]"), this.stringParams && (g.types = "[" + i.join(",") + "]", g.contexts = "[" + h.join(",") + "]"), this.options.data && (g.data = "data"), g
                    },
                    setupParams: function(a, b, c, d) {
                        var e = this.objectLiteral(this.setupOptions(a, b, c));
                        return d ? (this.useRegister("options"), c.push("options"), "options=" + e) : (c.push(e), "")
                    }
                };
                for (var i = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "), j = d.RESERVED_WORDS = {}, k = 0, l = i.length; l > k; k++) j[i[k]] = !0;
                return d.isValidJavaScriptVariableName = function(a) {
                    return !d.RESERVED_WORDS[a] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(a)
                }, e = d
            }(d, c),
            m = function(a, b, c, d, e) {
                "use strict";
                var f, g = a,
                    h = b,
                    i = c.parser,
                    j = c.parse,
                    k = d.Compiler,
                    l = d.compile,
                    m = d.precompile,
                    n = e,
                    o = g.create,
                    p = function() {
                        var a = o();
                        return a.compile = function(b, c) {
                            return l(b, c, a)
                        }, a.precompile = function(b, c) {
                            return m(b, c, a)
                        }, a.AST = h, a.Compiler = k, a.JavaScriptCompiler = n, a.Parser = i, a.parse = j, a
                    };
                return g = p(), g.create = p, g["default"] = g, f = g
            }(f, g, j, k, l);
        return m
    }), ! function(a, b, c) {
        b[a] = c
    }("onDomReady", this, function(a) {
        "use strict";

        function b(a) {
            if (!v) {
                if (!g.body) return e(b);
                for (v = !0; a = w.shift();) e(a)
            }
        }

        function c(a) {
            (t || a.type === i || g[m] === l) && (d(), b())
        }

        function d() {
            t ? (g[s](q, c, j), a[s](i, c, j)) : (g[o](r, c), a[o](k, c))
        }

        function e(a, b) {
            setTimeout(a, +b >= 0 ? b : 1)
        }

        function f(a) {
            v ? e(a) : w.push(a)
        }
        null == document.readyState && document.addEventListener && (document.addEventListener("DOMContentLoaded", function y() {
            document.removeEventListener("DOMContentLoaded", y, !1), document.readyState = "complete"
        }, !1), document.readyState = "loading");
        var g = a.document,
            h = g.documentElement,
            i = "load",
            j = !1,
            k = "on" + i,
            l = "complete",
            m = "readyState",
            n = "attachEvent",
            o = "detachEvent",
            p = "addEventListener",
            q = "DOMContentLoaded",
            r = "onreadystatechange",
            s = "removeEventListener",
            t = p in g,
            u = j,
            v = j,
            w = [];
        if (g[m] === l) e(b);
        else if (t) g[p](q, c, j), a[p](i, c, j);
        else {
            g[n](r, c), a[n](k, c);
            try {
                u = null == a.frameElement && h
            } catch (x) {}
            u && u.doScroll && ! function z() {
                if (!v) {
                    try {
                        u.doScroll("left")
                    } catch (a) {
                        return e(z, 50)
                    }
                    d(), b()
                }
            }()
        }
        return f.version = "1.4.0", f.isReady = function() {
            return v
        }, f
    }(this)), document.querySelectorAll || (document.querySelectorAll = function(a) {
        var b, c = document.createElement("style"),
            d = [];
        for (document.documentElement.firstChild.appendChild(c), document._qsa = [], c.styleSheet.cssText = a + "{x-qsa:expression(document._qsa && document._qsa.push(this))}", window.scrollBy(0, 0), c.parentNode.removeChild(c); document._qsa.length;) b = document._qsa.shift(), b.style.removeAttribute("x-qsa"), d.push(b);
        return document._qsa = null, d
    }), document.querySelector || (document.querySelector = function(a) {
        var b = document.querySelectorAll(a);
        return b.length ? b[0] : null
    }), document.getElementsByClassName || (document.getElementsByClassName = function(a) {
        return a = String(a).replace(/^|\s+/g, "."), document.querySelectorAll(a)
    }), Object.keys || (Object.keys = function(a) {
        if (a !== Object(a)) throw TypeError("Object.keys called on non-object");
        var b, c = [];
        for (b in a) Object.prototype.hasOwnProperty.call(a, b) && c.push(b);
        return c
    }),
    function(a) {
        var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        a.atob = a.atob || function(a) {
            a = String(a);
            var c, d = 0,
                e = [],
                f = 0,
                g = 0;
            if (a = a.replace(/\s/g, ""), a.length % 4 === 0 && (a = a.replace(/=+$/, "")), a.length % 4 === 1) throw Error("InvalidCharacterError");
            if (/[^+/0-9A-Za-z]/.test(a)) throw Error("InvalidCharacterError");
            for (; d < a.length;) c = b.indexOf(a.charAt(d)), f = f << 6 | c, g += 6, 24 === g && (e.push(String.fromCharCode(f >> 16 & 255)), e.push(String.fromCharCode(f >> 8 & 255)), e.push(String.fromCharCode(255 & f)), g = 0, f = 0), d += 1;
            return 12 === g ? (f >>= 4, e.push(String.fromCharCode(255 & f))) : 18 === g && (f >>= 2, e.push(String.fromCharCode(f >> 8 & 255)), e.push(String.fromCharCode(255 & f))), e.join("")
        }, a.btoa = a.btoa || function(a) {
            a = String(a);
            var c, d, e, f, g, h, i, j = 0,
                k = [];
            if (/[^\x00-\xFF]/.test(a)) throw Error("InvalidCharacterError");
            for (; j < a.length;) c = a.charCodeAt(j++), d = a.charCodeAt(j++), e = a.charCodeAt(j++), f = c >> 2, g = (3 & c) << 4 | d >> 4, h = (15 & d) << 2 | e >> 6, i = 63 & e, j === a.length + 2 ? (h = 64, i = 64) : j === a.length + 1 && (i = 64), k.push(b.charAt(f), b.charAt(g), b.charAt(h), b.charAt(i));
            return k.join("")
        }
    }(this),
    function() {
        function a(b, c, d) {
            b.document;
            var e, f = b.currentStyle[c].match(/([\d\.]+)(%|cm|em|in|mm|pc|pt|)/) || [0, 0, ""],
                g = f[1],
                h = f[2];
            return d = d ? /%|em/.test(h) && b.parentElement ? a(b.parentElement, "fontSize", null) : 16 : d, e = "fontSize" == c ? d : /width/i.test(c) ? b.clientWidth : b.clientHeight, "%" == h ? g / 100 * e : "cm" == h ? .3937 * g * 96 : "em" == h ? g * d : "in" == h ? 96 * g : "mm" == h ? .3937 * g * 96 / 10 : "pc" == h ? 12 * g * 96 / 72 : "pt" == h ? 96 * g / 72 : g
        }

        function b(a, b) {
            var c = "border" == b ? "Width" : "",
                d = b + "Top" + c,
                e = b + "Right" + c,
                f = b + "Bottom" + c,
                g = b + "Left" + c;
            a[b] = (a[d] == a[e] && a[d] == a[f] && a[d] == a[g] ? [a[d]] : a[d] == a[f] && a[g] == a[e] ? [a[d], a[e]] : a[g] == a[e] ? [a[d], a[e], a[f]] : [a[d], a[e], a[f], a[g]]).join(" ")
        }

        function c(c) {
            var d, e = this,
                f = c.currentStyle,
                g = a(c, "fontSize"),
                h = function(a) {
                    return "-" + a.toLowerCase()
                };
            for (d in f)
                if (Array.prototype.push.call(e, "styleFloat" == d ? "float" : d.replace(/[A-Z]/, h)), "width" == d) e[d] = c.offsetWidth + "px";
                else if ("height" == d) e[d] = c.offsetHeight + "px";
            else if ("styleFloat" == d) e["float"] = f[d];
            else if (/margin.|padding.|border.+W/.test(d) && "auto" != e[d]) e[d] = Math.round(a(c, d, g)) + "px";
            else if (/^outline/.test(d)) try {
                e[d] = f[d]
            } catch (i) {
                e.outlineColor = f.color, e.outlineStyle = e.outlineStyle || "none", e.outlineWidth = e.outlineWidth || "0px", e.outline = [e.outlineColor, e.outlineWidth, e.outlineStyle].join(" ")
            } else e[d] = f[d];
            b(e, "margin"), b(e, "padding"), b(e, "border"), e.fontSize = Math.round(g) + "px"
        }
        window.getComputedStyle || (c.prototype = {
            constructor: c,
            getPropertyPriority: function() {
                throw new Error("NotSupportedError: DOM Exception 9")
            },
            getPropertyValue: function(a) {
                var b = a.replace(/-([a-z])/g, function(a) {
                        return a = a.charAt ? a.split("") : a, a[1].toUpperCase()
                    }),
                    c = this[b];
                return c
            },
            item: function(a) {
                return this[a]
            },
            removeProperty: function() {
                throw new Error("NoModificationAllowedError: DOM Exception 7")
            },
            setProperty: function() {
                throw new Error("NoModificationAllowedError: DOM Exception 7")
            },
            getPropertyCSSValue: function() {
                throw new Error("NotSupportedError: DOM Exception 9")
            }
        }, window.getComputedStyle = function(a) {
            return new c(a)
        })
    }(), Object.prototype.hasOwnProperty || (Object.prototype.hasOwnProperty = function(a) {
        var b = this.__proto__ || this.constructor.prototype;
        return a in this && (!(a in b) || b[a] !== this[a])
    }),
    function(a, b) {
        a.augment = b()
    }(this, function() {
        "use strict";
        var a = function() {},
            b = Array.prototype.slice,
            c = function(c, d) {
                var e = a.prototype = "function" == typeof c ? c.prototype : c,
                    f = new a,
                    g = d.apply(f, b.call(arguments, 2).concat(e));
                if ("object" == typeof g)
                    for (var h in g) f[h] = g[h];
                if (!f.hasOwnProperty("constructor")) return f;
                var i = f.constructor;
                return i.prototype = f, i
            };
        return c.defclass = function(a) {
            var b = a.constructor;
            return b.prototype = a, b
        }, c.extend = function(a, b) {
            return c(a, function(a) {
                return this.uber = a, b
            })
        }, c
    }),
    function(a, b) {
        function c(a, b, c, f) {
            var g = d(c.substr(c.lastIndexOf(a.domain)), a);
            g && e(null, f, g, b)
        }

        function d(a, b) {
            for (var c = {
                    theme: p(A.settings.themes.gray, null),
                    stylesheets: b.stylesheets,
                    holderURL: []
                }, d = !1, e = String.fromCharCode(11), f = a.replace(/([^\\])\//g, "$1" + e).split(e), g = /%[0-9a-f]{2}/gi, h = f.length, i = 0; h > i; i++) {
                var j = f[i];
                if (j.match(g)) try {
                    j = decodeURIComponent(j)
                } catch (k) {
                    j = f[i]
                }
                var l = !1;
                if (A.flags.dimensions.match(j)) d = !0, c.dimensions = A.flags.dimensions.output(j), l = !0;
                else if (A.flags.fluid.match(j)) d = !0, c.dimensions = A.flags.fluid.output(j), c.fluid = !0, l = !0;
                else if (A.flags.textmode.match(j)) c.textmode = A.flags.textmode.output(j), l = !0;
                else if (A.flags.colors.match(j)) {
                    var m = A.flags.colors.output(j);
                    c.theme = p(c.theme, m), l = !0
                } else if (b.themes[j]) b.themes.hasOwnProperty(j) && (c.theme = p(b.themes[j], null)), l = !0;
                else if (A.flags.font.match(j)) c.font = A.flags.font.output(j), l = !0;
                else if (A.flags.auto.match(j)) c.auto = !0, l = !0;
                else if (A.flags.text.match(j)) c.text = A.flags.text.output(j), l = !0;
                else if (A.flags.random.match(j)) {
                    null == A.vars.cache.themeKeys && (A.vars.cache.themeKeys = Object.keys(b.themes));
                    var n = A.vars.cache.themeKeys[0 | Math.random() * A.vars.cache.themeKeys.length];
                    c.theme = p(b.themes[n], null), l = !0
                }
                l && c.holderURL.push(j)
            }
            return c.holderURL.unshift(b.domain), c.holderURL = c.holderURL.join("/"), d ? c : !1
        }

        function e(a, b, c, d) {
            var e = c.dimensions,
                g = c.theme,
                h = e.width + "x" + e.height;
            if (a = null == a ? c.fluid ? "fluid" : "image" : a, null != c.text && (g.text = c.text, "object" === b.nodeName.toLowerCase())) {
                for (var j = g.text.split("\\n"), l = 0; l < j.length; l++) j[l] = v(j[l]);
                g.text = j.join("\\n")
            }
            var n = c.holderURL,
                o = p(d, null);
            c.font && (g.font = c.font, !o.noFontFallback && "img" === b.nodeName.toLowerCase() && A.setup.supportsCanvas && "svg" === o.renderer && (o = p(o, {
                renderer: "canvas"
            }))), c.font && "canvas" == o.renderer && (o.reRender = !0), "background" == a ? null == b.getAttribute("data-background-src") && m(b, {
                "data-background-src": n
            }) : m(b, {
                "data-src": n
            }), c.theme = g, b.holderData = {
                flags: c,
                renderSettings: o
            }, ("image" == a || "fluid" == a) && m(b, {
                alt: g.text ? (g.text.length > 16 ? g.text.substring(0, 16) + "…" : g.text) + " [" + h + "]" : h
            }), "image" == a ? ("html" != o.renderer && c.auto || (b.style.width = e.width + "px", b.style.height = e.height + "px"), "html" == o.renderer ? b.style.backgroundColor = g.background : (f(a, {
                dimensions: e,
                theme: g,
                flags: c
            }, b, o), c.textmode && "exact" == c.textmode && (A.vars.resizableImages.push(b), i(b)))) : "background" == a && "html" != o.renderer ? f(a, {
                dimensions: e,
                theme: g,
                flags: c
            }, b, o) : "fluid" == a && ("%" == e.height.slice(-1) ? b.style.height = e.height : null != c.auto && c.auto || (b.style.height = e.height + "px"), "%" == e.width.slice(-1) ? b.style.width = e.width : null != c.auto && c.auto || (b.style.width = e.width + "px"), ("inline" == b.style.display || "" === b.style.display || "none" == b.style.display) && (b.style.display = "block"), k(b), "html" == o.renderer ? b.style.backgroundColor = g.background : (A.vars.resizableImages.push(b), i(b)))
        }

        function f(a, b, c, d) {
            function e() {
                var a = null;
                switch (d.renderer) {
                    case "canvas":
                        a = C(i);
                        break;
                    case "svg":
                        a = D(i, d);
                        break;
                    default:
                        throw "Holder: invalid renderer: " + d.renderer
                }
                return a
            }
            var f = null;
            switch (d.renderer) {
                case "svg":
                    if (!A.setup.supportsSVG) return;
                    break;
                case "canvas":
                    if (!A.setup.supportsCanvas) return;
                    break;
                default:
                    return
            }
            var h = {
                    width: b.dimensions.width,
                    height: b.dimensions.height,
                    theme: b.theme,
                    flags: b.flags
                },
                i = g(h);
            if ({
                    text: h.text,
                    width: h.width,
                    height: h.height,
                    textHeight: h.font.size,
                    font: h.font.family,
                    fontWeight: h.font.weight,
                    template: h.theme
                }, f = e(), null == f) throw "Holder: couldn't render placeholder";
            "background" == a ? (c.style.backgroundImage = "url(" + f + ")", c.style.backgroundSize = h.width + "px " + h.height + "px") : ("img" === c.nodeName.toLowerCase() ? m(c, {
                src: f
            }) : "object" === c.nodeName.toLowerCase() && (m(c, {
                data: f
            }), m(c, {
                type: "image/svg+xml"
            })), d.reRender && setTimeout(function() {
                var a = e();
                if (null == a) throw "Holder: couldn't render placeholder";
                "img" === c.nodeName.toLowerCase() ? m(c, {
                    src: a
                }) : "object" === c.nodeName.toLowerCase() && (m(c, {
                    data: a
                }), m(c, {
                    type: "image/svg+xml"
                }))
            }, 100)), m(c, {
                "data-holder-rendered": !0
            })
        }

        function g(a) {
            function b(a, b, c, d) {
                b.width = c, b.height = d, a.width = Math.max(a.width, b.width), a.height += b.height, a.add(b)
            }
            switch (a.font = {
                family: a.theme.font ? a.theme.font : "Arial, Helvetica, Open Sans, sans-serif",
                size: h(a.width, a.height, a.theme.size ? a.theme.size : A.defaults.size),
                units: a.theme.units ? a.theme.units : A.defaults.units,
                weight: a.theme.fontweight ? a.theme.fontweight : "bold"
            }, a.text = a.theme.text ? a.theme.text : Math.floor(a.width) + "x" + Math.floor(a.height), a.flags.textmode) {
                case "literal":
                    a.text = a.flags.dimensions.width + "x" + a.flags.dimensions.height;
                    break;
                case "exact":
                    if (!a.flags.exactDimensions) break;
                    a.text = Math.floor(a.flags.exactDimensions.width) + "x" + Math.floor(a.flags.exactDimensions.height)
            }
            var c = new E({
                    width: a.width,
                    height: a.height
                }),
                d = c.Shape,
                e = new d.Rect("holderBg", {
                    fill: a.theme.background
                });
            e.resize(a.width, a.height), c.root.add(e);
            var f = new d.Group("holderTextGroup", {
                text: a.text,
                align: "center",
                font: a.font,
                fill: a.theme.foreground
            });
            f.moveTo(null, null, 1), c.root.add(f);
            var g = f.textPositionData = B(c);
            if (!g) throw "Holder: staging fallback not supported yet.";
            f.properties.leading = g.boundingBox.height;
            var i = null,
                j = null;
            if (g.lineCount > 1) {
                var k = 0,
                    l = 0,
                    m = a.width * A.setup.lineWrapRatio,
                    n = 0;
                j = new d.Group("line" + n);
                for (var o = 0; o < g.words.length; o++) {
                    var p = g.words[o];
                    i = new d.Text(p.text);
                    var q = "\\n" == p.text;
                    (k + p.width >= m || q === !0) && (b(f, j, k, f.properties.leading), k = 0, l += f.properties.leading, n += 1, j = new d.Group("line" + n), j.y = l), q !== !0 && (i.moveTo(k, 0), k += g.spaceWidth + p.width, j.add(i))
                }
                b(f, j, k, f.properties.leading);
                for (var r in f.children) j = f.children[r], j.moveTo((f.width - j.width) / 2, null, null);
                f.moveTo((a.width - f.width) / 2, (a.height - f.height) / 2, null), (a.height - f.height) / 2 < 0 && f.moveTo(null, 0, null)
            } else i = new d.Text(a.text), j = new d.Group("line0"), j.add(i), f.add(j), f.moveTo((a.width - g.boundingBox.width) / 2, (a.height - g.boundingBox.height) / 2, null);
            return c
        }

        function h(a, b, c) {
            b = parseInt(b, 10), a = parseInt(a, 10);
            var d = Math.max(b, a),
                e = Math.min(b, a),
                f = A.defaults.scale,
                g = Math.min(.75 * e, .75 * d * f);
            return Math.round(Math.max(c, g))
        }

        function i(a) {
            var b;
            b = null == a || null == a.nodeType ? A.vars.resizableImages : [a];
            for (var c in b)
                if (b.hasOwnProperty(c)) {
                    var d = b[c];
                    if (d.holderData) {
                        var e = d.holderData.flags,
                            g = j(d, z.invisibleErrorFn(i));
                        if (g) {
                            if (e.fluid && e.auto) {
                                var h = d.holderData.fluidConfig;
                                switch (h.mode) {
                                    case "width":
                                        g.height = g.width / h.ratio;
                                        break;
                                    case "height":
                                        g.width = g.height * h.ratio
                                }
                            }
                            var k = {
                                dimensions: g,
                                theme: e.theme,
                                flags: e
                            };
                            e.textmode && "exact" == e.textmode && (e.exactDimensions = g, k.dimensions = e.dimensions), f("image", k, d, d.holderData.renderSettings)
                        }
                    }
                }
        }

        function j(a, b) {
            var c = {
                height: a.clientHeight,
                width: a.clientWidth
            };
            return c.height || c.width ? (a.removeAttribute("data-holder-invisible"), c) : (m(a, {
                "data-holder-invisible": !0
            }), void b.call(this, a))
        }

        function k(a) {
            if (a.holderData) {
                var b = j(a, z.invisibleErrorFn(k));
                if (b) {
                    var c = a.holderData.flags,
                        d = {
                            fluidHeight: "%" == c.dimensions.height.slice(-1),
                            fluidWidth: "%" == c.dimensions.width.slice(-1),
                            mode: null,
                            initialDimensions: b
                        };
                    d.fluidWidth && !d.fluidHeight ? (d.mode = "width", d.ratio = d.initialDimensions.width / parseFloat(c.dimensions.height)) : !d.fluidWidth && d.fluidHeight && (d.mode = "height", d.ratio = parseFloat(c.dimensions.width) / d.initialDimensions.height), a.holderData.fluidConfig = d
                }
            }
        }

        function l(a, b) {
            return null == b ? y.createElement(a) : y.createElementNS(b, a)
        }

        function m(a, b) {
            for (var c in b) a.setAttribute(c, b[c])
        }

        function n(a, b, c) {
            if (null == a) {
                a = l("svg", x);
                var d = l("defs", x);
                a.appendChild(d)
            }
            return a.webkitMatchesSelector && a.setAttribute("xmlns", x), m(a, {
                width: b,
                height: c,
                viewBox: "0 0 " + b + " " + c,
                preserveAspectRatio: "none"
            }), a
        }

        function o(a, c) {
            if (b.XMLSerializer) {
                var d = new XMLSerializer,
                    e = "",
                    f = c.stylesheets;
                if (a.querySelector("defs"), c.svgXMLStylesheet) {
                    for (var g = (new DOMParser).parseFromString("<xml />", "application/xml"), h = f.length - 1; h >= 0; h--) {
                        var i = g.createProcessingInstruction("xml-stylesheet", 'href="' + f[h] + '" rel="stylesheet"');
                        g.insertBefore(i, g.firstChild)
                    }
                    var j = g.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8" standalone="yes"');
                    g.insertBefore(j, g.firstChild), g.removeChild(g.documentElement), e = d.serializeToString(g)
                }
                var k = d.serializeToString(a);
                return k = k.replace(/\&amp;(\#[0-9]{2,}\;)/g, "&$1"), e + k
            }
        }

        function p(a, b) {
            var c = {};
            for (var d in a) a.hasOwnProperty(d) && (c[d] = a[d]);
            if (null != b)
                for (var e in b) b.hasOwnProperty(e) && (c[e] = b[e]);
            return c
        }

        function q(a) {
            var b = [];
            for (var c in a) a.hasOwnProperty(c) && b.push(c + ":" + a[c]);
            return b.join(";")
        }

        function r(a) {
            A.vars.debounceTimer || a.call(this), A.vars.debounceTimer && clearTimeout(A.vars.debounceTimer), A.vars.debounceTimer = setTimeout(function() {
                A.vars.debounceTimer = null, a.call(this)
            }, A.setup.debounce)
        }

        function s() {
            r(function() {
                i(null)
            })
        }

        function t(a) {
            var c = null;
            return "string" == typeof a ? c = y.querySelectorAll(a) : b.NodeList && a instanceof b.NodeList ? c = a : b.Node && a instanceof b.Node ? c = [a] : b.HTMLCollection && a instanceof b.HTMLCollection ? c = a : null === a && (c = []), c
        }

        function u(a, b) {
            var c = new Image;
            c.onerror = function() {
                b.call(this, !1)
            }, c.onload = function() {
                b.call(this, !0)
            }, c.src = a
        }

        function v(a) {
            for (var b = [], c = 0, d = a.length - 1; d >= 0; d--) c = a.charCodeAt(d), b.unshift(c > 128 ? ["&#", c, ";"].join("") : a[d]);
            return b.join("")
        }

        function w(a) {
            return a.replace(/&#(\d+);/g, function(a, b) {
                return String.fromCharCode(b)
            })
        }
        var x = "http://www.w3.org/2000/svg",
            y = b.document,
            z = {
                addTheme: function(a, b) {
                    return null != a && null != b && (A.settings.themes[a] = b), delete A.vars.cache.themeKeys, this
                },
                addImage: function(a, b) {
                    var c = y.querySelectorAll(b);
                    if (c.length)
                        for (var d = 0, e = c.length; e > d; d++) {
                            var f = l("img");
                            m(f, {
                                "data-src": a
                            }), c[d].appendChild(f)
                        }
                    return this
                },
                run: function(a) {
                    a = a || {};
                    var f = {};
                    A.vars.preempted = !0;
                    var g = p(A.settings, a);
                    f.renderer = g.renderer ? g.renderer : A.setup.renderer, -1 === A.setup.renderers.join(",").indexOf(f.renderer) && (f.renderer = A.setup.supportsSVG ? "svg" : A.setup.supportsCanvas ? "canvas" : "html"), g.use_canvas ? f.renderer = "canvas" : g.use_svg && (f.renderer = "svg");
                    var h = t(g.images),
                        i = t(g.bgnodes),
                        j = t(g.stylenodes),
                        k = t(g.objects);
                    f.stylesheets = [], f.svgXMLStylesheet = !0, f.noFontFallback = g.noFontFallback ? g.noFontFallback : !1;
                    for (var m = 0; m < j.length; m++) {
                        var n = j[m];
                        if (n.attributes.rel && n.attributes.href && "stylesheet" == n.attributes.rel.value) {
                            var o = n.attributes.href.value,
                                q = l("a");
                            q.href = o;
                            var r = q.protocol + "//" + q.host + q.pathname + q.search;
                            f.stylesheets.push(r)
                        }
                    }
                    for (m = 0; m < i.length; m++) {
                        var s = b.getComputedStyle(i[m], null).getPropertyValue("background-image"),
                            v = i[m].getAttribute("data-background-src"),
                            w = null;
                        w = null == v ? s : v;
                        var x = null,
                            y = "?" + g.domain + "/";
                        if (0 === w.indexOf(y)) x = w.slice(1);
                        else if (-1 != w.indexOf(y)) {
                            var z = w.substr(w.indexOf(y)).slice(1),
                                B = z.match(/([^\"]*)"?\)/);
                            null != B && (x = B[1])
                        }
                        if (null != x) {
                            var C = d(x, g);
                            C && e("background", i[m], C, f)
                        }
                    }
                    for (m = 0; m < k.length; m++) {
                        var D = k[m],
                            E = {};
                        try {
                            E.data = D.getAttribute("data"), E.dataSrc = D.getAttribute("data-src")
                        } catch (F) {}
                        var G = null != E.data && 0 === E.data.indexOf(g.domain),
                            H = null != E.dataSrc && 0 === E.dataSrc.indexOf(g.domain);
                        G ? c(g, f, E.data, D) : H && c(g, f, E.dataSrc, D)
                    }
                    for (m = 0; m < h.length; m++) {
                        var I = h[m],
                            J = {};
                        try {
                            J.src = I.getAttribute("src"), J.dataSrc = I.getAttribute("data-src"), J.rendered = I.getAttribute("data-holder-rendered")
                        } catch (F) {}
                        var K = null != J.src,
                            L = null != J.dataSrc && 0 === J.dataSrc.indexOf(g.domain),
                            M = null != J.rendered && "true" == J.rendered;
                        K ? 0 === J.src.indexOf(g.domain) ? c(g, f, J.src, I) : L && (M ? c(g, f, J.dataSrc, I) : ! function(a, b, d, e, f) {
                            u(a, function(a) {
                                a || c(b, d, e, f)
                            })
                        }(J.src, g, f, J.dataSrc, I)) : L && c(g, f, J.dataSrc, I)
                    }
                    return this
                },
                invisibleErrorFn: function() {
                    return function(a) {
                        if (a.hasAttribute("data-holder-invisible")) throw "Holder: invisible placeholder"
                    }
                }
            };
        z.add_theme = z.addTheme, z.add_image = z.addImage, z.invisible_error_fn = z.invisibleErrorFn;
        var A = {
                settings: {
                    domain: "holder.js",
                    images: "img",
                    objects: "object",
                    bgnodes: "body .holderjs",
                    stylenodes: "head link.holderjs",
                    stylesheets: [],
                    themes: {
                        gray: {
                            background: "#EEEEEE",
                            foreground: "#AAAAAA"
                        },
                        social: {
                            background: "#3a5a97",
                            foreground: "#FFFFFF"
                        },
                        industrial: {
                            background: "#434A52",
                            foreground: "#C2F200"
                        },
                        sky: {
                            background: "#0D8FDB",
                            foreground: "#FFFFFF"
                        },
                        vine: {
                            background: "#39DBAC",
                            foreground: "#1E292C"
                        },
                        lava: {
                            background: "#F8591A",
                            foreground: "#1C2846"
                        }
                    }
                },
                defaults: {
                    size: 10,
                    units: "pt",
                    scale: 1 / 16
                },
                flags: {
                    dimensions: {
                        regex: /^(\d+)x(\d+)$/,
                        output: function(a) {
                            var b = this.regex.exec(a);
                            return {
                                width: +b[1],
                                height: +b[2]
                            }
                        }
                    },
                    fluid: {
                        regex: /^([0-9]+%?)x([0-9]+%?)$/,
                        output: function(a) {
                            var b = this.regex.exec(a);
                            return {
                                width: b[1],
                                height: b[2]
                            }
                        }
                    },
                    colors: {
                        regex: /(?:#|\^)([0-9a-f]{3,})\:(?:#|\^)([0-9a-f]{3,})/i,
                        output: function(a) {
                            var b = this.regex.exec(a);
                            return {
                                foreground: "#" + b[2],
                                background: "#" + b[1]
                            }
                        }
                    },
                    text: {
                        regex: /text\:(.*)/,
                        output: function(a) {
                            return this.regex.exec(a)[1].replace("\\/", "/")
                        }
                    },
                    font: {
                        regex: /font\:(.*)/,
                        output: function(a) {
                            return this.regex.exec(a)[1]
                        }
                    },
                    auto: {
                        regex: /^auto$/
                    },
                    textmode: {
                        regex: /textmode\:(.*)/,
                        output: function(a) {
                            return this.regex.exec(a)[1]
                        }
                    },
                    random: {
                        regex: /^random$/
                    }
                }
            },
            B = function() {
                var a = null,
                    b = null,
                    c = null;
                return function(d) {
                    var e = d.root;
                    if (A.setup.supportsSVG) {
                        var f = !1,
                            g = function(a) {
                                return y.createTextNode(a)
                            };
                        null == a && (f = !0), a = n(a, e.properties.width, e.properties.height), f && (b = l("text", x), c = g(null), m(b, {
                            x: 0
                        }), b.appendChild(c), a.appendChild(b), y.body.appendChild(a), a.style.visibility = "hidden", a.style.position = "absolute", a.style.top = "-100%", a.style.left = "-100%");
                        var h = e.children.holderTextGroup,
                            i = h.properties;
                        m(b, {
                            y: i.font.size,
                            style: q({
                                "font-weight": i.font.weight,
                                "font-size": i.font.size + i.font.units,
                                "font-family": i.font.family,
                                "dominant-baseline": "middle"
                            })
                        }), c.nodeValue = i.text;
                        var j = b.getBBox(),
                            k = Math.ceil(j.width / (e.properties.width * A.setup.lineWrapRatio)),
                            o = i.text.split(" "),
                            p = i.text.match(/\\n/g);
                        k += null == p ? 0 : p.length, c.nodeValue = i.text.replace(/[ ]+/g, "");
                        var r = b.getComputedTextLength(),
                            s = j.width - r,
                            t = Math.round(s / Math.max(1, o.length - 1)),
                            u = [];
                        if (k > 1) {
                            c.nodeValue = "";
                            for (var v = 0; v < o.length; v++)
                                if (0 !== o[v].length) {
                                    c.nodeValue = w(o[v]);
                                    var z = b.getBBox();
                                    u.push({
                                        text: o[v],
                                        width: z.width
                                    })
                                }
                        }
                        return {
                            spaceWidth: t,
                            lineCount: k,
                            boundingBox: j,
                            words: u
                        }
                    }
                    return !1
                }
            }(),
            C = function() {
                var a = l("canvas"),
                    b = null;
                return function(c) {
                    null == b && (b = a.getContext("2d"));
                    var d = c.root;
                    a.width = A.dpr(d.properties.width), a.height = A.dpr(d.properties.height), b.textBaseline = "middle", b.fillStyle = d.children.holderBg.properties.fill, b.fillRect(0, 0, A.dpr(d.children.holderBg.width), A.dpr(d.children.holderBg.height));
                    var e = d.children.holderTextGroup;
                    e.properties, b.font = e.properties.font.weight + " " + A.dpr(e.properties.font.size) + e.properties.font.units + " " + e.properties.font.family + ", monospace", b.fillStyle = e.properties.fill;
                    for (var f in e.children) {
                        var g = e.children[f];
                        for (var h in g.children) {
                            var i = g.children[h],
                                j = A.dpr(e.x + g.x + i.x),
                                k = A.dpr(e.y + g.y + i.y + e.properties.leading / 2);
                            b.fillText(i.properties.text, j, k)
                        }
                    }
                    return a.toDataURL("image/png")
                }
            }(),
            D = function() {
                if (b.XMLSerializer) {
                    var a = n(null, 0, 0),
                        c = l("rect", x);
                    return a.appendChild(c),
                        function(b, d) {
                            var e = b.root;
                            n(a, e.properties.width, e.properties.height);
                            for (var f = a.querySelectorAll("g"), g = 0; g < f.length; g++) f[g].parentNode.removeChild(f[g]);
                            m(c, {
                                width: e.children.holderBg.width,
                                height: e.children.holderBg.height,
                                fill: e.children.holderBg.properties.fill
                            });
                            var h = e.children.holderTextGroup,
                                i = h.properties,
                                j = l("g", x);
                            a.appendChild(j);
                            for (var k in h.children) {
                                var p = h.children[k];
                                for (var r in p.children) {
                                    var s = p.children[r],
                                        t = h.x + p.x + s.x,
                                        u = h.y + p.y + s.y + h.properties.leading / 2,
                                        v = l("text", x),
                                        w = y.createTextNode(null);
                                    m(v, {
                                        x: t,
                                        y: u,
                                        style: q({
                                            fill: i.fill,
                                            "font-weight": i.font.weight,
                                            "font-family": i.font.family + ", monospace",
                                            "font-size": i.font.size + i.font.units,
                                            "dominant-baseline": "central"
                                        })
                                    }), w.nodeValue = s.properties.text, v.appendChild(w), j.appendChild(v)
                                }
                            }
                            var z = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(o(a, d))));
                            return z
                        }
                }
            }(),
            E = function(a) {
                function b(a, b) {
                    for (var c in b) a[c] = b[c];
                    return a
                }
                var c = 1,
                    d = augment.defclass({
                        constructor: function(a) {
                            c++, this.parent = null, this.children = {}, this.id = c, this.name = "n" + c, null != a && (this.name = a), this.x = 0, this.y = 0, this.z = 0, this.width = 0, this.height = 0
                        },
                        resize: function(a, b) {
                            null != a && (this.width = a), null != b && (this.height = b)
                        },
                        moveTo: function(a, b, c) {
                            this.x = null != a ? a : this.x, this.y = null != b ? b : this.y, this.z = null != c ? c : this.z
                        },
                        add: function(a) {
                            var b = a.name;
                            if (null != this.children[b]) throw "SceneGraph: child with that name already exists: " + b;
                            this.children[b] = a, a.parent = this
                        }
                    }),
                    e = augment(d, function(b) {
                        this.constructor = function() {
                            b.constructor.call(this, "root"), this.properties = a
                        }
                    }),
                    f = augment(d, function(a) {
                        function c(c, d) {
                            if (a.constructor.call(this, c), this.properties = {
                                    fill: "#000"
                                }, null != d) b(this.properties, d);
                            else if (null != c && "string" != typeof c) throw "SceneGraph: invalid node name"
                        }
                        this.Group = augment.extend(this, {
                            constructor: c,
                            type: "group"
                        }), this.Rect = augment.extend(this, {
                            constructor: c,
                            type: "rect"
                        }), this.Text = augment.extend(this, {
                            constructor: function(a) {
                                c.call(this), this.properties.text = a
                            },
                            type: "text"
                        })
                    }),
                    g = new e;
                return this.Shape = f, this.root = g, this
            };
        for (var F in A.flags) A.flags.hasOwnProperty(F) && (A.flags[F].match = function(a) {
            return a.match(this.regex)
        });
        A.setup = {
                renderer: "html",
                debounce: 100,
                ratio: 1,
                supportsCanvas: !1,
                supportsSVG: !1,
                lineWrapRatio: .9,
                renderers: ["html", "canvas", "svg"]
            }, A.dpr = function(a) {
                return a * A.setup.ratio
            }, A.vars = {
                preempted: !1,
                resizableImages: [],
                debounceTimer: null,
                cache: {}
            },
            function() {
                var a = 1,
                    c = 1,
                    d = l("canvas"),
                    e = null;
                d.getContext && -1 != d.toDataURL("image/png").indexOf("data:image/png") && (A.setup.renderer = "canvas", e = d.getContext("2d"), A.setup.supportsCanvas = !0), A.setup.supportsCanvas && (a = b.devicePixelRatio || 1, c = e.webkitBackingStorePixelRatio || e.mozBackingStorePixelRatio || e.msBackingStorePixelRatio || e.oBackingStorePixelRatio || e.backingStorePixelRatio || 1), A.setup.ratio = a / c, y.createElementNS && y.createElementNS(x, "svg").createSVGRect && (A.setup.renderer = "svg", A.setup.supportsSVG = !0)
            }(), a(z, "Holder", b), b.onDomReady && b.onDomReady(function() {
                A.vars.preempted || z.run(), b.addEventListener ? (b.addEventListener("resize", s, !1), b.addEventListener("orientationchange", s, !1)) : b.attachEvent("onresize", s), "object" == typeof b.Turbolinks && b.document.addEventListener("page:change", function() {
                    z.run()
                })
            })
    }(function(a, b, c) {
        var d = "function" == typeof define && define.amd;
        d ? define(a) : c[b] = a
    }, this), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.affix"),
                    f = "object" == typeof b && b;
                e || d.data("bs.affix", e = new c(this, f)), "string" == typeof b && e[b]()
            })
        }
        var c = function(b, d) {
            this.options = a.extend({}, c.DEFAULTS, d), this.$target = a(this.options.target).on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", a.proxy(this.checkPositionWithEventLoop, this)), this.$element = a(b), this.affixed = this.unpin = this.pinnedOffset = null, this.checkPosition()
        };
        c.VERSION = "3.3.0", c.RESET = "affix affix-top affix-bottom", c.DEFAULTS = {
            offset: 0,
            target: window
        }, c.prototype.getState = function(a, b, c, d) {
            var e = this.$target.scrollTop(),
                f = this.$element.offset(),
                g = this.$target.height();
            if (null != c && "top" == this.affixed) return c > e ? "top" : !1;
            if ("bottom" == this.affixed) return null != c ? e + this.unpin <= f.top ? !1 : "bottom" : a - d >= e + g ? !1 : "bottom";
            var h = null == this.affixed,
                i = h ? e : f.top,
                j = h ? g : b;
            return null != c && c >= i ? "top" : null != d && i + j >= a - d ? "bottom" : !1
        }, c.prototype.getPinnedOffset = function() {
            if (this.pinnedOffset) return this.pinnedOffset;
            this.$element.removeClass(c.RESET).addClass("affix");
            var a = this.$target.scrollTop(),
                b = this.$element.offset();
            return this.pinnedOffset = b.top - a
        }, c.prototype.checkPositionWithEventLoop = function() {
            setTimeout(a.proxy(this.checkPosition, this), 1)
        }, c.prototype.checkPosition = function() {
            if (this.$element.is(":visible")) {
                var b = this.$element.height(),
                    d = this.options.offset,
                    e = d.top,
                    f = d.bottom,
                    g = a("body").height();
                "object" != typeof d && (f = e = d), "function" == typeof e && (e = d.top(this.$element)), "function" == typeof f && (f = d.bottom(this.$element));
                var h = this.getState(g, b, e, f);
                if (this.affixed != h) {
                    null != this.unpin && this.$element.css("top", "");
                    var i = "affix" + (h ? "-" + h : ""),
                        j = a.Event(i + ".bs.affix");
                    if (this.$element.trigger(j), j.isDefaultPrevented()) return;
                    this.affixed = h, this.unpin = "bottom" == h ? this.getPinnedOffset() : null, this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix", "affixed") + ".bs.affix")
                }
                "bottom" == h && this.$element.offset({
                    top: g - b - f
                })
            }
        };
        var d = a.fn.affix;
        a.fn.affix = b, a.fn.affix.Constructor = c, a.fn.affix.noConflict = function() {
            return a.fn.affix = d, this
        }, a(window).on("load", function() {
            a('[data-spy="affix"]').each(function() {
                var c = a(this),
                    d = c.data();
                d.offset = d.offset || {}, null != d.offsetBottom && (d.offset.bottom = d.offsetBottom), null != d.offsetTop && (d.offset.top = d.offsetTop), b.call(c, d)
            })
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var c = a(this),
                    e = c.data("bs.alert");
                e || c.data("bs.alert", e = new d(this)), "string" == typeof b && e[b].call(c)
            })
        }
        var c = '[data-dismiss="alert"]',
            d = function(b) {
                a(b).on("click", c, this.close)
            };
        d.VERSION = "3.3.0", d.TRANSITION_DURATION = 150, d.prototype.close = function(b) {
            function c() {
                g.detach().trigger("closed.bs.alert").remove()
            }
            var e = a(this),
                f = e.attr("data-target");
            f || (f = e.attr("href"), f = f && f.replace(/.*(?=#[^\s]*$)/, ""));
            var g = a(f);
            b && b.preventDefault(), g.length || (g = e.closest(".alert")), g.trigger(b = a.Event("close.bs.alert")), b.isDefaultPrevented() || (g.removeClass("in"), a.support.transition && g.hasClass("fade") ? g.one("bsTransitionEnd", c).emulateTransitionEnd(d.TRANSITION_DURATION) : c())
        };
        var e = a.fn.alert;
        a.fn.alert = b, a.fn.alert.Constructor = d, a.fn.alert.noConflict = function() {
            return a.fn.alert = e, this
        }, a(document).on("click.bs.alert.data-api", c, d.prototype.close)
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.button"),
                    f = "object" == typeof b && b;
                e || d.data("bs.button", e = new c(this, f)), "toggle" == b ? e.toggle() : b && e.setState(b)
            })
        }
        var c = function(b, d) {
            this.$element = a(b), this.options = a.extend({}, c.DEFAULTS, d), this.isLoading = !1
        };
        c.VERSION = "3.3.0", c.DEFAULTS = {
            loadingText: "loading..."
        }, c.prototype.setState = function(b) {
            var c = "disabled",
                d = this.$element,
                e = d.is("input") ? "val" : "html",
                f = d.data();
            b += "Text", null == f.resetText && d.data("resetText", d[e]()), setTimeout(a.proxy(function() {
                d[e](null == f[b] ? this.options[b] : f[b]), "loadingText" == b ? (this.isLoading = !0, d.addClass(c).attr(c, c)) : this.isLoading && (this.isLoading = !1, d.removeClass(c).removeAttr(c))
            }, this), 0)
        }, c.prototype.toggle = function() {
            var a = !0,
                b = this.$element.closest('[data-toggle="buttons"]');
            if (b.length) {
                var c = this.$element.find("input");
                "radio" == c.prop("type") && (c.prop("checked") && this.$element.hasClass("active") ? a = !1 : b.find(".active").removeClass("active")), a && c.prop("checked", !this.$element.hasClass("active")).trigger("change")
            } else this.$element.attr("aria-pressed", !this.$element.hasClass("active"));
            a && this.$element.toggleClass("active")
        };
        var d = a.fn.button;
        a.fn.button = b, a.fn.button.Constructor = c, a.fn.button.noConflict = function() {
            return a.fn.button = d, this
        }, a(document).on("click.bs.button.data-api", '[data-toggle^="button"]', function(c) {
            var d = a(c.target);
            d.hasClass("btn") || (d = d.closest(".btn")), b.call(d, "toggle"), c.preventDefault()
        }).on("focus.bs.button.data-api blur.bs.button.data-api", '[data-toggle^="button"]', function(b) {
            a(b.target).closest(".btn").toggleClass("focus", "focus" == b.type)
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.carousel"),
                    f = a.extend({}, c.DEFAULTS, d.data(), "object" == typeof b && b),
                    g = "string" == typeof b ? b : f.slide;
                e || d.data("bs.carousel", e = new c(this, f)), "number" == typeof b ? e.to(b) : g ? e[g]() : f.interval && e.pause().cycle()
            })
        }
        var c = function(b, c) {
            this.$element = a(b), this.$indicators = this.$element.find(".carousel-indicators"), this.options = c, this.paused = this.sliding = this.interval = this.$active = this.$items = null, this.options.keyboard && this.$element.on("keydown.bs.carousel", a.proxy(this.keydown, this)), "hover" == this.options.pause && !("ontouchstart" in document.documentElement) && this.$element.on("mouseenter.bs.carousel", a.proxy(this.pause, this)).on("mouseleave.bs.carousel", a.proxy(this.cycle, this))
        };
        c.VERSION = "3.3.0", c.TRANSITION_DURATION = 600, c.DEFAULTS = {
            interval: 5e3,
            pause: "hover",
            wrap: !0,
            keyboard: !0
        }, c.prototype.keydown = function(a) {
            switch (a.which) {
                case 37:
                    this.prev();
                    break;
                case 39:
                    this.next();
                    break;
                default:
                    return
            }
            a.preventDefault()
        }, c.prototype.cycle = function(b) {
            return b || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval(a.proxy(this.next, this), this.options.interval)), this
        }, c.prototype.getItemIndex = function(a) {
            return this.$items = a.parent().children(".item"), this.$items.index(a || this.$active);

        }, c.prototype.getItemForDirection = function(a, b) {
            var c = "prev" == a ? -1 : 1,
                d = this.getItemIndex(b),
                e = (d + c) % this.$items.length;
            return this.$items.eq(e)
        }, c.prototype.to = function(a) {
            var b = this,
                c = this.getItemIndex(this.$active = this.$element.find(".item.active"));
            return a > this.$items.length - 1 || 0 > a ? void 0 : this.sliding ? this.$element.one("slid.bs.carousel", function() {
                b.to(a)
            }) : c == a ? this.pause().cycle() : this.slide(a > c ? "next" : "prev", this.$items.eq(a))
        }, c.prototype.pause = function(b) {
            return b || (this.paused = !0), this.$element.find(".next, .prev").length && a.support.transition && (this.$element.trigger(a.support.transition.end), this.cycle(!0)), this.interval = clearInterval(this.interval), this
        }, c.prototype.next = function() {
            return this.sliding ? void 0 : this.slide("next")
        }, c.prototype.prev = function() {
            return this.sliding ? void 0 : this.slide("prev")
        }, c.prototype.slide = function(b, d) {
            var e = this.$element.find(".item.active"),
                f = d || this.getItemForDirection(b, e),
                g = this.interval,
                h = "next" == b ? "left" : "right",
                i = "next" == b ? "first" : "last",
                j = this;
            if (!f.length) {
                if (!this.options.wrap) return;
                f = this.$element.find(".item")[i]()
            }
            if (f.hasClass("active")) return this.sliding = !1;
            var k = f[0],
                l = a.Event("slide.bs.carousel", {
                    relatedTarget: k,
                    direction: h
                });
            if (this.$element.trigger(l), !l.isDefaultPrevented()) {
                if (this.sliding = !0, g && this.pause(), this.$indicators.length) {
                    this.$indicators.find(".active").removeClass("active");
                    var m = a(this.$indicators.children()[this.getItemIndex(f)]);
                    m && m.addClass("active")
                }
                var n = a.Event("slid.bs.carousel", {
                    relatedTarget: k,
                    direction: h
                });
                return a.support.transition && this.$element.hasClass("slide") ? (f.addClass(b), f[0].offsetWidth, e.addClass(h), f.addClass(h), e.one("bsTransitionEnd", function() {
                    f.removeClass([b, h].join(" ")).addClass("active"), e.removeClass(["active", h].join(" ")), j.sliding = !1, setTimeout(function() {
                        j.$element.trigger(n)
                    }, 0)
                }).emulateTransitionEnd(c.TRANSITION_DURATION)) : (e.removeClass("active"), f.addClass("active"), this.sliding = !1, this.$element.trigger(n)), g && this.cycle(), this
            }
        };
        var d = a.fn.carousel;
        a.fn.carousel = b, a.fn.carousel.Constructor = c, a.fn.carousel.noConflict = function() {
            return a.fn.carousel = d, this
        };
        var e = function(c) {
            var d, e = a(this),
                f = a(e.attr("data-target") || (d = e.attr("href")) && d.replace(/.*(?=#[^\s]+$)/, ""));
            if (f.hasClass("carousel")) {
                var g = a.extend({}, f.data(), e.data()),
                    h = e.attr("data-slide-to");
                h && (g.interval = !1), b.call(f, g), h && f.data("bs.carousel").to(h), c.preventDefault()
            }
        };
        a(document).on("click.bs.carousel.data-api", "[data-slide]", e).on("click.bs.carousel.data-api", "[data-slide-to]", e), a(window).on("load", function() {
            a('[data-ride="carousel"]').each(function() {
                var c = a(this);
                b.call(c, c.data())
            })
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            var c, d = b.attr("data-target") || (c = b.attr("href")) && c.replace(/.*(?=#[^\s]+$)/, "");
            return a(d)
        }

        function c(b) {
            return this.each(function() {
                var c = a(this),
                    e = c.data("bs.collapse"),
                    f = a.extend({}, d.DEFAULTS, c.data(), "object" == typeof b && b);
                !e && f.toggle && "show" == b && (f.toggle = !1), e || c.data("bs.collapse", e = new d(this, f)), "string" == typeof b && e[b]()
            })
        }
        var d = function(b, c) {
            this.$element = a(b), this.options = a.extend({}, d.DEFAULTS, c), this.$trigger = a(this.options.trigger).filter('[href="#' + b.id + '"], [data-target="#' + b.id + '"]'), this.transitioning = null, this.options.parent ? this.$parent = this.getParent() : this.addAriaAndCollapsedClass(this.$element, this.$trigger), this.options.toggle && this.toggle()
        };
        d.VERSION = "3.3.0", d.TRANSITION_DURATION = 350, d.DEFAULTS = {
            toggle: !0,
            trigger: '[data-toggle="collapse"]'
        }, d.prototype.dimension = function() {
            var a = this.$element.hasClass("width");
            return a ? "width" : "height"
        }, d.prototype.show = function() {
            if (!this.transitioning && !this.$element.hasClass("in")) {
                var b, e = this.$parent && this.$parent.find("> .panel").children(".in, .collapsing");
                if (!(e && e.length && (b = e.data("bs.collapse"), b && b.transitioning))) {
                    var f = a.Event("show.bs.collapse");
                    if (this.$element.trigger(f), !f.isDefaultPrevented()) {
                        e && e.length && (c.call(e, "hide"), b || e.data("bs.collapse", null));
                        var g = this.dimension();
                        this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded", !0), this.$trigger.removeClass("collapsed").attr("aria-expanded", !0), this.transitioning = 1;
                        var h = function() {
                            this.$element.removeClass("collapsing").addClass("collapse in")[g](""), this.transitioning = 0, this.$element.trigger("shown.bs.collapse")
                        };
                        if (!a.support.transition) return h.call(this);
                        var i = a.camelCase(["scroll", g].join("-"));
                        this.$element.one("bsTransitionEnd", a.proxy(h, this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])
                    }
                }
            }
        }, d.prototype.hide = function() {
            if (!this.transitioning && this.$element.hasClass("in")) {
                var b = a.Event("hide.bs.collapse");
                if (this.$element.trigger(b), !b.isDefaultPrevented()) {
                    var c = this.dimension();
                    this.$element[c](this.$element[c]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded", !1), this.$trigger.addClass("collapsed").attr("aria-expanded", !1), this.transitioning = 1;
                    var e = function() {
                        this.transitioning = 0, this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")
                    };
                    return a.support.transition ? void this.$element[c](0).one("bsTransitionEnd", a.proxy(e, this)).emulateTransitionEnd(d.TRANSITION_DURATION) : e.call(this)
                }
            }
        }, d.prototype.toggle = function() {
            this[this.$element.hasClass("in") ? "hide" : "show"]()
        }, d.prototype.getParent = function() {
            return a(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each(a.proxy(function(c, d) {
                var e = a(d);
                this.addAriaAndCollapsedClass(b(e), e)
            }, this)).end()
        }, d.prototype.addAriaAndCollapsedClass = function(a, b) {
            var c = a.hasClass("in");
            a.attr("aria-expanded", c), b.toggleClass("collapsed", !c).attr("aria-expanded", c)
        };
        var e = a.fn.collapse;
        a.fn.collapse = c, a.fn.collapse.Constructor = d, a.fn.collapse.noConflict = function() {
            return a.fn.collapse = e, this
        }, a(document).on("click.bs.collapse.data-api", '[data-toggle="collapse"]', function(d) {
            var e = a(this);
            e.attr("data-target") || d.preventDefault();
            var f = b(e),
                g = f.data("bs.collapse"),
                h = g ? "toggle" : a.extend({}, e.data(), {
                    trigger: this
                });
            c.call(f, h)
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            b && 3 === b.which || (a(e).remove(), a(f).each(function() {
                var d = a(this),
                    e = c(d),
                    f = {
                        relatedTarget: this
                    };
                e.hasClass("open") && (e.trigger(b = a.Event("hide.bs.dropdown", f)), b.isDefaultPrevented() || (d.attr("aria-expanded", "false"), e.removeClass("open").trigger("hidden.bs.dropdown", f)))
            }))
        }

        function c(b) {
            var c = b.attr("data-target");
            c || (c = b.attr("href"), c = c && /#[A-Za-z]/.test(c) && c.replace(/.*(?=#[^\s]*$)/, ""));
            var d = c && a(c);
            return d && d.length ? d : b.parent()
        }

        function d(b) {
            return this.each(function() {
                var c = a(this),
                    d = c.data("bs.dropdown");
                d || c.data("bs.dropdown", d = new g(this)), "string" == typeof b && d[b].call(c)
            })
        }
        var e = ".dropdown-backdrop",
            f = '[data-toggle="dropdown"]',
            g = function(b) {
                a(b).on("click.bs.dropdown", this.toggle)
            };
        g.VERSION = "3.3.0", g.prototype.toggle = function(d) {
            var e = a(this);
            if (!e.is(".disabled, :disabled")) {
                var f = c(e),
                    g = f.hasClass("open");
                if (b(), !g) {
                    "ontouchstart" in document.documentElement && !f.closest(".navbar-nav").length && a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click", b);
                    var h = {
                        relatedTarget: this
                    };
                    if (f.trigger(d = a.Event("show.bs.dropdown", h)), d.isDefaultPrevented()) return;
                    e.trigger("focus").attr("aria-expanded", "true"), f.toggleClass("open").trigger("shown.bs.dropdown", h)
                }
                return !1
            }
        }, g.prototype.keydown = function(b) {
            if (/(38|40|27|32)/.test(b.which)) {
                var d = a(this);
                if (b.preventDefault(), b.stopPropagation(), !d.is(".disabled, :disabled")) {
                    var e = c(d),
                        g = e.hasClass("open");
                    if (!g && 27 != b.which || g && 27 == b.which) return 27 == b.which && e.find(f).trigger("focus"), d.trigger("click");
                    var h = " li:not(.divider):visible a",
                        i = e.find('[role="menu"]' + h + ', [role="listbox"]' + h);
                    if (i.length) {
                        var j = i.index(b.target);
                        38 == b.which && j > 0 && j--, 40 == b.which && j < i.length - 1 && j++, ~j || (j = 0), i.eq(j).trigger("focus")
                    }
                }
            }
        };
        var h = a.fn.dropdown;
        a.fn.dropdown = d, a.fn.dropdown.Constructor = g, a.fn.dropdown.noConflict = function() {
            return a.fn.dropdown = h, this
        }, a(document).on("click.bs.dropdown.data-api", b).on("click.bs.dropdown.data-api", ".dropdown form", function(a) {
            a.stopPropagation()
        }).on("click.bs.dropdown.data-api", f, g.prototype.toggle).on("keydown.bs.dropdown.data-api", f, g.prototype.keydown).on("keydown.bs.dropdown.data-api", '[role="menu"]', g.prototype.keydown).on("keydown.bs.dropdown.data-api", '[role="listbox"]', g.prototype.keydown)
    }(jQuery), + function(a) {
        "use strict";

        function b(b, d) {
            return this.each(function() {
                var e = a(this),
                    f = e.data("bs.modal"),
                    g = a.extend({}, c.DEFAULTS, e.data(), "object" == typeof b && b);
                f || e.data("bs.modal", f = new c(this, g)), "string" == typeof b ? f[b](d) : g.show && f.show(d)
            })
        }
        var c = function(b, c) {
            this.options = c, this.$body = a(document.body), this.$element = a(b), this.$backdrop = this.isShown = null, this.scrollbarWidth = 0, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, a.proxy(function() {
                this.$element.trigger("loaded.bs.modal")
            }, this))
        };
        c.VERSION = "3.3.0", c.TRANSITION_DURATION = 300, c.BACKDROP_TRANSITION_DURATION = 150, c.DEFAULTS = {
            backdrop: !0,
            keyboard: !0,
            show: !0
        }, c.prototype.toggle = function(a) {
            return this.isShown ? this.hide() : this.show(a)
        }, c.prototype.show = function(b) {
            var d = this,
                e = a.Event("show.bs.modal", {
                    relatedTarget: b
                });
            this.$element.trigger(e), this.isShown || e.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.$body.addClass("modal-open"), this.setScrollbar(), this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', a.proxy(this.hide, this)), this.backdrop(function() {
                var e = a.support.transition && d.$element.hasClass("fade");
                d.$element.parent().length || d.$element.appendTo(d.$body), d.$element.show().scrollTop(0), e && d.$element[0].offsetWidth, d.$element.addClass("in").attr("aria-hidden", !1), d.enforceFocus();
                var f = a.Event("shown.bs.modal", {
                    relatedTarget: b
                });
                e ? d.$element.find(".modal-dialog").one("bsTransitionEnd", function() {
                    d.$element.trigger("focus").trigger(f)
                }).emulateTransitionEnd(c.TRANSITION_DURATION) : d.$element.trigger("focus").trigger(f)
            }))
        }, c.prototype.hide = function(b) {
            b && b.preventDefault(), b = a.Event("hide.bs.modal"), this.$element.trigger(b), this.isShown && !b.isDefaultPrevented() && (this.isShown = !1, this.escape(), a(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), a.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", a.proxy(this.hideModal, this)).emulateTransitionEnd(c.TRANSITION_DURATION) : this.hideModal())
        }, c.prototype.enforceFocus = function() {
            a(document).off("focusin.bs.modal").on("focusin.bs.modal", a.proxy(function(a) {
                this.$element[0] === a.target || this.$element.has(a.target).length || this.$element.trigger("focus")
            }, this))
        }, c.prototype.escape = function() {
            this.isShown && this.options.keyboard ? this.$element.on("keydown.dismiss.bs.modal", a.proxy(function(a) {
                27 == a.which && this.hide()
            }, this)) : this.isShown || this.$element.off("keydown.dismiss.bs.modal")
        }, c.prototype.hideModal = function() {
            var a = this;
            this.$element.hide(), this.backdrop(function() {
                a.$body.removeClass("modal-open"), a.resetScrollbar(), a.$element.trigger("hidden.bs.modal")
            })
        }, c.prototype.removeBackdrop = function() {
            this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
        }, c.prototype.backdrop = function(b) {
            var d = this,
                e = this.$element.hasClass("fade") ? "fade" : "";
            if (this.isShown && this.options.backdrop) {
                var f = a.support.transition && e;
                if (this.$backdrop = a('<div class="modal-backdrop ' + e + '" />').prependTo(this.$element).on("click.dismiss.bs.modal", a.proxy(function(a) {
                        a.target === a.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this))
                    }, this)), f && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !b) return;
                f ? this.$backdrop.one("bsTransitionEnd", b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION) : b()
            } else if (!this.isShown && this.$backdrop) {
                this.$backdrop.removeClass("in");
                var g = function() {
                    d.removeBackdrop(), b && b()
                };
                a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION) : g()
            } else b && b()
        }, c.prototype.checkScrollbar = function() {
            this.scrollbarWidth = this.measureScrollbar()
        }, c.prototype.setScrollbar = function() {
            var a = parseInt(this.$body.css("padding-right") || 0, 10);
            this.scrollbarWidth && this.$body.css("padding-right", a + this.scrollbarWidth)
        }, c.prototype.resetScrollbar = function() {
            this.$body.css("padding-right", "")
        }, c.prototype.measureScrollbar = function() {
            if (document.body.clientWidth >= window.innerWidth) return 0;
            var a = document.createElement("div");
            a.className = "modal-scrollbar-measure", this.$body.append(a);
            var b = a.offsetWidth - a.clientWidth;
            return this.$body[0].removeChild(a), b
        };
        var d = a.fn.modal;
        a.fn.modal = b, a.fn.modal.Constructor = c, a.fn.modal.noConflict = function() {
            return a.fn.modal = d, this
        }, a(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(c) {
            var d = a(this),
                e = d.attr("href"),
                f = a(d.attr("data-target") || e && e.replace(/.*(?=#[^\s]+$)/, "")),
                g = f.data("bs.modal") ? "toggle" : a.extend({
                    remote: !/#/.test(e) && e
                }, f.data(), d.data());
            d.is("a") && c.preventDefault(), f.one("show.bs.modal", function(a) {
                a.isDefaultPrevented() || f.one("hidden.bs.modal", function() {
                    d.is(":visible") && d.trigger("focus")
                })
            }), b.call(f, g, this)
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(c, d) {
            var e = a.proxy(this.process, this);
            this.$body = a("body"), this.$scrollElement = a(a(c).is("body") ? window : c), this.options = a.extend({}, b.DEFAULTS, d), this.selector = (this.options.target || "") + " .nav li > a", this.offsets = [], this.targets = [], this.activeTarget = null, this.scrollHeight = 0, this.$scrollElement.on("scroll.bs.scrollspy", e), this.refresh(), this.process()
        }

        function c(c) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.scrollspy"),
                    f = "object" == typeof c && c;
                e || d.data("bs.scrollspy", e = new b(this, f)), "string" == typeof c && e[c]()
            })
        }
        b.VERSION = "3.3.0", b.DEFAULTS = {
            offset: 10
        }, b.prototype.getScrollHeight = function() {
            return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
        }, b.prototype.refresh = function() {
            var b = "offset",
                c = 0;
            a.isWindow(this.$scrollElement[0]) || (b = "position", c = this.$scrollElement.scrollTop()), this.offsets = [], this.targets = [], this.scrollHeight = this.getScrollHeight();
            var d = this;
            this.$body.find(this.selector).map(function() {
                var d = a(this),
                    e = d.data("target") || d.attr("href"),
                    f = /^#./.test(e) && a(e);
                return f && f.length && f.is(":visible") && [
                    [f[b]().top + c, e]
                ] || null
            }).sort(function(a, b) {
                return a[0] - b[0]
            }).each(function() {
                d.offsets.push(this[0]), d.targets.push(this[1])
            })
        }, b.prototype.process = function() {
            var a, b = this.$scrollElement.scrollTop() + this.options.offset,
                c = this.getScrollHeight(),
                d = this.options.offset + c - this.$scrollElement.height(),
                e = this.offsets,
                f = this.targets,
                g = this.activeTarget;
            if (this.scrollHeight != c && this.refresh(), b >= d) return g != (a = f[f.length - 1]) && this.activate(a);
            if (g && b < e[0]) return this.activeTarget = null, this.clear();
            for (a = e.length; a--;) g != f[a] && b >= e[a] && (!e[a + 1] || b <= e[a + 1]) && this.activate(f[a])
        }, b.prototype.activate = function(b) {
            this.activeTarget = b, this.clear();
            var c = this.selector + '[data-target="' + b + '"],' + this.selector + '[href="' + b + '"]',
                d = a(c).parents("li").addClass("active");
            d.parent(".dropdown-menu").length && (d = d.closest("li.dropdown").addClass("active")), d.trigger("activate.bs.scrollspy")
        }, b.prototype.clear = function() {
            a(this.selector).parentsUntil(this.options.target, ".active").removeClass("active")
        };
        var d = a.fn.scrollspy;
        a.fn.scrollspy = c, a.fn.scrollspy.Constructor = b, a.fn.scrollspy.noConflict = function() {
            return a.fn.scrollspy = d, this
        }, a(window).on("load.bs.scrollspy.data-api", function() {
            a('[data-spy="scroll"]').each(function() {
                var b = a(this);
                c.call(b, b.data())
            })
        })
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.tab");
                e || d.data("bs.tab", e = new c(this)), "string" == typeof b && e[b]()
            })
        }
        var c = function(b) {
            this.element = a(b)
        };
        c.VERSION = "3.3.0", c.TRANSITION_DURATION = 150, c.prototype.show = function() {
            var b = this.element,
                c = b.closest("ul:not(.dropdown-menu)"),
                d = b.data("target");
            if (d || (d = b.attr("href"), d = d && d.replace(/.*(?=#[^\s]*$)/, "")), !b.parent("li").hasClass("active")) {
                var e = c.find(".active:last a"),
                    f = a.Event("hide.bs.tab", {
                        relatedTarget: b[0]
                    }),
                    g = a.Event("show.bs.tab", {
                        relatedTarget: e[0]
                    });
                if (e.trigger(f), b.trigger(g), !g.isDefaultPrevented() && !f.isDefaultPrevented()) {
                    var h = a(d);
                    this.activate(b.closest("li"), c), this.activate(h, h.parent(), function() {
                        e.trigger({
                            type: "hidden.bs.tab",
                            relatedTarget: b[0]
                        }), b.trigger({
                            type: "shown.bs.tab",
                            relatedTarget: e[0]
                        })
                    })
                }
            }
        }, c.prototype.activate = function(b, d, e) {
            function f() {
                g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !1), b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded", !0), h ? (b[0].offsetWidth, b.addClass("in")) : b.removeClass("fade"), b.parent(".dropdown-menu") && b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded", !0), e && e()
            }
            var g = d.find("> .active"),
                h = e && a.support.transition && (g.length && g.hasClass("fade") || !!d.find("> .fade").length);
            g.length && h ? g.one("bsTransitionEnd", f).emulateTransitionEnd(c.TRANSITION_DURATION) : f(), g.removeClass("in")
        };
        var d = a.fn.tab;
        a.fn.tab = b, a.fn.tab.Constructor = c, a.fn.tab.noConflict = function() {
            return a.fn.tab = d, this
        };
        var e = function(c) {
            c.preventDefault(), b.call(a(this), "show")
        };
        a(document).on("click.bs.tab.data-api", '[data-toggle="tab"]', e).on("click.bs.tab.data-api", '[data-toggle="pill"]', e)
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.tooltip"),
                    f = "object" == typeof b && b,
                    g = f && f.selector;
                (e || "destroy" != b) && (g ? (e || d.data("bs.tooltip", e = {}), e[g] || (e[g] = new c(this, f))) : e || d.data("bs.tooltip", e = new c(this, f)), "string" == typeof b && e[b]())
            })
        }
        var c = function(a, b) {
            this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, this.init("tooltip", a, b)
        };
        c.VERSION = "3.3.0", c.TRANSITION_DURATION = 150, c.DEFAULTS = {
            animation: !0,
            placement: "top",
            selector: !1,
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
            trigger: "hover focus",
            title: "",
            delay: 0,
            html: !1,
            container: !1,
            viewport: {
                selector: "body",
                padding: 0
            }
        }, c.prototype.init = function(b, c, d) {
            this.enabled = !0, this.type = b, this.$element = a(c), this.options = this.getOptions(d), this.$viewport = this.options.viewport && a(this.options.viewport.selector || this.options.viewport);
            for (var e = this.options.trigger.split(" "), f = e.length; f--;) {
                var g = e[f];
                if ("click" == g) this.$element.on("click." + this.type, this.options.selector, a.proxy(this.toggle, this));
                else if ("manual" != g) {
                    var h = "hover" == g ? "mouseenter" : "focusin",
                        i = "hover" == g ? "mouseleave" : "focusout";
                    this.$element.on(h + "." + this.type, this.options.selector, a.proxy(this.enter, this)), this.$element.on(i + "." + this.type, this.options.selector, a.proxy(this.leave, this))
                }
            }
            this.options.selector ? this._options = a.extend({}, this.options, {
                trigger: "manual",
                selector: ""
            }) : this.fixTitle()
        }, c.prototype.getDefaults = function() {
            return c.DEFAULTS
        }, c.prototype.getOptions = function(b) {
            return b = a.extend({}, this.getDefaults(), this.$element.data(), b), b.delay && "number" == typeof b.delay && (b.delay = {
                show: b.delay,
                hide: b.delay
            }), b
        }, c.prototype.getDelegateOptions = function() {
            var b = {},
                c = this.getDefaults();
            return this._options && a.each(this._options, function(a, d) {
                c[a] != d && (b[a] = d)
            }), b
        }, c.prototype.enter = function(b) {
            var c = b instanceof this.constructor ? b : a(b.currentTarget).data("bs." + this.type);
            return c && c.$tip && c.$tip.is(":visible") ? void(c.hoverState = "in") : (c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c)), clearTimeout(c.timeout), c.hoverState = "in", c.options.delay && c.options.delay.show ? void(c.timeout = setTimeout(function() {
                "in" == c.hoverState && c.show()
            }, c.options.delay.show)) : c.show())
        }, c.prototype.leave = function(b) {
            var c = b instanceof this.constructor ? b : a(b.currentTarget).data("bs." + this.type);
            return c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c)), clearTimeout(c.timeout), c.hoverState = "out", c.options.delay && c.options.delay.hide ? void(c.timeout = setTimeout(function() {
                "out" == c.hoverState && c.hide()
            }, c.options.delay.hide)) : c.hide()
        }, c.prototype.show = function() {
            var b = a.Event("show.bs." + this.type);
            if (this.hasContent() && this.enabled) {
                this.$element.trigger(b);
                var d = a.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
                if (b.isDefaultPrevented() || !d) return;
                var e = this,
                    f = this.tip(),
                    g = this.getUID(this.type);
                this.setContent(), f.attr("id", g), this.$element.attr("aria-describedby", g), this.options.animation && f.addClass("fade");
                var h = "function" == typeof this.options.placement ? this.options.placement.call(this, f[0], this.$element[0]) : this.options.placement,
                    i = /\s?auto?\s?/i,
                    j = i.test(h);
                j && (h = h.replace(i, "") || "top"), f.detach().css({
                    top: 0,
                    left: 0,
                    display: "block"
                }).addClass(h).data("bs." + this.type, this), this.options.container ? f.appendTo(this.options.container) : f.insertAfter(this.$element);
                var k = this.getPosition(),
                    l = f[0].offsetWidth,
                    m = f[0].offsetHeight;
                if (j) {
                    var n = h,
                        o = this.options.container ? a(this.options.container) : this.$element.parent(),
                        p = this.getPosition(o);
                    h = "bottom" == h && k.bottom + m > p.bottom ? "top" : "top" == h && k.top - m < p.top ? "bottom" : "right" == h && k.right + l > p.width ? "left" : "left" == h && k.left - l < p.left ? "right" : h, f.removeClass(n).addClass(h)
                }
                var q = this.getCalculatedOffset(h, k, l, m);
                this.applyPlacement(q, h);
                var r = function() {
                    var a = e.hoverState;
                    e.$element.trigger("shown.bs." + e.type), e.hoverState = null, "out" == a && e.leave(e)
                };
                a.support.transition && this.$tip.hasClass("fade") ? f.one("bsTransitionEnd", r).emulateTransitionEnd(c.TRANSITION_DURATION) : r()
            }
        }, c.prototype.applyPlacement = function(b, c) {
            var d = this.tip(),
                e = d[0].offsetWidth,
                f = d[0].offsetHeight,
                g = parseInt(d.css("margin-top"), 10),
                h = parseInt(d.css("margin-left"), 10);
            isNaN(g) && (g = 0), isNaN(h) && (h = 0), b.top = b.top + g, b.left = b.left + h, a.offset.setOffset(d[0], a.extend({
                using: function(a) {
                    d.css({
                        top: Math.round(a.top),
                        left: Math.round(a.left)
                    })
                }
            }, b), 0), d.addClass("in");
            var i = d[0].offsetWidth,
                j = d[0].offsetHeight;
            "top" == c && j != f && (b.top = b.top + f - j);
            var k = this.getViewportAdjustedDelta(c, b, i, j);
            k.left ? b.left += k.left : b.top += k.top;
            var l = /top|bottom/.test(c),
                m = l ? 2 * k.left - e + i : 2 * k.top - f + j,
                n = l ? "offsetWidth" : "offsetHeight";
            d.offset(b), this.replaceArrow(m, d[0][n], l)
        }, c.prototype.replaceArrow = function(a, b, c) {
            this.arrow().css(c ? "left" : "top", 50 * (1 - a / b) + "%").css(c ? "top" : "left", "")
        }, c.prototype.setContent = function() {
            var a = this.tip(),
                b = this.getTitle();
            a.find(".tooltip-inner")[this.options.html ? "html" : "text"](b), a.removeClass("fade in top bottom left right")
        }, c.prototype.hide = function(b) {
            function d() {
                "in" != e.hoverState && f.detach(), e.$element.removeAttr("aria-describedby").trigger("hidden.bs." + e.type), b && b()
            }
            var e = this,
                f = this.tip(),
                g = a.Event("hide.bs." + this.type);
            return this.$element.trigger(g), g.isDefaultPrevented() ? void 0 : (f.removeClass("in"), a.support.transition && this.$tip.hasClass("fade") ? f.one("bsTransitionEnd", d).emulateTransitionEnd(c.TRANSITION_DURATION) : d(), this.hoverState = null, this)
        }, c.prototype.fixTitle = function() {
            var a = this.$element;
            (a.attr("title") || "string" != typeof a.attr("data-original-title")) && a.attr("data-original-title", a.attr("title") || "").attr("title", "")
        }, c.prototype.hasContent = function() {
            return this.getTitle()
        }, c.prototype.getPosition = function(b) {
            b = b || this.$element;
            var c = b[0],
                d = "BODY" == c.tagName,
                e = c.getBoundingClientRect();
            null == e.width && (e = a.extend({}, e, {
                width: e.right - e.left,
                height: e.bottom - e.top
            }));
            var f = d ? {
                    top: 0,
                    left: 0
                } : b.offset(),
                g = {
                    scroll: d ? document.documentElement.scrollTop || document.body.scrollTop : b.scrollTop()
                },
                h = d ? {
                    width: a(window).width(),
                    height: a(window).height()
                } : null;
            return a.extend({}, e, g, h, f)
        }, c.prototype.getCalculatedOffset = function(a, b, c, d) {
            return "bottom" == a ? {
                top: b.top + b.height,
                left: b.left + b.width / 2 - c / 2
            } : "top" == a ? {
                top: b.top - d,
                left: b.left + b.width / 2 - c / 2
            } : "left" == a ? {
                top: b.top + b.height / 2 - d / 2,
                left: b.left - c
            } : {
                top: b.top + b.height / 2 - d / 2,
                left: b.left + b.width
            }
        }, c.prototype.getViewportAdjustedDelta = function(a, b, c, d) {
            var e = {
                top: 0,
                left: 0
            };
            if (!this.$viewport) return e;
            var f = this.options.viewport && this.options.viewport.padding || 0,
                g = this.getPosition(this.$viewport);
            if (/right|left/.test(a)) {
                var h = b.top - f - g.scroll,
                    i = b.top + f - g.scroll + d;
                h < g.top ? e.top = g.top - h : i > g.top + g.height && (e.top = g.top + g.height - i)
            } else {
                var j = b.left - f,
                    k = b.left + f + c;
                j < g.left ? e.left = g.left - j : k > g.width && (e.left = g.left + g.width - k)
            }
            return e
        }, c.prototype.getTitle = function() {
            var a, b = this.$element,
                c = this.options;
            return a = b.attr("data-original-title") || ("function" == typeof c.title ? c.title.call(b[0]) : c.title)
        }, c.prototype.getUID = function(a) {
            do a += ~~(1e6 * Math.random()); while (document.getElementById(a));
            return a
        }, c.prototype.tip = function() {
            return this.$tip = this.$tip || a(this.options.template)
        }, c.prototype.arrow = function() {
            return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
        }, c.prototype.enable = function() {
            this.enabled = !0
        }, c.prototype.disable = function() {
            this.enabled = !1
        }, c.prototype.toggleEnabled = function() {
            this.enabled = !this.enabled
        }, c.prototype.toggle = function(b) {
            var c = this;
            b && (c = a(b.currentTarget).data("bs." + this.type), c || (c = new this.constructor(b.currentTarget, this.getDelegateOptions()), a(b.currentTarget).data("bs." + this.type, c))), c.tip().hasClass("in") ? c.leave(c) : c.enter(c)
        }, c.prototype.destroy = function() {
            var a = this;
            clearTimeout(this.timeout), this.hide(function() {
                a.$element.off("." + a.type).removeData("bs." + a.type)
            })
        };
        var d = a.fn.tooltip;
        a.fn.tooltip = b, a.fn.tooltip.Constructor = c, a.fn.tooltip.noConflict = function() {
            return a.fn.tooltip = d, this
        }
    }(jQuery), + function(a) {
        "use strict";

        function b(b) {
            return this.each(function() {
                var d = a(this),
                    e = d.data("bs.popover"),
                    f = "object" == typeof b && b,
                    g = f && f.selector;
                (e || "destroy" != b) && (g ? (e || d.data("bs.popover", e = {}), e[g] || (e[g] = new c(this, f))) : e || d.data("bs.popover", e = new c(this, f)), "string" == typeof b && e[b]())
            })
        }
        var c = function(a, b) {
            this.init("popover", a, b)
        };
        if (!a.fn.tooltip) throw new Error("Popover requires tooltip.js");
        c.VERSION = "3.3.0", c.DEFAULTS = a.extend({}, a.fn.tooltip.Constructor.DEFAULTS, {
            placement: "right",
            trigger: "click",
            content: "",
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        }), c.prototype = a.extend({}, a.fn.tooltip.Constructor.prototype), c.prototype.constructor = c, c.prototype.getDefaults = function() {
            return c.DEFAULTS
        }, c.prototype.setContent = function() {
            var a = this.tip(),
                b = this.getTitle(),
                c = this.getContent();
            a.find(".popover-title")[this.options.html ? "html" : "text"](b), a.find(".popover-content").children().detach().end()[this.options.html ? "string" == typeof c ? "html" : "append" : "text"](c), a.removeClass("fade top bottom left right in"), a.find(".popover-title").html() || a.find(".popover-title").hide()
        }, c.prototype.hasContent = function() {
            return this.getTitle() || this.getContent()
        }, c.prototype.getContent = function() {
            var a = this.$element,
                b = this.options;
            return a.attr("data-content") || ("function" == typeof b.content ? b.content.call(a[0]) : b.content)
        }, c.prototype.arrow = function() {
            return this.$arrow = this.$arrow || this.tip().find(".arrow")
        }, c.prototype.tip = function() {
            return this.$tip || (this.$tip = a(this.options.template)), this.$tip
        };
        var d = a.fn.popover;
        a.fn.popover = b, a.fn.popover.Constructor = c, a.fn.popover.noConflict = function() {
            return a.fn.popover = d, this
        }
    }(jQuery), + function(a) {
        "use strict";

        function b() {
            var a = document.createElement("bootstrap"),
                b = {
                    WebkitTransition: "webkitTransitionEnd",
                    MozTransition: "transitionend",
                    OTransition: "oTransitionEnd otransitionend",
                    transition: "transitionend"
                };
            for (var c in b)
                if (void 0 !== a.style[c]) return {
                    end: b[c]
                };
            return !1
        }
        a.fn.emulateTransitionEnd = function(b) {
            var c = !1,
                d = this;
            a(this).one("bsTransitionEnd", function() {
                c = !0
            });
            var e = function() {
                c || a(d).trigger(a.support.transition.end)
            };
            return setTimeout(e, b), this
        }, a(function() {
            a.support.transition = b(), a.support.transition && (a.event.special.bsTransitionEnd = {
                bindType: a.support.transition.end,
                delegateType: a.support.transition.end,
                handle: function(b) {
                    return a(b.target).is(this) ? b.handleObj.handler.apply(this, arguments) : void 0
                }
            })
        })
    }(jQuery),
    function(a) {
        DSpace.getTemplate = function(b) {
            return (DSpace.dev_mode || void 0 === DSpace.templates || void 0 === DSpace.templates[b]) && a.ajax({
                url: DSpace.theme_path + "templates/" + b + ".hbs",
                success: function(a) {
                    void 0 === DSpace.templates && (DSpace.templates = {}), DSpace.templates[b] = Handlebars.compile(a)
                },
                async: !1
            }), DSpace.templates[b]
        }
    }(jQuery),
    function(a) {
        function b() {
            return t || (t = DSpace.getTemplate("discovery_advanced_filters")), t
        }

        function c() {
            return u || (u = DSpace.getTemplate("discovery_simple_filters")), u
        }

        function d() {
            return DSpace.discovery.start_index + DSpace.discovery.filters.length
        }

        function e(a, b, c, e) {
            "number" == typeof a ? (DSpace.discovery.filters.splice(a - DSpace.discovery.start_index, 0, {
                index: a,
                type: b,
                relational_operator: c,
                query: e
            }), i()) : DSpace.discovery.filters.push({
                index: d(),
                type: b,
                relational_operator: c,
                query: e
            })
        }

        function f(a) {
            return 1 * /filter-new-(\d+)/.exec(a.attr("id"))[1]
        }

        function g(a) {
            var b, c, d, e, g;
            b = f(a), c = a.find('select[name^="filtertype_"]').val(), d = a.find('select[name^="filter_relational_operator_"]').val(), e = a.find('input[name^="filter_"]').val(), g = {
                index: b,
                type: c,
                relational_operator: d,
                query: e
            }, h(g)
        }

        function h(a) {
            for (var b = 0; b < DSpace.discovery.filters.length; b++)
                if (DSpace.discovery.filters[b].index === a.index) {
                    DSpace.discovery.filters[b] = a;
                    break
                }
            i()
        }

        function i() {
            for (var a = 0; a < DSpace.discovery.filters.length; a++) DSpace.discovery.filters[a].index = a + DSpace.discovery.start_index
        }

        function j(a) {
            for (var b = 0; b < DSpace.discovery.filters.length; b++) {
                var c = DSpace.discovery.filters[b];
                if (c.index === a) {
                    DSpace.discovery.filters.splice(b, 1);
                    break
                }
            }
            i()
        }

        function k() {
            var c, d, f;
            0 === DSpace.discovery.filters.length && e(null, null, null, ""), c = b(), d = c({
                filters: DSpace.discovery.filters,
                i18n: DSpace.i18n.discovery
            }), p(), a("#new-filters-wrapper").remove(), f = a('<div id="new-filters-wrapper"/>').html(d), a("#aspect_discovery_SimpleSearch_row_filter-controls").before(f), o()
        }

        function l() {
            var b, d, e;
            DSpace.discovery.filters.length > 0 && a(".active-filters-label").removeClass("hidden"), b = c(), d = b(DSpace.discovery), n(), a("#filters-overview-wrapper").remove(), e = a('<div id="filters-overview-wrapper"/>').html(d), a("#filters-overview-wrapper-squared").html("").append(e), m()
        }

        function m() {
            a("#filters-overview-wrapper .label").click(function(b) {
                var c = a(this).data("index");
                return j(c), k(), a("#aspect_discovery_SimpleSearch_div_search-filters").submit(), !1
            })
        }

        function n() {
            a("#filters-overview-wrapper .label").off()
        }

        function o() {
            var b = a(".search-filter");
            b.find("select, input").change(function() {
                g(a(this).closest(".search-filter")), k()
            }), b.find(".filter-control.filter-add").click(function(b) {
                var c = f(a(this).closest(".search-filter"));
                return e(c + 1, null, null, ""), k(), !1
            });
            var c = b.find(".filter-control.filter-remove");
            c.click(function(b) {
                var c = f(a(this).closest(".search-filter"));
                return j(c), k(), !1
            })
        }

        function p() {
            var b = a(".search-filter");
            b.find("select, input").off(), b.find(".filter-control.filter-add").off(), b.find(".filter-control.filter-remove").off()
        }

        function q() {
            a(".show-advanced-filters").click(function() {
                var b = a("#aspect_discovery_SimpleSearch_div_discovery-filters-wrapper");
                return b.parent().find(".discovery-filters-wrapper-head").hide().removeClass("hidden").fadeIn(200), b.hide().removeClass("hidden").slideDown(200), a(this).addClass("hidden"), a(".hide-advanced-filters").removeClass("hidden"), !1
            }), a(".hide-advanced-filters").click(function() {
                var b = a("#aspect_discovery_SimpleSearch_div_discovery-filters-wrapper");
                return b.parent().find(".discovery-filters-wrapper-head").fadeOut(200, function() {
                    a(this).addClass("hidden").removeAttr("style")
                }), b.slideUp(200, function() {
                    a(this).addClass("hidden").removeAttr("style")
                }), a(this).addClass("hidden"), a(".show-advanced-filters").removeClass("hidden"), !1
            }), a("#aspect_discovery_SimpleSearch_field_submit_reset_filter").click(function() {
                return s(), i(), k(), !1
            }), a(".discovery-add-filter-button").click(function() {
                return e(null, null, null, ""), k(), !1
            }), a(".controls-gear-wrapper").find("li.gear-option,li.gear-option a").click(function(b) {
                var c, d, e, f, g, h;
                if (b.stopPropagation(), h = a(this), g = h.is("li") ? h : h.parents("li:first"), g.hasClass("gear-option-selected")) return !1;

                h.attr("href") || (h = h.find("a")), f = h.attr("href").split("&"), e = a("#aspect_discovery_SimpleSearch_div_main-form");
                for (var i = 0; i < f.length; i++) d = f[i].split("=")[0], c = f[i].split("=")[1], e.find('input[name="' + d + '"]').val(c);
                return e.find('input[name="page"]').val("1"), e.submit(), h.closest(".open").removeClass("open"), !1
            })
        }

        function r() {
            DSpace.discovery.orig_filters = DSpace.discovery.filters.slice(0)
        }

        function s() {
            DSpace.discovery.filters = DSpace.discovery.orig_filters.slice(0)
        }
        var t, u;
        Handlebars.registerHelper("set_selected", function(b, c) {
            var d = a("<select />").html(c.fn(this));
            return d.find("[value=" + b + "]").attr({
                selected: "selected"
            }), d.html()
        }), "undefined" != typeof window.DSpace.discovery && (DSpace.discovery.start_index = 1, a(function() {
            i(), r(), q(), l(), k()
        }))
    }(jQuery),
    function(a) {
        function b() {
            a(".row-offcanvas").hasClass("active") ? a(".row-offcanvas").removeClass("active").promise().done(function() {
                a(".main-content").css("min-height", 0).off("click", b), window.setTimeout(function() {
                    a("#sidebar").removeAttr("style")
                }, 350)
            }) : (a("#sidebar").show(), a(".row-offcanvas").addClass("active"), a(".main-content").css("min-height", a("#sidebar").height()), a(".main-content").on("click", b))
        }
        a(function() {
            a("[data-toggle=offcanvas]").on("click", b).bind("touchend", function() {
                a(this).mouseout()
            })
        })
    }(jQuery),
    function(a) {
        function b() {
            a(".community-browser-row .toggler").click(function() {
                var b, g, h, i, j, k, l, m, n, o, p;
                m = a(this), a(".current-community-browser-row").removeClass("current-community-browser-row").find("a strong").contents().unwrap(), n = m.data("target"), h = m.parents(".sub-tree-wrapper"), i = a(".sub-tree-wrapper:not(" + n + ")").not(h), i.addClass("hidden"), j = a([]), i.each(function() {
                    j = j.add(e(a(this)).closest(".community-browser-row"))
                }), j.removeClass("open-community-browser-row").addClass("closed-community-browser-row"), b = m.closest(".community-browser-row"), o = m.find(".open-icon"), p = m.find(".closed-icon"), k = a(".community-browser-row"), d(k), l = a(n), l.is(":visible") ? (l.addClass("hidden"), o.addClass("hidden"), p.removeClass("hidden"), b.removeClass("open-community-browser-row").addClass("closed-community-browser-row"), l.find(".open-icon").addClass("hidden"), l.find(".closed-icon").removeClass("hidden"), g = e(m.closest(".sub-tree-wrapper")), g.length > 0 && (g.closest(".community-browser-row").addClass("current-community-browser-row").find("a").wrapInner("<strong></strong>"), c(k, g, a(g.data("target")), g.parents(".sub-tree-wrapper")))) : (l.removeClass("hidden"), o.removeClass("hidden"), p.addClass("hidden"), b.removeClass("closed-community-browser-row").addClass("open-community-browser-row").addClass("current-community-browser-row").find("a").wrapInner("<strong></strong>"), c(k, m, l, h)), f()
            }).bind("touchend", function() {
                a(this).mouseout()
            }), f()
        }

        function c(b, c, d, f) {
            var g, h, i;
            h = b.not(c.parents(".community-browser-row")).not(d.find(".community-browser-row")), g = f.find(".community-browser-row"), i = a([]), f.each(function() {
                var b;
                b = e(a(this)), i = i.add(b.parents(".community-browser-row"))
            }), g = h.filter(g).not(i), h = h.not(g).not(i), 0 === g.length && h.length > 0 && (g = h, h = a([])), g.addClass("related-community-browser-row hidden-xs"), g.find(".open-icon").addClass("hidden"), g.find(".closed-icon").removeClass("hidden"), h.addClass("unrelated-community-browser-row hidden-xs")
        }

        function d(a) {
            a.removeClass("related-community-browser-row hidden-xs").removeClass("unrelated-community-browser-row hidden-xs")
        }

        function e(b) {
            return a('a[data-target="#' + b.attr("id") + '"]')
        }

        function f() {
            var b = a(".community-browser-row:visible");
            b.removeClass("odd-community-browser-row"), b = b.not(".open-community-browser-row"), b.filter(":odd").addClass("odd-community-browser-row")
        }
        a(b)
    }(jQuery),
    function(a) {
        function b() {
            a(".sort-options-menu a").click(function() {
                var b, c;
                return b = a(this), c = a("#aspect_artifactbrowser_ConfigurableBrowse_div_browse-controls, #aspect_administrative_WithdrawnItems_div_browse-controls, #aspect_administrative_PrivateItems_div_browse-controls"), a('*[name="' + b.data("name") + '"]', c).val(b.data("returnvalue")), a(".btn", c).click(), b.closest(".open").removeClass("open"), !1
            })
        }

        function c() {
            a(".alphabet-select").change(function() {
                var b = a(this);
                return b.mouseout(), window.location = b.val(), !1
            }), a("#aspect_artifactbrowser_ConfigurableBrowse_field_year").change(function() {
                a("#aspect_artifactbrowser_ConfigurableBrowse_field_starts_with").val(""), a("#aspect_artifactbrowser_ConfigurableBrowse_field_submit").click()
            }), a("#aspect_administrative_WithdrawnItems_field_year").change(function() {
                a("#aspect_administrative_WithdrawnItems_field_starts_with").val(""), a("#aspect_administrative_WithdrawnItems_field_submit").click()
            }), a("#aspect_administrative_PrivateItems_field_year").change(function() {
                a("#aspect_administrative_PrivateItems_field_starts_with").val(""), a("#aspect_administrative_PrivateItems_field_submit").click()
            })
        }
        a(function() {
            c(), b()
        })
    }(jQuery), void 0 != window.runAfterJSImports && runAfterJSImports.execute(),
    function(a) {
        function b(c, d, e, f) {
            var g, h = d.childNodes,
                i = document.createElement("li"),
                j = i;
            0 == h.length ? g = "glyphicon-file" : (g = f ? "glyphicon-folder-open" : "glyphicon-folder-close", j = a('<a href="#"></a>'), j.appendTo(i));
            var k = a('<span class="vocabulary-node-icon btn-xs glyphicon ' + g + '"></span>');
            k.attr("id", "node_" + d.id), k.appendTo(j);
            var l = document.createElement("a");
            if (l.setAttribute("href", d.value), l.setAttribute("class", "vocabulary-label"), l.setAttribute("filter", d.value.toLowerCase()), l.innerHTML = d.label, i.appendChild(l), c.appendChild(i), 0 < h.length) {
                var m = document.createElement("ul");
                m.setAttribute("id", "node_" + d.id + "_sub"), f || m.setAttribute("style", "display: none;"), a.each(h, function(a, c) {
                    b(m, c, e, !1)
                }), c.appendChild(m)
            }
        }

        function c() {
            a("div#aspect_submission_ControlledVocabularyTransformer_item_vocabulary-loading").hide()
        }

        function d() {
            a("div#aspect_submission_ControlledVocabularyTransformer_item_vocabulary-error").removeClass("hidden")
        }
        a(document).ready(function() {
            var e = a('a[href^="vocabulary:"]');
            e.click(function(e) {
                for (var f, g, h = a(this), i = h.attr("href").replace("vocabulary:", ""), j = i.substr(0, i.indexOf("/JSON/controlled-vocabulary")), k = i.slice(i.indexOf("?") + 1, i.length).split("&"), l = 0; l < k.length; l++) {
                    var m = k[l].split("=")[0],
                        n = k[l].split("=")[1];
                    "vocabularyIdentifier" == m ? g = n : "metadataFieldName" == m && (f = n)
                }
                var o = "modal_vocabulary_dialog_" + g,
                    p = a("div#" + o);
                return 0 < p.length ? p.modal("show") : a.get(j + "/controlled-vocabulary-dialog", {
                    vocabularyIdentifier: g,
                    metadataFieldName: f
                }, function(e) {
                    p = a('<div class="modal fade" id="' + o + '">' + e + "</div>"), a("body").append(p), p.modal();
                    var f = p.find("div[id^=aspect_submission_ControlledVocabularyTransformer_div_vocabulary_dialog_]");
                    a.ajax({
                        url: i,
                        dataType: "json",
                        data: {},
                        success: function(e) {
                            null == e && (c(), d());
                            var g = document.createElement("ul");
                            g.setAttribute("class", "ds-simple-list vocabulary list-unstyled col-xs-12"), g.setAttribute("id", "vocabulary-list"), b(g, e, j, !0), c(), f[0].appendChild(g), p.find('span[id^="node_"]').click(function(b) {
                                b.preventDefault(), b.stopPropagation();
                                var c = a(this),
                                    d = a("ul#" + c.attr("id") + "_sub");
                                d.is(":visible") ? (d.hide(), d.find("li:first-child").hide()) : (d.show(), d.find("li:first-child").show()), c.hasClass("glyphicon-folder-open") ? (c.removeClass("glyphicon-folder-open"), c.addClass("glyphicon-folder-close")) : c.hasClass("glyphicon-folder-close") && (c.removeClass("glyphicon-folder-close"), c.addClass("glyphicon-folder-open"))
                            }), a("a.vocabulary-label", p).bind("click", function(b) {
                                b.preventDefault(), b.stopPropagation();
                                var c = a(this),
                                    d = p.find('input[type="hidden"][name="metadataFieldName"]').val();
                                return a('input[name="' + d + '"]').val(c.attr("href")), p.modal("hide"), !1
                            }), a('button[name="filter_button"]', p).bind("click", function() {
                                var b, c = a('input[name="filter"]', p).val();
                                if (0 < c.length) {
                                    var d = p.find("ul#vocabulary-list");
                                    d.hide(), d.find("li").hide();
                                    var e = a('a[filter*="' + c.toLowerCase() + '"]');
                                    b = e.parents("ul,li")
                                } else b = p.find("ul,li");
                                return b.show(), b.find(".glyphicon-folder-close").removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open"), !1
                            })
                        }
                    })
                }, "html"), !1
            })
        })
    }($), $(function() {
        function a() {
            $('input[name|="open_access_radios"]').length > 0 && ($('input[name|="open_access_radios"]').change(function() {
                "0" == $('input[name|="open_access_radios"]:checked').val() ? c() : "1" == $('input[name|="open_access_radios"]:checked').val() && b()
            }), "0" == $('input[name|="open_access_radios"]:checked').val() ? c() : "1" == $('input[name|="open_access_radios"]:checked').val() && b())
        }

        function b() {
            $("#aspect_submission_StepTransformer_field_reason").removeAttr("disabled"), $("#aspect_submission_StepTransformer_field_embargo_until_date").removeAttr("disabled")
        }

        function c() {
            $("#aspect_submission_StepTransformer_field_reason").attr("disabled", "disabled"), $("#aspect_submission_StepTransformer_field_embargo_until_date").attr("disabled", "disabled")
        }
        $(function() {
            a()
        })
    }), $(function() {
        Modernizr.inputtypes.date || $('input[type="date"]').each(function() {
            $(this).datepicker({
                dateFormat: "yy-mm-dd"
            })
        }), $("a.information").tooltip()
    }),
    function(a) {
        Holder.invisible_error_fn = function(a) {
            return function(b) {
                try {
                    a.call(this, b)
                } catch (c) {}
            }
        }
    }(jQuery), $(function() {
        $("#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_startDate").datepicker({
            changeMonth: !0,
            changeYear: !0,
            defaultDate: "-1y",
            numberOfMonths: 1,
            dateFormat: "yy-mm-dd",
            onClose: function(a) {
                $("#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_endDate").datepicker("option", "minDate", a)
            }
        }), $("#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_endDate").datepicker({
            changeMonth: !0,
            changeYear: !0,
            numberOfMonths: 1,
            dateFormat: "yy-mm-dd",
            onClose: function(a) {
                $("#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_startDate").datepicker("option", "maxDate", a)
            }
        })
    }), this.DSpace = this.DSpace || {}, this.DSpace.templates = this.DSpace.templates || {}, this.DSpace.templates.discovery_advanced_filters = Handlebars.template({
        1: function(a, b, c, d, e) {
            var f, g, h = "function",
                i = b.helperMissing,
                j = this.escapeExpression,
                k = '<div id="aspect_discovery_SimpleSearch_row_filter-new-' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                    name: "index",
                    hash: {},
                    data: d
                }) : g)) + '"\n     class="ds-form-item row advanced-filter-row search-filter">\n    <div class="col-xs-4 col-sm-2">\n        <p>\n            <select id="aspect_discovery_SimpleSearch_field_filtertype_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                    name: "index",
                    hash: {},
                    data: d
                }) : g)) + '" class="ds-select-field form-control"\n                    name="filtertype_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                    name: "index",
                    hash: {},
                    data: d
                }) : g)) + '">\n';
            return f = (b.set_selected || a && a.set_selected || i).call(a, null != a ? a.type : a, {
                name: "set_selected",
                hash: {},
                fn: this.program(2, d, e),
                inverse: this.noop,
                data: d
            }), null != f && (k += f), k += '            </select>\n        </p>\n    </div>\n    <div class="col-xs-4 col-sm-2">\n        <p>\n            <select id="aspect_discovery_SimpleSearch_field_filter_relational_operator_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '"\n                    class="ds-select-field form-control" name="filter_relational_operator_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '">\n', f = (b.set_selected || a && a.set_selected || i).call(a, null != a ? a.relational_operator : a, {
                name: "set_selected",
                hash: {},
                fn: this.program(5, d, e),
                inverse: this.noop,
                data: d
            }), null != f && (k += f), k + '            </select>\n        </p>\n    </div>\n    <div class="col-xs-4 col-sm-6">\n        <p>\n            <input id="aspect_discovery_SimpleSearch_field_filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '"\n                   class="ds-text-field form-control discovery-filter-input discovery-filter-input"\n                   name="filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '" type="text" value="' + j((g = null != (g = b.query || (null != a ? a.query : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "query",
                hash: {},
                data: d
            }) : g)) + '">\n        </p>\n    </div>\n    <div class="hidden-xs col-sm-2">\n        <div class="btn-group btn-group-justified">\n                <p class="btn-group">\n                    <button id="aspect_discovery_SimpleSearch_field_add-filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '"\n                            class="ds-button-field btn btn-default filter-control filter-add filter-control filter-add"\n                            name="add-filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '" type="submit" title="Add Filter"><span\n                            class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></button>\n                </p>\n                <p class="btn-group">\n                    <button id="aspect_discovery_SimpleSearch_field_remove-filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '"\n                            class="ds-button-field btn btn-default filter-control filter-remove filter-control filter-remove"\n                            name="remove-filter_' + j((g = null != (g = b.index || (null != a ? a.index : a)) ? g : i, typeof g === h ? g.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : g)) + '" type="submit" title="Remove"><span\n                            class="glyphicon glyphicon-minus-sign" aria-hidden="true"></span></button>\n                </p>\n        </div>\n    </div>\n</div>\n'
        },
        2: function(a, b, c, d, e) {
            var f, g = "";
            return f = b.each.call(a, null != (f = null != e[2] ? e[2].i18n : e[2]) ? f.filtertype : f, {
                name: "each",
                hash: {},
                fn: this.program(3, d, e),
                inverse: this.noop,
                data: d
            }), null != f && (g += f), g
        },
        3: function(a, b, c, d) {
            var e = this.lambda,
                f = this.escapeExpression;
            return '                <option value="' + f(e(d && d.key, a)) + '">' + f(e(a, a)) + "</option>\n"
        },
        5: function(a, b, c, d, e) {
            var f, g = "";
            return f = b.each.call(a, null != (f = null != e[2] ? e[2].i18n : e[2]) ? f.filter_relational_operator : f, {
                name: "each",
                hash: {},
                fn: this.program(3, d, e),
                inverse: this.noop,
                data: d
            }), null != f && (g += f), g
        },
        compiler: [6, ">= 2.0.0-beta.1"],
        main: function(a, b, c, d, e) {
            var f, g, h, i = "function",
                j = b.helperMissing,
                k = b.blockHelperMissing,
                l = "<!--\n\n    The contents of this file are subject to the license and copyright\n    detailed in the LICENSE and NOTICE files at the root of the source\n    tree and available online at\n\n    http://www.dspace.org/license/\n\n-->\n";
            return g = null != (g = b.filters || (null != a ? a.filters : a)) ? g : j, h = {
                name: "filters",
                hash: {},
                fn: this.program(1, d, e),
                inverse: this.noop,
                data: d
            }, f = typeof g === i ? g.call(a, h) : g, b.filters || (f = k.call(a, f, h)), null != f && (l += f), l
        },
        useData: !0,
        useDepths: !0
    }), this.DSpace.templates.discovery_simple_filters = Handlebars.template({
        1: function(a, b, c, d) {
            var e, f = "function",
                g = b.helperMissing,
                h = this.escapeExpression;
            return '    <label href="#" class="label label-primary" data-index="' + h((e = null != (e = b.index || (null != a ? a.index : a)) ? e : g, typeof e === f ? e.call(a, {
                name: "index",
                hash: {},
                data: d
            }) : e)) + '">' + h((e = null != (e = b.query || (null != a ? a.query : a)) ? e : g, typeof e === f ? e.call(a, {
                name: "query",
                hash: {},
                data: d
            }) : e)) + "&nbsp;&times;</label>\n"
        },
        compiler: [6, ">= 2.0.0-beta.1"],
        main: function(a, b, c, d) {
            var e, f = "<!--\n\n    The contents of this file are subject to the license and copyright\n    detailed in the LICENSE and NOTICE files at the root of the source\n    tree and available online at\n\n    http://www.dspace.org/license/\n\n-->\n";
            return e = b.each.call(a, null != a ? a.orig_filters : a, {
                name: "each",
                hash: {},
                fn: this.program(1, d),
                inverse: this.noop,
                data: d
            }), null != e && (f += e), f
        },
        useData: !0
    }),
    function(a, b, c) {
        ! function(a) {
            "use strict";
            "function" == typeof define && define.amd ? define("datatables", ["jquery"], a) : "object" == typeof exports ? a(require("jquery")) : jQuery && !jQuery.fn.dataTable && a(jQuery)
        }(function(d) {
            "use strict";

            function e(a) {
                var b, c, f = "a aa ai ao as b fn i m o s ",
                    g = {};
                d.each(a, function(d, h) {
                    b = d.match(/^([^A-Z]+?)([A-Z])/), b && -1 !== f.indexOf(b[1] + " ") && (c = d.replace(b[0], b[2].toLowerCase()), g[c] = d, "o" === b[1] && e(a[d]))
                }), a._hungarianMap = g
            }

            function f(a, b, g) {
                a._hungarianMap || e(a);
                var h;
                d.each(b, function(e, i) {
                    h = a._hungarianMap[e], h === c || !g && b[h] !== c || ("o" === h.charAt(0) ? (b[h] || (b[h] = {}), d.extend(!0, b[h], b[e]), f(a[h], b[h], g)) : b[h] = b[e])
                })
            }

            function g(a) {
                var b = Wa.defaults.oLanguage,
                    c = a.sZeroRecords;
                !a.sEmptyTable && c && "No data available in table" === b.sEmptyTable && La(a, a, "sZeroRecords", "sEmptyTable"), !a.sLoadingRecords && c && "Loading..." === b.sLoadingRecords && La(a, a, "sZeroRecords", "sLoadingRecords"), a.sInfoThousands && (a.sThousands = a.sInfoThousands);
                var d = a.sDecimal;
                d && Ua(d)
            }

            function h(a) {
                rb(a, "ordering", "bSort"), rb(a, "orderMulti", "bSortMulti"), rb(a, "orderClasses", "bSortClasses"), rb(a, "orderCellsTop", "bSortCellsTop"), rb(a, "order", "aaSorting"), rb(a, "orderFixed", "aaSortingFixed"), rb(a, "paging", "bPaginate"), rb(a, "pagingType", "sPaginationType"), rb(a, "pageLength", "iDisplayLength"), rb(a, "searching", "bFilter");
                var b = a.aoSearchCols;
                if (b)
                    for (var c = 0, d = b.length; d > c; c++) b[c] && f(Wa.models.oSearch, b[c])
            }

            function i(a) {
                rb(a, "orderable", "bSortable"), rb(a, "orderData", "aDataSort"), rb(a, "orderSequence", "asSorting"), rb(a, "orderDataType", "sortDataType")
            }

            function j(a) {
                var b = a.oBrowser,
                    c = d("<div/>").css({
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: 1,
                        width: 1,
                        overflow: "hidden"
                    }).append(d("<div/>").css({
                        position: "absolute",
                        top: 1,
                        left: 1,
                        width: 100,
                        overflow: "scroll"
                    }).append(d('<div class="test"/>').css({
                        width: "100%",
                        height: 10
                    }))).appendTo("body"),
                    e = c.find(".test");
                b.bScrollOversize = 100 === e[0].offsetWidth, b.bScrollbarLeft = 1 !== e.offset().left, c.remove()
            }

            function k(a, b, d, e, f, g) {
                var h, i = e,
                    j = !1;
                for (d !== c && (h = d, j = !0); i !== f;) a.hasOwnProperty(i) && (h = j ? b(h, a[i], i, a) : a[i], j = !0, i += g);
                return h
            }

            function l(a, c) {
                var e = Wa.defaults.column,
                    f = a.aoColumns.length,
                    g = d.extend({}, Wa.models.oColumn, e, {
                        nTh: c ? c : b.createElement("th"),
                        sTitle: e.sTitle ? e.sTitle : c ? c.innerHTML : "",
                        aDataSort: e.aDataSort ? e.aDataSort : [f],
                        mData: e.mData ? e.mData : f,
                        idx: f
                    });
                a.aoColumns.push(g);
                var h = a.aoPreSearchCols;
                h[f] = d.extend({}, Wa.models.oSearch, h[f]), m(a, f, null)
            }

            function m(a, b, e) {
                var g = a.aoColumns[b],
                    h = a.oClasses,
                    j = d(g.nTh);
                if (!g.sWidthOrig) {
                    g.sWidthOrig = j.attr("width") || null;
                    var k = (j.attr("style") || "").match(/width:\s*(\d+[pxem%]+)/);
                    k && (g.sWidthOrig = k[1])
                }
                e !== c && null !== e && (i(e), f(Wa.defaults.column, e), e.mDataProp === c || e.mData || (e.mData = e.mDataProp), e.sType && (g._sManualType = e.sType), e.className && !e.sClass && (e.sClass = e.className), d.extend(g, e), La(g, e, "sWidth", "sWidthOrig"), "number" == typeof e.iDataSort && (g.aDataSort = [e.iDataSort]), La(g, e, "aDataSort"));
                var l = g.mData,
                    m = B(l),
                    n = g.mRender ? B(g.mRender) : null,
                    o = function(a) {
                        return "string" == typeof a && -1 !== a.indexOf("@")
                    };
                g._bAttrSrc = d.isPlainObject(l) && (o(l.sort) || o(l.type) || o(l.filter)), g.fnGetData = function(a, b, d) {
                    var e = m(a, b, c, d);
                    return n && b ? n(e, b, a, d) : e
                }, g.fnSetData = function(a, b, c) {
                    return C(l)(a, b, c)
                }, "number" != typeof l && (a._rowReadObject = !0), a.oFeatures.bSort || (g.bSortable = !1, j.addClass(h.sSortableNone));
                var p = -1 !== d.inArray("asc", g.asSorting),
                    q = -1 !== d.inArray("desc", g.asSorting);
                g.bSortable && (p || q) ? p && !q ? (g.sSortingClass = h.sSortableAsc, g.sSortingClassJUI = h.sSortJUIAscAllowed) : !p && q ? (g.sSortingClass = h.sSortableDesc, g.sSortingClassJUI = h.sSortJUIDescAllowed) : (g.sSortingClass = h.sSortable, g.sSortingClassJUI = h.sSortJUI) : (g.sSortingClass = h.sSortableNone, g.sSortingClassJUI = "")
            }

            function n(a) {
                if (a.oFeatures.bAutoWidth !== !1) {
                    var b = a.aoColumns;
                    sa(a);
                    for (var c = 0, d = b.length; d > c; c++) b[c].nTh.style.width = b[c].sWidth
                }
                var e = a.oScroll;
                ("" !== e.sY || "" !== e.sX) && qa(a), Pa(a, null, "column-sizing", [a])
            }

            function o(a, b) {
                var c = r(a, "bVisible");
                return "number" == typeof c[b] ? c[b] : null
            }

            function p(a, b) {
                var c = r(a, "bVisible"),
                    e = d.inArray(b, c);
                return -1 !== e ? e : null
            }

            function q(a) {
                return r(a, "bVisible").length
            }

            function r(a, b) {
                var c = [];
                return d.map(a.aoColumns, function(a, d) {
                    a[b] && c.push(d)
                }), c
            }

            function s(a) {
                var b, d, e, f, g, h, i, j, k, l = a.aoColumns,
                    m = a.aoData,
                    n = Wa.ext.type.detect;
                for (b = 0, d = l.length; d > b; b++)
                    if (i = l[b], k = [], !i.sType && i._sManualType) i.sType = i._sManualType;
                    else if (!i.sType) {
                    for (e = 0, f = n.length; f > e; e++) {
                        for (g = 0, h = m.length; h > g && (k[g] === c && (k[g] = y(a, g, b, "type")), j = n[e](k[g], a), j && "html" !== j); g++);
                        if (j) {
                            i.sType = j;
                            break
                        }
                    }
                    i.sType || (i.sType = "string")
                }
            }

            function t(a, b, e, f) {
                var g, h, i, j, k, m, n, o = a.aoColumns;
                if (b)
                    for (g = b.length - 1; g >= 0; g--) {
                        n = b[g];
                        var p = n.targets !== c ? n.targets : n.aTargets;
                        for (d.isArray(p) || (p = [p]), i = 0, j = p.length; j > i; i++)
                            if ("number" == typeof p[i] && p[i] >= 0) {
                                for (; o.length <= p[i];) l(a);
                                f(p[i], n)
                            } else if ("number" == typeof p[i] && p[i] < 0) f(o.length + p[i], n);
                        else if ("string" == typeof p[i])
                            for (k = 0, m = o.length; m > k; k++)("_all" == p[i] || d(o[k].nTh).hasClass(p[i])) && f(k, n)
                    }
                if (e)
                    for (g = 0, h = e.length; h > g; g++) f(g, e[g])
            }

            function u(a, b, c, e) {
                var f = a.aoData.length,
                    g = d.extend(!0, {}, Wa.models.oRow, {
                        src: c ? "dom" : "data"
                    });
                g._aData = b, a.aoData.push(g);
                for (var h = a.aoColumns, i = 0, j = h.length; j > i; i++) c && z(a, f, i, y(a, f, i)), h[i].sType = null;
                return a.aiDisplayMaster.push(f), (c || !a.oFeatures.bDeferRender) && I(a, f, c, e), f
            }

            function v(a, b) {
                var c;
                return b instanceof d || (b = d(b)), b.map(function(b, d) {
                    return c = H(a, d), u(a, c.data, d, c.cells)
                })
            }

            function w(a, b) {
                return b._DT_RowIndex !== c ? b._DT_RowIndex : null
            }

            function x(a, b, c) {
                return d.inArray(c, a.aoData[b].anCells)
            }

            function y(a, b, d, e) {
                var f = a.iDraw,
                    g = a.aoColumns[d],
                    h = a.aoData[b]._aData,
                    i = g.sDefaultContent,
                    j = g.fnGetData(h, e, {
                        settings: a,
                        row: b,
                        col: d
                    });
                if (j === c) return a.iDrawError != f && null === i && (Ka(a, 0, "Requested unknown parameter " + ("function" == typeof g.mData ? "{function}" : "'" + g.mData + "'") + " for row " + b, 4), a.iDrawError = f), i;
                if (j !== h && null !== j || null === i) {
                    if ("function" == typeof j) return j.call(h)
                } else j = i;
                return null === j && "display" == e ? "" : j
            }

            function z(a, b, c, d) {
                var e = a.aoColumns[c],
                    f = a.aoData[b]._aData;
                e.fnSetData(f, d, {
                    settings: a,
                    row: b,
                    col: c
                })
            }

            function A(a) {
                return d.map(a.match(/(\\.|[^\.])+/g), function(a) {
                    return a.replace(/\\./g, ".")
                })
            }

            function B(a) {
                if (d.isPlainObject(a)) {
                    var b = {};
                    return d.each(a, function(a, c) {
                            c && (b[a] = B(c))
                        }),
                        function(a, d, e, f) {
                            var g = b[d] || b._;
                            return g !== c ? g(a, d, e, f) : a
                        }
                }
                if (null === a) return function(a) {
                    return a
                };
                if ("function" == typeof a) return function(b, c, d, e) {
                    return a(b, c, d, e)
                };
                if ("string" != typeof a || -1 === a.indexOf(".") && -1 === a.indexOf("[") && -1 === a.indexOf("(")) return function(b, c) {
                    return b[a]
                };
                var e = function(a, b, d) {
                    var f, g, h, i;
                    if ("" !== d)
                        for (var j = A(d), k = 0, l = j.length; l > k; k++) {
                            if (f = j[k].match(sb), g = j[k].match(tb), f) {
                                j[k] = j[k].replace(sb, ""), "" !== j[k] && (a = a[j[k]]), h = [], j.splice(0, k + 1), i = j.join(".");
                                for (var m = 0, n = a.length; n > m; m++) h.push(e(a[m], b, i));
                                var o = f[0].substring(1, f[0].length - 1);
                                a = "" === o ? h : h.join(o);
                                break
                            }
                            if (g) j[k] = j[k].replace(tb, ""), a = a[j[k]]();
                            else {
                                if (null === a || a[j[k]] === c) return c;
                                a = a[j[k]]
                            }
                        }
                    return a
                };
                return function(b, c) {
                    return e(b, c, a)
                }
            }

            function C(a) {
                if (d.isPlainObject(a)) return C(a._);
                if (null === a) return function() {};
                if ("function" == typeof a) return function(b, c, d) {
                    a(b, "set", c, d)
                };
                if ("string" != typeof a || -1 === a.indexOf(".") && -1 === a.indexOf("[") && -1 === a.indexOf("(")) return function(b, c) {
                    b[a] = c
                };
                var b = function(a, d, e) {
                    for (var f, g, h, i, j, k = A(e), l = k[k.length - 1], m = 0, n = k.length - 1; n > m; m++) {
                        if (g = k[m].match(sb), h = k[m].match(tb), g) {
                            k[m] = k[m].replace(sb, ""), a[k[m]] = [], f = k.slice(), f.splice(0, m + 1), j = f.join(".");
                            for (var o = 0, p = d.length; p > o; o++) i = {}, b(i, d[o], j), a[k[m]].push(i);
                            return
                        }
                        h && (k[m] = k[m].replace(tb, ""), a = a[k[m]](d)), (null === a[k[m]] || a[k[m]] === c) && (a[k[m]] = {}), a = a[k[m]]
                    }
                    l.match(tb) ? a = a[l.replace(tb, "")](d) : a[l.replace(sb, "")] = d
                };
                return function(c, d) {
                    return b(c, d, a)
                }
            }

            function D(a) {
                return mb(a.aoData, "_aData")
            }

            function E(a) {
                a.aoData.length = 0, a.aiDisplayMaster.length = 0, a.aiDisplay.length = 0
            }

            function F(a, b, d) {
                for (var e = -1, f = 0, g = a.length; g > f; f++) a[f] == b ? e = f : a[f] > b && a[f]--; - 1 != e && d === c && a.splice(e, 1)
            }

            function G(a, b, d, e) {
                var f, g, h = a.aoData[b];
                if ("dom" !== d && (d && "auto" !== d || "dom" !== h.src)) {
                    var i, j = h.anCells;
                    if (j)
                        for (f = 0, g = j.length; g > f; f++) {
                            for (i = j[f]; i.childNodes.length;) i.removeChild(i.firstChild);
                            j[f].innerHTML = y(a, b, f, "display")
                        }
                } else h._aData = H(a, h).data;
                h._aSortData = null, h._aFilterData = null;
                var k = a.aoColumns;
                if (e !== c) k[e].sType = null;
                else
                    for (f = 0, g = k.length; g > f; f++) k[f].sType = null;
                J(h)
            }

            function H(a, b) {
                var c, e, f, g = [],
                    h = b.firstChild,
                    i = 0,
                    j = a.aoColumns,
                    k = a._rowReadObject,
                    l = k ? {} : [],
                    m = function(a, b) {
                        if ("string" == typeof a) {
                            var c = a.indexOf("@");
                            if (-1 !== c) {
                                var d = a.substring(c + 1),
                                    e = C(a);
                                e(l, b.getAttribute(d))
                            }
                        }
                    },
                    n = function(a) {
                        if (e = j[i], f = d.trim(a.innerHTML), e && e._bAttrSrc) {
                            var b = C(e.mData._);
                            b(l, f), m(e.mData.sort, a), m(e.mData.type, a), m(e.mData.filter, a)
                        } else k ? (e._setter || (e._setter = C(e.mData)), e._setter(l, f)) : l.push(f);
                        i++
                    };
                if (h)
                    for (; h;) c = h.nodeName.toUpperCase(), ("TD" == c || "TH" == c) && (n(h), g.push(h)), h = h.nextSibling;
                else {
                    g = b.anCells;
                    for (var o = 0, p = g.length; p > o; o++) n(g[o])
                }
                return {
                    data: l,
                    cells: g
                }
            }

            function I(a, c, d, e) {
                var f, g, h, i, j, k = a.aoData[c],
                    l = k._aData,
                    m = [];
                if (null === k.nTr) {
                    for (f = d || b.createElement("tr"), k.nTr = f, k.anCells = m, f._DT_RowIndex = c, J(k), i = 0, j = a.aoColumns.length; j > i; i++) h = a.aoColumns[i], g = d ? e[i] : b.createElement(h.sCellType), m.push(g), (!d || h.mRender || h.mData !== i) && (g.innerHTML = y(a, c, i, "display")), h.sClass && (g.className += " " + h.sClass), h.bVisible && !d ? f.appendChild(g) : !h.bVisible && d && g.parentNode.removeChild(g), h.fnCreatedCell && h.fnCreatedCell.call(a.oInstance, g, y(a, c, i), l, c, i);
                    Pa(a, "aoRowCreatedCallback", null, [f, l, c])
                }
                k.nTr.setAttribute("role", "row")
            }

            function J(a) {
                var b = a.nTr,
                    c = a._aData;
                if (b) {
                    if (c.DT_RowId && (b.id = c.DT_RowId), c.DT_RowClass) {
                        var e = c.DT_RowClass.split(" ");
                        a.__rowc = a.__rowc ? qb(a.__rowc.concat(e)) : e, d(b).removeClass(a.__rowc.join(" ")).addClass(c.DT_RowClass)
                    }
                    c.DT_RowData && d(b).data(c.DT_RowData)
                }
            }

            function K(a) {
                var b, c, e, f, g, h = a.nTHead,
                    i = a.nTFoot,
                    j = 0 === d("th, td", h).length,
                    k = a.oClasses,
                    l = a.aoColumns;
                for (j && (f = d("<tr/>").appendTo(h)), b = 0, c = l.length; c > b; b++) g = l[b], e = d(g.nTh).addClass(g.sClass), j && e.appendTo(f), a.oFeatures.bSort && (e.addClass(g.sSortingClass), g.bSortable !== !1 && (e.attr("tabindex", a.iTabIndex).attr("aria-controls", a.sTableId), Ea(a, g.nTh, b))), g.sTitle != e.html() && e.html(g.sTitle), Ra(a, "header")(a, e, g, k);
                if (j && P(a.aoHeader, h), d(h).find(">tr").attr("role", "row"), d(h).find(">tr>th, >tr>td").addClass(k.sHeaderTH), d(i).find(">tr>th, >tr>td").addClass(k.sFooterTH), null !== i) {
                    var m = a.aoFooter[0];
                    for (b = 0, c = m.length; c > b; b++) g = l[b], g.nTf = m[b].cell, g.sClass && d(g.nTf).addClass(g.sClass)
                }
            }

            function L(a, b, e) {
                var f, g, h, i, j, k, l, m, n, o = [],
                    p = [],
                    q = a.aoColumns.length;
                if (b) {
                    for (e === c && (e = !1), f = 0, g = b.length; g > f; f++) {
                        for (o[f] = b[f].slice(), o[f].nTr = b[f].nTr, h = q - 1; h >= 0; h--) a.aoColumns[h].bVisible || e || o[f].splice(h, 1);
                        p.push([])
                    }
                    for (f = 0, g = o.length; g > f; f++) {
                        if (l = o[f].nTr)
                            for (; k = l.firstChild;) l.removeChild(k);
                        for (h = 0, i = o[f].length; i > h; h++)
                            if (m = 1, n = 1, p[f][h] === c) {
                                for (l.appendChild(o[f][h].cell), p[f][h] = 1; o[f + m] !== c && o[f][h].cell == o[f + m][h].cell;) p[f + m][h] = 1, m++;
                                for (; o[f][h + n] !== c && o[f][h].cell == o[f][h + n].cell;) {
                                    for (j = 0; m > j; j++) p[f + j][h + n] = 1;
                                    n++
                                }
                                d(o[f][h].cell).attr("rowspan", m).attr("colspan", n)
                            }
                    }
                }
            }

            function M(a) {
                var b = Pa(a, "aoPreDrawCallback", "preDraw", [a]);
                if (-1 !== d.inArray(!1, b)) return void oa(a, !1);
                var e = [],
                    f = 0,
                    g = a.asStripeClasses,
                    h = g.length,
                    i = (a.aoOpenRows.length, a.oLanguage),
                    j = a.iInitDisplayStart,
                    k = "ssp" == Sa(a),
                    l = a.aiDisplay;
                a.bDrawing = !0, j !== c && -1 !== j && (a._iDisplayStart = k ? j : j >= a.fnRecordsDisplay() ? 0 : j, a.iInitDisplayStart = -1);
                var m = a._iDisplayStart,
                    n = a.fnDisplayEnd();
                if (a.bDeferLoading) a.bDeferLoading = !1, a.iDraw++, oa(a, !1);
                else if (k) {
                    if (!a.bDestroying && !S(a)) return
                } else a.iDraw++;
                if (0 !== l.length)
                    for (var o = k ? 0 : m, p = k ? a.aoData.length : n, r = o; p > r; r++) {
                        var s = l[r],
                            t = a.aoData[s];
                        null === t.nTr && I(a, s);
                        var u = t.nTr;
                        if (0 !== h) {
                            var v = g[f % h];
                            t._sRowStripe != v && (d(u).removeClass(t._sRowStripe).addClass(v), t._sRowStripe = v)
                        }
                        Pa(a, "aoRowCallback", null, [u, t._aData, f, r]), e.push(u), f++
                    } else {
                        var w = i.sZeroRecords;
                        1 == a.iDraw && "ajax" == Sa(a) ? w = i.sLoadingRecords : i.sEmptyTable && 0 === a.fnRecordsTotal() && (w = i.sEmptyTable), e[0] = d("<tr/>", {
                            "class": h ? g[0] : ""
                        }).append(d("<td />", {
                            valign: "top",
                            colSpan: q(a),
                            "class": a.oClasses.sRowEmpty
                        }).html(w))[0]
                    }
                Pa(a, "aoHeaderCallback", "header", [d(a.nTHead).children("tr")[0], D(a), m, n, l]), Pa(a, "aoFooterCallback", "footer", [d(a.nTFoot).children("tr")[0], D(a), m, n, l]);
                var x = d(a.nTBody);
                x.children().detach(), x.append(d(e)), Pa(a, "aoDrawCallback", "draw", [a]), a.bSorted = !1, a.bFiltered = !1, a.bDrawing = !1
            }

            function N(a, b) {
                var c = a.oFeatures,
                    d = c.bSort,
                    e = c.bFilter;
                d && Ba(a), e ? X(a, a.oPreviousSearch) : a.aiDisplay = a.aiDisplayMaster.slice(), b !== !0 && (a._iDisplayStart = 0), a._drawHold = b, M(a), a._drawHold = !1
            }

            function O(a) {
                var b = a.oClasses,
                    c = d(a.nTable),
                    e = d("<div/>").insertBefore(c),
                    f = a.oFeatures,
                    g = d("<div/>", {
                        id: a.sTableId + "_wrapper",
                        "class": b.sWrapper + (a.nTFoot ? "" : " " + b.sNoFooter)
                    });
                a.nHolding = e[0], a.nTableWrapper = g[0], a.nTableReinsertBefore = a.nTable.nextSibling;
                for (var h, i, j, k, l, m, n = a.sDom.split(""), o = 0; o < n.length; o++) {
                    if (h = null, i = n[o], "<" == i) {
                        if (j = d("<div/>")[0], k = n[o + 1], "'" == k || '"' == k) {
                            for (l = "", m = 2; n[o + m] != k;) l += n[o + m], m++;
                            if ("H" == l ? l = b.sJUIHeader : "F" == l && (l = b.sJUIFooter), -1 != l.indexOf(".")) {
                                var p = l.split(".");
                                j.id = p[0].substr(1, p[0].length - 1), j.className = p[1]
                            } else "#" == l.charAt(0) ? j.id = l.substr(1, l.length - 1) : j.className = l;
                            o += m
                        }
                        g.append(j), g = d(j)
                    } else if (">" == i) g = g.parent();
                    else if ("l" == i && f.bPaginate && f.bLengthChange) h = ka(a);
                    else if ("f" == i && f.bFilter) h = W(a);
                    else if ("r" == i && f.bProcessing) h = na(a);
                    else if ("t" == i) h = pa(a);
                    else if ("i" == i && f.bInfo) h = ea(a);
                    else if ("p" == i && f.bPaginate) h = la(a);
                    else if (0 !== Wa.ext.feature.length)
                        for (var q = Wa.ext.feature, r = 0, s = q.length; s > r; r++)
                            if (i == q[r].cFeature) {
                                h = q[r].fnInit(a);
                                break
                            }
                    if (h) {
                        var t = a.aanFeatures;
                        t[i] || (t[i] = []), t[i].push(h), g.append(h)
                    }
                }
                e.replaceWith(g)
            }

            function P(a, b) {
                var c, e, f, g, h, i, j, k, l, m, n, o = d(b).children("tr"),
                    p = function(a, b, c) {
                        for (var d = a[b]; d[c];) c++;
                        return c
                    };
                for (a.splice(0, a.length), f = 0, i = o.length; i > f; f++) a.push([]);
                for (f = 0, i = o.length; i > f; f++)
                    for (c = o[f], k = 0, e = c.firstChild; e;) {
                        if ("TD" == e.nodeName.toUpperCase() || "TH" == e.nodeName.toUpperCase())
                            for (l = 1 * e.getAttribute("colspan"), m = 1 * e.getAttribute("rowspan"), l = l && 0 !== l && 1 !== l ? l : 1, m = m && 0 !== m && 1 !== m ? m : 1, j = p(a, f, k), n = 1 === l ? !0 : !1, h = 0; l > h; h++)
                                for (g = 0; m > g; g++) a[f + g][j + h] = {
                                    cell: e,
                                    unique: n
                                }, a[f + g].nTr = c;
                        e = e.nextSibling
                    }
            }

            function Q(a, b, c) {
                var d = [];
                c || (c = a.aoHeader, b && (c = [], P(c, b)));
                for (var e = 0, f = c.length; f > e; e++)
                    for (var g = 0, h = c[e].length; h > g; g++) !c[e][g].unique || d[g] && a.bSortCellsTop || (d[g] = c[e][g].cell);
                return d
            }

            function R(a, b, c) {
                if (Pa(a, "aoServerParams", "serverParams", [b]), b && d.isArray(b)) {
                    var e = {},
                        f = /(.*?)\[\]$/;
                    d.each(b, function(a, b) {
                        var c = b.name.match(f);
                        if (c) {
                            var d = c[0];
                            e[d] || (e[d] = []), e[d].push(b.value)
                        } else e[b.name] = b.value
                    }), b = e
                }
                var g, h = a.ajax,
                    i = a.oInstance;
                if (d.isPlainObject(h) && h.data) {
                    g = h.data;
                    var j = d.isFunction(g) ? g(b) : g;
                    b = d.isFunction(g) && j ? j : d.extend(!0, b, j), delete h.data
                }
                var k = {
                    data: b,
                    success: function(b) {
                        var d = b.error || b.sError;
                        d && a.oApi._fnLog(a, 0, d), a.json = b, Pa(a, null, "xhr", [a, b]), c(b)
                    },
                    dataType: "json",
                    cache: !1,
                    type: a.sServerMethod,
                    error: function(b, c, d) {
                        var e = a.oApi._fnLog;
                        "parsererror" == c ? e(a, 0, "Invalid JSON response", 1) : 4 === b.readyState && e(a, 0, "Ajax error", 7), oa(a, !1)
                    }
                };
                a.oAjaxData = b, Pa(a, null, "preXhr", [a, b]), a.fnServerData ? a.fnServerData.call(i, a.sAjaxSource, d.map(b, function(a, b) {
                    return {
                        name: b,
                        value: a
                    }
                }), c, a) : a.sAjaxSource || "string" == typeof h ? a.jqXHR = d.ajax(d.extend(k, {
                    url: h || a.sAjaxSource
                })) : d.isFunction(h) ? a.jqXHR = h.call(i, b, c, a) : (a.jqXHR = d.ajax(d.extend(k, h)), h.data = g)
            }

            function S(a) {
                return a.bAjaxDataGet ? (a.iDraw++, oa(a, !0), R(a, T(a), function(b) {
                    U(a, b)
                }), !1) : !0
            }

            function T(a) {
                var b, c, e, f, g = a.aoColumns,
                    h = g.length,
                    i = a.oFeatures,
                    j = a.oPreviousSearch,
                    k = a.aoPreSearchCols,
                    l = [],
                    m = Aa(a),
                    n = a._iDisplayStart,
                    o = i.bPaginate !== !1 ? a._iDisplayLength : -1,
                    p = function(a, b) {
                        l.push({
                            name: a,
                            value: b
                        })
                    };
                p("sEcho", a.iDraw), p("iColumns", h), p("sColumns", mb(g, "sName").join(",")), p("iDisplayStart", n), p("iDisplayLength", o);
                var q = {
                    draw: a.iDraw,
                    columns: [],
                    order: [],
                    start: n,
                    length: o,
                    search: {
                        value: j.sSearch,
                        regex: j.bRegex
                    }
                };
                for (b = 0; h > b; b++) e = g[b], f = k[b], c = "function" == typeof e.mData ? "function" : e.mData, q.columns.push({
                    data: c,
                    name: e.sName,
                    searchable: e.bSearchable,
                    orderable: e.bSortable,
                    search: {
                        value: f.sSearch,
                        regex: f.bRegex
                    }
                }), p("mDataProp_" + b, c), i.bFilter && (p("sSearch_" + b, f.sSearch), p("bRegex_" + b, f.bRegex), p("bSearchable_" + b, e.bSearchable)), i.bSort && p("bSortable_" + b, e.bSortable);
                i.bFilter && (p("sSearch", j.sSearch), p("bRegex", j.bRegex)), i.bSort && (d.each(m, function(a, b) {
                    q.order.push({
                        column: b.col,
                        dir: b.dir
                    }), p("iSortCol_" + a, b.col), p("sSortDir_" + a, b.dir)
                }), p("iSortingCols", m.length));
                var r = Wa.ext.legacy.ajax;
                return null === r ? a.sAjaxSource ? l : q : r ? l : q
            }

            function U(a, b) {
                var d = function(a, d) {
                        return b[a] !== c ? b[a] : b[d]
                    },
                    e = d("sEcho", "draw"),
                    f = d("iTotalRecords", "recordsTotal"),
                    g = d("iTotalDisplayRecords", "recordsFiltered");
                if (e) {
                    if (1 * e < a.iDraw) return;
                    a.iDraw = 1 * e
                }
                E(a), a._iRecordsTotal = parseInt(f, 10), a._iRecordsDisplay = parseInt(g, 10);
                for (var h = V(a, b), i = 0, j = h.length; j > i; i++) u(a, h[i]);
                a.aiDisplay = a.aiDisplayMaster.slice(), a.bAjaxDataGet = !1, M(a), a._bInitComplete || ia(a, b), a.bAjaxDataGet = !0, oa(a, !1)
            }

            function V(a, b) {
                var e = d.isPlainObject(a.ajax) && a.ajax.dataSrc !== c ? a.ajax.dataSrc : a.sAjaxDataProp;
                return "data" === e ? b.aaData || b[e] : "" !== e ? B(e)(b) : b
            }

            function W(a) {
                var c = a.oClasses,
                    e = a.sTableId,
                    f = a.oLanguage,
                    g = a.oPreviousSearch,
                    h = a.aanFeatures,
                    i = '<input type="search" class="' + c.sFilterInput + '"/>',
                    j = f.sSearch;
                j = j.match(/_INPUT_/) ? j.replace("_INPUT_", i) : j + i;
                var k = d("<div/>", {
                        id: h.f ? null : e + "_filter",
                        "class": c.sFilter
                    }).append(d("<label/>").append(j)),
                    l = function() {
                        var b = (h.f, this.value ? this.value : "");
                        b != g.sSearch && (X(a, {
                            sSearch: b,
                            bRegex: g.bRegex,
                            bSmart: g.bSmart,
                            bCaseInsensitive: g.bCaseInsensitive
                        }), a._iDisplayStart = 0, M(a))
                    },
                    m = null !== a.searchDelay ? a.searchDelay : "ssp" === Sa(a) ? 400 : 0,
                    n = d("input", k).val(g.sSearch).attr("placeholder", f.sSearchPlaceholder).bind("keyup.DT search.DT input.DT paste.DT cut.DT", m ? ta(l, m) : l).bind("keypress.DT", function(a) {
                        return 13 == a.keyCode ? !1 : void 0
                    }).attr("aria-controls", e);
                return d(a.nTable).on("search.dt.DT", function(c, d) {
                    if (a === d) try {
                        n[0] !== b.activeElement && n.val(g.sSearch)
                    } catch (e) {}
                }), k[0]
            }

            function X(a, b, d) {
                var e = a.oPreviousSearch,
                    f = a.aoPreSearchCols,
                    g = function(a) {
                        e.sSearch = a.sSearch, e.bRegex = a.bRegex, e.bSmart = a.bSmart, e.bCaseInsensitive = a.bCaseInsensitive
                    },
                    h = function(a) {
                        return a.bEscapeRegex !== c ? !a.bEscapeRegex : a.bRegex
                    };
                if (s(a), "ssp" != Sa(a)) {
                    $(a, b.sSearch, d, h(b), b.bSmart, b.bCaseInsensitive), g(b);
                    for (var i = 0; i < f.length; i++) Z(a, f[i].sSearch, i, h(f[i]), f[i].bSmart, f[i].bCaseInsensitive);
                    Y(a)
                } else g(b);
                a.bFiltered = !0, Pa(a, null, "search", [a])
            }

            function Y(a) {
                for (var b, c, d = Wa.ext.search, e = a.aiDisplay, f = 0, g = d.length; g > f; f++) {
                    for (var h = [], i = 0, j = e.length; j > i; i++) c = e[i], b = a.aoData[c], d[f](a, b._aFilterData, c, b._aData, i) && h.push(c);
                    e.length = 0, e.push.apply(e, h)
                }
            }

            function Z(a, b, c, d, e, f) {
                if ("" !== b)
                    for (var g, h = a.aiDisplay, i = _(b, d, e, f), j = h.length - 1; j >= 0; j--) g = a.aoData[h[j]]._aFilterData[c], i.test(g) || h.splice(j, 1)
            }

            function $(a, b, c, d, e, f) {
                var g, h, i, j = _(b, d, e, f),
                    k = a.oPreviousSearch.sSearch,
                    l = a.aiDisplayMaster;
                if (0 !== Wa.ext.search.length && (c = !0), h = ba(a), b.length <= 0) a.aiDisplay = l.slice();
                else
                    for ((h || c || k.length > b.length || 0 !== b.indexOf(k) || a.bSorted) && (a.aiDisplay = l.slice()), g = a.aiDisplay, i = g.length - 1; i >= 0; i--) j.test(a.aoData[g[i]]._sFilterRow) || g.splice(i, 1)
            }

            function _(a, b, c, e) {
                if (a = b ? a : aa(a), c) {
                    var f = d.map(a.match(/"[^"]+"|[^ ]+/g) || "", function(a) {
                        if ('"' === a.charAt(0)) {
                            var b = a.match(/^"(.*)"$/);
                            a = b ? b[1] : a
                        }
                        return a.replace('"', "")
                    });
                    a = "^(?=.*?" + f.join(")(?=.*?") + ").*$"
                }
                return new RegExp(a, e ? "i" : "")
            }

            function aa(a) {
                return a.replace(eb, "\\$1")
            }

            function ba(a) {
                var b, c, d, e, f, g, h, i, j = a.aoColumns,
                    k = Wa.ext.type.search,
                    l = !1;
                for (c = 0, e = a.aoData.length; e > c; c++)
                    if (i = a.aoData[c], !i._aFilterData) {
                        for (g = [], d = 0, f = j.length; f > d; d++) b = j[d], b.bSearchable ? (h = y(a, c, d, "filter"), k[b.sType] && (h = k[b.sType](h)), null === h && (h = ""), "string" != typeof h && h.toString && (h = h.toString())) : h = "", h.indexOf && -1 !== h.indexOf("&") && (ub.innerHTML = h, h = vb ? ub.textContent : ub.innerText), h.replace && (h = h.replace(/[\r\n]/g, "")), g.push(h);
                        i._aFilterData = g, i._sFilterRow = g.join("  "), l = !0
                    }
                return l
            }

            function ca(a) {
                return {
                    search: a.sSearch,
                    smart: a.bSmart,
                    regex: a.bRegex,
                    caseInsensitive: a.bCaseInsensitive
                }
            }

            function da(a) {
                return {
                    sSearch: a.search,
                    bSmart: a.smart,
                    bRegex: a.regex,
                    bCaseInsensitive: a.caseInsensitive
                }
            }

            function ea(a) {
                var b = a.sTableId,
                    c = a.aanFeatures.i,
                    e = d("<div/>", {
                        "class": a.oClasses.sInfo,
                        id: c ? null : b + "_info"
                    });
                return c || (a.aoDrawCallback.push({
                    fn: fa,
                    sName: "information"
                }), e.attr("role", "status").attr("aria-live", "polite"), d(a.nTable).attr("aria-describedby", b + "_info")), e[0]
            }

            function fa(a) {
                var b = a.aanFeatures.i;
                if (0 !== b.length) {
                    var c = a.oLanguage,
                        e = a._iDisplayStart + 1,
                        f = a.fnDisplayEnd(),
                        g = a.fnRecordsTotal(),
                        h = a.fnRecordsDisplay(),
                        i = h ? c.sInfo : c.sInfoEmpty;
                    h !== g && (i += " " + c.sInfoFiltered), i += c.sInfoPostFix, i = ga(a, i);
                    var j = c.fnInfoCallback;
                    null !== j && (i = j.call(a.oInstance, a, e, f, g, h, i)), d(b).html(i)
                }
            }

            function ga(a, b) {
                var c = a.fnFormatNumber,
                    d = a._iDisplayStart + 1,
                    e = a._iDisplayLength,
                    f = a.fnRecordsDisplay(),
                    g = -1 === e;
                return b.replace(/_START_/g, c.call(a, d)).replace(/_END_/g, c.call(a, a.fnDisplayEnd())).replace(/_MAX_/g, c.call(a, a.fnRecordsTotal())).replace(/_TOTAL_/g, c.call(a, f)).replace(/_PAGE_/g, c.call(a, g ? 1 : Math.ceil(d / e))).replace(/_PAGES_/g, c.call(a, g ? 1 : Math.ceil(f / e)))
            }

            function ha(a) {
                var b, c, d, e = a.iInitDisplayStart,
                    f = a.aoColumns,
                    g = a.oFeatures;
                if (!a.bInitialised) return void setTimeout(function() {
                    ha(a)
                }, 200);
                for (O(a), K(a), L(a, a.aoHeader), L(a, a.aoFooter), oa(a, !0), g.bAutoWidth && sa(a), b = 0, c = f.length; c > b; b++) d = f[b], d.sWidth && (d.nTh.style.width = ya(d.sWidth));
                N(a);
                var h = Sa(a);
                "ssp" != h && ("ajax" == h ? R(a, [], function(c) {
                    var d = V(a, c);
                    for (b = 0; b < d.length; b++) u(a, d[b]);
                    a.iInitDisplayStart = e, N(a), oa(a, !1), ia(a, c)
                }, a) : (oa(a, !1), ia(a)))
            }

            function ia(a, b) {
                a._bInitComplete = !0, b && n(a), Pa(a, "aoInitComplete", "init", [a, b])
            }

            function ja(a, b) {
                var c = parseInt(b, 10);
                a._iDisplayLength = c, Qa(a), Pa(a, null, "length", [a, c])
            }

            function ka(a) {
                for (var b = a.oClasses, c = a.sTableId, e = a.aLengthMenu, f = d.isArray(e[0]), g = f ? e[0] : e, h = f ? e[1] : e, i = d("<select/>", {
                        name: c + "_length",
                        "aria-controls": c,
                        "class": b.sLengthSelect
                    }), j = 0, k = g.length; k > j; j++) i[0][j] = new Option(h[j], g[j]);
                var l = d("<div><label/></div>").addClass(b.sLength);
                return a.aanFeatures.l || (l[0].id = c + "_length"), l.children().append(a.oLanguage.sLengthMenu.replace("_MENU_", i[0].outerHTML)), d("select", l).val(a._iDisplayLength).bind("change.DT", function(b) {
                    ja(a, d(this).val()), M(a)
                }), d(a.nTable).bind("length.dt.DT", function(b, c, e) {
                    a === c && d("select", l).val(e)
                }), l[0]
            }

            function la(a) {
                var b = a.sPaginationType,
                    c = Wa.ext.pager[b],
                    e = "function" == typeof c,
                    f = function(a) {
                        M(a)
                    },
                    g = d("<div/>").addClass(a.oClasses.sPaging + b)[0],
                    h = a.aanFeatures;
                return e || c.fnInit(a, g, f), h.p || (g.id = a.sTableId + "_paginate", a.aoDrawCallback.push({
                    fn: function(a) {
                        if (e) {
                            var b, d, g = a._iDisplayStart,
                                i = a._iDisplayLength,
                                j = a.fnRecordsDisplay(),
                                k = -1 === i,
                                l = k ? 0 : Math.ceil(g / i),
                                m = k ? 1 : Math.ceil(j / i),
                                n = c(l, m);
                            for (b = 0, d = h.p.length; d > b; b++) Ra(a, "pageButton")(a, h.p[b], b, n, l, m)
                        } else c.fnUpdate(a, f)
                    },
                    sName: "pagination"
                })), g
            }

            function ma(a, b, c) {
                var d = a._iDisplayStart,
                    e = a._iDisplayLength,
                    f = a.fnRecordsDisplay();
                0 === f || -1 === e ? d = 0 : "number" == typeof b ? (d = b * e, d > f && (d = 0)) : "first" == b ? d = 0 : "previous" == b ? (d = e >= 0 ? d - e : 0, 0 > d && (d = 0)) : "next" == b ? f > d + e && (d += e) : "last" == b ? d = Math.floor((f - 1) / e) * e : Ka(a, 0, "Unknown paging action: " + b, 5);
                var g = a._iDisplayStart !== d;
                return a._iDisplayStart = d, g && (Pa(a, null, "page", [a]), c && M(a)), g
            }

            function na(a) {
                return d("<div/>", {
                    id: a.aanFeatures.r ? null : a.sTableId + "_processing",
                    "class": a.oClasses.sProcessing
                }).html(a.oLanguage.sProcessing).insertBefore(a.nTable)[0]
            }

            function oa(a, b) {
                a.oFeatures.bProcessing && d(a.aanFeatures.r).css("display", b ? "block" : "none"), Pa(a, null, "processing", [a, b])
            }

            function pa(a) {
                var b = d(a.nTable);
                b.attr("role", "grid");
                var c = a.oScroll;
                if ("" === c.sX && "" === c.sY) return a.nTable;
                var e = c.sX,
                    f = c.sY,
                    g = a.oClasses,
                    h = b.children("caption"),
                    i = h.length ? h[0]._captionSide : null,
                    j = d(b[0].cloneNode(!1)),
                    k = d(b[0].cloneNode(!1)),
                    l = b.children("tfoot"),
                    m = "<div/>",
                    n = function(a) {
                        return a ? ya(a) : null
                    };
                c.sX && "100%" === b.attr("width") && b.removeAttr("width"), l.length || (l = null);
                var o = d(m, {
                    "class": g.sScrollWrapper
                }).append(d(m, {
                    "class": g.sScrollHead
                }).css({
                    overflow: "hidden",
                    position: "relative",
                    border: 0,
                    width: e ? n(e) : "100%"
                }).append(d(m, {
                    "class": g.sScrollHeadInner
                }).css({
                    "box-sizing": "content-box",
                    width: c.sXInner || "100%"
                }).append(j.removeAttr("id").css("margin-left", 0).append(b.children("thead")))).append("top" === i ? h : null)).append(d(m, {
                    "class": g.sScrollBody
                }).css({
                    overflow: "auto",
                    height: n(f),
                    width: n(e)
                }).append(b));
                l && o.append(d(m, {
                    "class": g.sScrollFoot
                }).css({
                    overflow: "hidden",
                    border: 0,
                    width: e ? n(e) : "100%"
                }).append(d(m, {
                    "class": g.sScrollFootInner
                }).append(k.removeAttr("id").css("margin-left", 0).append(b.children("tfoot")))).append("bottom" === i ? h : null));
                var p = o.children(),
                    q = p[0],
                    r = p[1],
                    s = l ? p[2] : null;
                return e && d(r).scroll(function(a) {
                    var b = this.scrollLeft;
                    q.scrollLeft = b, l && (s.scrollLeft = b)
                }), a.nScrollHead = q, a.nScrollBody = r, a.nScrollFoot = s, a.aoDrawCallback.push({
                    fn: qa,
                    sName: "scrolling"
                }), o[0]
            }

            function qa(a) {
                var b, c, e, f, g, h, i, j, k, l = a.oScroll,
                    m = l.sX,
                    n = l.sXInner,
                    p = l.sY,
                    q = l.iBarWidth,
                    r = d(a.nScrollHead),
                    s = r[0].style,
                    t = r.children("div"),
                    u = t[0].style,
                    v = t.children("table"),
                    w = a.nScrollBody,
                    x = d(w),
                    y = w.style,
                    z = d(a.nScrollFoot),
                    A = z.children("div"),
                    B = A.children("table"),
                    C = d(a.nTHead),
                    D = d(a.nTable),
                    E = D[0],
                    F = E.style,
                    G = a.nTFoot ? d(a.nTFoot) : null,
                    H = a.oBrowser,
                    I = H.bScrollOversize,
                    J = [],
                    K = [],
                    L = [],
                    M = function(a) {
                        var b = a.style;
                        b.paddingTop = "0", b.paddingBottom = "0", b.borderTopWidth = "0", b.borderBottomWidth = "0", b.height = 0
                    };
                if (D.children("thead, tfoot").remove(), g = C.clone().prependTo(D), b = C.find("tr"), e = g.find("tr"), g.find("th, td").removeAttr("tabindex"), G && (h = G.clone().prependTo(D), c = G.find("tr"), f = h.find("tr")), m || (y.width = "100%", r[0].style.width = "100%"), d.each(Q(a, g), function(b, c) {
                        i = o(a, b), c.style.width = a.aoColumns[i].sWidth
                    }), G && ra(function(a) {
                        a.style.width = ""
                    }, f), l.bCollapse && "" !== p && (y.height = x[0].offsetHeight + C[0].offsetHeight + "px"), k = D.outerWidth(), "" === m ? (F.width = "100%", I && (D.find("tbody").height() > w.offsetHeight || "scroll" == x.css("overflow-y")) && (F.width = ya(D.outerWidth() - q))) : "" !== n ? F.width = ya(n) : k == x.width() && x.height() < D.height() ? (F.width = ya(k - q), D.outerWidth() > k - q && (F.width = ya(k))) : F.width = ya(k), k = D.outerWidth(), ra(M, e), ra(function(a) {
                        L.push(a.innerHTML), J.push(ya(d(a).css("width")))
                    }, e), ra(function(a, b) {
                        a.style.width = J[b]
                    }, b), d(e).height(0), G && (ra(M, f), ra(function(a) {
                        K.push(ya(d(a).css("width")))
                    }, f), ra(function(a, b) {
                        a.style.width = K[b]
                    }, c), d(f).height(0)), ra(function(a, b) {
                        a.innerHTML = '<div class="dataTables_sizing" style="height:0;overflow:hidden;">' + L[b] + "</div>", a.style.width = J[b]
                    }, e), G && ra(function(a, b) {
                        a.innerHTML = "", a.style.width = K[b]
                    }, f), D.outerWidth() < k ? (j = w.scrollHeight > w.offsetHeight || "scroll" == x.css("overflow-y") ? k + q : k, I && (w.scrollHeight > w.offsetHeight || "scroll" == x.css("overflow-y")) && (F.width = ya(j - q)), ("" === m || "" !== n) && Ka(a, 1, "Possible column misalignment", 6)) : j = "100%", y.width = ya(j), s.width = ya(j), G && (a.nScrollFoot.style.width = ya(j)), p || I && (y.height = ya(E.offsetHeight + q)), p && l.bCollapse) {
                    y.height = ya(p);
                    var N = m && E.offsetWidth > w.offsetWidth ? q : 0;
                    E.offsetHeight < w.offsetHeight && (y.height = ya(E.offsetHeight + N))
                }
                var O = D.outerWidth();
                v[0].style.width = ya(O), u.width = ya(O);
                var P = D.height() > w.clientHeight || "scroll" == x.css("overflow-y"),
                    R = "padding" + (H.bScrollbarLeft ? "Left" : "Right");
                u[R] = P ? q + "px" : "0px", G && (B[0].style.width = ya(O), A[0].style.width = ya(O), A[0].style[R] = P ? q + "px" : "0px"), x.scroll(), !a.bSorted && !a.bFiltered || a._drawHold || (w.scrollTop = 0)
            }

            function ra(a, b, c) {
                for (var d, e, f = 0, g = 0, h = b.length; h > g;) {
                    for (d = b[g].firstChild, e = c ? c[g].firstChild : null; d;) 1 === d.nodeType && (c ? a(d, e, f) : a(d, f), f++), d = d.nextSibling, e = c ? e.nextSibling : null;
                    g++
                }
            }

            function sa(b) {
                var c, e, f, g, h, i = b.nTable,
                    j = b.aoColumns,
                    k = b.oScroll,
                    l = k.sY,
                    m = k.sX,
                    o = k.sXInner,
                    p = j.length,
                    s = r(b, "bVisible"),
                    t = d("th", b.nTHead),
                    u = i.getAttribute("width"),
                    v = i.parentNode,
                    w = !1;
                for (c = 0; c < s.length; c++) e = j[s[c]], null !== e.sWidth && (e.sWidth = ua(e.sWidthOrig, v), w = !0);
                if (w || m || l || p != q(b) || p != t.length) {
                    var x = d(i).clone().empty().css("visibility", "hidden").removeAttr("id").append(d(b.nTHead).clone(!1)).append(d(b.nTFoot).clone(!1)).append(d("<tbody><tr/></tbody>"));
                    x.find("tfoot th, tfoot td").css("width", "");
                    var y = x.find("tbody tr");
                    for (t = Q(b, x.find("thead")[0]), c = 0; c < s.length; c++) e = j[s[c]], t[c].style.width = null !== e.sWidthOrig && "" !== e.sWidthOrig ? ya(e.sWidthOrig) : "";
                    if (b.aoData.length)
                        for (c = 0; c < s.length; c++) f = s[c], e = j[f], d(wa(b, f)).clone(!1).append(e.sContentPadding).appendTo(y);
                    if (x.appendTo(v), m && o ? x.width(o) : m ? (x.css("width", "auto"), x.width() < v.offsetWidth && x.width(v.offsetWidth)) : l ? x.width(v.offsetWidth) : u && x.width(u), va(b, x[0]), m) {
                        var z = 0;
                        for (c = 0; c < s.length; c++) e = j[s[c]], h = d(t[c]).outerWidth(), z += null === e.sWidthOrig ? h : parseInt(e.sWidth, 10) + h - d(t[c]).width();
                        x.width(ya(z)), i.style.width = ya(z)
                    }
                    for (c = 0; c < s.length; c++) e = j[s[c]], g = d(t[c]).width(), g && (e.sWidth = ya(g));
                    i.style.width = ya(x.css("width")), x.remove()
                } else
                    for (c = 0; p > c; c++) j[c].sWidth = ya(t.eq(c).width());
                u && (i.style.width = ya(u)), !u && !m || b._reszEvt || (d(a).bind("resize.DT-" + b.sInstance, ta(function() {
                    n(b)
                })), b._reszEvt = !0)
            }

            function ta(a, b) {
                var d, e, f = b !== c ? b : 200;
                return function() {
                    var b = this,
                        g = +new Date,
                        h = arguments;
                    d && d + f > g ? (clearTimeout(e), e = setTimeout(function() {
                        d = c, a.apply(b, h)
                    }, f)) : d ? (d = g, a.apply(b, h)) : d = g
                }
            }

            function ua(a, c) {
                if (!a) return 0;
                var e = d("<div/>").css("width", ya(a)).appendTo(c || b.body),
                    f = e[0].offsetWidth;
                return e.remove(), f
            }

            function va(a, b) {
                var c = a.oScroll;
                if (c.sX || c.sY) {
                    var e = c.sX ? 0 : c.iBarWidth;
                    b.style.width = ya(d(b).outerWidth() - e)
                }
            }

            function wa(a, b) {
                var c = xa(a, b);
                if (0 > c) return null;
                var e = a.aoData[c];
                return e.nTr ? e.anCells[b] : d("<td/>").html(y(a, c, b, "display"))[0]
            }

            function xa(a, b) {
                for (var c, d = -1, e = -1, f = 0, g = a.aoData.length; g > f; f++) c = y(a, f, b, "display") + "", c = c.replace(wb, ""), c.length > d && (d = c.length, e = f);
                return e
            }

            function ya(a) {
                return null === a ? "0px" : "number" == typeof a ? 0 > a ? "0px" : a + "px" : a.match(/\d$/) ? a + "px" : a
            }

            function za() {
                if (!Wa.__scrollbarWidth) {
                    var a = d("<p/>").css({
                            width: "100%",
                            height: 200,
                            padding: 0
                        })[0],
                        b = d("<div/>").css({
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 200,
                            height: 150,
                            padding: 0,
                            overflow: "hidden",
                            visibility: "hidden"
                        }).append(a).appendTo("body"),
                        c = a.offsetWidth;
                    b.css("overflow", "scroll");
                    var e = a.offsetWidth;
                    c === e && (e = b[0].clientWidth), b.remove(), Wa.__scrollbarWidth = c - e
                }
                return Wa.__scrollbarWidth
            }

            function Aa(a) {
                var b, e, f, g, h, i, j, k = [],
                    l = a.aoColumns,
                    m = a.aaSortingFixed,
                    n = d.isPlainObject(m),
                    o = [],
                    p = function(a) {
                        a.length && !d.isArray(a[0]) ? o.push(a) : o.push.apply(o, a)
                    };
                for (d.isArray(m) && p(m), n && m.pre && p(m.pre), p(a.aaSorting), n && m.post && p(m.post), b = 0; b < o.length; b++)
                    for (j = o[b][0], g = l[j].aDataSort, e = 0, f = g.length; f > e; e++) h = g[e], i = l[h].sType || "string", o[b]._idx === c && (o[b]._idx = d.inArray(o[b][1], l[h].asSorting)), k.push({
                        src: j,
                        col: h,
                        dir: o[b][1],
                        index: o[b]._idx,
                        type: i,
                        formatter: Wa.ext.type.order[i + "-pre"]
                    });
                return k
            }

            function Ba(a) {
                var b, c, d, e, f, g = [],
                    h = Wa.ext.type.order,
                    i = a.aoData,
                    j = (a.aoColumns, 0),
                    k = a.aiDisplayMaster;
                for (s(a), f = Aa(a), b = 0, c = f.length; c > b; b++) e = f[b], e.formatter && j++, Ga(a, e.col);
                if ("ssp" != Sa(a) && 0 !== f.length) {
                    for (b = 0, d = k.length; d > b; b++) g[k[b]] = b;
                    k.sort(j === f.length ? function(a, b) {
                        var c, d, e, h, j, k = f.length,
                            l = i[a]._aSortData,
                            m = i[b]._aSortData;
                        for (e = 0; k > e; e++)
                            if (j = f[e], c = l[j.col], d = m[j.col], h = d > c ? -1 : c > d ? 1 : 0, 0 !== h) return "asc" === j.dir ? h : -h;
                        return c = g[a], d = g[b], d > c ? -1 : c > d ? 1 : 0
                    } : function(a, b) {
                        var c, d, e, j, k, l, m = f.length,
                            n = i[a]._aSortData,
                            o = i[b]._aSortData;
                        for (e = 0; m > e; e++)
                            if (k = f[e], c = n[k.col], d = o[k.col], l = h[k.type + "-" + k.dir] || h["string-" + k.dir], j = l(c, d), 0 !== j) return j;
                        return c = g[a], d = g[b], d > c ? -1 : c > d ? 1 : 0
                    })
                }
                a.bSorted = !0
            }

            function Ca(a) {
                for (var b, c, d = a.aoColumns, e = Aa(a), f = a.oLanguage.oAria, g = 0, h = d.length; h > g; g++) {
                    var i = d[g],
                        j = i.asSorting,
                        k = i.sTitle.replace(/<.*?>/g, ""),
                        l = i.nTh;
                    l.removeAttribute("aria-sort"), i.bSortable ? (e.length > 0 && e[0].col == g ? (l.setAttribute("aria-sort", "asc" == e[0].dir ? "ascending" : "descending"), c = j[e[0].index + 1] || j[0]) : c = j[0], b = k + ("asc" === c ? f.sSortAscending : f.sSortDescending)) : b = k, l.setAttribute("aria-label", b)
                }
            }

            function Da(a, b, e, f) {
                var g, h = a.aoColumns[b],
                    i = a.aaSorting,
                    j = h.asSorting,
                    k = function(a, b) {
                        var e = a._idx;
                        return e === c && (e = d.inArray(a[1], j)), e + 1 < j.length ? e + 1 : b ? null : 0
                    };
                if ("number" == typeof i[0] && (i = a.aaSorting = [i]), e && a.oFeatures.bSortMulti) {
                    var l = d.inArray(b, mb(i, "0")); - 1 !== l ? (g = k(i[l], !0), null === g ? i.splice(l, 1) : (i[l][1] = j[g], i[l]._idx = g)) : (i.push([b, j[0], 0]), i[i.length - 1]._idx = 0)
                } else i.length && i[0][0] == b ? (g = k(i[0]), i.length = 1, i[0][1] = j[g], i[0]._idx = g) : (i.length = 0, i.push([b, j[0]]), i[0]._idx = 0);
                N(a), "function" == typeof f && f(a)
            }

            function Ea(a, b, c, d) {
                var e = a.aoColumns[c];
                Na(b, {}, function(b) {
                    e.bSortable !== !1 && (a.oFeatures.bProcessing ? (oa(a, !0), setTimeout(function() {
                        Da(a, c, b.shiftKey, d), "ssp" !== Sa(a) && oa(a, !1)
                    }, 0)) : Da(a, c, b.shiftKey, d))
                })
            }

            function Fa(a) {
                var b, c, e, f = a.aLastSort,
                    g = a.oClasses.sSortColumn,
                    h = Aa(a),
                    i = a.oFeatures;
                if (i.bSort && i.bSortClasses) {
                    for (b = 0, c = f.length; c > b; b++) e = f[b].src, d(mb(a.aoData, "anCells", e)).removeClass(g + (2 > b ? b + 1 : 3));
                    for (b = 0, c = h.length; c > b; b++) e = h[b].src, d(mb(a.aoData, "anCells", e)).addClass(g + (2 > b ? b + 1 : 3))
                }
                a.aLastSort = h
            }

            function Ga(a, b) {
                var c, d = a.aoColumns[b],
                    e = Wa.ext.order[d.sSortDataType];
                e && (c = e.call(a.oInstance, a, b, p(a, b)));
                for (var f, g, h = Wa.ext.type.order[d.sType + "-pre"], i = 0, j = a.aoData.length; j > i; i++) f = a.aoData[i], f._aSortData || (f._aSortData = []), (!f._aSortData[b] || e) && (g = e ? c[i] : y(a, i, b, "sort"), f._aSortData[b] = h ? h(g) : g)
            }

            function Ha(a) {
                if (a.oFeatures.bStateSave && !a.bDestroying) {
                    var b = {
                        time: +new Date,
                        start: a._iDisplayStart,
                        length: a._iDisplayLength,
                        order: d.extend(!0, [], a.aaSorting),
                        search: ca(a.oPreviousSearch),
                        columns: d.map(a.aoColumns, function(b, c) {
                            return {
                                visible: b.bVisible,
                                search: ca(a.aoPreSearchCols[c])
                            }
                        })
                    };
                    Pa(a, "aoStateSaveParams", "stateSaveParams", [a, b]), a.oSavedState = b, a.fnStateSaveCallback.call(a.oInstance, a, b)
                }
            }

            function Ia(a, b) {
                var c, e, f = a.aoColumns;
                if (a.oFeatures.bStateSave) {
                    var g = a.fnStateLoadCallback.call(a.oInstance, a);
                    if (g && g.time) {
                        var h = Pa(a, "aoStateLoadParams", "stateLoadParams", [a, g]);
                        if (-1 === d.inArray(!1, h)) {
                            var i = a.iStateDuration;
                            if (!(i > 0 && g.time < +new Date - 1e3 * i) && f.length === g.columns.length) {
                                for (a.oLoadedState = d.extend(!0, {}, g), a._iDisplayStart = g.start, a.iInitDisplayStart = g.start, a._iDisplayLength = g.length, a.aaSorting = [], d.each(g.order, function(b, c) {
                                        a.aaSorting.push(c[0] >= f.length ? [0, c[1]] : c)
                                    }), d.extend(a.oPreviousSearch, da(g.search)), c = 0, e = g.columns.length; e > c; c++) {
                                    var j = g.columns[c];
                                    f[c].bVisible = j.visible, d.extend(a.aoPreSearchCols[c], da(j.search))
                                }
                                Pa(a, "aoStateLoaded", "stateLoaded", [a, g])
                            }
                        }
                    }
                }
            }

            function Ja(a) {
                var b = Wa.settings,
                    c = d.inArray(a, mb(b, "nTable"));
                return -1 !== c ? b[c] : null
            }

            function Ka(b, c, d, e) {
                if (d = "DataTables warning: " + (null !== b ? "table id=" + b.sTableId + " - " : "") + d, e && (d += ". For more information about this error, please see http://datatables.net/tn/" + e), c) a.console && console.log && console.log(d);
                else {
                    var f = Wa.ext,
                        g = f.sErrMode || f.errMode;
                    if ("alert" != g) throw new Error(d);
                    alert(d)
                }
            }

            function La(a, b, e, f) {
                return d.isArray(e) ? void d.each(e, function(c, e) {
                    d.isArray(e) ? La(a, b, e[0], e[1]) : La(a, b, e)
                }) : (f === c && (f = e), void(b[e] !== c && (a[f] = b[e])))
            }

            function Ma(a, b, c) {
                var e;
                for (var f in b) b.hasOwnProperty(f) && (e = b[f], d.isPlainObject(e) ? (d.isPlainObject(a[f]) || (a[f] = {}), d.extend(!0, a[f], e)) : a[f] = c && "data" !== f && "aaData" !== f && d.isArray(e) ? e.slice() : e);
                return a
            }

            function Na(a, b, c) {
                d(a).bind("click.DT", b, function(b) {
                    a.blur(), c(b)
                }).bind("keypress.DT", b, function(a) {
                    13 === a.which && (a.preventDefault(), c(a))
                }).bind("selectstart.DT", function() {
                    return !1
                })
            }

            function Oa(a, b, c, d) {
                c && a[b].push({
                    fn: c,
                    sName: d
                })
            }

            function Pa(a, b, c, e) {
                var f = [];
                return b && (f = d.map(a[b].slice().reverse(), function(b, c) {
                    return b.fn.apply(a.oInstance, e)
                })), null !== c && d(a.nTable).trigger(c + ".dt", e), f
            }

            function Qa(a) {
                var b = a._iDisplayStart,
                    c = a.fnDisplayEnd(),
                    d = a._iDisplayLength;
                b >= c && (b = c - d), (-1 === d || 0 > b) && (b = 0), a._iDisplayStart = b
            }

            function Ra(a, b) {
                var c = a.renderer,
                    e = Wa.ext.renderer[b];
                return d.isPlainObject(c) && c[b] ? e[c[b]] || e._ : "string" == typeof c ? e[c] || e._ : e._
            }

            function Sa(a) {
                return a.oFeatures.bServerSide ? "ssp" : a.ajax || a.sAjaxSource ? "ajax" : "dom"
            }

            function Ta(a, b) {
                var c = [],
                    d = Tb.numbers_length,
                    e = Math.floor(d / 2);
                return d >= b ? c = ob(0, b) : e >= a ? (c = ob(0, d - 2), c.push("ellipsis"), c.push(b - 1)) : a >= b - 1 - e ? (c = ob(b - (d - 2), b), c.splice(0, 0, "ellipsis"), c.splice(0, 0, 0)) : (c = ob(a - 1, a + 2), c.push("ellipsis"), c.push(b - 1), c.splice(0, 0, "ellipsis"), c.splice(0, 0, 0)), c.DT_el = "span", c
            }

            function Ua(a) {
                d.each({
                    num: function(b) {
                        return Ub(b, a)
                    },
                    "num-fmt": function(b) {
                        return Ub(b, a, fb)
                    },
                    "html-num": function(b) {
                        return Ub(b, a, bb)
                    },
                    "html-num-fmt": function(b) {
                        return Ub(b, a, bb, fb)
                    }
                }, function(b, c) {
                    Xa.type.order[b + a + "-pre"] = c
                })
            }

            function Va(a) {
                return function() {
                    var b = [Ja(this[Wa.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));
                    return Wa.ext.internal[a].apply(this, b)
                }
            }
            var Wa, Xa, Ya, Za, $a, _a = {},
                ab = /[\r\n]/g,
                bb = /<.*?>/g,
                cb = /^[\w\+\-]/,
                db = /[\w\+\-]$/,
                eb = new RegExp("(\\" + ["/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^", "-"].join("|\\") + ")", "g"),
                fb = /[',$£€¥%\u2009\u202F]/g,
                gb = function(a) {
                    return a && a !== !0 && "-" !== a ? !1 : !0
                },
                hb = function(a) {
                    var b = parseInt(a, 10);
                    return !isNaN(b) && isFinite(a) ? b : null
                },
                ib = function(a, b) {
                    return _a[b] || (_a[b] = new RegExp(aa(b), "g")), "string" == typeof a && "." !== b ? a.replace(/\./g, "").replace(_a[b], ".") : a
                },
                jb = function(a, b, c) {
                    var d = "string" == typeof a;
                    return b && d && (a = ib(a, b)), c && d && (a = a.replace(fb, "")), gb(a) || !isNaN(parseFloat(a)) && isFinite(a)
                },
                kb = function(a) {
                    return gb(a) || "string" == typeof a
                },
                lb = function(a, b, c) {
                    if (gb(a)) return !0;
                    var d = kb(a);
                    return d && jb(pb(a), b, c) ? !0 : null
                },
                mb = function(a, b, d) {
                    var e = [],
                        f = 0,
                        g = a.length;
                    if (d !== c)
                        for (; g > f; f++) a[f] && a[f][b] && e.push(a[f][b][d]);
                    else
                        for (; g > f; f++) a[f] && e.push(a[f][b]);
                    return e
                },
                nb = function(a, b, d, e) {
                    var f = [],
                        g = 0,
                        h = b.length;
                    if (e !== c)
                        for (; h > g; g++) f.push(a[b[g]][d][e]);
                    else
                        for (; h > g; g++) f.push(a[b[g]][d]);
                    return f
                },
                ob = function(a, b) {
                    var d, e = [];
                    b === c ? (b = 0, d = a) : (d = b, b = a);
                    for (var f = b; d > f; f++) e.push(f);
                    return e
                },
                pb = function(a) {
                    return a.replace(bb, "")
                },
                qb = function(a) {
                    var b, c, d, e = [],
                        f = a.length,
                        g = 0;
                    a: for (c = 0; f > c; c++) {
                        for (b = a[c], d = 0; g > d; d++)
                            if (e[d] === b) continue a;
                        e.push(b), g++
                    }
                    return e
                },
                rb = function(a, b, d) {
                    a[b] !== c && (a[d] = a[b])
                },
                sb = /\[.*?\]$/,
                tb = /\(\)$/,
                ub = d("<div>")[0],
                vb = ub.textContent !== c,
                wb = /<.*?>/g;
            Wa = function(a) {
                this.$ = function(a, b) {
                    return this.api(!0).$(a, b)
                }, this._ = function(a, b) {
                    return this.api(!0).rows(a, b).data()
                }, this.api = function(a) {
                    return new Ya(a ? Ja(this[Xa.iApiIndex]) : this)
                }, this.fnAddData = function(a, b) {
                    var e = this.api(!0),
                        f = d.isArray(a) && (d.isArray(a[0]) || d.isPlainObject(a[0])) ? e.rows.add(a) : e.row.add(a);
                    return (b === c || b) && e.draw(), f.flatten().toArray()
                }, this.fnAdjustColumnSizing = function(a) {
                    var b = this.api(!0).columns.adjust(),
                        d = b.settings()[0],
                        e = d.oScroll;
                    a === c || a ? b.draw(!1) : ("" !== e.sX || "" !== e.sY) && qa(d)
                }, this.fnClearTable = function(a) {
                    var b = this.api(!0).clear();
                    (a === c || a) && b.draw()
                }, this.fnClose = function(a) {
                    this.api(!0).row(a).child.hide()
                }, this.fnDeleteRow = function(a, b, d) {
                    var e = this.api(!0),
                        f = e.rows(a),
                        g = f.settings()[0],
                        h = g.aoData[f[0][0]];
                    return f.remove(), b && b.call(this, g, h), (d === c || d) && e.draw(), h
                }, this.fnDestroy = function(a) {
                    this.api(!0).destroy(a)
                }, this.fnDraw = function(a) {
                    this.api(!0).draw(!a)
                }, this.fnFilter = function(a, b, d, e, f, g) {
                    var h = this.api(!0);
                    null === b || b === c ? h.search(a, d, e, g) : h.column(b).search(a, d, e, g), h.draw()
                }, this.fnGetData = function(a, b) {
                    var d = this.api(!0);
                    if (a !== c) {
                        var e = a.nodeName ? a.nodeName.toLowerCase() : "";
                        return b !== c || "td" == e || "th" == e ? d.cell(a, b).data() : d.row(a).data() || null
                    }
                    return d.data().toArray()
                }, this.fnGetNodes = function(a) {
                    var b = this.api(!0);
                    return a !== c ? b.row(a).node() : b.rows().nodes().flatten().toArray()
                }, this.fnGetPosition = function(a) {
                    var b = this.api(!0),
                        c = a.nodeName.toUpperCase();
                    if ("TR" == c) return b.row(a).index();
                    if ("TD" == c || "TH" == c) {
                        var d = b.cell(a).index();
                        return [d.row, d.columnVisible, d.column]
                    }
                    return null
                }, this.fnIsOpen = function(a) {
                    return this.api(!0).row(a).child.isShown()
                }, this.fnOpen = function(a, b, c) {
                    return this.api(!0).row(a).child(b, c).show().child()[0]
                }, this.fnPageChange = function(a, b) {
                    var d = this.api(!0).page(a);
                    (b === c || b) && d.draw(!1)
                }, this.fnSetColumnVis = function(a, b, d) {
                    var e = this.api(!0).column(a).visible(b);
                    (d === c || d) && e.columns.adjust().draw()
                }, this.fnSettings = function() {
                    return Ja(this[Xa.iApiIndex])
                }, this.fnSort = function(a) {
                    this.api(!0).order(a).draw()
                }, this.fnSortListener = function(a, b, c) {
                    this.api(!0).order.listener(a, b, c)
                }, this.fnUpdate = function(a, b, d, e, f) {
                    var g = this.api(!0);
                    return d === c || null === d ? g.row(b).data(a) : g.cell(b, d).data(a), (f === c || f) && g.columns.adjust(), (e === c || e) && g.draw(), 0
                }, this.fnVersionCheck = Xa.fnVersionCheck;
                var b = this,
                    e = a === c,
                    k = this.length;
                e && (a = {}), this.oApi = this.internal = Xa.internal;
                for (var n in Wa.ext.internal) n && (this[n] = Va(n));
                return this.each(function() {
                    var n, o = {},
                        p = k > 1 ? Ma(o, a, !0) : a,
                        q = 0,
                        r = this.getAttribute("id"),
                        s = !1,
                        w = Wa.defaults;
                    if ("table" != this.nodeName.toLowerCase()) return void Ka(null, 0, "Non-table node initialisation (" + this.nodeName + ")", 2);
                    h(w), i(w.column), f(w, w, !0), f(w.column, w.column, !0), f(w, p);
                    var x = Wa.settings;
                    for (q = 0, n = x.length; n > q; q++) {
                        if (x[q].nTable == this) {
                            var y = p.bRetrieve !== c ? p.bRetrieve : w.bRetrieve,
                                z = p.bDestroy !== c ? p.bDestroy : w.bDestroy;
                            if (e || y) return x[q].oInstance;
                            if (z) {
                                x[q].oInstance.fnDestroy();
                                break
                            }
                            return void Ka(x[q], 0, "Cannot reinitialise DataTable", 3)
                        }
                        if (x[q].sTableId == this.id) {
                            x.splice(q, 1);
                            break
                        }
                    }(null === r || "" === r) && (r = "DataTables_Table_" + Wa.ext._unique++, this.id = r);
                    var A = d.extend(!0, {}, Wa.models.oSettings, {
                        nTable: this,
                        oApi: b.internal,
                        oInit: p,
                        sDestroyWidth: d(this)[0].style.width,
                        sInstance: r,
                        sTableId: r
                    });
                    x.push(A), A.oInstance = 1 === b.length ? b : d(this).dataTable(), h(p), p.oLanguage && g(p.oLanguage), p.aLengthMenu && !p.iDisplayLength && (p.iDisplayLength = d.isArray(p.aLengthMenu[0]) ? p.aLengthMenu[0][0] : p.aLengthMenu[0]), p = Ma(d.extend(!0, {}, w), p), La(A.oFeatures, p, ["bPaginate", "bLengthChange", "bFilter", "bSort", "bSortMulti", "bInfo", "bProcessing", "bAutoWidth", "bSortClasses", "bServerSide", "bDeferRender"]), La(A, p, ["asStripeClasses", "ajax", "fnServerData", "fnFormatNumber", "sServerMethod", "aaSorting", "aaSortingFixed", "aLengthMenu", "sPaginationType", "sAjaxSource", "sAjaxDataProp", "iStateDuration", "sDom", "bSortCellsTop", "iTabIndex", "fnStateLoadCallback", "fnStateSaveCallback", "renderer", "searchDelay", ["iCookieDuration", "iStateDuration"],
                        ["oSearch", "oPreviousSearch"],
                        ["aoSearchCols", "aoPreSearchCols"],
                        ["iDisplayLength", "_iDisplayLength"],
                        ["bJQueryUI", "bJUI"]
                    ]), La(A.oScroll, p, [
                        ["sScrollX", "sX"],
                        ["sScrollXInner", "sXInner"],
                        ["sScrollY", "sY"],
                        ["bScrollCollapse", "bCollapse"]
                    ]), La(A.oLanguage, p, "fnInfoCallback"), Oa(A, "aoDrawCallback", p.fnDrawCallback, "user"), Oa(A, "aoServerParams", p.fnServerParams, "user"), Oa(A, "aoStateSaveParams", p.fnStateSaveParams, "user"), Oa(A, "aoStateLoadParams", p.fnStateLoadParams, "user"), Oa(A, "aoStateLoaded", p.fnStateLoaded, "user"), Oa(A, "aoRowCallback", p.fnRowCallback, "user"), Oa(A, "aoRowCreatedCallback", p.fnCreatedRow, "user"), Oa(A, "aoHeaderCallback", p.fnHeaderCallback, "user"), Oa(A, "aoFooterCallback", p.fnFooterCallback, "user"), Oa(A, "aoInitComplete", p.fnInitComplete, "user"), Oa(A, "aoPreDrawCallback", p.fnPreDrawCallback, "user");
                    var B = A.oClasses;
                    if (p.bJQueryUI ? (d.extend(B, Wa.ext.oJUIClasses, p.oClasses), p.sDom === w.sDom && "lfrtip" === w.sDom && (A.sDom = '<"H"lfr>t<"F"ip>'), A.renderer ? d.isPlainObject(A.renderer) && !A.renderer.header && (A.renderer.header = "jqueryui") : A.renderer = "jqueryui") : d.extend(B, Wa.ext.classes, p.oClasses), d(this).addClass(B.sTable), ("" !== A.oScroll.sX || "" !== A.oScroll.sY) && (A.oScroll.iBarWidth = za()), A.oScroll.sX === !0 && (A.oScroll.sX = "100%"), A.iInitDisplayStart === c && (A.iInitDisplayStart = p.iDisplayStart, A._iDisplayStart = p.iDisplayStart), null !== p.iDeferLoading) {
                        A.bDeferLoading = !0;
                        var C = d.isArray(p.iDeferLoading);
                        A._iRecordsDisplay = C ? p.iDeferLoading[0] : p.iDeferLoading, A._iRecordsTotal = C ? p.iDeferLoading[1] : p.iDeferLoading
                    }
                    "" !== p.oLanguage.sUrl ? (A.oLanguage.sUrl = p.oLanguage.sUrl, d.getJSON(A.oLanguage.sUrl, null, function(a) {
                        g(a), f(w.oLanguage, a), d.extend(!0, A.oLanguage, p.oLanguage, a), ha(A)
                    }), s = !0) : d.extend(!0, A.oLanguage, p.oLanguage), null === p.asStripeClasses && (A.asStripeClasses = [B.sStripeOdd, B.sStripeEven]);
                    var D = A.asStripeClasses,
                        E = d("tbody tr:eq(0)", this); - 1 !== d.inArray(!0, d.map(D, function(a, b) {
                        return E.hasClass(a)
                    })) && (d("tbody tr", this).removeClass(D.join(" ")), A.asDestroyStripes = D.slice());
                    var F, G = [],
                        I = this.getElementsByTagName("thead");
                    if (0 !== I.length && (P(A.aoHeader, I[0]), G = Q(A)), null === p.aoColumns)
                        for (F = [], q = 0, n = G.length; n > q; q++) F.push(null);
                    else F = p.aoColumns;
                    for (q = 0, n = F.length; n > q; q++) l(A, G ? G[q] : null);
                    if (t(A, p.aoColumnDefs, F, function(a, b) {
                            m(A, a, b)
                        }), E.length) {
                        var J = function(a, b) {
                            return a.getAttribute("data-" + b) ? b : null
                        };
                        d.each(H(A, E[0]).cells, function(a, b) {
                            var d = A.aoColumns[a];
                            if (d.mData === a) {
                                var e = J(b, "sort") || J(b, "order"),
                                    f = J(b, "filter") || J(b, "search");
                                (null !== e || null !== f) && (d.mData = {
                                    _: a + ".display",
                                    sort: null !== e ? a + ".@data-" + e : c,
                                    type: null !== e ? a + ".@data-" + e : c,
                                    filter: null !== f ? a + ".@data-" + f : c
                                }, m(A, a))
                            }
                        })
                    }
                    var K = A.oFeatures;
                    if (p.bStateSave && (K.bStateSave = !0, Ia(A, p), Oa(A, "aoDrawCallback", Ha, "state_save")), p.aaSorting === c) {
                        var L = A.aaSorting;
                        for (q = 0, n = L.length; n > q; q++) L[q][1] = A.aoColumns[q].asSorting[0]
                    }
                    Fa(A), K.bSort && Oa(A, "aoDrawCallback", function() {
                        if (A.bSorted) {
                            var a = Aa(A),
                                b = {};
                            d.each(a, function(a, c) {
                                b[c.src] = c.dir
                            }), Pa(A, null, "order", [A, a, b]), Ca(A)
                        }
                    }), Oa(A, "aoDrawCallback", function() {
                        (A.bSorted || "ssp" === Sa(A) || K.bDeferRender) && Fa(A)
                    }, "sc"), j(A);
                    var M = d(this).children("caption").each(function() {
                            this._captionSide = d(this).css("caption-side")
                        }),
                        N = d(this).children("thead");
                    0 === N.length && (N = d("<thead/>").appendTo(this)), A.nTHead = N[0];
                    var O = d(this).children("tbody");
                    0 === O.length && (O = d("<tbody/>").appendTo(this)), A.nTBody = O[0];
                    var R = d(this).children("tfoot");
                    if (0 === R.length && M.length > 0 && ("" !== A.oScroll.sX || "" !== A.oScroll.sY) && (R = d("<tfoot/>").appendTo(this)), 0 === R.length || 0 === R.children().length ? d(this).addClass(B.sNoFooter) : R.length > 0 && (A.nTFoot = R[0], P(A.aoFooter, A.nTFoot)), p.aaData)
                        for (q = 0; q < p.aaData.length; q++) u(A, p.aaData[q]);
                    else(A.bDeferLoading || "dom" == Sa(A)) && v(A, d(A.nTBody).children("tr"));
                    A.aiDisplay = A.aiDisplayMaster.slice(), A.bInitialised = !0, s === !1 && ha(A)
                }), b = null, this
            };
            var xb = [],
                yb = Array.prototype,
                zb = function(a) {
                    var b, c, e = Wa.settings,
                        f = d.map(e, function(a, b) {
                            return a.nTable
                        });
                    return a ? a.nTable && a.oApi ? [a] : a.nodeName && "table" === a.nodeName.toLowerCase() ? (b = d.inArray(a, f), -1 !== b ? [e[b]] : null) : a && "function" == typeof a.settings ? a.settings().toArray() : ("string" == typeof a ? c = d(a) : a instanceof d && (c = a), c ? c.map(function(a) {
                        return b = d.inArray(this, f), -1 !== b ? e[b] : null
                    }).toArray() : void 0) : []
                };
            Ya = function(a, b) {
                if (!this instanceof Ya) throw "DT API must be constructed as a new object";
                var c = [],
                    e = function(a) {
                        var b = zb(a);
                        b && c.push.apply(c, b)
                    };
                if (d.isArray(a))
                    for (var f = 0, g = a.length; g > f; f++) e(a[f]);
                else e(a);
                this.context = qb(c), b && this.push.apply(this, b.toArray ? b.toArray() : b), this.selector = {
                    rows: null,
                    cols: null,
                    opts: null
                }, Ya.extend(this, this, xb)
            }, Wa.Api = Ya, Ya.prototype = {
                concat: yb.concat,
                context: [],
                each: function(a) {
                    for (var b = 0, c = this.length; c > b; b++) a.call(this, this[b], b, this);
                    return this
                },
                eq: function(a) {
                    var b = this.context;
                    return b.length > a ? new Ya(b[a], this[a]) : null
                },
                filter: function(a) {
                    var b = [];
                    if (yb.filter) b = yb.filter.call(this, a, this);
                    else
                        for (var c = 0, d = this.length; d > c; c++) a.call(this, this[c], c, this) && b.push(this[c]);
                    return new Ya(this.context, b)
                },
                flatten: function() {
                    var a = [];
                    return new Ya(this.context, a.concat.apply(a, this.toArray()))
                },
                join: yb.join,
                indexOf: yb.indexOf || function(a, b) {
                    for (var c = b || 0, d = this.length; d > c; c++)
                        if (this[c] === a) return c;
                    return -1
                },
                iterator: function(a, b, d) {
                    var e, f, g, h, i, j, k, l, m = [],
                        n = this.context,
                        o = this.selector;
                    for ("string" == typeof a && (d = b, b = a, a = !1), f = 0, g = n.length; g > f; f++) {
                        var p = new Ya(n[f]);
                        if ("table" === b) e = d.call(p, n[f], f), e !== c && m.push(e);
                        else if ("columns" === b || "rows" === b) e = d.call(p, n[f], this[f], f), e !== c && m.push(e);
                        else if ("column" === b || "column-rows" === b || "row" === b || "cell" === b)
                            for (k = this[f], "column-rows" === b && (j = Fb(n[f], o.opts)), h = 0, i = k.length; i > h; h++) l = k[h], e = "cell" === b ? d.call(p, n[f], l.row, l.column, f, h) : d.call(p, n[f], l, f, h, j), e !== c && m.push(e)
                    }
                    if (m.length) {
                        var q = new Ya(n, a ? m.concat.apply([], m) : m),
                            r = q.selector;
                        return r.rows = o.rows, r.cols = o.cols, r.opts = o.opts, q
                    }
                    return this
                },
                lastIndexOf: yb.lastIndexOf || function(a, b) {
                    return this.indexOf.apply(this.toArray.reverse(), arguments)
                },
                length: 0,
                map: function(a) {
                    var b = [];
                    if (yb.map) b = yb.map.call(this, a, this);
                    else
                        for (var c = 0, d = this.length; d > c; c++) b.push(a.call(this, this[c], c));
                    return new Ya(this.context, b)
                },
                pluck: function(a) {
                    return this.map(function(b) {
                        return b[a]
                    })
                },
                pop: yb.pop,
                push: yb.push,
                reduce: yb.reduce || function(a, b) {
                    return k(this, a, b, 0, this.length, 1)
                },
                reduceRight: yb.reduceRight || function(a, b) {
                    return k(this, a, b, this.length - 1, -1, -1)
                },
                reverse: yb.reverse,
                selector: null,
                shift: yb.shift,
                sort: yb.sort,
                splice: yb.splice,
                toArray: function() {
                    return yb.slice.call(this)
                },
                to$: function() {
                    return d(this)
                },
                toJQuery: function() {
                    return d(this)
                },
                unique: function() {
                    return new Ya(this.context, qb(this))
                },
                unshift: yb.unshift
            }, Ya.extend = function(a, b, c) {
                if (b && (b instanceof Ya || b.__dt_wrapper)) {
                    var e, f, g, h = function(a, b, c) {
                        return function() {
                            var d = b.apply(a, arguments);
                            return Ya.extend(d, d, c.methodExt), d
                        }
                    };
                    for (e = 0, f = c.length; f > e; e++) g = c[e], b[g.name] = "function" == typeof g.val ? h(a, g.val, g) : d.isPlainObject(g.val) ? {} : g.val, b[g.name].__dt_wrapper = !0, Ya.extend(a, b[g.name], g.propExt)
                }
            }, Ya.register = Za = function(a, b) {
                if (d.isArray(a))
                    for (var c = 0, e = a.length; e > c; c++) Ya.register(a[c], b);
                else {
                    var f, g, h, i, j = a.split("."),
                        k = xb,
                        l = function(a, b) {
                            for (var c = 0, d = a.length; d > c; c++)
                                if (a[c].name === b) return a[c];
                            return null
                        };
                    for (f = 0, g = j.length; g > f; f++) {
                        i = -1 !== j[f].indexOf("()"), h = i ? j[f].replace("()", "") : j[f];
                        var m = l(k, h);
                        m || (m = {
                            name: h,
                            val: {},
                            methodExt: [],
                            propExt: []
                        }, k.push(m)), f === g - 1 ? m.val = b : k = i ? m.methodExt : m.propExt
                    }
                }
            }, Ya.registerPlural = $a = function(a, b, e) {
                Ya.register(a, e), Ya.register(b, function() {
                    var a = e.apply(this, arguments);
                    return a === this ? this : a instanceof Ya ? a.length ? d.isArray(a[0]) ? new Ya(a.context, a[0]) : a[0] : c : a
                })
            };
            var Ab = function(a, b) {
                if ("number" == typeof a) return [b[a]];
                var c = d.map(b, function(a, b) {
                    return a.nTable
                });
                return d(c).filter(a).map(function(a) {
                    var e = d.inArray(this, c);
                    return b[e]
                }).toArray()
            };
            Za("tables()", function(a) {
                return a ? new Ya(Ab(a, this.context)) : this
            }), Za("table()", function(a) {
                var b = this.tables(a),
                    c = b.context;
                return c.length ? new Ya(c[0]) : b
            }), $a("tables().nodes()", "table().node()", function() {
                return this.iterator("table", function(a) {
                    return a.nTable
                })
            }), $a("tables().body()", "table().body()", function() {
                return this.iterator("table", function(a) {
                    return a.nTBody
                })
            }), $a("tables().header()", "table().header()", function() {
                return this.iterator("table", function(a) {
                    return a.nTHead
                })
            }), $a("tables().footer()", "table().footer()", function() {
                return this.iterator("table", function(a) {
                    return a.nTFoot
                })
            }), $a("tables().containers()", "table().container()", function() {
                return this.iterator("table", function(a) {
                    return a.nTableWrapper
                })
            }), Za("draw()", function(a) {
                return this.iterator("table", function(b) {
                    N(b, a === !1)
                })
            }), Za("page()", function(a) {
                return a === c ? this.page.info().page : this.iterator("table", function(b) {
                    ma(b, a)
                })
            }), Za("page.info()", function(a) {
                if (0 === this.context.length) return c;
                var b = this.context[0],
                    d = b._iDisplayStart,
                    e = b._iDisplayLength,
                    f = b.fnRecordsDisplay(),
                    g = -1 === e;
                return {
                    page: g ? 0 : Math.floor(d / e),
                    pages: g ? 1 : Math.ceil(f / e),
                    start: d,
                    end: b.fnDisplayEnd(),
                    length: e,
                    recordsTotal: b.fnRecordsTotal(),
                    recordsDisplay: f
                }
            }), Za("page.len()", function(a) {
                return a === c ? 0 !== this.context.length ? this.context[0]._iDisplayLength : c : this.iterator("table", function(b) {
                    ja(b, a)
                })
            });
            var Bb = function(a, b, c) {
                if ("ssp" == Sa(a) ? N(a, b) : (oa(a, !0), R(a, [], function(c) {
                        E(a);
                        for (var d = V(a, c), e = 0, f = d.length; f > e; e++) u(a, d[e]);
                        N(a, b), oa(a, !1)
                    })), c) {
                    var d = new Ya(a);
                    d.one("draw", function() {
                        c(d.ajax.json())
                    })
                }
            };
            Za("ajax.json()", function() {
                var a = this.context;
                return a.length > 0 ? a[0].json : void 0
            }), Za("ajax.params()", function() {
                var a = this.context;
                return a.length > 0 ? a[0].oAjaxData : void 0
            }), Za("ajax.reload()", function(a, b) {
                return this.iterator("table", function(c) {
                    Bb(c, b === !1, a)
                })
            }), Za("ajax.url()", function(a) {
                var b = this.context;
                return a === c ? 0 === b.length ? c : (b = b[0], b.ajax ? d.isPlainObject(b.ajax) ? b.ajax.url : b.ajax : b.sAjaxSource) : this.iterator("table", function(b) {
                    d.isPlainObject(b.ajax) ? b.ajax.url = a : b.ajax = a
                })
            }), Za("ajax.url().load()", function(a, b) {
                return this.iterator("table", function(c) {
                    Bb(c, b === !1, a)
                })
            });
            var Cb = function(a, b) {
                    var e, f, g, h, i, j, k = [],
                        l = typeof a;
                    for (a && "string" !== l && "function" !== l && a.length !== c || (a = [a]), g = 0, h = a.length; h > g; g++)
                        for (f = a[g] && a[g].split ? a[g].split(",") : [a[g]], i = 0, j = f.length; j > i; i++) e = b("string" == typeof f[i] ? d.trim(f[i]) : f[i]), e && e.length && k.push.apply(k, e);
                    return k
                },
                Db = function(a) {
                    return a || (a = {}), a.filter && !a.search && (a.search = a.filter), {
                        search: a.search || "none",
                        order: a.order || "current",
                        page: a.page || "all"
                    }
                },
                Eb = function(a) {
                    for (var b = 0, c = a.length; c > b; b++)
                        if (a[b].length > 0) return a[0] = a[b], a.length = 1, a.context = [a.context[b]], a;
                    return a.length = 0, a
                },
                Fb = function(a, b) {
                    var c, e, f, g = [],
                        h = a.aiDisplay,
                        i = a.aiDisplayMaster,
                        j = b.search,
                        k = b.order,
                        l = b.page;
                    if ("ssp" == Sa(a)) return "removed" === j ? [] : ob(0, i.length);
                    if ("current" == l)
                        for (c = a._iDisplayStart, e = a.fnDisplayEnd(); e > c; c++) g.push(h[c]);
                    else if ("current" == k || "applied" == k) g = "none" == j ? i.slice() : "applied" == j ? h.slice() : d.map(i, function(a, b) {
                        return -1 === d.inArray(a, h) ? a : null
                    });
                    else if ("index" == k || "original" == k)
                        for (c = 0, e = a.aoData.length; e > c; c++) "none" == j ? g.push(c) : (f = d.inArray(c, h), (-1 === f && "removed" == j || f >= 0 && "applied" == j) && g.push(c));
                    return g
                },
                Gb = function(a, b, c) {
                    return Cb(b, function(b) {
                        var e = hb(b);
                        if (null !== e && !c) return [e];
                        var f = Fb(a, c);
                        if (null !== e && -1 !== d.inArray(e, f)) return [e];
                        if (!b) return f;
                        var g = nb(a.aoData, f, "nTr");
                        return "function" == typeof b ? d.map(f, function(c) {
                            var d = a.aoData[c];
                            return b(c, d._aData, d.nTr) ? c : null
                        }) : b.nodeName && -1 !== d.inArray(b, g) ? [b._DT_RowIndex] : d(g).filter(b).map(function() {
                            return this._DT_RowIndex
                        }).toArray()
                    })
                };
            Za("rows()", function(a, b) {
                a === c ? a = "" : d.isPlainObject(a) && (b = a, a = ""), b = Db(b);
                var e = this.iterator("table", function(c) {
                    return Gb(c, a, b)
                });
                return e.selector.rows = a, e.selector.opts = b, e
            }), Za("rows().nodes()", function() {
                return this.iterator("row", function(a, b) {
                    return a.aoData[b].nTr || c
                })
            }), Za("rows().data()", function() {
                return this.iterator(!0, "rows", function(a, b) {
                    return nb(a.aoData, b, "_aData")
                })
            }), $a("rows().cache()", "row().cache()", function(a) {
                return this.iterator("row", function(b, c) {
                    var d = b.aoData[c];
                    return "search" === a ? d._aFilterData : d._aSortData
                })
            }), $a("rows().invalidate()", "row().invalidate()", function(a) {
                return this.iterator("row", function(b, c) {
                    G(b, c, a)
                })
            }), $a("rows().indexes()", "row().index()", function() {
                return this.iterator("row", function(a, b) {
                    return b
                })
            }), $a("rows().remove()", "row().remove()", function() {
                var a = this;
                return this.iterator("row", function(b, c, e) {
                    var f = b.aoData;
                    f.splice(c, 1);
                    for (var g = 0, h = f.length; h > g; g++) null !== f[g].nTr && (f[g].nTr._DT_RowIndex = g);
                    d.inArray(c, b.aiDisplay);
                    F(b.aiDisplayMaster, c), F(b.aiDisplay, c), F(a[e], c, !1), Qa(b)
                })
            }), Za("rows.add()", function(a) {
                var b = this.iterator("table", function(b) {
                        var c, d, e, f = [];
                        for (d = 0, e = a.length; e > d; d++) c = a[d], f.push(c.nodeName && "TR" === c.nodeName.toUpperCase() ? v(b, c)[0] : u(b, c));
                        return f
                    }),
                    c = this.rows(-1);
                return c.pop(), c.push.apply(c, b.toArray()), c
            }), Za("row()", function(a, b) {
                return Eb(this.rows(a, b))
            }), Za("row().data()", function(a) {
                var b = this.context;
                return a === c ? b.length && this.length ? b[0].aoData[this[0]]._aData : c : (b[0].aoData[this[0]]._aData = a, G(b[0], this[0], "data"), this)
            }), Za("row().node()", function() {
                var a = this.context;
                return a.length && this.length ? a[0].aoData[this[0]].nTr || null : null
            }), Za("row.add()", function(a) {
                a instanceof d && a.length && (a = a[0]);
                var b = this.iterator("table", function(b) {
                    return a.nodeName && "TR" === a.nodeName.toUpperCase() ? v(b, a)[0] : u(b, a)
                });
                return this.row(b[0])
            });
            var Hb = function(a, b, c, e) {
                    var f = [],
                        g = function(b, c) {
                            if (b.nodeName && "tr" === b.nodeName.toLowerCase()) f.push(b);
                            else {
                                var e = d("<tr><td/></tr>").addClass(c);
                                d("td", e).addClass(c).html(b)[0].colSpan = q(a), f.push(e[0])
                            }
                        };
                    if (d.isArray(c) || c instanceof d)
                        for (var h = 0, i = c.length; i > h; h++) g(c[h], e);
                    else g(c, e);
                    b._details && b._details.remove(), b._details = d(f), b._detailsShow && b._details.insertAfter(b.nTr)
                },
                Ib = function(a, b) {
                    var d = a.context;
                    if (d.length) {
                        var e = d[0].aoData[b !== c ? b : a[0]];
                        e._details && (e._details.remove(), e._detailsShow = c, e._details = c)
                    }
                },
                Jb = function(a, b) {
                    var c = a.context;
                    if (c.length && a.length) {
                        var d = c[0].aoData[a[0]];
                        d._details && (d._detailsShow = b, b ? d._details.insertAfter(d.nTr) : d._details.detach(), Kb(c[0]))
                    }
                },
                Kb = function(a) {
                    var b = new Ya(a),
                        c = ".dt.DT_details",
                        d = "draw" + c,
                        e = "column-visibility" + c,
                        f = "destroy" + c,
                        g = a.aoData;
                    b.off(d + " " + e + " " + f), mb(g, "_details").length > 0 && (b.on(d, function(c, d) {
                        a === d && b.rows({
                            page: "current"
                        }).eq(0).each(function(a) {
                            var b = g[a];
                            b._detailsShow && b._details.insertAfter(b.nTr)
                        })
                    }), b.on(e, function(b, c, d, e) {
                        if (a === c)
                            for (var f, h = q(c), i = 0, j = g.length; j > i; i++) f = g[i], f._details && f._details.children("td[colspan]").attr("colspan", h)
                    }), b.on(f, function(c, d) {
                        if (a === d)
                            for (var e = 0, f = g.length; f > e; e++) g[e]._details && Ib(b, e)
                    }))
                },
                Lb = "",
                Mb = Lb + "row().child",
                Nb = Mb + "()";
            Za(Nb, function(a, b) {
                var d = this.context;
                return a === c ? d.length && this.length ? d[0].aoData[this[0]]._details : c : (a === !0 ? this.child.show() : a === !1 ? Ib(this) : d.length && this.length && Hb(d[0], d[0].aoData[this[0]], a, b), this)
            }), Za([Mb + ".show()", Nb + ".show()"], function(a) {
                return Jb(this, !0), this
            }), Za([Mb + ".hide()", Nb + ".hide()"], function() {
                return Jb(this, !1), this
            }), Za([Mb + ".remove()", Nb + ".remove()"], function() {
                return Ib(this), this
            }), Za(Mb + ".isShown()", function() {
                var a = this.context;
                return a.length && this.length ? a[0].aoData[this[0]]._detailsShow || !1 : !1
            });
            var Ob = /^(.+):(name|visIdx|visible)$/,
                Pb = function(a, b, c, d, e) {
                    for (var f = [], g = 0, h = e.length; h > g; g++) f.push(y(a, e[g], b));
                    return f
                },
                Qb = function(a, b, c) {
                    var e = a.aoColumns,
                        f = mb(e, "sName"),
                        g = mb(e, "nTh");
                    return Cb(b, function(b) {
                        var h = hb(b);
                        if ("" === b) return ob(e.length);
                        if (null !== h) return [h >= 0 ? h : e.length + h];
                        if ("function" == typeof b) {
                            var i = Fb(a, c);
                            return d.map(e, function(c, d) {
                                return b(d, Pb(a, d, 0, 0, i), g[d]) ? d : null
                            })
                        }
                        var j = "string" == typeof b ? b.match(Ob) : "";
                        if (!j) return d(g).filter(b).map(function() {
                            return d.inArray(this, g)
                        }).toArray();
                        switch (j[2]) {
                            case "visIdx":
                            case "visible":
                                var k = parseInt(j[1], 10);
                                if (0 > k) {
                                    var l = d.map(e, function(a, b) {
                                        return a.bVisible ? b : null
                                    });
                                    return [l[l.length + k]]
                                }
                                return [o(a, k)];
                            case "name":
                                return d.map(f, function(a, b) {
                                    return a === j[1] ? b : null
                                })
                        }
                    })
                },
                Rb = function(a, b, e, f) {
                    var g, h, i, j, k = a.aoColumns,
                        l = k[b],
                        m = a.aoData;
                    if (e === c) return l.bVisible;
                    if (l.bVisible !== e) {
                        if (e) {
                            var o = d.inArray(!0, mb(k, "bVisible"), b + 1);
                            for (h = 0, i = m.length; i > h; h++) j = m[h].nTr, g = m[h].anCells, j && j.insertBefore(g[b], g[o] || null)
                        } else d(mb(a.aoData, "anCells", b)).detach();
                        l.bVisible = e, L(a, a.aoHeader), L(a, a.aoFooter), (f === c || f) && (n(a), (a.oScroll.sX || a.oScroll.sY) && qa(a)), Pa(a, null, "column-visibility", [a, b, e]), Ha(a)
                    }
                };
            Za("columns()", function(a, b) {
                a === c ? a = "" : d.isPlainObject(a) && (b = a, a = ""), b = Db(b);
                var e = this.iterator("table", function(c) {
                    return Qb(c, a, b)
                });
                return e.selector.cols = a, e.selector.opts = b, e
            }), $a("columns().header()", "column().header()", function(a, b) {
                return this.iterator("column", function(a, b) {
                    return a.aoColumns[b].nTh
                })
            }), $a("columns().footer()", "column().footer()", function(a, b) {
                return this.iterator("column", function(a, b) {
                    return a.aoColumns[b].nTf
                })
            }), $a("columns().data()", "column().data()", function() {
                return this.iterator("column-rows", Pb)
            }), $a("columns().dataSrc()", "column().dataSrc()", function() {
                return this.iterator("column", function(a, b) {
                    return a.aoColumns[b].mData
                })
            }), $a("columns().cache()", "column().cache()", function(a) {
                return this.iterator("column-rows", function(b, c, d, e, f) {
                    return nb(b.aoData, f, "search" === a ? "_aFilterData" : "_aSortData", c)
                })
            }), $a("columns().nodes()", "column().nodes()", function() {
                return this.iterator("column-rows", function(a, b, c, d, e) {
                    return nb(a.aoData, e, "anCells", b)
                })
            }), $a("columns().visible()", "column().visible()", function(a, b) {
                return this.iterator("column", function(d, e) {
                    return a === c ? d.aoColumns[e].bVisible : Rb(d, e, a, b)
                })
            }), $a("columns().indexes()", "column().index()", function(a) {
                return this.iterator("column", function(b, c) {
                    return "visible" === a ? p(b, c) : c
                })
            }), Za("columns.adjust()", function() {
                return this.iterator("table", function(a) {
                    n(a)
                })
            }), Za("column.index()", function(a, b) {
                if (0 !== this.context.length) {
                    var c = this.context[0];
                    if ("fromVisible" === a || "toData" === a) return o(c, b);
                    if ("fromData" === a || "toVisible" === a) return p(c, b)
                }
            }), Za("column()", function(a, b) {
                return Eb(this.columns(a, b))
            });
            var Sb = function(a, b, e) {
                var f, g, h, i, j, k, l, m = a.aoData,
                    n = Fb(a, e),
                    o = nb(m, n, "anCells"),
                    p = d([].concat.apply([], o)),
                    q = a.aoColumns.length;
                return Cb(b, function(b) {
                    var e = "function" == typeof b;
                    if (null === b || b === c || e) {
                        for (g = [], h = 0, i = n.length; i > h; h++)
                            for (f = n[h], j = 0; q > j; j++) k = {
                                row: f,
                                column: j
                            }, e ? (l = a.aoData[f], b(k, y(a, f, j), l.anCells[j]) && g.push(k)) : g.push(k);
                        return g
                    }
                    return d.isPlainObject(b) ? [b] : p.filter(b).map(function(a, b) {
                        return f = b.parentNode._DT_RowIndex, {
                            row: f,
                            column: d.inArray(b, m[f].anCells)
                        }
                    }).toArray()
                })
            };
            Za("cells()", function(a, b, e) {
                    if (d.isPlainObject(a) && (typeof a.row !== c ? (e = b, b = null) : (e = a, a = null)), d.isPlainObject(b) && (e = b, b = null), null === b || b === c) return this.iterator("table", function(b) {
                        return Sb(b, a, Db(e))
                    });
                    var f, g, h, i, j, k = this.columns(b, e),
                        l = this.rows(a, e),
                        m = this.iterator("table", function(a, b) {
                            for (f = [], g = 0, h = l[b].length; h > g; g++)
                                for (i = 0, j = k[b].length; j > i; i++) f.push({
                                    row: l[b][g],
                                    column: k[b][i]
                                });
                            return f
                        });
                    return d.extend(m.selector, {
                        cols: b,
                        rows: a,
                        opts: e
                    }), m
                }), $a("cells().nodes()", "cell().node()", function() {
                    return this.iterator("cell", function(a, b, c) {
                        return a.aoData[b].anCells[c]
                    })
                }), Za("cells().data()", function() {
                    return this.iterator("cell", function(a, b, c) {
                        return y(a, b, c)
                    })
                }), $a("cells().cache()", "cell().cache()", function(a) {
                    return a = "search" === a ? "_aFilterData" : "_aSortData", this.iterator("cell", function(b, c, d) {
                        return b.aoData[c][a][d]
                    })
                }), $a("cells().render()", "cell().render()", function(a) {
                    return this.iterator("cell", function(b, c, d) {
                        return y(b, c, d, a)
                    })
                }), $a("cells().indexes()", "cell().index()", function() {
                    return this.iterator("cell", function(a, b, c) {
                        return {
                            row: b,
                            column: c,
                            columnVisible: p(a, c)
                        }
                    })
                }), Za(["cells().invalidate()", "cell().invalidate()"], function(a) {
                    var b = this.selector;
                    return this.rows(b.rows, b.opts).invalidate(a), this
                }), Za("cell()", function(a, b, c) {
                    return Eb(this.cells(a, b, c))
                }), Za("cell().data()", function(a) {
                    var b = this.context,
                        d = this[0];
                    return a === c ? b.length && d.length ? y(b[0], d[0].row, d[0].column) : c : (z(b[0], d[0].row, d[0].column, a), G(b[0], d[0].row, "data", d[0].column), this)
                }), Za("order()", function(a, b) {
                    var e = this.context;
                    return a === c ? 0 !== e.length ? e[0].aaSorting : c : ("number" == typeof a ? a = [
                        [a, b]
                    ] : d.isArray(a[0]) || (a = Array.prototype.slice.call(arguments)), this.iterator("table", function(b) {
                        b.aaSorting = a.slice()
                    }))
                }), Za("order.listener()", function(a, b, c) {
                    return this.iterator("table", function(d) {
                        Ea(d, a, b, c)
                    })
                }), Za(["columns().order()", "column().order()"], function(a) {
                    var b = this;
                    return this.iterator("table", function(c, e) {
                        var f = [];
                        d.each(b[e], function(b, c) {
                            f.push([c, a])
                        }), c.aaSorting = f
                    })
                }), Za("search()", function(a, b, e, f) {
                    var g = this.context;
                    return a === c ? 0 !== g.length ? g[0].oPreviousSearch.sSearch : c : this.iterator("table", function(c) {
                        c.oFeatures.bFilter && X(c, d.extend({}, c.oPreviousSearch, {
                            sSearch: a + "",
                            bRegex: null === b ? !1 : b,
                            bSmart: null === e ? !0 : e,
                            bCaseInsensitive: null === f ? !0 : f
                        }), 1)
                    })
                }), $a("columns().search()", "column().search()", function(a, b, e, f) {
                    return this.iterator("column", function(g, h) {
                        var i = g.aoPreSearchCols;
                        return a === c ? i[h].sSearch : void(g.oFeatures.bFilter && (d.extend(i[h], {
                            sSearch: a + "",
                            bRegex: null === b ? !1 : b,
                            bSmart: null === e ? !0 : e,
                            bCaseInsensitive: null === f ? !0 : f
                        }), X(g, g.oPreviousSearch, 1)))
                    })
                }), Za("state()", function() {
                    return this.context.length ? this.context[0].oSavedState : null
                }), Za("state.clear()", function() {
                    return this.iterator("table", function(a) {
                        a.fnStateSaveCallback.call(a.oInstance, a, {})
                    })
                }), Za("state.loaded()", function() {
                    return this.context.length ? this.context[0].oLoadedState : null
                }), Za("state.save()", function() {
                    return this.iterator("table", function(a) {
                        Ha(a)
                    })
                }), Wa.versionCheck = Wa.fnVersionCheck = function(a) {
                    for (var b, c, d = Wa.version.split("."), e = a.split("."), f = 0, g = e.length; g > f; f++)
                        if (b = parseInt(d[f], 10) || 0, c = parseInt(e[f], 10) || 0, b !== c) return b > c;
                    return !0
                }, Wa.isDataTable = Wa.fnIsDataTable = function(a) {
                    var b = d(a).get(0),
                        c = !1;
                    return d.each(Wa.settings, function(a, d) {
                        (d.nTable === b || d.nScrollHead === b || d.nScrollFoot === b) && (c = !0)
                    }), c
                }, Wa.tables = Wa.fnTables = function(a) {
                    return jQuery.map(Wa.settings, function(b) {
                        return !a || a && d(b.nTable).is(":visible") ? b.nTable : void 0
                    })
                }, Wa.util = {
                    throttle: ta
                }, Wa.camelToHungarian = f, Za("$()", function(a, b) {
                    var c = this.rows(b).nodes(),
                        e = d(c);
                    return d([].concat(e.filter(a).toArray(), e.find(a).toArray()))
                }), d.each(["on", "one", "off"], function(a, b) {
                    Za(b + "()", function() {
                        var a = Array.prototype.slice.call(arguments);
                        a[0].match(/\.dt\b/) || (a[0] += ".dt");
                        var c = d(this.tables().nodes());
                        return c[b].apply(c, a), this
                    })
                }), Za("clear()", function() {
                    return this.iterator("table", function(a) {
                        E(a)
                    })
                }), Za("settings()", function() {
                    return new Ya(this.context, this.context)
                }), Za("data()", function() {
                    return this.iterator("table", function(a) {
                        return mb(a.aoData, "_aData")
                    }).flatten()
                }), Za("destroy()", function(b) {
                    return b = b || !1, this.iterator("table", function(c) {
                        var e, f = c.nTableWrapper.parentNode,
                            g = c.oClasses,
                            h = c.nTable,
                            i = c.nTBody,
                            j = c.nTHead,
                            k = c.nTFoot,
                            l = d(h),
                            m = d(i),
                            n = d(c.nTableWrapper),
                            o = d.map(c.aoData, function(a) {
                                return a.nTr
                            });
                        c.bDestroying = !0, Pa(c, "aoDestroyCallback", "destroy", [c]), b || new Ya(c).columns().visible(!0), n.unbind(".DT").find(":not(tbody *)").unbind(".DT"), d(a).unbind(".DT-" + c.sInstance), h != j.parentNode && (l.children("thead").detach(), l.append(j)), k && h != k.parentNode && (l.children("tfoot").detach(), l.append(k)), l.detach(), n.detach(), c.aaSorting = [], c.aaSortingFixed = [], Fa(c), d(o).removeClass(c.asStripeClasses.join(" ")), d("th, td", j).removeClass(g.sSortable + " " + g.sSortableAsc + " " + g.sSortableDesc + " " + g.sSortableNone), c.bJUI && (d("th span." + g.sSortIcon + ", td span." + g.sSortIcon, j).detach(), d("th, td", j).each(function() {
                            var a = d("div." + g.sSortJUIWrapper, this);
                            d(this).append(a.contents()), a.detach()
                        })), !b && f && f.insertBefore(h, c.nTableReinsertBefore), m.children().detach(), m.append(o), l.css("width", c.sDestroyWidth).removeClass(g.sTable), e = c.asDestroyStripes.length, e && m.children().each(function(a) {
                            d(this).addClass(c.asDestroyStripes[a % e])
                        });
                        var p = d.inArray(c, Wa.settings); - 1 !== p && Wa.settings.splice(p, 1)
                    })
                }), Wa.version = "1.10.3", Wa.settings = [], Wa.models = {}, Wa.models.oSearch = {
                    bCaseInsensitive: !0,
                    sSearch: "",
                    bRegex: !1,
                    bSmart: !0
                }, Wa.models.oRow = {
                    nTr: null,
                    anCells: null,
                    _aData: [],
                    _aSortData: null,
                    _aFilterData: null,
                    _sFilterRow: null,
                    _sRowStripe: "",
                    src: null
                }, Wa.models.oColumn = {
                    idx: null,
                    aDataSort: null,
                    asSorting: null,
                    bSearchable: null,
                    bSortable: null,
                    bVisible: null,
                    _sManualType: null,
                    _bAttrSrc: !1,
                    fnCreatedCell: null,
                    fnGetData: null,
                    fnSetData: null,
                    mData: null,
                    mRender: null,
                    nTh: null,
                    nTf: null,
                    sClass: null,
                    sContentPadding: null,
                    sDefaultContent: null,
                    sName: null,
                    sSortDataType: "std",
                    sSortingClass: null,
                    sSortingClassJUI: null,
                    sTitle: null,
                    sType: null,
                    sWidth: null,
                    sWidthOrig: null
                }, Wa.defaults = {
                    aaData: null,
                    aaSorting: [
                        [0, "asc"]
                    ],
                    aaSortingFixed: [],
                    ajax: null,
                    aLengthMenu: [10, 25, 50, 100],
                    aoColumns: null,
                    aoColumnDefs: null,
                    aoSearchCols: [],
                    asStripeClasses: null,
                    bAutoWidth: !0,
                    bDeferRender: !1,
                    bDestroy: !1,
                    bFilter: !0,
                    bInfo: !0,
                    bJQueryUI: !1,
                    bLengthChange: !0,
                    bPaginate: !0,
                    bProcessing: !1,
                    bRetrieve: !1,
                    bScrollCollapse: !1,
                    bServerSide: !1,
                    bSort: !0,
                    bSortMulti: !0,
                    bSortCellsTop: !1,
                    bSortClasses: !0,
                    bStateSave: !1,
                    fnCreatedRow: null,
                    fnDrawCallback: null,
                    fnFooterCallback: null,
                    fnFormatNumber: function(a) {
                        return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.oLanguage.sThousands)
                    },
                    fnHeaderCallback: null,
                    fnInfoCallback: null,
                    fnInitComplete: null,
                    fnPreDrawCallback: null,
                    fnRowCallback: null,
                    fnServerData: null,
                    fnServerParams: null,
                    fnStateLoadCallback: function(a) {
                        try {
                            return JSON.parse((-1 === a.iStateDuration ? sessionStorage : localStorage).getItem("DataTables_" + a.sInstance + "_" + location.pathname))
                        } catch (b) {}
                    },
                    fnStateLoadParams: null,
                    fnStateLoaded: null,
                    fnStateSaveCallback: function(a, b) {
                        try {
                            (-1 === a.iStateDuration ? sessionStorage : localStorage).setItem("DataTables_" + a.sInstance + "_" + location.pathname, JSON.stringify(b))
                        } catch (c) {}
                    },
                    fnStateSaveParams: null,
                    iStateDuration: 7200,
                    iDeferLoading: null,
                    iDisplayLength: 10,
                    iDisplayStart: 0,
                    iTabIndex: 0,
                    oClasses: {},
                    oLanguage: {
                        oAria: {
                            sSortAscending: ": activate to sort column ascending",
                            sSortDescending: ": activate to sort column descending"
                        },
                        oPaginate: {
                            sFirst: "First",
                            sLast: "Last",
                            sNext: "Next",
                            sPrevious: "Previous"
                        },
                        sEmptyTable: "No data available in table",
                        sInfo: "Showing _START_ to _END_ of _TOTAL_ entries",
                        sInfoEmpty: "Showing 0 to 0 of 0 entries",
                        sInfoFiltered: "(filtered from _MAX_ total entries)",
                        sInfoPostFix: "",
                        sDecimal: "",
                        sThousands: ",",
                        sLengthMenu: "Show _MENU_ entries",
                        sLoadingRecords: "Loading...",
                        sProcessing: "Processing...",
                        sSearch: "Search:",
                        sSearchPlaceholder: "",
                        sUrl: "",
                        sZeroRecords: "No matching records found"
                    },
                    oSearch: d.extend({}, Wa.models.oSearch),
                    sAjaxDataProp: "data",
                    sAjaxSource: null,
                    sDom: "lfrtip",
                    searchDelay: null,
                    sPaginationType: "simple_numbers",
                    sScrollX: "",
                    sScrollXInner: "",
                    sScrollY: "",
                    sServerMethod: "GET",
                    renderer: null
                }, e(Wa.defaults), Wa.defaults.column = {
                    aDataSort: null,
                    iDataSort: -1,
                    asSorting: ["asc", "desc"],
                    bSearchable: !0,
                    bSortable: !0,
                    bVisible: !0,
                    fnCreatedCell: null,
                    mData: null,
                    mRender: null,
                    sCellType: "td",
                    sClass: "",
                    sContentPadding: "",
                    sDefaultContent: null,
                    sName: "",
                    sSortDataType: "std",
                    sTitle: null,
                    sType: null,
                    sWidth: null
                }, e(Wa.defaults.column), Wa.models.oSettings = {
                    oFeatures: {
                        bAutoWidth: null,
                        bDeferRender: null,
                        bFilter: null,
                        bInfo: null,
                        bLengthChange: null,
                        bPaginate: null,
                        bProcessing: null,
                        bServerSide: null,
                        bSort: null,
                        bSortMulti: null,
                        bSortClasses: null,
                        bStateSave: null
                    },
                    oScroll: {
                        bCollapse: null,
                        iBarWidth: 0,
                        sX: null,
                        sXInner: null,
                        sY: null
                    },
                    oLanguage: {
                        fnInfoCallback: null
                    },
                    oBrowser: {
                        bScrollOversize: !1,
                        bScrollbarLeft: !1
                    },
                    ajax: null,
                    aanFeatures: [],
                    aoData: [],
                    aiDisplay: [],
                    aiDisplayMaster: [],
                    aoColumns: [],
                    aoHeader: [],
                    aoFooter: [],
                    oPreviousSearch: {},
                    aoPreSearchCols: [],
                    aaSorting: null,
                    aaSortingFixed: [],
                    asStripeClasses: null,
                    asDestroyStripes: [],
                    sDestroyWidth: 0,
                    aoRowCallback: [],
                    aoHeaderCallback: [],
                    aoFooterCallback: [],
                    aoDrawCallback: [],
                    aoRowCreatedCallback: [],
                    aoPreDrawCallback: [],
                    aoInitComplete: [],
                    aoStateSaveParams: [],
                    aoStateLoadParams: [],
                    aoStateLoaded: [],
                    sTableId: "",
                    nTable: null,
                    nTHead: null,
                    nTFoot: null,
                    nTBody: null,
                    nTableWrapper: null,
                    bDeferLoading: !1,
                    bInitialised: !1,
                    aoOpenRows: [],
                    sDom: null,
                    searchDelay: null,
                    sPaginationType: "two_button",
                    iStateDuration: 0,
                    aoStateSave: [],
                    aoStateLoad: [],
                    oSavedState: null,
                    oLoadedState: null,
                    sAjaxSource: null,
                    sAjaxDataProp: null,
                    bAjaxDataGet: !0,
                    jqXHR: null,
                    json: c,
                    oAjaxData: c,
                    fnServerData: null,
                    aoServerParams: [],
                    sServerMethod: null,
                    fnFormatNumber: null,
                    aLengthMenu: null,
                    iDraw: 0,
                    bDrawing: !1,
                    iDrawError: -1,
                    _iDisplayLength: 10,
                    _iDisplayStart: 0,
                    _iRecordsTotal: 0,
                    _iRecordsDisplay: 0,
                    bJUI: null,
                    oClasses: {},
                    bFiltered: !1,
                    bSorted: !1,
                    bSortCellsTop: null,
                    oInit: null,
                    aoDestroyCallback: [],
                    fnRecordsTotal: function() {
                        return "ssp" == Sa(this) ? 1 * this._iRecordsTotal : this.aiDisplayMaster.length
                    },
                    fnRecordsDisplay: function() {
                        return "ssp" == Sa(this) ? 1 * this._iRecordsDisplay : this.aiDisplay.length
                    },
                    fnDisplayEnd: function() {
                        var a = this._iDisplayLength,
                            b = this._iDisplayStart,
                            c = b + a,
                            d = this.aiDisplay.length,
                            e = this.oFeatures,
                            f = e.bPaginate;
                        return e.bServerSide ? f === !1 || -1 === a ? b + d : Math.min(b + a, this._iRecordsDisplay) : !f || c > d || -1 === a ? d : c
                    },
                    oInstance: null,
                    sInstance: null,
                    iTabIndex: 0,
                    nScrollHead: null,
                    nScrollFoot: null,
                    aLastSort: [],
                    oPlugins: {}
                }, Wa.ext = Xa = {
                    classes: {},
                    errMode: "alert",
                    feature: [],
                    search: [],
                    internal: {},
                    legacy: {
                        ajax: null
                    },
                    pager: {},
                    renderer: {
                        pageButton: {},
                        header: {}
                    },
                    order: {},
                    type: {
                        detect: [],
                        search: {},
                        order: {}
                    },
                    _unique: 0,
                    fnVersionCheck: Wa.fnVersionCheck,
                    iApiIndex: 0,
                    oJUIClasses: {},
                    sVersion: Wa.version
                }, d.extend(Xa, {
                    afnFiltering: Xa.search,
                    aTypes: Xa.type.detect,
                    ofnSearch: Xa.type.search,
                    oSort: Xa.type.order,
                    afnSortData: Xa.order,
                    aoFeatures: Xa.feature,
                    oApi: Xa.internal,
                    oStdClasses: Xa.classes,
                    oPagination: Xa.pager
                }), d.extend(Wa.ext.classes, {
                    sTable: "dataTable",
                    sNoFooter: "no-footer",
                    sPageButton: "paginate_button",
                    sPageButtonActive: "current",
                    sPageButtonDisabled: "disabled",
                    sStripeOdd: "odd",
                    sStripeEven: "even",
                    sRowEmpty: "dataTables_empty",
                    sWrapper: "dataTables_wrapper",
                    sFilter: "dataTables_filter",
                    sInfo: "dataTables_info",
                    sPaging: "dataTables_paginate paging_",
                    sLength: "dataTables_length",
                    sProcessing: "dataTables_processing",
                    sSortAsc: "sorting_asc",
                    sSortDesc: "sorting_desc",
                    sSortable: "sorting",
                    sSortableAsc: "sorting_asc_disabled",
                    sSortableDesc: "sorting_desc_disabled",
                    sSortableNone: "sorting_disabled",
                    sSortColumn: "sorting_",
                    sFilterInput: "",
                    sLengthSelect: "",
                    sScrollWrapper: "dataTables_scroll",
                    sScrollHead: "dataTables_scrollHead",
                    sScrollHeadInner: "dataTables_scrollHeadInner",
                    sScrollBody: "dataTables_scrollBody",
                    sScrollFoot: "dataTables_scrollFoot",
                    sScrollFootInner: "dataTables_scrollFootInner",
                    sHeaderTH: "",
                    sFooterTH: "",
                    sSortJUIAsc: "",
                    sSortJUIDesc: "",
                    sSortJUI: "",
                    sSortJUIAscAllowed: "",
                    sSortJUIDescAllowed: "",
                    sSortJUIWrapper: "",
                    sSortIcon: "",
                    sJUIHeader: "",
                    sJUIFooter: ""
                }),
                function() {
                    var a = "";
                    a = "";
                    var b = a + "ui-state-default",
                        c = a + "css_right ui-icon ui-icon-",
                        e = a + "fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix";
                    d.extend(Wa.ext.oJUIClasses, Wa.ext.classes, {
                        sPageButton: "fg-button ui-button " + b,
                        sPageButtonActive: "ui-state-disabled",
                        sPageButtonDisabled: "ui-state-disabled",
                        sPaging: "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",
                        sSortAsc: b + " sorting_asc",
                        sSortDesc: b + " sorting_desc",
                        sSortable: b + " sorting",
                        sSortableAsc: b + " sorting_asc_disabled",
                        sSortableDesc: b + " sorting_desc_disabled",
                        sSortableNone: b + " sorting_disabled",
                        sSortJUIAsc: c + "triangle-1-n",
                        sSortJUIDesc: c + "triangle-1-s",
                        sSortJUI: c + "carat-2-n-s",
                        sSortJUIAscAllowed: c + "carat-1-n",
                        sSortJUIDescAllowed: c + "carat-1-s",
                        sSortJUIWrapper: "DataTables_sort_wrapper",
                        sSortIcon: "DataTables_sort_icon",
                        sScrollHead: "dataTables_scrollHead " + b,
                        sScrollFoot: "dataTables_scrollFoot " + b,
                        sHeaderTH: b,
                        sFooterTH: b,
                        sJUIHeader: e + " ui-corner-tl ui-corner-tr",
                        sJUIFooter: e + " ui-corner-bl ui-corner-br"
                    })
                }();
            var Tb = Wa.ext.pager;
            d.extend(Tb, {
                simple: function(a, b) {
                    return ["previous", "next"]
                },
                full: function(a, b) {
                    return ["first", "previous", "next", "last"]
                },
                simple_numbers: function(a, b) {
                    return ["previous", Ta(a, b), "next"]
                },
                full_numbers: function(a, b) {
                    return ["first", "previous", Ta(a, b), "next", "last"]
                },
                _numbers: Ta,
                numbers_length: 7
            }), d.extend(!0, Wa.ext.renderer, {
                pageButton: {
                    _: function(a, c, e, f, g, h) {
                        var i, j, k = a.oClasses,
                            l = a.oLanguage.oPaginate,
                            m = 0,
                            n = function(b, c) {
                                var f, o, p, q, r = function(b) {
                                    ma(a, b.data.action, !0)
                                };
                                for (f = 0, o = c.length; o > f; f++)
                                    if (q = c[f], d.isArray(q)) {
                                        var s = d("<" + (q.DT_el || "div") + "/>").appendTo(b);
                                        n(s, q)
                                    } else {
                                        switch (i = "", j = "", q) {
                                            case "ellipsis":
                                                b.append("<span>&hellip;</span>");
                                                break;
                                            case "first":
                                                i = l.sFirst, j = q + (g > 0 ? "" : " " + k.sPageButtonDisabled);
                                                break;
                                            case "previous":
                                                i = l.sPrevious, j = q + (g > 0 ? "" : " " + k.sPageButtonDisabled);
                                                break;
                                            case "next":
                                                i = l.sNext, j = q + (h - 1 > g ? "" : " " + k.sPageButtonDisabled);
                                                break;
                                            case "last":
                                                i = l.sLast, j = q + (h - 1 > g ? "" : " " + k.sPageButtonDisabled);
                                                break;
                                            default:
                                                i = q + 1, j = g === q ? k.sPageButtonActive : ""
                                        }
                                        i && (p = d("<a>", {
                                            "class": k.sPageButton + " " + j,
                                            "aria-controls": a.sTableId,
                                            "data-dt-idx": m,
                                            tabindex: a.iTabIndex,
                                            id: 0 === e && "string" == typeof q ? a.sTableId + "_" + q : null
                                        }).html(i).appendTo(b), Na(p, {
                                            action: q
                                        }, r), m++)
                                    }
                            };
                        try {
                            var o = d(b.activeElement).data("dt-idx");
                            n(d(c).empty(), f), null !== o && d(c).find("[data-dt-idx=" + o + "]").focus()
                        } catch (p) {}
                    }
                }
            });
            var Ub = function(a, b, c, d) {
                return 0 === a || a && "-" !== a ? (b && (a = ib(a, b)), a.replace && (c && (a = a.replace(c, "")), d && (a = a.replace(d, ""))), 1 * a) : -(1 / 0)
            };
            return d.extend(Xa.type.order, {
                "date-pre": function(a) {
                    return Date.parse(a) || 0
                },
                "html-pre": function(a) {
                    return gb(a) ? "" : a.replace ? a.replace(/<.*?>/g, "").toLowerCase() : a + ""
                },
                "string-pre": function(a) {
                    return gb(a) ? "" : "string" == typeof a ? a.toLowerCase() : a.toString ? a.toString() : ""
                },
                "string-asc": function(a, b) {
                    return b > a ? -1 : a > b ? 1 : 0
                },
                "string-desc": function(a, b) {
                    return b > a ? 1 : a > b ? -1 : 0
                }
            }), Ua(""), d.extend(Wa.ext.type.detect, [function(a, b) {
                var c = b.oLanguage.sDecimal;
                return jb(a, c) ? "num" + c : null
            }, function(a, b) {
                if (!(!a || a instanceof Date || cb.test(a) && db.test(a))) return null;
                var c = Date.parse(a);
                return null !== c && !isNaN(c) || gb(a) ? "date" : null
            }, function(a, b) {
                var c = b.oLanguage.sDecimal;
                return jb(a, c, !0) ? "num-fmt" + c : null
            }, function(a, b) {
                var c = b.oLanguage.sDecimal;
                return lb(a, c) ? "html-num" + c : null
            }, function(a, b) {
                var c = b.oLanguage.sDecimal;
                return lb(a, c, !0) ? "html-num-fmt" + c : null
            }, function(a, b) {
                return gb(a) || "string" == typeof a && -1 !== a.indexOf("<") ? "html" : null
            }]), d.extend(Wa.ext.type.search, {
                html: function(a) {
                    return gb(a) ? a : "string" == typeof a ? a.replace(ab, " ").replace(bb, "") : ""
                },
                string: function(a) {
                    return gb(a) ? a : "string" == typeof a ? a.replace(ab, " ") : a
                }
            }), d.extend(!0, Wa.ext.renderer, {
                header: {
                    _: function(a, b, c, e) {
                        d(a.nTable).on("order.dt.DT", function(d, f, g, h) {
                            if (a === f) {
                                var i = c.idx;
                                b.removeClass(c.sSortingClass + " " + e.sSortAsc + " " + e.sSortDesc).addClass("asc" == h[i] ? e.sSortAsc : "desc" == h[i] ? e.sSortDesc : c.sSortingClass)
                            }
                        })
                    },
                    jqueryui: function(a, b, c, e) {
                        d("<div/>").addClass(e.sSortJUIWrapper).append(b.contents()).append(d("<span/>").addClass(e.sSortIcon + " " + c.sSortingClassJUI)).appendTo(b), d(a.nTable).on("order.dt.DT", function(d, f, g, h) {
                            if (a === f) {
                                var i = c.idx;
                                b.removeClass(e.sSortAsc + " " + e.sSortDesc).addClass("asc" == h[i] ? e.sSortAsc : "desc" == h[i] ? e.sSortDesc : c.sSortingClass), b.find("span." + e.sSortIcon).removeClass(e.sSortJUIAsc + " " + e.sSortJUIDesc + " " + e.sSortJUI + " " + e.sSortJUIAscAllowed + " " + e.sSortJUIDescAllowed).addClass("asc" == h[i] ? e.sSortJUIAsc : "desc" == h[i] ? e.sSortJUIDesc : c.sSortingClassJUI)
                            }
                        })
                    }
                }
            }), Wa.render = {
                number: function(a, b, c, d) {
                    return {
                        display: function(e) {
                            var f = 0 > e ? "-" : "";
                            e = Math.abs(parseFloat(e));
                            var g = parseInt(e, 10),
                                h = c ? b + (e - g).toFixed(c).substring(2) : "";
                            return f + (d || "") + g.toString().replace(/\B(?=(\d{3})+(?!\d))/g, a) + h
                        }
                    }
                }
            }, d.extend(Wa.ext.internal, {
                _fnExternApiFunc: Va,
                _fnBuildAjax: R,
                _fnAjaxUpdate: S,
                _fnAjaxParameters: T,
                _fnAjaxUpdateDraw: U,
                _fnAjaxDataSrc: V,
                _fnAddColumn: l,
                _fnColumnOptions: m,
                _fnAdjustColumnSizing: n,
                _fnVisibleToColumnIndex: o,
                _fnColumnIndexToVisible: p,
                _fnVisbleColumns: q,
                _fnGetColumns: r,
                _fnColumnTypes: s,
                _fnApplyColumnDefs: t,
                _fnHungarianMap: e,
                _fnCamelToHungarian: f,
                _fnLanguageCompat: g,
                _fnBrowserDetect: j,
                _fnAddData: u,
                _fnAddTr: v,
                _fnNodeToDataIndex: w,
                _fnNodeToColumnIndex: x,
                _fnGetCellData: y,
                _fnSetCellData: z,
                _fnSplitObjNotation: A,
                _fnGetObjectDataFn: B,
                _fnSetObjectDataFn: C,
                _fnGetDataMaster: D,
                _fnClearTable: E,
                _fnDeleteIndex: F,
                _fnInvalidateRow: G,
                _fnGetRowElements: H,
                _fnCreateTr: I,
                _fnBuildHead: K,
                _fnDrawHead: L,
                _fnDraw: M,
                _fnReDraw: N,
                _fnAddOptionsHtml: O,
                _fnDetectHeader: P,
                _fnGetUniqueThs: Q,
                _fnFeatureHtmlFilter: W,
                _fnFilterComplete: X,
                _fnFilterCustom: Y,
                _fnFilterColumn: Z,
                _fnFilter: $,
                _fnFilterCreateSearch: _,
                _fnEscapeRegex: aa,
                _fnFilterData: ba,
                _fnFeatureHtmlInfo: ea,
                _fnUpdateInfo: fa,
                _fnInfoMacros: ga,
                _fnInitialise: ha,
                _fnInitComplete: ia,
                _fnLengthChange: ja,
                _fnFeatureHtmlLength: ka,
                _fnFeatureHtmlPaginate: la,
                _fnPageChange: ma,
                _fnFeatureHtmlProcessing: na,
                _fnProcessingDisplay: oa,
                _fnFeatureHtmlTable: pa,
                _fnScrollDraw: qa,
                _fnApplyToChildren: ra,
                _fnCalculateColumnWidths: sa,
                _fnThrottle: ta,
                _fnConvertToWidth: ua,
                _fnScrollingWidthAdjust: va,
                _fnGetWidestNode: wa,
                _fnGetMaxLenString: xa,
                _fnStringToCss: ya,
                _fnScrollBarWidth: za,
                _fnSortFlatten: Aa,
                _fnSort: Ba,
                _fnSortAria: Ca,
                _fnSortListener: Da,
                _fnSortAttachListener: Ea,
                _fnSortingClasses: Fa,
                _fnSortData: Ga,
                _fnSaveState: Ha,
                _fnLoadState: Ia,
                _fnSettingsFromNode: Ja,
                _fnLog: Ka,
                _fnMap: La,
                _fnBindAction: Na,
                _fnCallbackReg: Oa,
                _fnCallbackFire: Pa,
                _fnLengthOverflow: Qa,
                _fnRenderer: Ra,
                _fnDataSource: Sa,
                _fnRowAttributes: J,
                _fnCalculateEnd: function() {}
            }), d.fn.dataTable = Wa, d.fn.dataTableSettings = Wa.settings, d.fn.dataTableExt = Wa.ext, d.fn.DataTable = function(a) {
                return d(this).dataTable(a).api()
            }, d.each(Wa, function(a, b) {
                d.fn.DataTable[a] = b
            }), d.fn.dataTable
        })
    }(window, document);