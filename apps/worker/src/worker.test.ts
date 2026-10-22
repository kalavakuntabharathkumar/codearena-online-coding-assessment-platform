import { describe, expect, it } from "@jest/globals";

describe("worker contract", () => {
  it("documents the safe demo verdict", () => {
    const result = { verdict: "demo_only", message: "Candidate code was not executed." };
    expect(result.verdict).toBe("demo_only");
    expect(result.message).toContain("not executed");
  });
});
