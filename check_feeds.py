"""Run this first. It tests every source and tells you which ones work."""
import news
ok = bad = 0
for f in news.FEEDS["feeds"]:
    try:
        n = len(news.parse_feed(news.fetch(f["url"]), f["outlet"])); print(f"OK   {f['outlet']:<18} {n:>3} items  {f['url']}"); ok += 1
    except Exception as e:
        print(f"FAIL {f['outlet']:<18} {type(e).__name__}  {f['url']}"); bad += 1
try:
    import urllib.parse
    u = "https://news.google.com/rss/search?q=cricket&hl=en-IN&gl=IN&ceid=IN:en"
    print(f"OK   Google News search  {len(news.parse_feed(news.fetch(u),'Google News'))} items")
except Exception as e:
    print("FAIL Google News search", type(e).__name__)
print(f"\n{ok} feeds work, {bad} failed. Remove failed ones from feeds.json.")
