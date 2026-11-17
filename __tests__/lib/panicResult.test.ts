import { describe, it, expect } from "vitest";
import { parsePanicResult, parsePanicText } from "@/lib/panicResult";

describe("parsePanicResult", () => {
  it.each(["sent", "partial", "failed", "no_contacts"])("accepts status %s", (status) => {
    expect(parsePanicResult({ status, sent: 1, failed: 0 })).toEqual({ status, sent: 1, failed: 0 });
  });

  it("drops every field except status, sent and failed", () => {
    expect(
      parsePanicResult({ status: "sent", sent: 1, failed: 0, phone: "+12125550100", userId: "u1" })
    ).toEqual({ status: "sent", sent: 1, failed: 0 });
  });

  it.each([
    ["an unknown status", { status: "ok", sent: 1, failed: 0 }],
    ["a missing count", { status: "sent", sent: 1 }],
    ["a negative count", { status: "sent", sent: -1, failed: 0 }],
    ["a fractional count", { status: "sent", sent: 1.5, failed: 0 }],
    ["a count as a string", { status: "sent", sent: "1", failed: 0 }],
    ["null", null],
    ["a string", "sent"],
  ])("returns null for %s", (_, value) => {
    expect(parsePanicResult(value)).toBeNull();
  });
});

describe("parsePanicText", () => {
  it("parses a JSON body", () => {
    expect(parsePanicText('{"status":"partial","sent":2,"failed":1}')).toEqual({
      status: "partial",
      sent: 2,
      failed: 1,
    });
  });

  it("returns null for a body that isn't JSON", () => {
    expect(parsePanicText("<html>502 Bad Gateway</html>")).toBeNull();
    expect(parsePanicText("")).toBeNull();
  });
});
