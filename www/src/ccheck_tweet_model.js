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
    var model_CHTags = (function (_super) {
        __extends(model_CHTags, _super);
        function model_CHTags(attributes, options) {
            return _super.call(this, attributes, options) || this;
        }
        return model_CHTags;
    }(Backbone.Model));
    ccheck_tweet.model_CHTags = model_CHTags;
    var model_CTimeline = (function (_super) {
        __extends(model_CTimeline, _super);
        function model_CTimeline(attributes, options) {
            return _super.call(this, attributes, options) || this;
        }
        return model_CTimeline;
    }(Backbone.Model));
    ccheck_tweet.model_CTimeline = model_CTimeline;
    function compare_hashtag_count(compare, to) {
        if (to.value == compare.value) {
            if (compare.tag > to.tag) {
                return 1;
            }
            else {
                return -1;
            }
        }
        return (to.value - compare.value);
    }
    var view_CHTags = (function (_super) {
        __extends(view_CHTags, _super);
        function view_CHTags(options) {
            var _this = _super.call(this, options) || this;
            _this.listenTo(_this.model, "change", _this.render);
            return _this;
        }
        view_CHTags.prototype.events = function () {
            return {};
        };
        view_CHTags.prototype.render = function () {
            var tplHTags = Hogan.compile($("#id_tpl_htags").html());
            var listRenderSource = [];
            var listData = [];
            for (var n = 0; n < this.model.attributes.rows.length; n++) {
                var r = this.model.attributes.rows[n];
                if (r.value > 1) {
                    listData.push(this.model.attributes.rows[n]);
                }
            }
            listData.sort(compare_hashtag_count);
            for (var n = 0; n < listData.length; n++) {
                var r = listData[n];
                listRenderSource.push(tplHTags.render({ tag: r.key[0], tag_encode: encodeURI(r.key[0]), value: r.value }));
            }
            $("#id_tbl_htags").html(listRenderSource.join(""));
            return this;
        };
        return view_CHTags;
    }(Backbone.View));
    ccheck_tweet.view_CHTags = view_CHTags;
})(ccheck_tweet || (ccheck_tweet = {}));
//# sourceMappingURL=ccheck_tweet_model.js.map