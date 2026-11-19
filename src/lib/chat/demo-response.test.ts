import { describe, expect, it } from "vitest";
import { createDemoResponse } from "./demo-response";

describe("createDemoResponse", () => {
  it("returns a transparent default demo response", () => {
    const response = createDemoResponse("Olá");
    expect(response).toContain("Astraea Demo");
    expect(response).toContain("não foi enviada");
  });

  it("returns a formatted technical demonstration", () => {
    expect(createDemoResponse("Mostre código TypeScript")).toContain("```ts");
  });
});

describe("createDemoResponse in other languages", () => {
  it("answers in English and Spanish", () => {
    expect(createDemoResponse("Hello", "en")).toContain("was not sent");
    expect(createDemoResponse("Hazme un plan", "es")).toContain("Plan de demostración");
    expect(createDemoResponse("Show me code", "en")).toContain("Technical assistance demo");
  });
});
