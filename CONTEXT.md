# Resume RPG

Resume RPG turns a career into a playable 2D dungeon crawler: a recruiter explores the career as a map, and completing each location's challenge reveals the real skills and experience behind it, with a traditional CV always one click away.

## Language

**Location**:
A place on the game map that represents one real career milestone — school, university, job, project, team experience, initiative.
_Avoid_: area, zone, room, map (for a single milestone)

**Challenge**:
The small interactive task at a Location — puzzle, quiz, quest, coding puzzle, dialogue, or resource challenge — that must be completed to unlock the milestone.
_Avoid_: task, mission, minigame

**Skill unlock**:
The real-world evidence (years, projects, usage) revealed when a Challenge is completed, shown instead of an arbitrary RPG number.
_Avoid_: XP, reward, loot

**Career file**:
The single JSON file that holds all career content, with the text written as HTML for the game to render.
_Avoid_: save file, content.json, data file
