import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime, timedelta, timezone
import news
now = datetime(2026, 11, 13, 6, 0, tzinfo=timezone.utc)
def rss(items):
    body = "".join(f"<item><title>{t}</title><link>https://x/{i}</link><description>{d}</description><pubDate>{(now-timedelta(hours=h)).strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>{s}</item>" for i,(t,d,h,s) in enumerate(items))
    return f"<rss><channel>{body}</channel></rss>".encode()
X = rss([("India beat New Zealand by 4 runs in rain-hit 2nd ODI","<p>India won.</p>",3,""),
         ("Rain-hit 2nd ODI: India beat New Zealand by four runs - Mint","",4,"<source>Mint</source>"),
         ("Sensex jumps 1,100 points as markets reopen","Markets rose.",2,""),
         ("Old story from last week","x",200,""),
         ("Man arrested after murder in city","x",1,"")])
items = news.parse_feed(X, "TestOutlet"); assert len(items) == 5
for i in items: i["topic"] = "cricket" if "ODI" in i["title"] else "stocks"
out = news.build(items, now)
cr = [s for s in out if s["topic"] == "cricket"]
assert len(cr) == 1 and cr[0]["label"] == "multi", cr     # two outlets merged
assert not any("last week" in s["headline"] for s in out)   # stale dropped
assert any(s["sensitive"] for s in out)                     # flagged for under-18 filter
assert all(s["label"] in ("multi", "single") for s in out)
assert news.outlet_key("BBC News")==news.outlet_key("BBC Sport")==news.outlet_key("BBC")
print("all tests passed:", len(out), "stories")
