import { describe, expect, it } from "vitest";
import { analyzeDefinedTerms } from "@/lib/defined-terms";

// The mock contract in src/preview.tsx, kept here without importing its UI.
const draftText = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (this "Agreement") is entered into as of the Effective Date by and between Acme Inc., a Delaware corporation ("Acme"), and Beta LLC, a Delaware limited liability company ("Beta").

1. Confidential Information. "Confidential Information" means any non-public information disclosed by one party to the other, whether orally, in writing, or by inspection of tangible objects.

2. Obligations. Each party shall (a) hold the other's Confidential Information in strict confidence, and (b) not disclose it to any third party without prior written consent.

3. Term. The obligations of confidentiality shall survive for three (3) years following termination of this Agreement.

4. Governing Law. This Agreement shall be governed by the laws of the State of Delaware.`;

describe("analyzeDefinedTerms", () => {
  it("recognizes both definition grammars in the preview contract without flagging used terms", () => {
    const report = analyzeDefinedTerms(draftText);

    expect(report.definedCount).toBe(4);
    expect(report.findings).toEqual([]);
  });

  it("reports an unused definition added to the sample contract", () => {
    const report = analyzeDefinedTerms(`${draftText}\n"Review Period" means thirty days.`);

    expect(report.definedCount).toBe(5);
    expect(report.findings).toMatchObject([
      { term: "Review Period", kind: "unused", count: 1, definitionCount: 1 },
    ]);
    expect(report.findings).toHaveLength(1);
  });

  it("reports a second definition instead of an unused or undefined finding", () => {
    const report = analyzeDefinedTerms(`${draftText}\n"Confidential Information" means all records.`);

    expect(report.definedCount).toBe(4);
    expect(report.findings).toMatchObject([
      { term: "Confidential Information", kind: "duplicate", definitionCount: 2 },
    ]);
    expect(report.findings).toHaveLength(1);
  });

  it("flags a quoted term only when it is also used unquoted without a definition", () => {
    const report = analyzeDefinedTerms(`${draftText}\nThe "Effective Date" is stated above.`);

    expect(report.findings).toMatchObject([
      { term: "Effective Date", kind: "undefined", count: 2, definitionCount: 0 },
    ]);
    expect(report.findings).toHaveLength(1);
    expect(analyzeDefinedTerms('The parties said "Good Morning".').findings).toEqual([]);
  });

  it("counts whole-word, case-sensitive uses and ordinary plurals", () => {
    expect(analyzeDefinedTerms('"Party" means a signatory. The Parties agree.').findings).toEqual([]);
    expect(analyzeDefinedTerms('"Term" means one year. Terms apply.').findings).toEqual([]);
    expect(analyzeDefinedTerms('"Term" means one year. Termination is separate.').findings)
      .toMatchObject([{ term: "Term", kind: "unused" }]);
    expect(analyzeDefinedTerms('"Party" means a signatory. A party signed.').findings)
      .toMatchObject([{ term: "Party", kind: "unused" }]);
  });

  it("handles curly quotes and resets its state across repeated analyses", () => {
    const text = "Each signatory (each a “Party”) agrees. The Parties sign.";

    expect(analyzeDefinedTerms(text)).toEqual({ definedCount: 1, findings: [] });
    expect(analyzeDefinedTerms("")).toEqual({ definedCount: 0, findings: [] });
    expect(analyzeDefinedTerms(text)).toEqual({ definedCount: 1, findings: [] });
  });
});
