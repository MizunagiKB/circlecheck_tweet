/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
var ccheck_tweet;
(function (ccheck_tweet) {
    ccheck_tweet.WEBAPI_BASE = "/db";
    var DEFAULT_ROWS_LIMIT = 250;
    var CApplication = (function () {
        function CApplication(strHashTag, nLimit, b_enable_img, b_enable_possibly_sensitive) {
            this.m_htags_m = null;
            this.m_htags_v = null;
            this.m_view_Tag = null;
            this.m_view_Usr = null;
            this.m_strCurrentHashTag = "";
            this.m_strCurrentHashTag = decodeURI(strHashTag).toLowerCase();
            this.m_htags_m = new ccheck_tweet.model_CHTags();
            this.m_htags_v = new ccheck_tweet.view_CHTags({
                el: "body",
                model: this.m_htags_m
            });
            this.m_view_Tag = new ccheck_tweet.view_CDocTable({
                el: "body",
                collection: new ccheck_tweet.collection_CDoc()
            }, Hogan.compile($("#id_tpl_tweet").html()), "#id_tbl_tweet_tag");
            this.m_view_Usr = new ccheck_tweet.view_CDocTable({
                el: "body",
                collection: new ccheck_tweet.collection_CDoc()
            }, Hogan.compile($("#id_tpl_tweet").html()), "#id_tbl_tweet_usr");
            $("#id_view_tweet").hide();
            $("#id_menu_tweet").addClass("disabled");
            $("#id_view_htags").hide();
            $("#id_menu_htags").addClass("disabled");
            if (this.m_strCurrentHashTag == "") {
                this.m_htags_m.url = ccheck_tweet.WEBAPI_BASE + "/circlecheck_tweet/_design/cache/_view/tag";
                this.m_htags_m.fetch({
                    data: {
                        group: true,
                        group_level: 1,
                        reduce: true
                    }
                });
                $("#id_view_htags").show();
                $("#id_menu_htags").removeClass("disabled");
            }
            else {
                this.m_view_Tag.collection.url = ccheck_tweet.WEBAPI_BASE + "/circlecheck_tweet/_design/cache/_view/tweet_tag";
                this.m_view_Tag.collection.fetch({
                    data: {
                        include_docs: true,
                        descending: true,
                        startkey: JSON.stringify([this.m_strCurrentHashTag, "Z"]),
                        endkey: JSON.stringify([this.m_strCurrentHashTag]),
                        limit: nLimit
                    }
                });
                $("#id_limit_count").html(String(nLimit));
                var tplPills = Hogan.compile($("#id_tpl_pills").html());
                $("#id_limit_pills").html(tplPills.render({
                    tag_encode: strHashTag,
                    limit_250: (nLimit == 250) ? true : false,
                    limit_500: (nLimit == 500) ? true : false,
                    limit_750: (nLimit == 750) ? true : false
                }));
                var tplChecks = Hogan.compile(''
                    + '<label id="id_enable_img" class="btn btn-primary {{#enable_img}}active{{/enable_img}}">'
                    + '    <input id="id_input_enable_img" type="checkbox" autocomplete="off" {{#enable_img}}checked{{/enable_img}} /><span class="glyphicon glyphicon-picture"></span>&nbsp;画像を表示'
                    + '</label>'
                    + '<label id="id_enable_possibly_sensitive" class="btn btn-primary {{#enable_possibly_sensitive}}active{{/enable_possibly_sensitive}}">'
                    + '    <input id="id_input_enable_possibly_sensitive" type="checkbox" autocomplete="off" {{#enable_possibly_sensitive}}checked{{/enable_possibly_sensitive}} /><span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;不適切設定も表示'
                    + '</label>');
                $("#id_mode_checks").html(tplChecks.render({
                    enable_img: b_enable_img,
                    enable_possibly_sensitive: b_enable_possibly_sensitive
                }));
                $("#id_view_tweet").show();
                $("#id_menu_tweet").removeClass("disabled");
                $("#id_menu_htags").removeClass("disabled");
            }
            CApplication.instance = this;
        }
        return CApplication;
    }());
    CApplication.instance = null;
    ccheck_tweet.CApplication = CApplication;
    function get_url_param() {
        var listResult = {};
        var listParam = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
        for (var n = 0; n < listParam.length; n++) {
            var listData = listParam[n].split("=");
            listResult[listData[0]] = listData[1];
        }
        return listResult;
    }
    function main() {
        var dictParam = get_url_param();
        var strHashTag = "";
        var nLimit = DEFAULT_ROWS_LIMIT;
        var b_enable_img = false;
        var b_enable_possibly_sensitive = false;
        if ("hashtag" in dictParam) {
            strHashTag = dictParam["hashtag"];
        }
        if ("limit" in dictParam) {
            nLimit = parseInt(dictParam["limit"]);
        }
        if ("ei" in dictParam) {
            b_enable_img = parseInt(dictParam["ei"]) == 1 ? true : false;
        }
        if ("eps" in dictParam) {
            b_enable_possibly_sensitive = parseInt(dictParam["eps"]) == 1 ? true : false;
        }
        var o = new CApplication(strHashTag, nLimit, b_enable_img, b_enable_possibly_sensitive);
        return o;
    }
    ccheck_tweet.main = main;
})(ccheck_tweet || (ccheck_tweet = {}));
//# sourceMappingURL=ccheck_tweet.js.map