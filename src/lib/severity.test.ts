import { describe, expect, it } from "vitest";
import { severityOf } from "@/lib/severity";

describe("severityOf", () => {
  it("promotes every deal breaker to high, including manager-level approval", () => {
    expect(severityOf({ isDealBreaker: true })).toBe("high");
    expect(severityOf({ isDealBreaker: true, approvalLevel: "manager" })).toBe("high");
    expect(severityOf({ isDealBreaker: true, approvalLevel: "none" })).toBe("high");
  });

  it.each(["partner", "gc"] as const)("promotes %s approval to high", (approvalLevel) => {
    expect(severityOf({ isDealBreaker: false, approvalLevel })).toBe("high");
  });

  it("keeps manager approval at medium when it is not a deal breaker", () => {
    expect(severityOf({ isDealBreaker: false, approvalLevel: "manager" })).toBe("medium");
  });

  it.each([undefined, null, "none"] as const)("keeps %s approval at low", (approvalLevel) => {
    expect(severityOf({ isDealBreaker: false, approvalLevel })).toBe("low");
  });
});
