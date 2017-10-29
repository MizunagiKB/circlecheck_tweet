/*!
 * @brief CircleCheck
 * @author @MizunagiKB
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ccheck_tweet;
(function (ccheck_tweet) {
    var model_CDoc = (function (_super) {
        __extends(model_CDoc, _super);
        function model_CDoc(attributes, options) {
            return _super.call(this, attributes, options) || this;
        }
        return model_CDoc;
    }(Backbone.Model));
    ccheck_tweet.model_CDoc = model_CDoc;
    var collection_CDoc = (function (_super) {
        __extends(collection_CDoc, _super);
        function collection_CDoc(attributes, options) {
            return _super.call(this, attributes, options) || this;
        }
        collection_CDoc.prototype.modelId = function (attributes) {
            return attributes._id;
        };
        collection_CDoc.prototype.parse = function (data) {
            return data.rows;
        };
        return collection_CDoc;
    }(Backbone.Collection));
    ccheck_tweet.collection_CDoc = collection_CDoc;
    var view_CDocTable = (function (_super) {
        __extends(view_CDocTable, _super);
        function view_CDocTable(options, template, id_render_target) {
            var _this = _super.call(this, options) || this;
            _this.template = template;
            _this.id_render_target = id_render_target;
            _this.b_enable_img = false;
            _this.b_enable_possibly_sensitive = false;
            _this.listenTo(_this.collection, "update", _this.render);
            return _this;
        }
        view_CDocTable.prototype.events = function () {
            return {
                "click button.show_tweet": this.evt_show_tweet,
                "click a.show_tbl_usr": this.evt_show_tbl_usr,
                "click label#id_enable_img": this.evt_enable_img,
                "click label#id_enable_possibly_sensitive": this.evt_enable_possibly_sensitive
            };
        };
        view_CDocTable.prototype.evt_show_tweet = function (evt) {
            var tpl = Hogan.compile('<blockquote class="twitter-tweet" width="100%" data-conversation="none" data-lang="ja"><p lang="ja" dir="ltr"><a href="https://twitter.com/{{screen-name}}/status/{{tweet-id}}"></a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
            var o = $("#" + evt.currentTarget.id);
            $("#tweet-screen").html(tpl.render({
                "screen-name": o.data("screen-name"),
                "tweet-id": o.data("tweet-id")
            }));
        };
        view_CDocTable.prototype.evt_show_tbl_usr = function (evt) {
        };
        view_CDocTable.prototype.evt_enable_img = function (evt) {
            this.b_enable_img = $("#id_enable_img").hasClass("active") == true ? false : true;
            this.render();
        };
        view_CDocTable.prototype.evt_enable_possibly_sensitive = function () {
            this.b_enable_possibly_sensitive = $("#id_enable_possibly_sensitive").hasClass("active") == true ? false : true;
            this.render();
        };
        view_CDocTable.prototype.group_by_user = function () {
            var r_date_curr = new Date();
            var dictUser = {};
            var listResult = [];
            for (var n = 0; n < this.collection.length; n++) {
                var r = this.collection.at(n).attributes.doc;
                var r_date = new Date(Date.parse(r.created_at));
                var tweet_text = r.text;
                var elapsed_time = r_date_curr.getTime() - (r_date.getTime() + (24 * 3600 * 1000));
                if (isNaN(r_date) == true) {
                    r_date = new Date(Date(r.created_at));
                }
                if (r.user.id in dictUser) {
                }
                else {
                    var o_1 = {
                        id: r.user.id,
                        name: r.user.name,
                        screen_name: r.user.screen_name,
                        profile_image_url: r.user.profile_image_url,
                        tweet_list: [],
                        tweet_list_more: []
                    };
                    dictUser[r.user.id] = o_1;
                    listResult.push(o_1);
                }
                var o = dictUser[r.user.id];
                var media_count = 0;
                if (r.media) {
                    media_count = r.media.length;
                    for (var n_1 = 0; n_1 < r.media.length; n_1++) {
                        var url = r.media[n_1].url;
                        tweet_text = tweet_text.replace(url, "");
                    }
                }
                tweet_text = tweet_text.replace(/\n/g, "<br />");
                if (o.tweet_list.length < 3) {
                    o.tweet_list.push({
                        current_datetime: formatDate(r_date),
                        id_str: r.id_str,
                        possibly_sensitive: r.possibly_sensitive,
                        hashtags: r.hashtags,
                        media: r.media,
                        text: tweet_text, new_tweet: elapsed_time < 0, with_attachments: media_count > 0, media_count: media_count,
                        enable_img: this.b_enable_img,
                        enable_possibly_sensitive: this.b_enable_possibly_sensitive
                    });
                }
                else {
                    o.tweet_list_more.push({
                        current_datetime: formatDate(r_date),
                        id_str: r.id_str,
                        possibly_sensitive: r.possibly_sensitive,
                        hashtags: r.hashtags,
                        media: r.media,
                        text: tweet_text, new_tweet: elapsed_time < 0, with_attachments: media_count > 0, media_count: media_count,
                        enable_img: this.b_enable_img,
                        enable_possibly_sensitive: this.b_enable_possibly_sensitive
                    });
                    o.more_tweet_count = o.tweet_list_more.length;
                }
            }
            return listResult;
        };
        view_CDocTable.prototype.render = function () {
            var listUserTweet = this.group_by_user();
            var listRenderSource = [];
            var tpl = Hogan.compile($("#id_tpl_tweet_button").html());
            for (var n = 0; n < listUserTweet.length; n++) {
                listRenderSource.push(this.template.render(listUserTweet[n]));
            }
            $("#id_current_hashtag").html("#" + ccheck_tweet.CApplication.instance.m_strCurrentHashTag);
            $("#id_tweet_button").html(tpl.render());
            $(this.id_render_target).html(listRenderSource.join(""));
            return this;
        };
        return view_CDocTable;
    }(Backbone.View));
    ccheck_tweet.view_CDocTable = view_CDocTable;
    function formatDate(date, format) {
        if (!format)
            format = "YYYY-MM-DD hh:mm:ss";
        format = format.replace(/YYYY/g, ('0000' + (date.getFullYear())).slice(-4));
        format = format.replace(/MM/g, ('00' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('00' + date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('00' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('00' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('00' + date.getSeconds()).slice(-2));
        return format;
    }
    ;
})(ccheck_tweet || (ccheck_tweet = {}));
//# sourceMappingURL=ccheck_tweet_couch.js.map