import { getPremium } from "./fetch.ts";

const info = {
  berufGruppe: 2,
  dateOfBirthVp: "2000-01-01",
  startDate: "2025-01-01",
  sbE: 300,
  sbK: 0,
  sbS: 0,
  ppv: true,
  kt: false,
  ktTgs: 50,
  zahlweise: 1,
} as const;

const premium = await getPremium(info);

console.log(premium);
