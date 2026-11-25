import { describe, expect, it } from "vitest";
import { selCsv } from "./csv";

describe("selCsv", () => {
  it("teks polos tanpa kutip", () => {
    expect(selCsv("Posko Harapan")).toBe("Posko Harapan");
    expect(selCsv(320)).toBe("320");
  });

  it("koma, petik, dan baris baru dikutip plus petik digandakan", () => {
    expect(selCsv("a,b")).toBe('"a,b"');
    expect(selCsv('kata "kunci"')).toBe('"kata ""kunci"""');
    expect(selCsv("baris\nbaru")).toBe('"baris\nbaru"');
  });
});
