# -*- coding: utf-8 -*-
import sys
import couchdb
import datetime
import dateutil.parser
import StringIO
import csv
import xml.sax.saxutils
import optparse

import configure

dict_category = {
    0: (u"お品書き", u"MENU",),
    1: (u"新作", u"新刊", u"NEW_ITEM", u"NEWITEM",),
    2: (u"既刊", u"在庫", u"INV_ITEM", u"INVITEM",),
    3: (u"お知らせ", u"INFO",),
    4: (u"欠席", u"ABSENT",),
}
ERROR_CATEGORY_CODE = -1
MAXIMUM_TWEETS = 5
MAXIMUM_TEXT_LENGTH = 40
TWITTER_URL_PATTERN = "https://twitter.com/"


# ============================================================================
def hashtag_to_category(list_hashtag):
    """
    """

    for dict_hashtag in list_hashtag:
        if "text" in dict_hashtag:
            hashtag = dict_hashtag["text"].upper()
            for category_code, cmp_hashtag in dict_category.items():
                if hashtag in cmp_hashtag:
                    return category_code

    return ERROR_CATEGORY_CODE


# ============================================================================
def insert_record(conn_couch, dict_layout_map, DATA_SOURCE, doc):
    """
    """

    db_circlecheck_cinfo = conn_couch["circlecheck_cinfo"]

    screen_name = doc["user"]["screen_name"]
    if screen_name not in dict_layout_map:
        return False

    # calc UTC to JST
    date_created = dateutil.parser.parse(doc["created_at"]) + datetime.timedelta(seconds=60 * 60 * 9)
    # get layout
    layout = dict_layout_map[screen_name]

    cedit_category = hashtag_to_category(doc["hashtags"])
    if "full_text" in doc:
        tweet_text = xml.sax.saxutils.unescape(doc["full_text"])
    else:
        tweet_text = xml.sax.saxutils.unescape(doc["text"])
    if len(tweet_text) > MAXIMUM_TEXT_LENGTH:
        tweet_text = tweet_text[0:MAXIMUM_TEXT_LENGTH] + " ..."

    if cedit_category != ERROR_CATEGORY_CODE:
        dict_record = {
            "_id": "crawl_" + doc["id_str"],
            "cedit_date": date_created.strftime("%Y-%m-%d"),
            "cedit_category": hashtag_to_category(doc["hashtags"]),
            "cedit_rating": 0,
            "cedit_url": "https://twitter.com/" + screen_name + "/status/" + doc["id_str"],
            "cedit_txt": tweet_text,
            "DATA_SOURCE": DATA_SOURCE,
            "layout": layout
        }

        try:
            db_circlecheck_cinfo.save(dict_record)
        except couchdb.http.ResourceConflict:
            print "except couchdb.http.ResourceConflict", doc["id_str"]
            pass

    list_expire = db_circlecheck_cinfo.view(
        "event/circle_information_w_layout",
        descending=True,
        reduce=False,
        include_docs=True,
        key=[DATA_SOURCE, layout]
    )

    for r in sorted(list_expire, key=lambda o: o.doc["cedit_date"], reverse=True)[MAXIMUM_TWEETS:]:
        db_circlecheck_cinfo.delete(r.doc)
        #print "EV", r.doc["cedit_date"]

    return True


# ============================================================================
def build_layout_map(conn_couch, doc_id):
    """
    """

    db_circlecheck_tweet = conn_couch["circlecheck"]
    doc = db_circlecheck_tweet[doc_id]
    tag = doc["EVENT_HASHTAG"]

    dict_layout_map = {}

    for k, list_circle in doc["CIRCLE_LIST_DAT"].items():
        for circle in list_circle:
            for r in circle["circle_list"]:
                if "twitter" in r:
                    dict_layout_map[r["twitter"][len(TWITTER_URL_PATTERN):]] = circle["layout"]

    return tag, dict_layout_map


# ============================================================================
def main():
    """
    """

    opt_parse = optparse.OptionParser()
    opt_parse.add_option(
        "-i", "--doc-id",
        help="Event Document",
        dest="DOC_ID"
    )

    options, _ = opt_parse.parse_args()

    if options.DOC_ID is None:
        opt_parse.print_help()
        return 1

    # CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )

    # CouchDB get layout
    hashtag, dict_layout_map = build_layout_map(conn_couch, options.DOC_ID)
    # CouchDB get tweets
    db_circlecheck_tweet = conn_couch["circlecheck_tweet"]

    list_event_tweet = db_circlecheck_tweet.view(
        "cache/tweet_tag",
        wrapper=None,
        descending=True,
        include_docs=True,
        startkey=[hashtag,"9999-12-31T23:59:59+00:00"],
        endkey=[hashtag,""]
    )

    for r in list_event_tweet:
        insert_record(
            conn_couch,
            dict_layout_map,
            "/db/circlecheck/" + options.DOC_ID,
            r.doc
        )


if __name__ == "__main__":
    main()



# [EOF]
