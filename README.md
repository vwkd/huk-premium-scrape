# README

Scrape HUK-Coburg private health insurance premiums



## Features

- get yearly premiums over time
  - for Tarif Komfort, Tarif SelectPro, and Tarif E
  - with Pflegepflichtversicherung
  - without Krankentagegeld
- approximates future premiums using current premiums from older cohorts
- beware: approximation might not be exact, since younger cohorts aren't necessarily like older cohorts!
- beware: doesn't account for health conditions, might get different premiums when signing up!



## Requirements

- Deno



## Usage

- scrape data

```sh
deno task run 2000 70
```
