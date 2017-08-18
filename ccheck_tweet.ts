// ===========================================================================
/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
// -------------------------------------------------------------- reference(s)
/// <reference path="../DefinitelyTyped/jquery/index.d.ts"/>
/// <reference path="../DefinitelyTyped/bootstrap/index.d.ts"/>
/// <reference path="../DefinitelyTyped/backbone/index.d.ts"/>
/// <reference path="../DefinitelyTyped/hogan/index.d.ts"/>

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
        constructor(strHashTag: string, nLimit: number, b_enable_img: boolean, b_enable_possibly_sensitive: boolean) {
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

                $("#id_limit_count").html(String(nLimit));

                let tplPills = Hogan.compile($("#id_tpl_pills").html());
                $("#id_limit_pills").html(
                    tplPills.render(
                        {
                            tag_encode: strHashTag,
                            limit_250: (nLimit == 250) ? true : false,
                            limit_500: (nLimit == 500) ? true : false,
                            limit_750: (nLimit == 750) ? true : false
                        }
                    )
                );

                let tplChecks = Hogan.compile(
                    ''
                    + '<label id="id_enable_img" class="btn btn-primary {{#enable_img}}active{{/enable_img}}">'
                    + '    <input id="id_input_enable_img" type="checkbox" autocomplete="off" {{#enable_img}}checked{{/enable_img}} /><span class="glyphicon glyphicon-picture"></span>&nbsp;画像を表示'
                    + '</label>'
                    + '<label id="id_enable_possibly_sensitive" class="btn btn-primary {{#enable_possibly_sensitive}}active{{/enable_possibly_sensitive}}">'
                    + '    <input id="id_input_enable_possibly_sensitive" type="checkbox" autocomplete="off" {{#enable_possibly_sensitive}}checked{{/enable_possibly_sensitive}} /><span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;不適切設定も表示'
                    + '</label>'
                );
                $("#id_mode_checks").html(
                    tplChecks.render(
                        {
                            enable_img: b_enable_img,
                            enable_possibly_sensitive: b_enable_possibly_sensitive
                        }
                    )
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
        let b_enable_img: boolean = false;
        let b_enable_possibly_sensitive: boolean = false;

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

        let o = new CApplication(
            strHashTag,
            nLimit,
            b_enable_img,
            b_enable_possibly_sensitive
        );

        return o;
    }
}

//
