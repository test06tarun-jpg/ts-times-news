"""T.S Times daily pipeline: collect -> group -> check sources -> rank -> write stories.json.
Standard library only, so it runs anywhere without installing anything."""
import json, re, sys, html, hashlib, urllib.request, urllib.parse
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET

CFG = json.load(open("config.json"))
FEEDS = json.load(open("feeds.json"))
UA = {"User-Agent": "Mozilla/5.0 (compatible; TSTimesBot/0.1)"}
STOP = set("a an the of in on at to for and or as is are was were be by with from after over into this that its it his her their new says say said us vs amid".split())
# Stories matching this are flagged so the app can hide them from readers under 18.
SENSITIVE = re.compile(r"\b(murder|rape|suicide|killed|killing|shot dead|terror\w*|attack|bomb|sex\w*|scandal|assault|harass\w*|gambl\w*|betting|casino|drugs?|porn\w*|abuse|crime|arrested)\b", re.I)
KICKER = {"stocks":"Stocks · Markets","ipos":"IPOs","economy":"Economy","finance":"Personal Finance","startups":"Startups","gold":"Gold","cricket":"Cricket","football":"Football","nba":"NBA","tennis":"Tennis","f1":"Formula 1","hockey":"Hockey","badminton":"Badminton","olympics":"Olympics","kabaddi":"Kabaddi","movies":"Movies","ott":"OTT & Series","music":"Music","tv":"Television","gaming":"Gaming","ai":"AI","gadgets":"Gadgets & Apps","cyber":"Cybersecurity","space":"Space","fashion":"Fashion","food":"Food","travel":"Travel","fitness":"Fitness","exams":"Exams","careers":"Careers","science":"Science","climate":"Climate","policy":"Policy","elections":"Elections","world":"World Affairs","courts":"Courts & Law"}

# A story must mention its topic to be filed there (stops search results drifting, e.g. cricket under kabaddi).
RELEVANT = {
 "kabaddi": r"kabaddi|pkl", "hockey": r"hockey", "badminton": r"badminton|bwf|shuttler|srikanth|lakshya|sindhu|satwik",
 "tennis": r"tennis|wta|atp|grand slam|wimbledon|sinner|alcaraz|sabalenka|djokovic", "f1": r"formula ?(1|one)|\bf1\b|grand prix|verstappen|hamilton|norris",
 "nba": r"\bnba\b|basketball", "football": r"football|soccer|premier league|la liga|champions league|\bfifa\b|uefa|\bisl\b|goal",
 "cricket": r"cricket|\bodi\b|t20|test match|\bipl\b|bcci|wicket|innings|asia cup", "olympics": r"olympic|asian games|athletics|\bioa\b|\bioc\b",
 "elections": r"election|poll|vote|ballot|campaign|assembly|lok sabha|parliament", "gold": r"gold|silver|bullion",
 "ipos": r"\bipo\b|listing|subscription|grey market|\bgmp\b", "space": r"space|isro|nasa|rocket|satellite|moon|mars|astronaut|launch",
 "gaming": r"gaming|esports|playstation|xbox|nintendo|\bgames?\b|steam", "music": r"music|album|concert|singer|song|band|tour",
 "tv": r"\btv\b|television|reality show|serial|bigg boss", "ott": r"netflix|prime video|hotstar|jiocinema|zee5|series|ott|streaming|sonyliv",
 "movies": r"film|movie|box office|bollywood|tollywood|cinema|trailer|actor|actress", "cyber": r"cyber|hack|breach|ransomware|phishing|malware|privacy|data leak",
 "startups": r"startup|funding|raises|unicorn|founder|series [a-d]|seed round", "economy": r"economy|gdp|inflation|trade|export|import|rbi|fiscal|rupee|growth",
}
# Low-value or risky items we never want as news cards.
JUNK = re.compile(r"live stream\w*|where to watch|predict\w*|schedule of play|date, time,? (and )?venue|commentary|live blog|pitch report|playing ?(11|xi)|dream ?11|fantasy|h2h|live score|betting|odds|telecast|how to watch|promo code|coupon", re.I)
def is_english(t):
    letters = [c for c in t if c.isalpha()]
    return not letters or sum(ord(c) > 0x24F or 0xC0 <= ord(c) <= 0x24F for c in letters) / len(letters) < 0.06
def keep(i):
    text = i["title"] + " " + i["desc"]
    if JUNK.search(i["title"]) or not is_english(i["title"]): return False
    r = RELEVANT.get(i["topic"])
    return not r or re.search(r, text, re.I) is not None

def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def clean(t):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t or ""))
    return re.sub(r"\s+", " ", t).strip()

def parse_date(s):
    if not s: return None
    try:
        d = parsedate_to_datetime(s)
    except Exception:
        try: d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception: return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)

def parse_feed(xml_bytes, default_outlet):
    """Reads RSS and Atom. Returns a list of dicts."""
    root = ET.fromstring(xml_bytes)
    out = []
    ns = "{http://www.w3.org/2005/Atom}"
    for it in list(root.iter("item")) + list(root.iter(ns + "entry")):
        def g(tag): 
            e = it.find(tag); return (e.text or "") if e is not None else ""
        title = clean(g("title") or g(ns + "title"))
        link = g("link")
        if not link:
            le = it.find(ns + "link"); link = le.get("href") if le is not None else ""
        desc = clean(g("description") or g(ns + "summary"))
        when = parse_date(g("pubDate") or g(ns + "published") or g(ns + "updated"))
        outlet = default_outlet
        src = it.find("source")
        if src is not None and (src.text or "").strip(): outlet = src.text.strip()
        # Google News titles end with " - Outlet": split it off.
        m = re.match(r"^(.*)\s+-\s+([^-]{2,40})$", title)
        if m and src is not None: title = m.group(1).strip()
        if title and link and when:
            out.append({"title": title, "link": link.strip(), "desc": desc, "when": when, "outlet": outlet})
    return out

def outlet_key(name):
    """Same publisher under different names (BBC / BBC News / BBC Sport) counts once."""
    k = re.sub(r"[^a-z0-9 ]", "", name.lower())
    k = re.sub(r"\b(news|sport|sports|india|the|online|live)\b", "", k)
    return re.sub(r"\s+", " ", k).strip() or name.lower()

def tokens(title):
    w = re.findall(r"[a-z0-9₹%.]+", title.lower())
    return {x.strip(".") for x in w if x.strip(".") and x not in STOP}

def similar(a, b, th):
    if not a or not b: return False
    inter = len(a & b)
    return inter / min(len(a), len(b)) >= th + 0.1 and inter / len(a | b) >= th - 0.15

def collect(fetcher=fetch):
    items, errors = [], []
    jobs = []
    for f in FEEDS["feeds"]:
        for t in f["topics"]: jobs.append((f["url"], f["outlet"], t))
    for t, q in FEEDS["searches"].items():
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:2d", "hl": "en-IN", "gl": "IN", "ceid": "IN:en"})
        jobs.append((url, "Google News", t))
    cache = {}
    for url, outlet, topic in jobs:
        try:
            if url not in cache: cache[url] = parse_feed(fetcher(url), outlet)
            for x in cache[url]: items.append({**x, "topic": topic})
        except Exception as e:
            errors.append(f"{outlet} ({topic}): {type(e).__name__}")
    return items, errors

def build(items, now):
    cutoff = now - timedelta(hours=CFG["max_age_hours"])
    items = [i for i in items if keep(i) and i["when"] >= cutoff and i["when"] <= now + timedelta(hours=1)]
    stories = []
    for topic in sorted({i["topic"] for i in items}):
        pool = sorted([i for i in items if i["topic"] == topic], key=lambda i: i["when"], reverse=True)
        groups = []
        for it in pool:
            tk = tokens(it["title"]); it["tk"] = tk
            for g in groups:
                if similar(tk, g["tk"], CFG["similarity"]): g["items"].append(it); break
            else: groups.append({"tk": tk, "items": [it]})
        for g in groups:
            its = g["items"]; lead = its[0]
            outlets = []
            for i in its:
                if outlet_key(i["outlet"]) not in [outlet_key(o["outlet"]) for o in outlets]: outlets.append({"outlet": i["outlet"], "url": i["link"]})
            n = len(outlets)
            age_h = (now - lead["when"]).total_seconds() / 3600
            score = n * 2 + max(0, 1 - age_h / CFG["max_age_hours"]) * 3
            snippet = lead["desc"]
            if snippet.lower().startswith(lead["title"].lower()[:30]): snippet = ""
            if len(snippet) > CFG["snippet_chars"]: snippet = snippet[:CFG["snippet_chars"]].rsplit(" ", 1)[0] + "…"
            ist = lead["when"] + timedelta(minutes=CFG["timezone_offset_minutes"])
            stories.append({
                "id": hashlib.md5((topic + lead["title"]).encode()).hexdigest()[:10],
                "topic": topic, "kicker": KICKER.get(topic, topic.title()),
                "headline": lead["title"], "sub": "", "card": snippet or "Read the full report at the source.",
                "full": [], "why": "",
                "source": ", ".join(o["outlet"] for o in outlets[:4]) + " (" + ist.strftime("%-d %b, %-I:%M %p") + " IST)",
                "label": "multi" if n >= 2 else "single",
                "sources": outlets[:4], "published": lead["when"].isoformat(),
                "sensitive": bool(SENSITIVE.search(lead["title"] + " " + snippet)), "score": round(score, 2)})
    final = []
    for topic in sorted({s["topic"] for s in stories}):
        top = sorted([s for s in stories if s["topic"] == topic], key=lambda s: -s["score"])[:CFG["max_per_topic"]]
        final += top
    return final

def main():
    now = datetime.now(timezone.utc)
    items, errors = collect()
    stories = build(items, now)
    ist = now + timedelta(minutes=CFG["timezone_offset_minutes"])
    out = {"generated_at": now.isoformat(), "stamp": "Updated " + ist.strftime("%-I:%M %p") + " IST", "date": ist.strftime("%A, %-d %B %Y"),
           "feed_errors": errors, "stories": stories}
    json.dump(out, open("stories.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(stories)} stories, {len(errors)} feed errors")
    for e in errors: print(" -", e)
    if not stories: sys.exit("No stories were collected. Not publishing an empty edition."); 

if __name__ == "__main__":
    main()
