#!/bin/bash
source ~/pyEnv/main/bin/activate
pushd /var/www/gadgets/circlecheck_tweet/cron.d
for kwd in "#comitia" "#リリマジテスト" "#魔法少女リリカルなのは夜の創作60分一本勝負" "#リリマジ"
do
    python search_tweet.py -t $kwd
done
popd
deactivate
