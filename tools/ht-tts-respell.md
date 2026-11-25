# Kreyòl → ElevenLabs pronunciation spellings

ElevenLabs (eleven_v4) reads most Kreyòl correctly, but a few sounds need a
respelled prompt. The app still shows the correct Kreyòl spelling; only the
text sent to the voice generator changes.

| Kreyòl sound | Problem | Write it as | Example |
| --- | --- | --- | --- |
| `en` + consonant (nasal, as in *pen*) | read like French *an* | `ain` | Enfimyè → Ainfimyèh |
| final `è` (as in *frè*, *myè*) | read like closed *e* | `èh` | Enfimyè → Ainfimyèh |
| `enn` (oral *è* + n, as in *jwenn*, *grenn*) | read nasal | `ènn` | jwenn → jwènn, vennde → vènnde |
| numbers written as digits | read in English | words | 1804 → mil uit san kat |

Tested 2026-11-11 with voice "Simone"; Clefford confirmed "Ainfimyèh".
Re-test with the Monia clone before batch generation.

2026-11-24: ~280 more clips made with the Monia clone (numbers 0–100, emotions, opposites, food, habits, order, Haiti, world, question starts). Items separated by `...`, one take each; cut with the word timings from ElevenLabs Speech-to-Text on the same flow.
