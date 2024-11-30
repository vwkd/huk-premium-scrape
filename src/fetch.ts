import { InfoRequest, Premium, PremiumResult } from "./types.ts";

const API_URL = "https://www.huk.de/voll/api/tarifiere";
const HEADERS = {
  "Content-Type": "application/json",
  "Referer": "https://www.huk.de/tarifrechner/voll/unser-angebot",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.3",
};

/**
 * Get premium for HUK private health insurance from API
 *
 * @param info personal information
 * @returns premium
 */
export async function getPremium(info: InfoRequest): Promise<Premium> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(info),
  });

  if (!res.ok) {
    throw new Error(`Got status code ${res.status}`);
  }

  const beitrag: PremiumResult = await res.json();

  return {
    beitragGesamt: beitrag.beitragGesamt,
    beitragProdukt: info.produktlinie === "S"
      ? beitrag.beitragProduktS
      : info.produktlinie === "K"
      ? beitrag.beitragProduktK
      : info.produktlinie === "E"
      ? beitrag.beitragProduktE
      : ((): never => {
        throw new Error("Invalid produktlinie");
      })(),
    beitragPpv: beitrag.beitragPpv,
  };
}
