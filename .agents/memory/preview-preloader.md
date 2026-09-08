---
name: Preview preloader behavior
description: Constraint for global loading overlays in the proxied development preview
---

Global loading overlays must not depend on the browser's window.load event to disappear.

**Why:** The proxied Replit preview can attach after that event has already fired, leaving a legacy overlay above otherwise healthy rendered content indefinitely.

**How to apply:** Prefer rendering the page immediately or use a bounded client-side timer for non-blocking transitions. Always remove the body scroll-lock class during mount and route changes.