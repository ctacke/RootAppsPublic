---
title: Node-ROOT Changelog
permalink: /noderoot/changelog/
app: noderoot
---

What's new in **Node-ROOT**, newest first.

## 0.9.8 — 1 October 2026

### Refresh channels, roles and lists without reloading

When you add a channel or a role in Root, Node-ROOT now picks it up without a
full reload.

- A new **Refresh** button in the toolbar re-fetches your community's channels,
  roles and lists from Root on demand, with a spinner while it works.
- Channel, role and list pickers — in both the node properties panel and the
  Event Simulator — each have their own inline refresh button, so you can pull
  in something you just created without leaving the field you're editing.
- Node-ROOT also refreshes on its own when you switch back to the editor tab,
  so the pickers are up to date when you return.

### Pickers keep a value they don't recognise

A channel, role or list that isn't in the current list — for example one named
by a template, or one removed since you set it — is no longer silently dropped
from a picker. It stays selected and is shown as-is, so your workflow keeps the
value you chose.

### Keyword lists

- **New "Exact match (entire text)" mode** for list conditions, which matches
  only when the whole message is exactly a list entry — alongside the existing
  Whole word, Anywhere, and Starts with modes.
- **Whole-word matching now catches commands and emoji.** Entries like `!help`
  now match even though the message starts with punctuation, and emoji such as
  ❤️ are matched as whole tokens instead of being stripped away.

---

Questions or problems? See [Support]({{ '/noderoot/support/' | relative_url }}).
