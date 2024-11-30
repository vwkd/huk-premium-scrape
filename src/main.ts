import { getPremium } from "./fetch.ts";

const OUTPUT_FILE = "out/data.jsonl";
const yearOfBirth = 2000;
const yearsDuration = 30;

try {
  await Deno.remove(OUTPUT_FILE);
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}

// `yearsDuration*4*3*(4+4+2)` requests
for (let year = yearOfBirth; year >= yearOfBirth - yearsDuration; year -= 1) {
  for (let berufGruppe = 1; berufGruppe <= 4; berufGruppe += 1) {
    for (const zahlweise of [1, 2, 12]) {
      for (const sbS of [0, 300, 600, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${year}-01-01`,
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

        const premium = await getPremium(info);
        const line = JSON.stringify({ ...info, ...premium });
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }
      for (const sbK of [0, 300, 600, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${year}-01-01`,
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

        const premium = await getPremium(info);
        const line = JSON.stringify({ ...info, ...premium });
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }
      for (const sbE of [300, 1500]) {
        const info = {
          berufGruppe,
          dateOfBirthVp: `${year}-01-01`,
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

        const premium = await getPremium(info);
        const line = JSON.stringify({ ...info, ...premium });
        console.log(line);
        await Deno.writeTextFile(OUTPUT_FILE, line + "\n", { append: true });
      }
    }
  }
}
