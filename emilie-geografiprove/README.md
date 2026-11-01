# Geografiprøve VG1 – Emilie

En selvstendig, mobilvennlig, statisk prøvenettside basert på den tidligere utarbeidede VG1-prøven (10 oppgaver, 100 poeng). Ingen fasit publiseres i repoet.

## Før oppstart

- Test oppgavene ved å åpne en lokal webserver: `python -m http.server 8000`, åpne `http://localhost:8000`.
- Opprett et **nytt, separat offentlig GitHub-repo** med navn `emilie-geografiprove`. Last opp innholdet fra denne mappen **uten `build.py`**. GitHub-tilkoblingen i ChatGPT kan per nå ikke opprette nye repoer.
- Under **Settings → Pages**, velg **Deploy from a branch**, branch `main`, folder `/ (root)`. GitHub Pages-nettstedet vises etter publisering.
- Ikke legg personopplysninger, svar, API-nøkler eller fasit i det offentlige repoet.

## Opprett Google Sheets-mottak

1. Åpne svararket med fanen **Besvarelser**, med kolonnene: `Tidspunkt`, `Kvittering`, `Elev`, `Prøve`, `Oppgave 1` ... `Oppgave 10`.
2. Velg **Utvidelser → Apps Script** i *det samme* regnearket. Lim inn hele `Code.gs`, lagre.
3. Velg **Deploy → New deployment → Web app**. Kjør som **Me** og tilgang **Anyone**. Autoriser. Kopier webappens `https://script.google.com/macros/s/.../exec`-adresse.
4. I GitHub: rediger `config.js`, fyll inn adressen som `submitUrl`, commit.
5. Send inn en testbesvarelse og **kontroller manuelt at en ny rad kommer i Besvarelser**. Kvitterings-ID fra nettsiden skal matche kolonnen «Kvittering».

### Viktige begrensninger

- Nettleseren bruker `localStorage`, som bare lagrer på samme enhet/nettleser og kan forsvinne. Elever bør eksportere en kopi før og etter innlevering.
- En Apps Script-webapp som er åpen for "Anyone" har **ikke elevinnlogging eller sikker autentisering** og kan motta uønskede innsendinger. Ikke bruk den til sensitive personopplysninger eller formell eksamen uten sikrere autentisering og sikkerhetsgjennomgang.
- Innsendingen skjer som `no-cors` POST. Nettleseren kan **ikke lese en serverbekreftelse**, selv om forespørselen sendes. Derfor viser siden *ikke* falsk "mottatt"-bekreftelse; du må verifisere raden i Google Sheets.
- Nettstedet er ikke en låst eksamensplattform og forhindrer ikke hjelpemidler eller fusk.
- Endringer i `Code.gs` krever ny distribusjonsversjon under **Deploy → Manage deployments**.
- Ark som mottar besvarelser bør deles kun med foresatt/lærer, ikke offentlig. Dette er en øvingsløsning.

## Filoversikt

- `index.html`, `style.css`, `app.js`: elevside, visning, lokal lagring og innsending.
- `questions.json`: oppgavetekst og poeng.
- `assets/`: figur 1–3.
- `config.js`: offentlig webapp-adresse, uten passord.
- `Code.gs`: mottakskode som installeres manuelt i Google Apps Script; ikke kjørt av GitHub.

## Faglig formål

Eleven skal forklare og begrunne årsak–virkning, arbeide med kart, modeller, kildekritikk og naturkatastrofer. Emner om ressurs- og arealbruk er utelatt etter avtale. Det er en øvingsprøve, ikke full vurdering av samtlige kompetansemål i geografifaget.

## Opprettet Google Sheets-svarark

Det er allerede opprettet et nytt Google Sheets-ark:

https://docs.google.com/spreadsheets/d/1W6z74XULvu4yDwUAaxwEYDu0V79QC3_rN3fjvJFQXg0/edit

Åpne dette arket og legg inn Apps Script-koden som beskrevet over. Ikke opprett et ekstra svarark med samme navn. Siden er **ikke** koblet til svararket før dette og `config.js` er gjort.
