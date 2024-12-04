# README

Scrape HUK-Coburg private health insurance premiums for years of life



## Features

- for Tarif Komfort, Tarif SelectPro, Tarif E
- includes Pflegepflichtversicherung
- doesn't include Krankentagegeld
- approximates future premiums using current premiums from older cohorts
- beware: approximation might not be exact, since younger cohorts aren't necessarily like older cohorts!



## Requirements

- Deno



## Usage

- scrape data

```sh
deno task run 2000 70
```
