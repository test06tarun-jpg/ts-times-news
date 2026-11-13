# T.S Times news pipeline (free version)

Twice a day (6 am and 6 pm IST) this collects headlines from news feeds, groups stories about the same event,
counts how many outlets reported each one, ranks them and writes `stories.json`. The app reads that file.
No paid services, no AI, no API keys.

## One-time setup (about 10 minutes)
1. Make a free account at github.com.
2. Click **New repository**. Name it `ts-times-news`. Choose **Public**. Create it.
3. Click **uploading an existing file** and upload everything in this folder (keep the `.github` folder).
4. Open the **Actions** tab and click **Update T.S Times news**, then **Run workflow**.
5. When it shows a green tick, open `stories.json` in the repo. If it has stories, it works.
6. Send me this address: `https://raw.githubusercontent.com/<your-username>/ts-times-news/main/stories.json`

If step 4 shows a red cross, open it, copy the error text and send it to me.

## What each file does
- `feeds.json`: the sources for every sub-head. Add or remove sources here.
- `news.py`: the collector, grouper and ranker.
- `check_feeds.py`: tests every source. Run it to see which feeds are alive.
- `config.json`: freshness window (36 hours), stories per topic (5), snippet length.
- `tests/`: a self-check that runs before every update.

## Rules built in
- Only stories from the last 36 hours.
- Two or more outlets on the same event: "Two or more sources". One outlet: "Single source".
- Short snippet only, always with the outlet names and a link. We never copy full articles.
- Stories with violence, crime or gambling words are flagged so the app hides them from readers under 18.
- If nothing is collected, nothing is published, so the last good edition stays.
