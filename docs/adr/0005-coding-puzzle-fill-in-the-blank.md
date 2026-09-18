# The coding puzzle is fill-in-the-blank; the blank is a `____` inside the code

Context: v1 has exactly one coding-puzzle Challenge — a "very easy broken application" that a recruiter with three minutes can solve. The owner picked the mechanic from three prototyped variants in "The coding puzzle: how the very easy broken-app challenge behaves" (map ticket #3; prototypes in `docs/prototypes/3/`): **C — fill in the blank** won. The Career file's `coding` content slots (`context` / `code` / `fix` / `explanation`) were settled earlier (map ticket #2); how the blank is expressed in the file, and what it accepts, was left to the spec.

We decided: the owner writes `code` as the broken snippet with the token to be fixed replaced by a `____` placeholder; the game renders the snippet with an inline input at the blank. `fix` is the accepted answer, matched leniently (trim, collapse inner whitespace, case-sensitive). Any wrong entry gets a gentle rejection. The `bun run check` validator enforces exactly one `____` per coding challenge and a non-empty `fix`. Solving triggers the shared solve sequence: the fix is diffed in place (struck line + `+` line), `explanation` renders, and the Location's skills with their HTML evidence reveal as `unlocked`.

Why: the owner chose C because it feels most like actually fixing code while remaining solvable in seconds. The `____` placeholder keeps the four settled content slots intact — nothing new for the owner to learn, the inline comments keep it fillable without reading code — and the validator can catch a wrong blank count at fill time.

Considered options:
- **A — click the broken line** (prototyped, rejected by the owner): lowest friction, no answer to check, weaker skill signal.
- **B — pick the fix** (prototyped, rejected by the owner): would have needed an `options` presentation field in the file; blurred the line with the `quiz` challenge type.
- **Game-derived masking from a code/fix diff**: rejected — the diff between a full snippet and a `fix` string is ambiguous for the game to mask, and it punishes the owner for writing `fix` as anything other than the exact token.

Consequences: the prototype's targeted hint for re-entering the broken token does not carry into v1 — the file carries no slot for a known-wrong token, so v1's feedback is the gentle rejection; if the owner wants targeted hints later, it is a one-line optional schema addition. Placeholder content hosts the challenge at the Current Role location; when real entries arrive, placement moves in the file alone (the challenge type is data per Location).
