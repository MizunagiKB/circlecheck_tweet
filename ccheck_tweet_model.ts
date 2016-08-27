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
    // --------------------------------------------------------------- enum(s)
    // ------------------------------------------------------ Global Object(s)
    // -------------------------------------------------------------- class(s)
    // -----------------------------------------------------------------------
    /*!
     */
    export class model_CHTags extends Backbone.Model {

        //
        constructor(attributes?: any, options?: any) {
            super(attributes, options);
        }
    }

    // -----------------------------------------------------------------------
    /*!
     */
    export class model_CTimeline extends Backbone.Model {

        //
        constructor(attributes?: any, options?: any) {
            super(attributes, options);
        }
    }

    // =======================================================================
    /*!
     */
    function compare_hashtag_count(compare: any, to: any): number {
        if (to.value == compare.value) {
            if (compare.tag > to.tag) {
                return 1;
            } else {
                return -1;
            }
        }

        return (to.value - compare.value);
    }

    // -----------------------------------------------------------------------
    /*!
     */
    export class view_CHTags extends Backbone.View<model_CHTags> {

        //
        constructor(options?: Backbone.ViewOptions<model_CHTags>) {
            super(options);

            this.listenTo(this.model, "change", this.render);
        }

        //
        events(): Backbone.EventsHash {
            return {
            }
        }

        //
        render() {
            let tplHTags = Hogan.compile($("#id_tpl_htags").html());
            let listRenderSource: Array<string> = [];
            let listData: Array<any> = [];

            for (let n: number = 0; n < this.model.attributes.rows.length; n++) {
                const r: any = this.model.attributes.rows[n];

                if (r.value > 1) {
                    listData.push(this.model.attributes.rows[n]);
                }
            }

            listData.sort(compare_hashtag_count);

            for (let n: number = 0; n < listData.length; n++) {
                const r: any = listData[n];

                listRenderSource.push(
                    tplHTags.render({ tag: r.key[0], tag_encode: encodeURI(r.key[0]), value: r.value })
                );
            }

            $("#id_tbl_htags").html(listRenderSource.join(""));

            return this;
        }
    }
}

// --------------------------------------------------------------------- [EOF]
