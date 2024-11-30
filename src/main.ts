import { getPremium } from "./fetch.ts";
import { InfoRequest } from "./types.ts";

const OUTPUT_FILE = "out/data.jsonl";
const yearOfBirth = 2000;
const yearsMax = 30;

try {
  await Deno.remove(OUTPUT_FILE);
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}

/**
 * @module
 *
 * Scrape HUK-Coburg private health insurance premiums for years of life
 *
 * - from 0 to `yearsMax` years of life
 * - beware: approximation using premiums from cohorts of previous years, newer cohorts aren't necessarily like older ones!
 * - doesn't support Krankentagegeld
 * - makes `yearsMax*4*3*(4+4+2)` requests
 */
for (let year = 0; year <= yearsMax; year += 1) {
  const yearOfBirthOld = yearOfBirth - year;

  for (let berufGruppe = 1; berufGruppe <= 4; berufGruppe += 1) {
    for (const zahlweise of [1, 2, 12]) {
      for (const sbS of [0, 300, 600, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${yearOfBirthOld}-01-01`,
          startDate: "2025-01-01",
          sbE: 300,
          sbK: 0,
          sbS,
          produktlinie: "S",
          ppv: true,
          kt: false,
          ktTgs: 50,
          zahlweise,
        } as const;

        await get(info, year);
      }
      for (const sbK of [0, 300, 600, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${yearOfBirthOld}-01-01`,
          startDate: "2025-01-01",
          sbE: 300,
          sbK,
          sbS: 0,
          produktlinie: "K",
          ppv: true,
          kt: false,
          ktTgs: 50,
          zahlweise,
        } as const;

        await get(info, year);
      }
      for (const sbE of [300, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${yearOfBirthOld}-01-01`,
          startDate: "2025-01-01",
          sbE,
          sbK: 0,
          sbS: 0,
          produktlinie: "E",
          ppv: true,
          kt: false,
          ktTgs: 50,
          zahlweise,
        } as const;

        await get(info, year);
      }
    }
  }
}

/**
 * Get premium and write to file
 *
 * @param info personal information
 * @param year year of insurance
 * @returns
 */
async function get(info: InfoRequest, year: number) {
  const premium = await getPremium(info);

  if (info.produktlinie === "S") {
    const result = {
      produktlinie: info.produktlinie,
      berufGruppe: info.berufGruppe,
      year: year,
      sb: info.sbS,
      zahlweise: info.zahlweise,
      beitragProdukt: premium.beitragProduktS,
      beitragPpv: premium.beitragPpv,
      beitragGesamt: Number(
        (info.zahlweise === 1
          ? premium.beitragGesamt / 12
          : info.zahlweise === 2
          ? premium.beitragGesamt / 6
          : premium.beitragGesamt).toFixed(2),
      ),
    };

    const line = JSON.stringify(result);
    console.log(line);
    await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
  } else if (info.produktlinie === "K") {
    const result = {
      produktlinie: info.produktlinie,
      berufGruppe: info.berufGruppe,
      year: year,
      sb: info.sbK,
      zahlweise: info.zahlweise,
      beitragProdukt: premium.beitragProduktK,
      beitragPpv: premium.beitragPpv,
      beitragGesamt: Number(
        (info.zahlweise === 1
          ? premium.beitragGesamt / 12
          : info.zahlweise === 2
          ? premium.beitragGesamt / 6
          : premium.beitragGesamt).toFixed(2),
      ),
    };

    const line = JSON.stringify(result);
    console.log(line);
    await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
  } else if (info.produktlinie === "E") {
    const result = {
      produktlinie: info.produktlinie,
      berufGruppe: info.berufGruppe,
      year: year,
      sb: info.sbE,
      zahlweise: info.zahlweise,
      beitragProdukt: premium.beitragProduktE,
      beitragPpv: premium.beitragPpv,
      beitragGesamt: Number(
        (info.zahlweise === 1
          ? premium.beitragGesamt / 12
          : info.zahlweise === 2
          ? premium.beitragGesamt / 6
          : premium.beitragGesamt).toFixed(2),
      ),
    };

    const line = JSON.stringify(result);
    console.log(line);
    await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
  } else {
    throw new Error("Invalid produktlinie");
  }
}
