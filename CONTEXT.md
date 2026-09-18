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

**World**:
The themed umbrella over the whole career map — a name and framing (v1: Tech City) that gives every Location a shared setting. The theme lives in the World, not in Location titles, which stay real.
_Avoid_: map, theme, level

**Final boss**:
The capstone of the career journey at the far end of the map. In v1 it is a gate that only opens once every Location's Challenge is complete — the "combination of everything unlocked" expressed as a gate, not a fight.
_Avoid_: boss fight, endgame
