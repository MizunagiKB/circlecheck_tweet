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
        endkey=[o_date_expire.strftime("%Y-%m-%dT%H:%M:%S+00:00")]
    )

    try:
        for record in list_expire:
            db_circlecheck_tweet.delete(record.doc)
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

    opt_parse = optparse.OptionParser()
    opt_parse.add_option(
        "-t", "--text",
        help="Search text",
        dest="q"
    )
    opt_parse.add_option(
        "-l", "--limit",
        action="store_true",
        help="Show Twitter API Limit",
        dest="l"
    )

    options, _ = opt_parse.parse_args()

    if options.q is None:
        opt_parse.print_help()
        return 1

    # Twitter
    o_twitter = twitter.Api(
        configure.CONSUMER_KEY,
        configure.CONSUMER_SECRET,
        configure.ACCESS_TOKEN,
        configure.ACCESS_TOKEN_SECRET,
        sleep_on_rate_limit=True,
        tweet_mode="extended"
    )
    o_twitter.InitializeRateLimit()

    if options.l is True:
        print o_twitter.rate_limit.resources["search"]
        return

    # CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )
    db_circlecheck_tweet = conn_couch["circlecheck_tweet"]

    o_date_expire = datetime.datetime.utcnow() - datetime.timedelta(days=configure.EXPIRE_DAYS)

    delete_expire_doc(db_circlecheck_tweet, o_date_expire)

    b_testmode = False
    max_id = 0
    read_count = 0
    while True:
        save_count = 0
        for item in twitter_search_generator(o_twitter, options.q + " exclude:retweets", 100, max_id, b_testmode):
            dict_record = item.AsDict()

            # tweet_idを_idとして使用
            id_str = dict_record["id_str"]

            dict_record["_id"] = id_str

            # 日付をISO表記に変更
            created_at = dict_record["created_at"]

            o_date = dateutil.parser.parse(created_at)

            dict_record["ccheck_created"] = o_date.strftime("%Y-%m-%dT%H:%M:%S+00:00")

            utime_date = time.mktime(o_date.timetuple())
            utime_curr = time.mktime(o_date_expire.timetuple())

            if utime_date > utime_curr:
                try:
                    db_circlecheck_tweet.save(dict_record)
                    save_count += 1
                except couchdb.http.ResourceConflict:
                    print "except couchdb.http.ResourceConflict", id_str
                    pass

            read_count += 1
            max_id = item.id - 1

        if save_count == 0 or read_count > 256:
            break
        else:
            print max_id, read_count
            print "------------------------------------------------------------------------ sleep"
            time.sleep(5)


if __name__ == "__main__":
    main()



# [EOF]
