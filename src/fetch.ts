import { PremiumRequest, PremiumResponse } from "./types.ts";

const API_URL = "https://www.huk.de/voll/api/tarifiere";

const USER_AGENT = Deno.env.get("USER_AGENT");

if (!USER_AGENT) {
  throw new Error("USER_AGENT environment variable not set");
}

/**
 * Get premium for HUK private health insurance from API
 *
 * @param info personal information
 * @returns premium
 */
export async function getPremium(
  info: PremiumRequest,
): Promise<PremiumResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://www.huk.de/tarifrechner/voll/unser-angebot",
      "User-Agent": USER_AGENT!,
    },
    body: JSON.stringify(info),
  });

  if (!res.ok) {
    throw new Error(`Got status code ${res.status}`);
  }

  const premium: PremiumResponse = await res.json();

  return premium;
}
