import { describe, expect, it } from "vitest";
import { baris, tunggal } from "./baris";

describe("baris", () => {
  it("terima array berisi objek", () => {
    expect(baris([{ a: 1 }, { b: 2 }])).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("buang baris bukan objek dan non-array", () => {
    expect(baris([{ a: 1 }, null, "x", 3] as unknown[])).toEqual([{ a: 1 }]);
    expect(baris(null)).toEqual([]);
    expect(baris({ a: 1 })).toEqual([]);
  });
});

describe("tunggal", () => {
  it("terima objek, tolak sisanya", () => {
    expect(tunggal({ a: 1 })).toEqual({ a: 1 });
    expect(tunggal(null)).toBeNull();
    expect(tunggal([1])).toEqual([1]);
  });
});
