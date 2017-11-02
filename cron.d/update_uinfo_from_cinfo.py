# -*- coding: utf-8 -*-
import sys
import couchdb
import optparse

import configure


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

#    if options.DOC_ID is None:
#        opt_parse.print_help()
#        return 1

    # CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )

    # CouchDB get tweets
    db_circlecheck_tweet = conn_couch["circlecheck_tweet"]

    list_user = db_circlecheck_tweet.view(
        "user/id",
        wrapper=None,
        reduce=True,
        group=True,
        descending=False,
        include_docs=False,
    )

    db_circlecheck_uinfo = conn_couch["circlecheck_uinfo"]
    for r in list_user:
        try:
            db_circlecheck_uinfo.save(
                {
                    "_id": str(r.key[0]),
                    "screen_name": r.key[1],
                    "created_at": r.key[2]
                }
            )
        except couchdb.http.ResourceConflict:
            pass



if __name__ == "__main__":
    main()



# [EOF]
