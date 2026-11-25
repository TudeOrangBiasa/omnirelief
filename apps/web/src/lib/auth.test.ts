import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfil, requireRole } from "./auth";
import { createClient } from "./supabase/server";

vi.mock("./supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const buatClient = (user: { id: string } | null, profil: unknown) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profil }),
  }),
});

beforeEach(() => {
  vi.mocked(createClient).mockReset();
});

describe("getProfil", () => {
  it("null bila belum masuk", async () => {
    vi.mocked(createClient).mockResolvedValue(buatClient(null, null) as never);
    expect(await getProfil()).toBeNull();
  });

  it("ambil profil peran admin", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buatClient({ id: "1" }, { id: "1", nama: "A", peran: "ADMIN", posko_id: null }) as never
    );
    expect(await getProfil()).toEqual({ id: "1", nama: "A", peran: "ADMIN", posko_id: null });
  });
});

describe("requireRole", () => {
  it("lempar redirect masuk bila anonim dan beranda bila peran salah", async () => {
    vi.mocked(createClient).mockResolvedValue(buatClient(null, null) as never);
    await expect(requireRole(["ADMIN"])).rejects.toThrow("REDIRECT:/masuk");
    vi.mocked(createClient).mockResolvedValue(
      buatClient({ id: "1" }, { id: "1", nama: "B", peran: "BPBD", posko_id: null }) as never
    );
    await expect(requireRole(["ADMIN"])).rejects.toThrow("REDIRECT:/beranda");
  });

  it("lolos untuk peran yang boleh", async () => {
    vi.mocked(createClient).mockResolvedValue(
      buatClient({ id: "1" }, { id: "1", nama: "A", peran: "ADMIN", posko_id: null }) as never
    );
    expect(await requireRole(["ADMIN"])).toEqual({ id: "1", nama: "A", peran: "ADMIN", posko_id: null });
  });
});
