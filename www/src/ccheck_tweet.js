/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
var ccheck_tweet;
(function (ccheck_tweet) {
    ccheck_tweet.WEBAPI_BASE = "/db";
    var DEFAULT_ROWS_LIMIT = 250;
    var CApplication = (function () {
        function CApplication(strHashTag, nLimit) {
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
                $("#id_view_tweet").show();
                $("#id_menu_tweet").removeClass("disabled");
                $("#id_menu_htags").removeClass("disabled");
            }
            CApplication.instance = this;
        }
        CApplication.instance = null;
        return CApplication;
    }());
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
        if ("hashtag" in dictParam) {
            strHashTag = dictParam["hashtag"];
        }
        if ("limit" in dictParam) {
            nLimit = parseInt(dictParam["limit"]);
        }
        var o = new CApplication(strHashTag, nLimit);
        return o;
    }
    ccheck_tweet.main = main;
})(ccheck_tweet || (ccheck_tweet = {}));
//# sourceMappingURL=ccheck_tweet.js.map