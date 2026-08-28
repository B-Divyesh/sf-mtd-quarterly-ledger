# Demo sandbox

Open `/demo/` or `/?demo=1` to load three realistic sample records: tutoring income, workshop materials, and client travel.

The **Import CSV** dialog also includes a bundled local sample at `/sample-import.csv`. Importing, previewing, cancelling, or confirming rows in demo mode only changes the demo ledger.

Demo records use the separate IndexedDB database `demo:quarter-sheet-ledger`. Real records use `quarter-sheet-ledger`; neither database is read or written by the other mode. Demo preferences and backup reminders use the `demo:` localStorage prefix.

The persistent banner says **Demo — sample data, nothing is saved**. **Reset demo** clears and reseeds only the demo database and demo preferences. **Start for real** clears the demo namespace before opening `/`; real records are never changed.
