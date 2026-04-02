# Demo 08 – Tehtävälista-palvelin

Demo ei keskity palvelinsovelluksen rakentamiseen, vaan React-sovelluksen tilanhallintaan `Context`-ominaisuuden avulla. Alla oleva ohjeistus käy lyhyesti läpi palvelinsovelluksen toiminnan ja REST API -reitit, joita React-sovellus käyttää.

Express 5 REST API, joka tallentaa tehtävälistan paikalliseen JSON-tiedostoon. Yksinkertaistamisen vuoksi erillistä tietokantaa ei käytetä demossa.

## Käynnistys

```bash
npm install
npm run dev   # tsx watch — käynnistyy uudelleen tiedostomuutosten yhteydessä
npm start     # tsx — yksittäinen ajo
```

Palvelin käynnistyy osoitteeseen `http://localhost:3008` (portti voidaan vaihtaa `PORT`-ympäristömuuttujalla).

## API-reitit

### `GET /api/tehtavalista`

Palauttaa koko tehtävälistan JSON-taulukkona.

**Vastaus – onnistui (`200`)**
```json
[
  { "id": "...", "nimi": "Käy kaupassa", "suoritettu": true },
  { "id": "...", "nimi": "Ulkoiluta koiraa", "suoritettu": false }
]
```

**Vastaus – lukuvirhe (`200`)**
```json
{ "virhe": "Tiedoston sisältämä data on korruptoitunut. Tietojen lukeminen ei onnistu." }
```

### `POST /api/tehtavalista`

Korvaa koko tehtävälistan pyynnön rungossa annetulla taulukolla.

**Pyynnön runko**
```json
{
  "tehtavat": [
    { "id": "...", "nimi": "Uusi tehtävä", "suoritettu": false }
  ]
}
```

**Vastaus – onnistui (`200`)**
```json
{}
```

## Data

Tehtävät tallennetaan tiedostoon [data/tehtavalista.json](data/tehtavalista.json). Tiedosto luetaan ja kirjoitetaan jokaisella pyynnöllä — palvelimella ei ole muistitilaa.

## CORS

Pyyntöjä hyväksytään ainoastaan osoitteesta `http://localhost:3000` (Reactin oletuskehityspalvelimen osoite).
