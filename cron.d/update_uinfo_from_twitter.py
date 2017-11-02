# -*- coding: utf-8 -*-
import sys
import optparse

import requests
import couchdb
import HTMLParser
import configure


# ============================================================================
def search_twitter_user_id(screen_name):
    """Twitter ID

    Args:
        screen_name (str):
    """

    url = "https://twitter.com/" + screen_name

    req = requests.get(url)

    if req.status_code in (200,):

        with open("result.html", "wb") as h_writer:
            h_writer.write(req.text.encode("utf-8"))

        return req.text.encode("utf-8").decode("utf-8")


    return None


# ============================================================================
class CParser(HTMLParser.HTMLParser):
    def init(self):
        self.dict_twitter_user = {}

    def handle_starttag(self, tag, list_attr):
        if tag == "div":
            dict_attr = {}
            for attr in list_attr:
                if len(attr) == 2:
                    dict_attr[attr[0]] = attr[1]

            if "data-user-id" in dict_attr:
                if "data-screen-name" in dict_attr:
                    if "data-name" in dict_attr:
                        #print dict_attr["data-screen-name"], dict_attr["data-user-id"], dict_attr["data-name"]
                        self.dict_twitter_user[dict_attr["data-user-id"]] = {
                            "screen_name": dict_attr["data-screen-name"],
                            "name": dict_attr["data-name"],
                            "created_at": "*"
                        }


# ============================================================================
def main():
    """
    """

    opt_parse = optparse.OptionParser()
    opt_parse.add_option(
        "-n", "--screen_name",
        help="Twitter user.screen_name",
        dest="SCREEN_NAME"
    )

    options, _ = opt_parse.parse_args()

#    if options.DOC_ID is None:
#        opt_parse.print_help()
#        return 1

    # CouchDB
    conn_couch = couchdb.Server(
        "http://" + configure.COUCH_USER + ":" + configure.COUCH_PASS + "@" + configure.COUCH_HOST
    )

    db_circlecheck_uinfo = conn_couch["circlecheck_uinfo"]

    raw_html = search_twitter_user_id(options.SCREEN_NAME)

    if raw_html is not None:
        o = CParser()
        o.init()
        o.feed(
            raw_html
        )

        for k, dict_data in o.dict_twitter_user.items():
            print k, dict_data

            try:
                db_circlecheck_uinfo.save(
                    {
                        "_id": k,
                        "screen_name": dict_data["screen_name"],
                        "created_at": dict_data["created_at"]
                    }
                )
            except couchdb.http.ResourceConflict:
                pass

if __name__ == "__main__":
    main()



# [EOF]
