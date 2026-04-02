# Demo 08: Tehtävälista-palvelin

Demo ei keskity palvelinsovelluksen rakentamiseen, vaan React-sovelluksen tilanhallintaan Context API:n avulla. Alla oleva ohjeistus käy lyhyesti läpi palvelinsovelluksen toiminnan ja REST API -reitit, joita React-asiakassovellus käyttää.

Palvelin on Express 5 REST API, joka tallentaa tehtävälistan paikalliseen JSON-tiedostoon. Erillistä tietokantaa ei käytetä, koska demon painopiste on asiakassovelluksen kontekstissa.

## Riippuvuudet

| Paketti | Kuvaus |
|---------|--------|
| `express` | Web-sovelluskehys HTTP-palvelimelle (v5) |
| `cors` | Middleware, joka sallii pyynnöt toisesta osoitteesta (cross-origin) |
| `tsx` | TypeScript-suoritusympäristö kehityskäyttöön |
| `typescript` | TypeScript-kääntäjä |
| `@types/cors`, `@types/express`, `@types/node` | TypeScript-tyyppimäärittelyt |

## Käynnistys

```bash
npm install
npm run dev   # tsx watch — käynnistyy uudelleen tiedostomuutosten yhteydessä
npm start     # tsx — yksittäinen ajo
```

Palvelin käynnistyy osoitteeseen `http://localhost:3008`. Portti voidaan vaihtaa `PORT`-ympäristömuuttujalla.

## CORS

**CORS** (Cross-Origin Resource Sharing) on selainten turvallisuusmekanismi, joka estää oletuksena HTTP-pyyntöjä eri osoitteiden välillä. Koska asiakassovellus toimii osoitteessa `http://localhost:3000` ja palvelin osoitteessa `http://localhost:3008`, selain tulkitsee nämä eri lähteiksi (eri portti = eri origin).

Palvelimen `cors`-middleware sallii pyynnöt ainoastaan asiakassovelluksen osoitteesta:

```typescript
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  }),
);
```

`origin`-asetukseen määritellään sallittu osoite. Muista osoitteista tulevat pyynnöt hylätään. `optionsSuccessStatus: 200` varmistaa yhteensopivuuden vanhempien selainten kanssa.

> **Huomio:** Jos asiakassovelluksen portti vaihdetaan (esim. `vite.config.ts`-tiedostossa), palvelimen CORS-asetus on päivitettävä vastaavasti.

## API-reitit

### `GET /api/tehtavalista`

Palauttaa koko tehtävälistan JSON-taulukkona. Palvelin lukee `data/tehtavalista.json`-tiedoston, parsii sen JSON-muodosta ja lähettää sisällön vastauksena.

**Vastaus (200)**

```json
[
  { "id": "abc-123", "nimi": "Käy kaupassa", "suoritettu": true },
  { "id": "def-456", "nimi": "Ulkoiluta koiraa", "suoritettu": false }
]
```

Jos tiedoston lukeminen tai parsiminen epäonnistuu (esim. tiedosto on tyhjä tai sisältää virheellistä JSON-dataa), palvelin palauttaa virheobjektin:

```json
{ "virhe": "Tiedoston sisältämä data on korruptoitunut. Tietojen lukeminen ei onnistu." }
```

### `POST /api/tehtavalista`

Korvaa koko tehtävälistan pyynnön rungossa annetulla taulukolla. Palvelin kirjoittaa vastaanotetun datan `data/tehtavalista.json`-tiedostoon `fs.writeFile`-funktiolla. Tiedoston aiempi sisältö korvataan kokonaan.

**Pyynnön runko**

```json
{
  "tehtavat": [
    { "id": "abc-123", "nimi": "Käy kaupassa", "suoritettu": true },
    { "id": "ghi-789", "nimi": "Uusi tehtävä", "suoritettu": false }
  ]
}
```

**Vastaus (200)**

```json
{}
```

Asiakassovellus lähettää aina koko tehtävälistan kerralla. Palvelin ei tee yksittäisiä lisäys-, päivitys- tai poisto-operaatioita, vaan tallentaa aina koko listan sellaisenaan.

## Tiedostoon tallentaminen

Tehtävät tallennetaan tiedostoon `data/tehtavalista.json`. Palvelin käyttää Node.js:n `fs/promises`-moduulia tiedoston lukemiseen ja kirjoittamiseen:

```typescript
// Kirjoittaminen (POST-reitissä)
await fs.writeFile(
  path.resolve(import.meta.dirname, "data", "tehtavalista.json"),
  JSON.stringify(req.body.tehtavat, null, 2),
  { encoding: "utf-8" },
);
```

`path.resolve(import.meta.dirname, "data", "tehtavalista.json")` rakentaa absoluuttisen polun tiedostoon. `import.meta.dirname` palauttaa nykyisen tiedoston hakemistopolun (ES-moduulien vastine CommonJS:n `__dirname`-muuttujalle). `JSON.stringify(data, null, 2)` muuntaa JavaScript-objektin JSON-merkkijonoksi kahden välilyönnin sisennyksellä, jolloin tiedosto on luettavissa myös tekstieditorissa.

Palvelimella ei ole muistissa olevaa tilaa. Jokainen pyyntö lukee tiedot tiedostosta tai kirjoittaa ne sinne. Tämä tarkoittaa, että sovellus toimii yksinkertaisesti ilman tietokantaa, mutta tuotantokäytössä tiedostopohjainen tallennus ei sovellu samanaikaisten käyttäjien ympäristöön.

## Data

Tehtävät tallennetaan tiedostoon [data/tehtavalista.json](data/tehtavalista.json). Tiedosto sisältää JSON-taulukon, jonka jokainen alkio noudattaa `Tehtava`-rajapinnan rakennetta:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nimi": "Käy kaupassa",
    "suoritettu": false
  }
]
```

Jos tiedostoa ei ole olemassa tai se on tyhjä, GET-reitti palauttaa virheobjektin. Uusi tehtävälista luodaan automaattisesti ensimmäisellä POST-pyynnöllä.
