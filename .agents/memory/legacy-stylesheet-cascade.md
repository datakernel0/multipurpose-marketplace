---
name: Legacy stylesheet cascade
description: The imported MartPlace template stylesheet can override app-level global CSS on public marketplace pages.
---

The legacy public stylesheet is linked after the app's bundled global stylesheet. Public MarketNest overrides that must win over template rules belong in a stylesheet loaded after the legacy link.

**Why:** The old template's hero overlay and header float rules overrode the redesigned homepage despite equivalent selectors, producing a blue hero and overlapping navigation in the proxied preview.

**How to apply:** When changing the public marketplace surface, check stylesheet load order first and keep final overrides in the later-loaded public override stylesheet.