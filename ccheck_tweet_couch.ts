// ===========================================================================
/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
// -------------------------------------------------------------- reference(s)
// ------------------------------------------------ http://definitelytyped.org
/// <reference path="../DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../DefinitelyTyped/bootstrap/bootstrap.d.ts"/>
/// <reference path="../DefinitelyTyped/backbone/backbone.d.ts"/>
/// <reference path="../DefinitelyTyped/hogan/hogan.d.ts"/>
/// <reference path="./ccheck_tweet.ts"/>

// ---------------------------------------------------------------- declare(s)

module ccheck_tweet {

    // ---------------------------------------------------------- interface(s)

    interface ICOUCHDB_DOCUMENT_HASHTAG {
        text: string;
    }

    interface ICOUCHDB_DOCUMENT_USER {
        id: number;
        profile_image_url: string;
        screen_name: string;
        name: string;
    }

    interface ICOUCHDB_DOCUMENT {
        _id: string;
        id_str: string;
        created_at: string;
        hashtags: Array<ICOUCHDB_DOCUMENT_HASHTAG>;
        urls: Array<{ url: string, expanded_url: string }>;
        media: Array<{ url: string }>;
        possibly_sensitive: boolean;
        text: string;
        user: ICOUCHDB_DOCUMENT_USER;
    }

    interface ICOUCHDB_RESULT {
        total_rows: number;
        offset: number;
        rows: Array<ICOUCHDB_DOCUMENT>;
    }

    interface ITWEET {
        current_datetime: string;
        id_str: string;
        hashtags: Array<ICOUCHDB_DOCUMENT_HASHTAG>;
        possibly_sensitive: boolean;
        text: string;
        media_count: number;
        new_tweet: boolean;
        with_attachments: boolean;
    }

    interface IUSERTWEET {
        id: number;
        name: string;
        screen_name: string;
        profile_image_url: string;
        more_tweet_count?: number;
        tweet_list: Array<ITWEET>;
        tweet_list_more: Array<ITWEET>;
    }

    // --------------------------------------------------------------- enum(s)
    // ------------------------------------------------------ Global Object(s)
    // -------------------------------------------------------------- class(s)
    // -----------------------------------------------------------------------
    /*!
     */
    export class model_CDoc extends Backbone.Model {

        //
        constructor(attributes?: any, options?: any) {
            super(attributes, options);
        }
    }


    // -----------------------------------------------------------------------
    /*!
     */
    export class collection_CDoc extends Backbone.Collection<model_CDoc> {

        //
        constructor(attributes?: any, options?: any) {
            super(attributes, options);
        }

        //
        modelId(attributes: ICOUCHDB_DOCUMENT) {
            return attributes._id;
        }

        parse(data: ICOUCHDB_RESULT): Array<ICOUCHDB_DOCUMENT> {
            return data.rows;
        }
    }


    // -----------------------------------------------------------------------
    /*!
     */
    export class view_CDocTable extends Backbone.View<model_CDoc> {
        private id_render_target: string;
        private template: Hogan.template;

        //
        constructor(options?: Backbone.ViewOptions<model_CDoc>, template?: Hogan.template, id_render_target?: string) {
            super(options);

            this.template = template;
            this.id_render_target = id_render_target;

            this.listenTo(this.collection, "update", this.render);
        }

        //
        events(): Backbone.EventsHash {
            return {
                "click button.show_tweet": this.evt_show_tweet,
                "click a.show_tbl_usr": this.evt_show_tbl_usr
            }
        }

        evt_show_tweet(evt: any): void {
            let tpl = Hogan.compile(
                '<blockquote class="twitter-tweet" width="100%" data-conversation="none" data-lang="ja"><p lang="ja" dir="ltr"><a href="https://twitter.com/{{screen-name}}/status/{{tweet-id}}"></a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
            );
            let o = $("#" + evt.currentTarget.id);

            $("#tweet-screen").html(
                tpl.render(
                    {
                        "screen-name": o.data("screen-name"),
                        "tweet-id": o.data("tweet-id")
                    }
                )
            );
        }

        evt_show_tbl_usr(evt: any): void {
            /*let o = $("#" + evt.currentTarget.id);

            CApplication.instance.m_view_Usr.collection.url = WEBAPI_BASE + "/circlecheck_tweet/_design/cache/_view/tweet_usr";
            CApplication.instance.m_view_Usr.collection.fetch(
                {
                    data: {
                        include_docs: true,
                        descending: true,
                        startkey: JSON.stringify([o.data("user-id"), "Z"]),
                        endkey: JSON.stringify([o.data("user-id")]),
                        limit: 256
                    }
                }
            );*/
        }

        //
        group_by_user(): Array<IUSERTWEET> {
            const r_date_curr: Date = new Date();
            let dictUser: { [key: number]: IUSERTWEET; } = {}
            let listResult: Array<IUSERTWEET> = [];

            for (let n: number = 0; n < this.collection.length; n++) {
                const r: ICOUCHDB_DOCUMENT = this.collection.at(n).attributes.doc;
                const r_date: Date = new Date(Date.parse(r.created_at));
                let tweet_text: string = r.text;
                let elapsed_time: number = r_date_curr.getTime() - (r_date.getTime() + (24 * 3600 * 1000));

                if (isNaN(r_date) == true) {
                    r_date = new Date(Date(r.created_at));
                }

                if (r.user.id in dictUser) {
                } else {
                    let o: IUSERTWEET = {
                        id: r.user.id,
                        name: r.user.name,
                        screen_name: r.user.screen_name,
                        profile_image_url: r.user.profile_image_url,
                        tweet_list: [],
                        tweet_list_more: []
                    }
                    dictUser[r.user.id] = o;

                    listResult.push(o);
                }

                let o: IUSERTWEET = dictUser[r.user.id];
                let media_count: number = 0;

                if (r.media) {
                    media_count = r.media.length;
                    for (let n: number = 0; n < r.media.length; n++) {
                        const url: string = r.media[n].url;
                        tweet_text = tweet_text.replace(url, "");
                    }
                }

                tweet_text = tweet_text.replace(/\n/g, "<br />");

                if (o.tweet_list.length < 3) {
                    o.tweet_list.push(
                        {
                            current_datetime: formatDate(r_date),
                            id_str: r.id_str,
                            possibly_sensitive: r.possibly_sensitive,
                            hashtags: r.hashtags,
                            text: tweet_text, new_tweet: elapsed_time < 0, with_attachments: media_count > 0, media_count: media_count
                        }
                    );
                } else {
                    o.tweet_list_more.push(
                        {
                            current_datetime: formatDate(r_date),
                            id_str: r.id_str,
                            possibly_sensitive: r.possibly_sensitive,
                            hashtags: r.hashtags,
                            text: tweet_text, new_tweet: elapsed_time < 0, with_attachments: media_count > 0, media_count: media_count
                        }
                    );
                    o.more_tweet_count = o.tweet_list_more.length;
                }
            }

            return listResult;
        }

        //
        render() {
            const listUserTweet: Array<IUSERTWEET> = this.group_by_user();
            let listRenderSource: Array<string> = [];
            let tpl = Hogan.compile($("#id_tpl_tweet_button").html());

            for (let n: number = 0; n < listUserTweet.length; n++) {
                listRenderSource.push(
                    this.template.render(listUserTweet[n])
                );
            }

            $("#id_current_hashtag").html("#" + CApplication.instance.m_strCurrentHashTag);

            $("#id_tweet_button").html(tpl.render());

            $(this.id_render_target).html(listRenderSource.join(""));

            return this;
        }
    }

    function formatDate(date: Date, format?: string): string {

        if (!format) format = "YYYY-MM-DD hh:mm:ss";

        format = format.replace(/YYYY/g, ('0000' + (date.getFullYear())).slice(-4));
        format = format.replace(/MM/g, ('00' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('00' + date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('00' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('00' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('00' + date.getSeconds()).slice(-2));

        return format;
    };
}



// --------------------------------------------------------------------- [EOF]
