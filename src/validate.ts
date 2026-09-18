/**
 * Field-level validation rules for the career file (`data/career.jsonc`).
 *
 * Pure module: no I/O, no console, no process.exit. `validateCareer` takes
 * the parsed file as `unknown` and walks the raw object — the whole point
 * is to catch objects that do NOT match the settled `Career` types (the
 * types alone can't stop a JSON typo). It returns one friendly,
 * human-readable message per problem, each starting with the offending
 * field path (0-based array indices), e.g.
 *
 *   locations[2].challenge.questions[0].answer: expected an integer between
 *   0 and 2 (options has 3 entries)
 *
 * Unknown fields are reported by path too — that is how an owner typo like
 * `loactions` gets caught (and the corresponding required field then
 * reports missing). Empty array means the file is valid.
 */

/** A location id: lowercase words joined by single hyphens, like "first-job". */
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

function validateLinks(value: unknown, path: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${path}: expected an array of { label, url } links`);
    return;
  }
  value.forEach((link, i) => {
    const p = `${path}[${i}]`;
    if (!isObject(link)) {
      errors.push(`${p}: expected an object { label, url }`);
      return;
    }
    for (const key of Object.keys(link)) {
      if (key !== "label" && key !== "url") {
        errors.push(`${p}.${key}: unknown field (a link only has "label" and "url")`);
      }
    }
    if (!isNonEmptyString(link.label)) errors.push(`${p}.label: expected a non-empty string`);
    if (!isNonEmptyString(link.url)) errors.push(`${p}.url: expected a non-empty string`);
  });
}

function validatePlayer(value: unknown, path: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (!["name", "headline", "summary", "links"].includes(key)) {
      errors.push(`${path}.${key}: unknown field`);
    }
  }
  for (const field of ["name", "headline", "summary"]) {
    if (!isNonEmptyString(value[field])) {
      errors.push(`${path}.${field}: expected a non-empty string`);
    }
  }
  validateLinks(value.links, `${path}.links`, errors);
}

function validateWorld(value: unknown, path: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${path}: expected an object with "name" and "blurb"`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (key !== "name" && key !== "blurb") {
      errors.push(`${path}.${key}: unknown field`);
    }
  }
  if (!isNonEmptyString(value.name)) errors.push(`${path}.name: expected a non-empty string`);
  if (!isNonEmptyString(value.blurb)) errors.push(`${path}.blurb: expected a non-empty string`);
}

function validateQuiz(value: Record<string, unknown>, path: string, errors: string[]): void {
  const questions = value.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push(`${path}.questions: expected an array of at least one question`);
    return;
  }
  questions.forEach((question, j) => {
    const p = `${path}.questions[${j}]`;
    if (!isObject(question)) {
      errors.push(`${p}: expected an object`);
      return;
    }
    for (const key of Object.keys(question)) {
      if (!["question", "options", "answer", "note"].includes(key)) {
        errors.push(`${p}.${key}: unknown field`);
      }
    }
    if (!isNonEmptyString(question.question)) {
      errors.push(`${p}.question: expected a non-empty string`);
    }
    const options = question.options;
    if (!Array.isArray(options) || options.length === 0) {
      errors.push(`${p}.options: expected an array of at least one non-empty string`);
    } else {
      options.forEach((option, k) => {
        if (!isNonEmptyString(option)) {
          errors.push(`${p}.options[${k}]: expected a non-empty string`);
        }
      });
    }
    if (!Number.isInteger(question.answer)) {
      errors.push(`${p}.answer: expected an integer (the position of the correct option, counting from 0)`);
    } else if (Array.isArray(options) && options.length > 0) {
      const answer = question.answer as number;
      if (answer < 0 || answer >= options.length) {
        errors.push(
          `${p}.answer: expected an integer between 0 and ${options.length - 1} (options has ${options.length} entries)`,
        );
      }
    }
    if ("note" in question && typeof question.note !== "string") {
      errors.push(`${p}.note: expected a string`);
    }
  });
}

function validateCoding(value: Record<string, unknown>, path: string, errors: string[]): void {
  if (!isNonEmptyString(value.context)) {
    errors.push(`${path}.context: expected a non-empty string`);
  }
  if (!isNonEmptyString(value.code)) {
    errors.push(`${path}.code: expected a non-empty string`);
  } else {
    const blanks = (value.code as string).match(/____/g)?.length ?? 0;
    if (blanks !== 1) {
      errors.push(`${path}.code: expected exactly one "____" (found ${blanks})`);
    }
  }
  if (!isNonEmptyString(value.fix)) {
    errors.push(`${path}.fix: expected a non-empty string`);
  }
  if (!isNonEmptyString(value.explanation)) {
    errors.push(`${path}.explanation: expected a non-empty string`);
  }
}

function validateChallenge(value: unknown, path: string, errors: string[]): void {
  if (value === undefined) {
    errors.push(`${path}: missing — every Location needs exactly one challenge (talk | quiz | coding)`);
    return;
  }
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const type = value.type;
  if (typeof type !== "string" || !["talk", "quiz", "coding"].includes(type)) {
    errors.push(`${path}.type: challenge type must be one of talk | quiz | coding`);
    return;
  }
  const knownByType: Record<string, string[]> = {
    // talk has zero payload — any key besides "type" is reported below.
    talk: ["type"],
    quiz: ["type", "questions"],
    coding: ["type", "context", "code", "fix", "explanation"],
  };
  const known = knownByType[type]!;
  for (const key of Object.keys(value)) {
    if (!known.includes(key)) {
      errors.push(`${path}.${key}: unknown field for a ${type} challenge`);
    }
  }
  if (type === "quiz") validateQuiz(value, path, errors);
  else if (type === "coding") validateCoding(value, path, errors);
}

function validateLocation(value: unknown, index: number, seenIds: Map<string, number>, errors: string[]): void {
  const path = `locations[${index}]`;
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (!["id", "title", "period", "npcName", "dialogue", "challenge", "skills"].includes(key)) {
      errors.push(`${path}.${key}: unknown field`);
    }
  }
  const id = value.id;
  if (!isNonEmptyString(id)) {
    errors.push(`${path}.id: expected a non-empty string`);
  } else {
    if (!KEBAB.test(id)) {
      errors.push(
        `${path}.id: "${id}" is not a kebab-case slug (lowercase words joined by single hyphens, like "first-job")`,
      );
    }
    const firstIndex = seenIds.get(id);
    if (firstIndex !== undefined) {
      errors.push(`${path}.id: duplicate id "${id}" (already used by locations[${firstIndex}])`);
    } else {
      seenIds.set(id, index);
    }
  }
  if (!isNonEmptyString(value.title)) errors.push(`${path}.title: expected a non-empty string`);
  if (!isNonEmptyString(value.period)) errors.push(`${path}.period: expected a non-empty string`);
  if ("npcName" in value && typeof value.npcName !== "string") {
    errors.push(`${path}.npcName: expected a string`);
  }
  const dialogue = value.dialogue;
  if (!Array.isArray(dialogue) || dialogue.length === 0) {
    errors.push(`${path}.dialogue: expected an array of at least one non-empty string (the ordered speech bubbles)`);
  } else {
    dialogue.forEach((line, j) => {
      if (!isNonEmptyString(line)) errors.push(`${path}.dialogue[${j}]: expected a non-empty string`);
    });
  }
  validateChallenge(value.challenge, `${path}.challenge`, errors);
  const skills = value.skills;
  if (!Array.isArray(skills) || skills.length === 0) {
    errors.push(`${path}.skills: expected an array of at least one { name, evidence } skill`);
  } else {
    skills.forEach((skill, j) => {
      const p = `${path}.skills[${j}]`;
      if (!isObject(skill)) {
        errors.push(`${p}: expected an object { name, evidence }`);
        return;
      }
      for (const key of Object.keys(skill)) {
        if (key !== "name" && key !== "evidence") {
          errors.push(`${p}.${key}: unknown field`);
        }
      }
      if (!isNonEmptyString(skill.name)) errors.push(`${p}.name: expected a non-empty string`);
      if (!isNonEmptyString(skill.evidence)) errors.push(`${p}.evidence: expected a non-empty string`);
    });
  }
}

function validateLocations(value: unknown, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push("locations: expected an array of at least one location");
    return;
  }
  if (value.length === 0) {
    errors.push("locations: expected at least one entry");
    return;
  }
  const seenIds = new Map<string, number>();
  value.forEach((location, i) => validateLocation(location, i, seenIds, errors));
}

function validateProjects(value: unknown, path: string, errors: string[]): void {
  if (!Array.isArray(value)) {
    errors.push(`${path}: expected an array (empty allowed)`);
    return;
  }
  value.forEach((project, i) => {
    const p = `${path}[${i}]`;
    if (!isObject(project)) {
      errors.push(`${p}: expected an object`);
      return;
    }
    for (const key of Object.keys(project)) {
      if (!["name", "html", "links"].includes(key)) {
        errors.push(`${p}.${key}: unknown field`);
      }
    }
    if (!isNonEmptyString(project.name)) errors.push(`${p}.name: expected a non-empty string`);
    if (!isNonEmptyString(project.html)) errors.push(`${p}.html: expected a non-empty string`);
    validateLinks(project.links, `${p}.links`, errors);
  });
}

function validateGate(value: unknown, path: string, errors: string[]): void {
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const key of Object.keys(value)) {
    if (key !== "title" && key !== "html") {
      errors.push(`${path}.${key}: unknown field`);
    }
  }
  if (!isNonEmptyString(value.title)) errors.push(`${path}.title: expected a non-empty string`);
  if (!isNonEmptyString(value.html)) errors.push(`${path}.html: expected a non-empty string`);
}

/**
 * Validate the parsed career file. Returns one friendly message per problem
 * (each starting with the field path), empty when valid.
 */
export function validateCareer(raw: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(raw)) {
    return ["(root): expected the career file to be a JSON object"];
  }
  const topLevel = ["player", "world", "locations", "projects", "gate"];
  for (const key of Object.keys(raw)) {
    if (!topLevel.includes(key)) {
      errors.push(`${key}: unknown top-level field (expected only ${topLevel.join(", ")})`);
    }
  }
  if (!("player" in raw)) errors.push("player: missing required field");
  else validatePlayer(raw.player, "player", errors);
  if ("world" in raw) validateWorld(raw.world, "world", errors);
  if (!("locations" in raw)) errors.push("locations: missing required field");
  else validateLocations(raw.locations, errors);
  if (!("projects" in raw)) errors.push("projects: missing required field");
  else validateProjects(raw.projects, "projects", errors);
  if (!("gate" in raw)) errors.push("gate: missing required field");
  else validateGate(raw.gate, "gate", errors);
  return errors;
}
