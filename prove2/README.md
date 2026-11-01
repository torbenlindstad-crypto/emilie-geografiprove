# Geografiprøve 2 – Flervalg (VG1)

- 32 nye flervalgsspørsmål (fire alternativer, ett riktig). Ingen fritekstfelt.
- Bygger på jordas oppbygning, platetektonikk, naturfarer, bergarter og Norges geologi. Ressurs- og arealbruk er utelatt.
- Ni illustrasjonssider fra USGS/NPS/Wikimedia Commons er **kun lenket til**; ingen tredjeparts bildefiler er lastet opp i repoet. Lisens og opphav er synlige ved hvert bildelenkespørsmål.
- Lokal automatisk lagring og JSON-eksport.
- For digital innlevering: Kopier den nyeste `Code.gs` i repoets rot til Apps Script knyttet til Google Sheets, autoriser eventuell ny MailApp-tillatelse og distribuer en **ny versjon** under Administrer implementeringer. Endre deretter `prove2/config.js` til `enabled:true`. Inntil da fungerer prøven lokalt, men innleveringsknappen er deaktivert.
- Før levering må eleven fylle inn navn og gyldig e-postadresse. Etter at serveren har bekreftet mottak via en tilfeldig kvitterings-ID, får eleven 0–32 poeng og en begrunnelse på hvert spørsmål. En kopi sendes også på e-post når MailApp tillater det.
- Google Sheets: `Flervalg 2` har 32 svar, totalscore, e-postadresse og status for e-postutsending. Fasit ligger i privat fane `Fasit flervalg 2`.
- Bruk av e-post: Adressen lagres sammen med besvarelsen i privat regneark og benyttes bare til å sende resultat. Avsenderen må selv sikre at lagring og sletting følger gjeldende personvernrutiner.
- Riktig svar finnes **ikke** i elevens offentlige kode. Fasit og forklaringer ligger i privat Google Sheets-fane `Fasit flervalg 2`.

## Publisert adresse

https://torbenlindstad-crypto.github.io/emilie-geografiprove/prove2/

## Merk

Å lenke til et bilde er ikke automatisk et fritak fra opphavsrett. Sjekk lisens ved originalbildet. Spørsmålene skal løses uten tilgang til fasit, men denne løsningen er ikke en sikker eksamensplattform.
