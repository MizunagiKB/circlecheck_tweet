// ===========================================================================
/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
// -------------------------------------------------------------- reference(s)
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../DefinitelyTyped/bootstrap/bootstrap.d.ts"/>
/// <reference path="../DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="../DefinitelyTyped/hogan/hogan.d.ts"/>

// ---------------------------------------------------------------- declare(s)
// ----------------------------------------------------------------- module(s)
module ccheck_tweet {

    //export const WEBAPI_BASE = "http://127.0.0.1:5984";
    export const WEBAPI_BASE = "/db";

    const DEFAULT_ROWS_LIMIT: number = 250;

    export class CApplication {
        public static instance: CApplication = null;

        private m_htags_m: model_CHTags = null;
        private m_htags_v: view_CHTags = null;

        public m_view_Tag: view_CDocTable = null;
        public m_view_Usr: view_CDocTable = null;

        public m_strCurrentHashTag: string = "";

        // -------------------------------------------------------------------
        /*!
         */
        constructor(strHashTag: string, nLimit: number) {
            this.m_strCurrentHashTag = decodeURI(strHashTag).toLowerCase();

            this.m_htags_m = new model_CHTags();
            this.m_htags_v = new view_CHTags(
                {
                    el: "body",
                    model: this.m_htags_m
                },
            );

            this.m_view_Tag = new view_CDocTable(
                {
                    el: "body",
                    collection: new collection_CDoc()
                },
                Hogan.compile($("#id_tpl_tweet").html()),
                "#id_tbl_tweet_tag"
            )

            this.m_view_Usr = new view_CDocTable(
                {
                    el: "body",
                    collection: new collection_CDoc()
                },
                Hogan.compile($("#id_tpl_tweet").html()),
                "#id_tbl_tweet_usr"
            )

            $("#id_view_tweet").hide();
            $("#id_menu_tweet").addClass("disabled");
            $("#id_view_htags").hide();
            $("#id_menu_htags").addClass("disabled");

            if (this.m_strCurrentHashTag == "") {

                this.m_htags_m.url = WEBAPI_BASE + "/circlecheck_tweet/_design/cache/_view/tag";
                this.m_htags_m.fetch(
                    {
                        data: {
                            group: true,
                            group_level: 1,
                            reduce: true
                        }
                    }
                );
                $("#id_view_htags").show();
                $("#id_menu_htags").removeClass("disabled");

            } else {

                this.m_view_Tag.collection.url = WEBAPI_BASE + "/circlecheck_tweet/_design/cache/_view/tweet_tag";

                this.m_view_Tag.collection.fetch(
                    {
                        data: {
                            include_docs: true,
                            descending: true,
                            startkey: JSON.stringify([this.m_strCurrentHashTag, "Z"]),
                            endkey: JSON.stringify([this.m_strCurrentHashTag]),
                            limit: nLimit
                        }
                    }
                );

                $("#id_view_tweet").show();
                $("#id_menu_tweet").removeClass("disabled");
                $("#id_menu_htags").removeClass("disabled");
            }

            CApplication.instance = this;
        }
    }

    // =======================================================================
    /*!
     */
    function get_url_param(): { [key: string]: string } {
        let listResult: { [key: string]: string } = {};
        let listParam: string[] = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");

        for (let n: number = 0; n < listParam.length; n++) {
            const listData: Array<string> = listParam[n].split("=");

            listResult[listData[0]] = listData[1];
        }

        return listResult;
    }

    // =======================================================================
    /*!
     */
    export function main() {
        const dictParam: { [key: string]: string } = get_url_param();
        let strHashTag: string = "";
        let nLimit: number = DEFAULT_ROWS_LIMIT;

        if ("hashtag" in dictParam) {
            strHashTag = dictParam["hashtag"];
        }

        if ("limit" in dictParam) {
            nLimit = parseInt(dictParam["limit"]);
        }

        let o = new CApplication(strHashTag, nLimit);

        return o;
    }
}

//
