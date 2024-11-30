/**
 * Personal information
 */
export interface InfoRequest {
  /**
   * Beruflicher Status
   *
   * - 1 = Angestellt
   * - 2 = Selbstständig
   * - 3 = Freiberuflich tätig
   * - 4 = Sonstiges
   */
  berufGruppe: 1 | 2 | 3 | 4;
  /**
   * Geburtsdatum
   *
   * - in `YYYY-MM-DD` format
   *
   * @example `2000-01-01`
   */
  dateOfBirthVp: string;
  /**
   * Versicherungsbeginn
   *
   * - in `YYYY-MM-DD` format
   * - must be within the next six months
   *
   * @example `2020-01-01`
   */
  startDate: string;
  /**
   * Selbstbeteiligung Tarif E
   */
  sbE: 300 | 1500;
  /**
   * Selbstbeteiligung Tarif K
   */
  sbK: 0 | 300 | 600 | 1500;
  /**
   * Selbstbeteiligung Tarif S
   */
  sbS: 0 | 300 | 600 | 1500;
  /**
   * Produktlinie
   */
  produktlinie: "E" | "K" | "S";
  /**
   * Pflegepflichtversicherung
   */
  ppv: boolean;
  /**
   * Krankentagegeld
   *
   * - note: for `berufGruppe: 4` is always `false`
   */
  kt: boolean;
  /**
   * Krankentagegeld Tagessatz
   *
   * - note: in actual request not present for `berufGruppe: 4`, here include anyways
   */
  ktTgs:
    | 5
    | 10
    | 15
    | 20
    | 25
    | 30
    | 35
    | 40
    | 45
    | 50
    | 55
    | 60
    | 65
    | 70
    | 75
    | 80
    | 85
    | 90
    | 95
    | 100
    | 105
    | 110
    | 115
    | 120
    | 125
    | 130
    | 135
    | 140
    | 145
    | 150
    | 155
    | 160
    | 165
    | 170
    | 175
    | 180;
  /**
   * Zahlweise
   *
   * - 1 = jährlich
   * - 2 = halbjährlich
   * - 12 = monatlich
   */
  zahlweise: 1 | 2 | 12;
}

/**
 * Premium amounts
 */
export interface Premium {
  /**
   * Monatsgesamtbeitrag
   */
  beitragGesamt: number;
  /**
   * Monatsbeitrag
   */
  beitragProdukt: number;
  /**
   * Monatsbeitrag Pflegepflichtversicherung
   */
  beitragPpv: number;
}

/**
 * Premium amounts
 */
export interface PremiumResult {
  /**
   * Gesamtbeitrag
   *
   * - Achtung: variiert je nach `zahlweise`
   */
  beitragGesamt: number;
  /**
   * Monatsbeitrag Tarif K
   */
  beitragProduktK: number;
  /**
   * Monatsbeitrag Tarif S
   */
  beitragProduktS: number;
  /**
   * Monatsbeitrag Tarif E
   */
  beitragProduktE: number;
  /**
   * Monatsbeitrag Pflegepflichtversicherung
   */
  beitragPpv: number;
}
