# 🎮 Resume RPG — Coding Vision

## Concept

Turn my CV into a small, playable browser RPG.

Instead of recruiters simply reading a traditional resume, they can **explore my career as a game**. Every important milestone in my professional journey becomes a location on the map, and each location contains a small challenge, quest, puzzle, or interaction.

By completing these challenges, the player unlocks **skills and experience** — the same information that would normally appear as bullet points on a CV.

The goal is to make the resume memorable, interactive, and fun while still providing a professional and easily accessible traditional CV for recruiters who don't want to play.

---

# 🗺️ Core Game Concept

The game is a **2D browser-based RPG / dungeon crawler**.

The player controls a character and explores a world representing my professional journey.

```text
                         🏰 CURRENT ADVENTURE
                                │
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
        🧙 EDUCATION                         💼 CAREER
              │                                   │
        🏫 School                            🏢 Job 1
              │                                   │
        🎓 University                        🏢 Job 2
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                           🗡️ PROJECTS
                                │
                    ┌───────────┴───────────┐
                    │                       │
                 💻 Project 1            💻 Project 2
                    │                       │
                    └───────────┬───────────┘
                                │
                           👹 FINAL BOSS
                                │
                           📜 FULL CV
```

Each location represents a real part of my career.

---

# 🎯 Design Philosophy

The game should follow one central principle:

> **Don't just tell the player what I can do — let them experience it.**

For example, instead of simply displaying:

```text
JavaScript — 4 years
React — 3 years
Problem Solving — Advanced
```

the player might encounter a small challenge:

> **QUEST: The Broken Application**
>
> Something is wrong with the application.
> Find the problem and fix it.

After completing the challenge:

```text
╔══════════════════════════╗
║      ✨ SKILL UNLOCKED   ║
║                          ║
║      🧠 Problem Solving  ║
║                          ║
║      + XP                ║
╚══════════════════════════╝
```

The skill is then added to the player's character sheet.

---

# 🧩 Game Mechanics

Different career milestones should use different gameplay mechanics.

| Career Milestone        | Theme                   | Possible Gameplay     |
| ----------------------- | ----------------------- | --------------------- |
| 🏫 Education            | Fundamentals            | Puzzle / Quiz         |
| 🎓 University           | Knowledge               | Logic Challenge       |
| 💼 Job                  | Professional Experience | Quest                 |
| 💻 Project              | Technical Skills        | Coding Puzzle         |
| 🤝 Team Experience      | Soft Skills             | Dialogue / Decision   |
| 🚀 Startup / Initiative | Ownership               | Resource Challenge    |
| 🐛 Bug Dungeon          | Debugging               | Find the Bug          |
| 👹 Final Boss           | Overall Experience      | Multi-skill Challenge |

The goal is to avoid having every location feel like the same interaction.

---

# ⚔️ Skills Instead of Resume Bullet Points

Skills are treated like RPG abilities.

Instead of a static CV section:

```text
Skills

- JavaScript
- React
- TypeScript
- Git
- Docker
- Teamwork
- Problem Solving
```

the player discovers and unlocks them throughout the game.

Example:

```text
╔══════════════════════════════════════╗
║             CHARACTER                ║
║                                      ║
║  🧙 PLAYER NAME                      ║
║                                      ║
║  Level 27                            ║
║  XP ███████████░░░                   ║
║                                      ║
║  ⚔️ DEVELOPMENT                      ║
║  ████████████████░░                 ║
║                                      ║
║  🧠 PROBLEM SOLVING                  ║
║  ██████████████░░░░                 ║
║                                      ║
║  🤝 TEAMWORK                         ║
║  ████████████░░░░░                 ║
║                                      ║
║  🚀 LEADERSHIP                       ║
║  █████████░░░░░░░                   ║
║                                      ║
║  🛠️ INVENTORY                        ║
║  Git · React · Node · Docker         ║
╚══════════════════════════════════════╝
```

However, skill levels should **not be arbitrary RPG numbers**.

Instead of inventing something like:

```text
React: 87/100
```

the game should use real evidence:

```text
React

★★★★★
3+ years
5 projects

Used in:
• Project A
• Project B
• Project C
```

or:

```text
React
✓ UNLOCKED

Experience:
3+ years

Projects:
5
```

This keeps the game fun without making the professional information misleading.

---

# 🌍 World Design

The entire map represents my career journey.

A possible structure:

```text
                         ☁️ ☁️ ☁️
                    ┌──────────────┐
                    │ 🏰 CURRENT   │
                    │   ADVENTURE  │
                    └──────┬───────┘
                           │
                      🌲 DARK FOREST
                           │
              ┌────────────┴────────────┐
              │                         │
          🏫 ACADEMIA              🏢 TECH CITY
              │                         │
          🎓 Education             💼 Experience
              │                         │
              └────────────┬────────────┘
                           │
                       🏜️ PROJECTS
                           │
                    💻 PROJECT DUNGEON
                           │
                           │
                       🌋 THE ABYSS
                           │
                        👹 BOSS
```

The names and themes should ultimately be customized around my actual career.

---

# 👹 The Final Boss

The final boss represents the challenges and complexity of my professional journey.

Example:

```text
              👹
        THE FINAL BUG

       HP ████████████

       "Your skills alone
        won't defeat me."

       [ FIGHT ]
```

The player must use skills collected throughout the journey.

```text
🧠 Problem Solving    ✓
💻 JavaScript         ✓
⚛️ React              ✓
🐘 Backend            ✓
🐙 Git                ✓
🤝 Teamwork           ✓
🚀 Leadership         ✓
```

The boss should require a combination of previously unlocked skills.

This makes the final encounter a metaphor for the complete professional journey.

---

# 📜 Recruiter Experience

A critical requirement:

**The recruiter should never be forced to play the game.**

Recruiters may have very little time, so the landing screen should provide multiple options.

```text
╔══════════════════════════════════╗
║                                  ║
║       ⚔️ WELCOME, ADVENTURER     ║
║                                  ║
║     Explore my career as an RPG  ║
║                                  ║
║       [ PLAY EXPERIENCE ]        ║
║                                  ║
║       [ VIEW RESUME ]            ║
║                                  ║
║       [ VIEW PROJECTS ]          ║
║                                  ║
╚══════════════════════════════════╝
```

### Play Experience

The full interactive RPG.

### View Resume

A traditional, recruiter-friendly CV.

### View Projects

A portfolio view with projects, technologies, links, screenshots, and descriptions.

The game should **enhance the CV, not replace it**.

---

# ⏱️ Recruiter Mode

A potential future feature could be a fast recruiter mode.

When entering:

> **You have 3 minutes. Choose your path.**

```text
⚔️ TECHNICAL JOURNEY
→ Projects & Technologies

🛡️ LEADERSHIP JOURNEY
→ Teamwork & Responsibility

🧙 COMPLETE JOURNEY
→ Full Career
```

This allows someone to quickly explore the aspects most relevant to the role they're hiring for.

---

# 🏆 Progression System

The player's progression should directly reflect the real career timeline.

Possible progression:

```text
Education
    ↓
First Experience
    ↓
Professional Experience
    ↓
Projects
    ↓
Advanced Skills
    ↓
Leadership / Responsibility
    ↓
Current Position
    ↓
Final Boss
```

Each milestone can provide:

- XP
- Skills
- Achievements
- Items
- Lore / Story
- Portfolio entries
- Career milestones

---

# 🎒 Inventory

The inventory can represent technologies, certifications, tools, and achievements.

Example:

```text
╔════════════════════════════╗
║          INVENTORY         ║
╠════════════════════════════╣
║                            ║
║  ⚛️ React                  ║
║  📘 TypeScript             ║
║  🟨 JavaScript             ║
║  🐳 Docker                 ║
║  🐙 Git                    ║
║  ☁️ Cloud                  ║
║                            ║
║  🏆 Certification          ║
║  🏆 Achievement            ║
║                            ║
╚════════════════════════════╝
```

Clicking an item should provide real context.

For example:

```text
🐳 Docker

Unlocked at:
Company X

Used for:
• Project A
• Project B

Experience:
2+ years
```

---

# 🧑‍💻 Technical Direction

The game should be built as a lightweight browser application.

## Recommended Stack

- **TypeScript**
- **Phaser 3**
- **Vite**
- HTML5 Canvas / WebGL
- Tilemaps
- GitHub Pages or another static hosting provider

The existing reference project uses Phaser 3 and demonstrates a similar direction with a browser-based game, tilemaps, physics, and interactive gameplay.

Reference:

`https://github.com/ABCoder1/ABCoder1.github.io`

---

# 📁 Proposed Project Structure

```text
resume-rpg/
│
├── src/
│   ├── main.ts
│   │
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── WorldScene.ts
│   │   ├── DungeonScene.ts
│   │   └── ResumeScene.ts
│   │
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── NPC.ts
│   │   ├── Enemy.ts
│   │   └── Boss.ts
│   │
│   ├── systems/
│   │   ├── QuestSystem.ts
│   │   ├── SkillSystem.ts
│   │   ├── DialogueSystem.ts
│   │   └── SaveSystem.ts
│   │
│   ├── data/
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   └── quests.ts
│   │
│   └── ui/
│       ├── CharacterSheet.ts
│       ├── DialogueBox.ts
│       ├── QuestLog.ts
│       └── SkillPopup.ts
│
├── assets/
│   ├── characters/
│   ├── tilesets/
│   ├── enemies/
│   ├── ui/
│   └── audio/
│
└── public/
```

---

# 🚀 MVP

The first version should stay small.

## Version 1

Build one small playable world containing:

- WASD / Arrow Key movement
- Pixel-art player character
- Tilemap
- 3–4 career locations
- NPC dialogue
- Quest system
- One or two simple puzzles
- Skill unlock system
- Character sheet
- Project information
- Traditional CV button
- Responsive browser UI
- Deployable static website

Example flow:

```text
START
  ↓
🏫 EDUCATION
  ↓
💼 EXPERIENCE
  ↓
💻 PROJECTS
  ↓
👹 FINAL BOSS
  ↓
📜 COMPLETE CV
```

This is enough to create a compelling first prototype.

---

# 🔮 Future Features

Once the core gameplay works:

### Gameplay

- Multiple maps
- More quests
- Enemies
- Boss fights
- XP system
- Inventory
- Achievements
- NPCs
- Dialogue trees
- Hidden areas
- Easter eggs

### Career Features

- Detailed project pages
- GitHub integration
- LinkedIn link
- Downloadable PDF CV
- Certificates
- References
- Timeline
- Skill history

### Recruiter Features

- Recruiter Mode
- Role-specific journeys
- 3-minute quick tour
- Direct project links
- Skill filtering
- One-click traditional resume

---

# 🎨 Visual Style

The visual direction should feel like a **small polished indie RPG**, rather than a corporate website with game elements.

Possible inspirations:

- Classic 2D RPGs
- Zelda-style exploration
- Dungeon crawlers
- Pixel-art adventure games
- Modern indie browser games

The interface should remain clean and readable.

The game should feel playful, but the actual career information should remain professional.

---

# 🧠 Core Design Principle

The most important idea is to make the **career itself the game mechanics**.

| Traditional CV   | RPG Equivalent      |
| ---------------- | ------------------- |
| Education        | 🏫 Starting Area    |
| Degree           | 🎓 Achievement      |
| Job              | 🏢 Guild / Location |
| Work Experience  | ⭐ XP               |
| Project          | 💻 Quest / Dungeon  |
| Technical Skill  | ⚔️ Ability          |
| Soft Skill       | 🛡️ Passive Ability  |
| Certification    | 🏆 Achievement      |
| Technology       | 🎒 Inventory Item   |
| Career Milestone | 🗺️ New Area         |
| Challenge        | 👹 Enemy / Puzzle   |
| Current Role     | 🏰 Endgame Area     |
| Full CV          | 📜 Character Sheet  |

---

# 🎯 Final Vision

The final product should feel like:

> **A portfolio that happens to be a game — rather than a game that happens to contain a portfolio.**

Someone should be able to visit the website and immediately understand:

**Who I am → what I've done → what I can do → what I've built → where I'm going.**

But instead of scrolling through a traditional resume, they discover that information by **exploring my professional journey**.

The ideal reaction from a recruiter should be:

> _"I've never seen a CV like this before."_

And if they don't have time to play:

> **[ VIEW RESUME ]**

is always one click away.
