# -*- coding: utf-8 -*-
"""Tweetの収集アプリケーション
"""
import optparse
import time
import datetime
import pickle

import dateutil.parser
import couchdb
import twitter

import configure


# ============================================================================
def delete_expire_doc(db_circlecheck_tweet, o_date_expire):
    """古いツイートを削除
    """

    list_expire = db_circlecheck_tweet.view(
        "cache/expire",
        wrapper=None,
        descending=False,
        include_docs=True,
        startkey=[""],
#        endkey=["2017-03-26T00:00:00+00:00"],
        endkey=[o_date_expire.strftime("%Y-%m-%dT%H:%M:%S+00:00")]
    )

#    print o_date_expire, list_expire

#    for record in list_expire:
#        print record
#        break

    try:
        for record in list_expire:
            db_circlecheck_tweet.delete(record.doc)
            print record.key
    except couchdb.http.ResourceNotFound:
        pass


# ============================================================================
def twitter_search_generator(o_twitter, text, count, max_id, b_testmode):
    """Search結果を一件づつ戻すジェネレーター

    Args:
        o_twitter:
            Twitte API Object
        count:
            取得最大件数
        max_id:
            取得開始ID
        b_testmode:
            テストモード
    """

    if b_testmode:
        with open("twitter_search_generator_list.pickle", "rb") as h_load:
            list_tweet = pickle.load(h_load)
    else:

        print o_twitter.rate_limit.resources["search"]

        list_tweet = o_twitter.GetSearch(
            term=text,
            max_id=max_id,
            count=count,
            result_type="recent"
        )

        with open("twitter_search_generator_list.pickle", "wb") as h_dump:
            pickle.dump(list_tweet, h_dump)

    for item in list_tweet:
        yield item


# ============================================================================
def main():
    """プログラムエントリー
    """

    # CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )
    db_circlecheck_tweet = conn_couch["circlecheck_tweet"]

    o_date_expire = datetime.datetime.utcnow() - datetime.timedelta(days=configure.EXPIRE_DAYS)
    
    o_date = datetime.datetime(2017, 3, 26)

    while o_date < o_date_expire:
        delete_expire_doc(db_circlecheck_tweet, o_date)
        o_date += datetime.timedelta(days=1)
        print o_date
            



if __name__ == "__main__":
    main()



# [EOF]
