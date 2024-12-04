import { getPremium } from "./fetch.ts";
import { Entry } from "./types.ts";
import { Command } from "@cliffy/command";
import { exists } from "@std/fs";

const OUTPUT_FILE = "out/data.jsonl";
/**
 * Maximum age for which premiums are available
 *
 * - get from earliest possible birthyear in form
 */
const MAX_AGE = 100;
const ZAHLWEISEN = [1, 2, 12] as const;
const SELBSTBEHALTE_SK = [0, 300, 600, 1500] as const;
const SELBSTBEHALTE_E = [300, 1500] as const;
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getUTCFullYear();
const FIRST_OF_NEXT_MONTH = new Date(Date.UTC(
  TODAY.getUTCFullYear(),
  TODAY.getUTCMonth() + 1,
  1,
));

await new Command()
  .name("huk-premium-scrape")
  .version("0.0.1")
  .description("Scrape HUK-Coburg private health insurance premiums for years of life")
  .arguments("<yearOfBirth:number> <durationYears:number>")
  .action(main)
  .parse(Deno.args);

/**
 * Scrape HUK-Coburg private health insurance premiums for years of life
 *
 * - from 0 to `durationYears` years of life
 * - approximates future premiums using current premiums from older cohorts
 * - beware: approximation might not be exact, since younger cohorts aren't necessarily like older cohorts!
 * - makes `durationYears*3*(4+4+2)` requests
 */
async function main(_, yearOfBirth: number, durationYears: number) {
  console.info(
    `Getting premiums for ${yearOfBirth} with ${durationYears} years of plan`,
  );

  const earliestYear = CURRENT_YEAR - MAX_AGE;

  if (
    !Number.isInteger(durationYears) || durationYears < 0 ||
    durationYears > MAX_AGE
  ) {
    throw new Error(
      `Expected 'durationYears' to be a positive integer smaller or equal to '${MAX_AGE}'`,
    );
  }

  if (
    !Number.isInteger(yearOfBirth) || yearOfBirth - durationYears < earliestYear
  ) {
    throw new Error(
      `Expected 'yearOfBirth' to be larger or equal to '${
        earliestYear + durationYears
      }'`,
    );
  }

  if (await exists(OUTPUT_FILE)) {
    throw new Error(
      `Aborting because output file already exists. Remove it to continue.`,
    );
  }

  for (let year = 0; year <= durationYears; year += 1) {
    const yearOfBirthOld = yearOfBirth - year;

    for (const zahlweise of ZAHLWEISEN) {
      for (const sb of SELBSTBEHALTE_SK) {
        const result = await getEntry("S", sb, zahlweise, yearOfBirthOld, year);
        const line = JSON.stringify(result);
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }

      for (const sb of SELBSTBEHALTE_SK) {
        const result = await getEntry("K", sb, zahlweise, yearOfBirthOld, year);
        const line = JSON.stringify(result);
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }

      for (const sb of SELBSTBEHALTE_E) {
        const result = await getEntry("E", sb, zahlweise, yearOfBirthOld, year);
        const line = JSON.stringify(result);
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }
    }
  }

  /**
   * Get entry for year, produktlinie, sb, and zahlweise
   *
   * - includes Pflegepflichtversicherung
   * - doesn't include Krankentagegeld
   * - hardcode `berufGruppe: 1` since all give identical data, see `validate: add` commit
   *
   * @param produktlinie produktlinie
   * @param sb Selbstbeteiligung
   * @param zahlweise zahlweise
   * @param yearOfBirthOld year of birth
   * @param year year
   * @returns entry for personal information
   */
  async function getEntry<P extends "S" | "K" | "E">(
    produktlinie: P,
    sb: P extends "E" ? 300 | 1500 : 0 | 300 | 600 | 1500,
    zahlweise: 1 | 2 | 12,
    yearOfBirthOld: number,
    year: number,
  ): Promise<Entry> {
    if (produktlinie === "S") {
      const info = {
        berufGruppe: 1,
        dateOfBirthVp: `${yearOfBirthOld}-01-01`,
        startDate: FIRST_OF_NEXT_MONTH.toISOString().split("T")[0],
        sbE: SELBSTBEHALTE_E[0],
        sbK: SELBSTBEHALTE_SK[0],
        sbS: sb,
        produktlinie,
        ppv: true,
        kt: false,
        ktTgs: 50,
        zahlweise,
      } as const;

      const premium = await getPremium(info);

      return {
        produktlinie,
        year,
        sb,
        zahlweise,
        beitragProdukt: premium.beitragProduktS,
        beitragPpv: premium.beitragPpv,
        beitragGesamt: Number(
          (info.zahlweise === 12
            ? premium.beitragGesamt * 12
            : info.zahlweise === 2
            ? premium.beitragGesamt * 2
            : premium.beitragGesamt).toFixed(2),
        ),
      };
    } else if (produktlinie === "K") {
      const info = {
        berufGruppe: 1,
        dateOfBirthVp: `${yearOfBirthOld}-01-01`,
        startDate: FIRST_OF_NEXT_MONTH.toISOString().split("T")[0],
        sbE: SELBSTBEHALTE_E[0],
        sbK: sb,
        sbS: SELBSTBEHALTE_SK[0],
        produktlinie,
        ppv: true,
        kt: false,
        ktTgs: 50,
        zahlweise,
      } as const;

      const premium = await getPremium(info);

      return {
        produktlinie,
        year,
        sb,
        zahlweise,
        beitragProdukt: premium.beitragProduktK,
        beitragPpv: premium.beitragPpv,
        beitragGesamt: Number(
          (info.zahlweise === 12
            ? premium.beitragGesamt * 12
            : info.zahlweise === 2
            ? premium.beitragGesamt * 2
            : premium.beitragGesamt).toFixed(2),
        ),
      };
    } else if (produktlinie === "E") {
      const info = {
        berufGruppe: 1,
        dateOfBirthVp: `${yearOfBirthOld}-01-01`,
        startDate: FIRST_OF_NEXT_MONTH.toISOString().split("T")[0],
        sbE: sb,
        sbK: SELBSTBEHALTE_SK[0],
        sbS: SELBSTBEHALTE_SK[0],
        produktlinie,
        ppv: true,
        kt: false,
        ktTgs: 50,
        zahlweise,
      } as const;

      const premium = await getPremium(info);

      return {
        produktlinie,
        year,
        sb,
        zahlweise,
        beitragProdukt: premium.beitragProduktE,
        beitragPpv: premium.beitragPpv,
        beitragGesamt: Number(
          (info.zahlweise === 12
            ? premium.beitragGesamt * 12
            : info.zahlweise === 2
            ? premium.beitragGesamt * 2
            : premium.beitragGesamt).toFixed(2),
        ),
      };
    } else {
      throw new Error("Invalid produktlinie");
    }
  }
}
