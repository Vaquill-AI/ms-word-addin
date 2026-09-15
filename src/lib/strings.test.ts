import { describe, expect, it } from "vitest";
import { stripMarkdown } from "@/lib/strings";

describe("stripMarkdown", () => {
  it("converts headings and emphasis to readable plain text", () => {
    expect(stripMarkdown("## Review\n**Confidential** and *important*."))
      .toBe("Review\nConfidential and important.");
  });

  it("keeps link text and image alt text without their destinations", () => {
    expect(stripMarkdown("Read [the policy](https://example.com/policy) and ![the diagram](diagram.png)."))
      .toBe("Read the policy and the diagram.");
  });

  it("removes table separators while preserving cell contents", () => {
    expect(stripMarkdown("Name | Risk\n:--- | ---:\nTerm | High"))
      .toBe("Name  Risk\n\nTerm  High");
  });

  it("normalizes Windows newlines, quotes, lists, and inline code", () => {
    expect(stripMarkdown("> **Note**\r\n- `Term`\r\n1) Check"))
      .toBe("Note\n• Term\n1. Check");
    expect(stripMarkdown("")).toBe("");
  });
});
