# 12 · Privacy

| Principle | Implementation |
|---|---|
| Data minimisation | No accounts, no location, no names. Queries are processed in memory and never stored. |
| No health-data advertising or sale | No ad SDKs. Stated in product and policy. |
| Analytics without content | 10 events with a property whitelist (guide id, category, safety level, intent, language, mode). The text, voice transcript and photo are never included. The database policy rejects events with fields like `query`, `text`, `image`, `location`. |
| On-device storage | Saved guides, settings and feedback use localStorage with guarded access; the app works without it. |
| Deletion | Profile → Delete my data removes everything on the device. Server events auto-purge after 90 days (`purge_old_events`). |
| Photos | Downscaled and re-encoded on device (drops EXIF, including GPS). Demo mode never uploads. Live mode sends only for a single description and does not store it. |
| Consent | Before live AI launch: explicit consent for sending text/photos to the AI service. |
| Regulation | Review against India's Digital Personal Data Protection Act, 2023 before launch (**not yet done**). |
