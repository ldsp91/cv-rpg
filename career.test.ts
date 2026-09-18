import { test, expect } from "bun:test";
import career from "./data/career.json";

test("the career file is a valid content source", () => {
  expect(typeof career.player?.name).toBe("string");
  expect(Array.isArray(career.locations)).toBe(true);
  expect(career.locations.length).toBeGreaterThan(0);

  for (const location of career.locations) {
    expect(typeof location.id).toBe("string");
    expect(typeof location.title).toBe("string");
    expect(typeof location.html).toBe("string");
    expect(location.html.length).toBeGreaterThan(0);
  }
});
