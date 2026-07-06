# bujo

A minimalistic, elegant bullet journal for daily use — a Daily Log, a Monthly
Log, and free-form Collections, styled after paper-journal conventions.

- **Daily Log** — rapid-log tasks, events, and notes for any day. Click the
  bullet to check off a task, hover a row to migrate or star it as a priority,
  click the text to edit it in place.
- **Monthly Log** — a compact overview of the whole month with every day's
  entries visible at a glance; click a day to jump into its Daily Log.
- **Collections** — freeform named lists (books to read, goals, ideas — your
  own bujo-style spreads) that use the same bullets and interactions.

Bullets follow classic bullet-journal notation: `•` task, `○` event, `–`
note, `✕` done, `>` migrated.

Everything is stored locally in the browser (`localStorage`) — no account,
no server.

## Developing

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
npm run lint    # oxlint
```
