# -*- coding: utf-8 -*-
"""
"""
import sys
import os
import optparse
import urllib
import json
import time
import datetime

import dateutil.parser
import couchdb
import twitter

import configure


# ============================================================================
##
#
def delete_expire_doc(db_circlecheck_tweet, o_date_expire):

    list_expire = db_circlecheck_tweet.view(
        "hashtags/expire",
        wrapper=None,
        descending=False,
        include_docs=True,
        startkey=[""],
        endkey=[o_date_expire.strftime("%Y-%m-%dT%H:%M:%S+00:00")]
    )

    for r in list_expire:
        db_circlecheck_tweet.delete(r.doc)
        print "delete", r


# ============================================================================
##
#
def main():
    """
    """

    opt_parse = optparse.OptionParser()
    opt_parse.add_option(
        "-t", "--text",
        help="Search text",
        dest="q"
    )
    opt_parse.add_option(
        "-s", "--since_id",
        help="Since ID",
        dest="since_id"
    )
    opt_parse.add_option(
        "-m", "--max_id",
        help="Max ID",
        dest="max_id"
    )

    options, _ = opt_parse.parse_args()

    if options.q is None:
        opt_parse.print_help()
        return 1

    list_urlparam = [
        ("q", options.q + " " + "exclude:retweets"),
        ("result_type", "recent"),
        ("count", 100)
    ]

    if options.since_id is not None:
        list_urlparam.append(("since_id", options.since_id))

    if options.max_id is not None:
        list_urlparam.append(("max_id", options.max_id))

    o_api = twitter.Api(
        consumer_key=configure.CONSUMER_KEY,
        consumer_secret=configure.CONSUMER_SECRET,
        access_token_key=configure.ACCESS_TOKEN,
        access_token_secret=configure.ACCESS_TOKEN_SECRET
    )

    search_result = o_api.GetSearch(raw_query=urllib.urlencode(list_urlparam))

    # Write to CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )
    db_circlecheck_tweet = conn_couch["circlecheck_tweet"]

    #
    o_date_expire = datetime.datetime.utcnow() - datetime.timedelta(days=configure.EXPIRE_DAYS)

    delete_expire_doc(db_circlecheck_tweet, o_date_expire)

    n_save_count = 0
    for s in search_result:
        dictRecord = s.AsDict()

        # tweet_idを_idとして使用
        id_str = dictRecord["id_str"]

        dictRecord["_id"] = id_str

        # 日付をISO表記に変更
        created_at = dictRecord["created_at"]

        o_date = dateutil.parser.parse(created_at)

        dictRecord["ccheck_created"] = o_date.strftime("%Y-%m-%dT%H:%M:%S+00:00")

        utime_date = time.mktime(o_date.timetuple())
        utime_curr = time.mktime(o_date_expire.timetuple())

        if utime_date > utime_curr:
            try:
                db_circlecheck_tweet.save(dictRecord)
                n_save_count += 1
            except couchdb.http.ResourceConflict:
                print "except couchdb.http.ResourceConflict", id_str

    print n_save_count


if __name__ == "__main__":
    main()



#
