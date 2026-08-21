---
title: QuestBoard Changelog
permalink: /questboard/changelog/
app: questboard
---

What's new in **QuestBoard**, newest first.

## 0.9.6 — 9 August 2026

A stability release.

### Fixed

- **A crash that could stop QuestBoard from starting.** Once more than one
  person had voted on the same date — on an event request or an event proposal —
  the app could fail to start, and would keep failing on every restart until it
  was repaired by hand. Fixed, and the app now recovers from that state on its
  own. Communities affected by this need only restart the app; no votes,
  proposals or reservations were lost.

### Added

- The version you're running is now shown in the top-right of the title banner,
  which makes it much easier to say what you're on when reporting a problem.

## 0.9.5 — 9 August 2026

### Event Proposals

A new way to plan a game before it has a date.

Post the system you want to run — with an optional title, level range,
description and duration — along with the dates you could run it. Players mark
each date as **Can play**, **Maybe**, or **No**, and you see at a glance how
many people are free for each one, and exactly who. Candidate dates are picked
from a calendar, with a "repeat weekly" helper for setting up a run of weeks.

When a date works, schedule it in one step. Everyone who said they were
available gets a reservation automatically, filling the table in the order
people answered — definite answers before maybes. If more players are available
than the table seats, you're told who didn't fit rather than left to work it
out, and the proposal keeps its voting history.

### Now available in four languages

QuestBoard is now translated into **English, Spanish, French and German**.
Choose your language under *My Profile*; your choice is remembered across
devices. Dates, times and day names follow the language you pick.

> These translations are new. If something reads awkwardly in your language,
> [let me know](mailto:ctacke@gmail.com) — corrections are very welcome.

### Also new

- **Propose Dates** on an event request, turning a "someone should run this"
  request into a proposal with real dates.

### Fixed

- **"Can't reach the server" no longer appears for no reason.** If the app's
  first request arrived before the server had finished starting, it gave up and
  showed a connection error that stayed until you pressed *Retry*. It now
  retries on its own.
- **Game type icons appear immediately** when you return to the Events tab,
  instead of being blank for several seconds.
- Switching users no longer leaves the previous user's language in place.
- Changing your language and navigating away without saving no longer keeps the
  unsaved choice.
- Navigation tabs no longer overflow the page when translated labels are longer
  than the English ones.
- Dialogs use the full height of the window instead of scrolling inside a small
  box.

---

Questions or problems? See [Support]({{ '/questboard/support/' | relative_url }}).
