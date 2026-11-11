# Kreyòl → ElevenLabs pronunciation spellings

ElevenLabs (eleven_v4) reads most Kreyòl correctly, but a few sounds need a
respelled prompt. The app still shows the correct Kreyòl spelling; only the
text sent to the voice generator changes.

| Kreyòl sound | Problem | Write it as | Example |
| --- | --- | --- | --- |
| `en` + consonant (nasal, as in *pen*) | read like French *an* | `ain` | Enfimyè → Ainfimyèh |
| final `è` (as in *frè*, *myè*) | read like closed *e* | `èh` | Enfimyè → Ainfimyèh |

Tested 2026-11-11 with voice "Simone"; Clefford confirmed "Ainfimyèh".
Re-test with the Monia clone before batch generation.
