/**
 * Validate premiums for beitragsGruppen are identical
 * 
 * @param data data to validate
 * @throws Error if premiums are not identical for beitragsGruppen
 */
function validateBeitragsgruppen(data) {
  const years = Array.from(new Set(data.map((d) => d.year)));

  const zahlweisen = Array.from(new Set(data.map((d) => d.zahlweise)));

  const produktlinien = Array.from(new Set(data.map((d) => d.produktlinie)));

  const sbsS = Array.from(
    new Set(data.filter((d) => d.produktlinie === "S").map((d) => d.sb)),
  );
  const sbsK = Array.from(
    new Set(data.filter((d) => d.produktlinie === "K").map((d) => d.sb)),
  );
  const sbsE = Array.from(
    new Set(data.filter((d) => d.produktlinie === "E").map((d) => d.sb)),
  );
  const sbs = {
    S: sbsS,
    K: sbsK,
    E: sbsE,
  };

  for (const year of years) {
    for (const zahlweise of zahlweisen) {
      for (const produktlinie of produktlinien) {
        for (const sb of sbs[produktlinie]) {
          const dataBG = data.filter((d) =>
            d.year === year && d.zahlweise === zahlweise &&
            d.produktlinie === produktlinie && d.sb === sb
          );

          const beitragProdukt = dataBG[0].beitragProdukt;
          const beitragPpv = dataBG[0].beitragPpv;
          const beitragGesamt = dataBG[0].beitragGesamt;

          if (
            !dataBG.every((d) =>
              d.beitragProdukt === beitragProdukt &&
              d.beitragPpv === beitragPpv && d.beitragGesamt === beitragGesamt
            )
          ) {
            throw new Error(
              `Different premiums for beitragsGruppen of year '${year}', zahlweise '${zahlweise}', produktlinie '${produktlinie}', sb '${sb}'`,
            );
          }
        }
      }
    }
  }
}

const lines = await Deno.readTextFile("out/data.jsonl");
const data = lines.trim().split("\n").map(JSON.parse);

validateBeitragsgruppen(data);
