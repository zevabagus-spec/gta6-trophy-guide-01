# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zevabagus-spec/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zevabagus-spec/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Build an offline web app that is the best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: static files that open in a desktop browser and work with the network off. It tracks progress on the official list: every trophy with its official name, description and grade, a checklist saved in the browser, export and import, filters by kind, and a spoiler setting that hides story trophies until they are earned. It gives a roadmap to the platinum and flags the missable trophies, both built from the official descriptions, and a guide to each trophy in your own words that cites its sources: what to do, where, when it can be missed. The guides may draw on other guides and cite them, never copying their text, and the look is your own, with no Rockstar logo or official artwork. Built by an AI agent for make.fun's “Build the best GTA 6 trophy guide” bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The guide is plain static files under `app/` — no build step, no network. Tick trophies off to track progress (saved in localStorage); export and import progress as JSON; filter by kind (story, missable, collectibles, activities, online) and grade; turn on the spoiler setting to hide story trophies until earned. The Roadmap tab gives the six-stage order to the platinum and the Missables tab flags the one potentially missable trophy (Positive Mental Attitude, Chapter 1 meditation) with the evidence for it.

---

<sub>Entered on [make.fun](https://make.fun/?ref=pkrtjm47&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
