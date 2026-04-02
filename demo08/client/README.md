# Demo 8: React Context API ja `useContext`-hook

Demossa 8 on rakennettu tehtävälista-sovellus Reactilla. Tehtäviä hallitaan koko sovelluksen tasolla Reactin Context API:n avulla, joka tarjoaa tehtäviin liittyvät tiedot ja toiminnot sovelluksen kaikkien komponenttien käytettäväksi ilman erillistä propsien välittämistä jokaisen komponentin läpi. Samalla sovelluksessa palautetaan mieleen asiakas- ja palvelinsovelluksen yhdistämistä `fetch`-funktioilla. Tehtävät tallennetaan palvelimelle json-tiedostoon tietojen pitkäaikaissäilytystä varten.

Oppimistavoitteena on, että tutustumalla lähdekoodiin ja tässä olevaan ohjeistukseen, opiskelija tunnistaa Reactin Context API:in liittyvät komennot ja funktiot ja pystyy soveltamaan demon esimerkkejä oman React-sovelluksen "globaaliin" tilanhallintaan.

Keskeiset tekniikat:

- React-kontekstin luonti `createContext`-funktiolla (konteksti luodaan omaan `TehtavaContext.tsx`-tiedostoon)
- Provider-komponentin toteutus React-kontekstista, joka sisältää sovelluksen tilan ja metodit
- `useContext`-hookin käyttö kontekstin lukemiseen muissa komponenteissa
- React-palvelimen REST API:n kanssa kommunikointi `fetch`-funktiolla

>[!tip]
Kirjoitin ohjeistuksen aluksi Claude Codea hyödyntäen edellisen toteutuksen vastaavan demon pohjalta, jota sitten tarkensin tarvittavilta osin.

---

## 1. Keskeiset käsitteet

Käydään ensimmäiseksi läpi demon keskeiset käsitteet liittyen:

- Reactin Context API:in ja sen ominaisuuksiin

### 1.1 Reactin Context API

**Context API** on Reactin sisäänrakennettu ominaisuus sovelluksen ns. "globaalin" tilan jakamiseen komponenttien välillä. Perinteisesti Reactissa tietoa välitetään propsien kautta yläkomponentilta lapsikomponenteille. Kun sovellus kasvaa ja komponentteja on useita tasoja, propseja joudutaan ketjuttamaan usean komponentin läpi tekniikalla, jota kutsutaan **prop drilling**:iksi. Tiedot pitää välittää propseina jokaisen komponentin läpi vaikka välikomponentit eivät itse tarvitsisikaan kyseistä tietoa. Tämä tekee sovelluksen ylläpidettävyydestä ja lähdekoodin seuraamisesta vaikeampaa.

Context API ratkaisee muun muassa tällaisia ongelmia. Kontekstin avulla sovelluksen tila määritellään yhdessä paikassa (ns. Provider-komponentti), ja mikä tahansa lapsikomponentti voi lukea sen suoraan mistä tahansa.

Context API:n käyttö koostuu kolmesta osasta:

| Osa | Kuvaus |
|-----|--------|
| `createContext()` | Funktio, joka luo kontekstiobjektin. Käytännössä tämä on vain nimi, johon kontekstin sisältämät tiedot tallennetaan, ja johon viittaamalla niihin päästään käsiksi. |
| `Provider` | Kontekstista luotu React-komponentti, joka "kääritään" koko sovelluksen tai rajatun sovelluksen osan ympärille. Provider tarjoaa kontekstin sisältämät tiedot sen sisältämille komponenteille. |
| `useContext()` | Hook, jolla voidaan lukea kontekstin sisältämät tiedot. |

### 1.2 Provider

**Provider** on tavallinen React-komponentti, joka kääritään sovelluksen (tai sen osan) ympärille. Provider sisältää sille määritellyt sovelluksen "globaalit" tilamuuttujat (`useState`), metodit ja "sivuvaikutukset" (`useEffect`). Se välittää nämä lapsikomponenteille `value`-propsin kautta.

**Esimerkki TehtavaProviderin käärimisestä koko sovelluksen ympärille**:
```tsx
<TehtavaProvider>
  <App />       {/* App ja kaikki sen lapsikomponentit voivat lukea kontekstin */}
</TehtavaProvider>
```

Kaikki Provider-komponentin sisällä olevat komponentit voivat käyttää kontekstin tietoja riippumatta siitä, kuinka syvällä tasolla ne ovat. Esimerkiksi yllä olevassa esimerkissä App-komponentti voi sisältää rinnakkain useamman lapsikomponentin, jotka kaikki pääsevät Providerin kontekstitietoihin käsiksi, samoin näiden alla olevat lapsikomponentit. Providerin ulkopuolella olevat komponentit eivät pääse kontekstiin käsiksi.

Tämä tulee ottaa huomioon React-sovelluksen tilanhallintaa suunnittelussa, mille tasolle Provider sijoitetaan ja mitä tietoja yksittäinen Provider tarjoaa. Sovelluksen jokaista tilatietoa, metodia tai efektiä ei tarvitse tarjota samasta Providerista samalla tasolla, vaan eri toimintoihin liittyviä tietoja voidaan myös pilkkoa omiin pienempiin konteksteihinsa, jotka annetaan vain niitä tarvitseville komponenteille. Tässä demossa kuitenkin luodaan vain yksi Context Provider kaikille tehtävälista-sovelluksen tehtäville ja niiden käsittelylle.

### 1.3 `useContext`-hook

`useContext` on Reactin hook, joka lukee kontekstin arvon lähimmästä ylätason Providerista:

```tsx
const { tehtavat } = useContext(TehtavaContext);
```

Kontekstin arvosta poimitaan halutut ominaisuudet **destrukturoinnilla**/purkamisella käyttäen aaltosulkeita. Jokainen komponentti ottaa kontekstista vain ne tiedot ja metodit, joita se tarvitsee. Yllä olevassa koodinpätkässä `TehtavaContext`:sta puretaan vain `tehtavat`-tilamuuttuja käyttöön. Alla on toinen esimerkki kontekstin purkamisesta, jossa otetaan `lisaysDialogi`, `setLisaysDialogi` ja `lisaaTehtava` käyttöön lapsikomponentissa.

```tsx
// Kontekstin tuonti
import { TehtavaContext } from "../context/TehtavaContext";

// Kontekstin purkaminen
const { lisaysDialogi, setLisaysDialogi, lisaaTehtava } =
    useContext(TehtavaContext);

// Kutsutaan kontekstista purettua funktiota...
lisaaTehtava();
```

### 1.4 Tiivistelmä demosovelluksen aiheesta

Demossa rakennetaan tehtävälista-sovellus, jossa React-asiakassovellus kommunikoi Express REST API -palvelimen kanssa. Sovelluksen tila hallitaan kokonaan Context API:n avulla yhdessä kontekstitiedostossa. Jokainen käyttöliittymäkomponentti lukee tarvitsemansa tiedot ja metodit suoraan kontekstista `useContext`-hookilla.

Palvelinsovellus on toteutettu valmiiksi `server/`-kansioon. Se tarjoaa kaksi REST API -reittiä:

| Metodi | Polku | Kuvaus |
|--------|-------|--------|
| GET | `/api/tehtavalista` | Palauttaa kaikki tehtävät JSON-taulukkona |
| POST | `/api/tehtavalista` | Korvaa tehtävälistan pyynnön rungon taulukolla |

Palvelin käynnistyy porttiin `3008` ja asiakassovellus porttiin `3000`.

---

## 2. Demosovelluksen rakentuminen vaihe vaiheelta

Seuraava ohjeistus neuvoo demosovelluksen rakentumisen vaihe vaiheelta. Tarkoituksena on pelkän valmiin koodiesimerkin lisäksi havainnollistaa, missä vaiheessa mikäkin sovelluksen ominaisuus rakennetaan ja liitetään muuhun sovelluksen kulkuun.

### Vaihe 1: Projektin luominen

Jos aloitat kokonaan tyhjästä projektista, asiakassovellus (client) ja palvelin (server) kannattaa luoda omiin alikansioihinsa. Oletetaan, että projektin juureen on jo luotu palvelin kansioon `/server`. Luodaan projektin juureen samalle tasolle uusi Vite + React + TypeScript -projekti `client`-kansioon. Komento ajetaan kansion juuresta komentokehotteessa:

```bash
# Luodaan Vite-kehitysprojekti kansioon client nykyiseen sijaintiin käyttäen pohjana Vite:n React-TypeScript -pohjaa
npm create vite@latest client -- --template react-ts
```

Seuraa komentokehotteen ohjeita oletusasetuksilla. Vite luo valmiin projektirungon, johon sisältyy React, TypeScript ja kehityspalvelin. Kun asennus on valmis, siirrytään projektin kansioon:

```bash
cd client
```

### Vaihe 2: Material UI -riippuvuuksien asentaminen

Ohjeistukset pohjautuvat [Material UI:n dokumentaatioon](https://mui.com/material-ui/getting-started/installation/ "https://mui.com/material-ui/getting-started/installation/"). Asennetaan Material UI ja siihen liittyvät paketit:

```bash
npm install @mui/material @emotion/react @emotion/styled @fontsource/roboto @mui/icons-material
```

| Paketti | Kuvaus |
|---------|--------|
| `@mui/material` | MUI:n ydinkomponentit (Button, Dialog, List jne.) |
| `@emotion/react` | CSS-in-JS-tyylitysmoottori, jota MUI käyttää |
| `@emotion/styled` | Emotion-tyylitysmoottori styled-komponenteille |
| `@fontsource/roboto` | Roboto-fontti, jota MUI:n typografia käyttää |
| `@mui/icons-material` | Material Design -ikonit React-komponentteina |

### Vaihe 3: Konfiguroidaan Vite-kehityspalvelimen portti

Muokataan `vite.config.ts` ja asetetaan kehityspalvelimen portti:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

Portti `3000` on sama, jonka palvelinsovelluksen CORS-asetukset sallivat. Jos porttia muutetaan, palvelimen CORS-asetus on päivitettävä vastaavasti.

### Vaihe 4: Sovelluksen kontekstin luominen (TehtavaContext.tsx)

Luodaan seuraavaksi React-asiakassovelluksemme ydin, eli kontekstitiedosto (`TehtavaContext.tsx`), joka hallitsee sovelluksen tehtävien tilaa (tyypit, tilamuuttujat, funktiot, palvelinkutsut). Tämä on demon tärkein tiedosto, koska koko sovelluksen tila hallitaan täällä.

Luodaan asiakassovellukseen `client` kansio `/src/context/` ja sinne tiedosto `TehtavaContext.tsx`. Älä siis luo uutta `/src`-kansiota, vaan luo sen alle kontekstia varten oma alikansio.

#### 4.1 Kontekstin tarvitsemat importit

Aloitetaan tuomalla kontekstiin kaikki tarvittavat Reactin ominaisuudet:

```tsx
import React, { createContext, useEffect, useRef, useState } from "react";
```

#### 4.2 Tyyppimäärittely

Konteksti (`TehtavaContext.tsx`) nimensämukaisesti hallitsee sovelluksessa käsiteltäviä tehtävä-objekteja. Tehtäväobjekti sisältää tehtävän tunnisteen, nimen ja suorituksen tilan. Tehtävät tallennetaan palvelimelle näillä tiedoilla, josta ne myös haetaan takaisin asiakassovellukseen sessioiden aikana. Määritellään tehtävän rakenne:

```tsx
export interface Tehtava {
  id: string; // Tehtävän yksilöivä tunniste. Tällä kertaa tunnisteeseen käytetään automaattisesti generoitavia UUID-merkkijonoja
  nimi: string;
  suoritettu: boolean;
}
```

`Tehtava` kuvaa yksittäisen tehtävän rakenteen: jokaisella tehtävällä on yksilöllinen tunniste, nimi ja tieto siitä, onko se suoritettu.

#### 4.3 Kontekstin luominen

Konteksti luodaan itse kontekstitiedoston sisällä. Tässä siis kerrotaan Reactille, että luo uusi konteksti tähän tiedostoon, josta se voidaan sitten viedä muualle sovelluksen komponentteihin. Yksinkertaisuuden vuoksi demon konteksti tyypitetään yleisellä tasolla `React.Context`:iksi, ilman tarkennusta (any-tyyppi). Konteksti luodaan `createContext()`-metodilla, jonka arvoksi määritetään aluksi `undefined`.

```tsx
export const TehtavaContext: React.Context<any> = createContext(undefined);
```

`createContext` luo kontekstiobjektin. `undefined` on oletusarvo, jota käytetään silloin, kun komponentti yrittää lukea kontekstia ilman Provideria. Käytännössä tätä ei pitäisi tapahtua, koska Provider kääritään sovelluksen ylimmälle tasolle.

Yllä luotu kontekstiobjekti sisältää kaksi asiaa:
- `TehtavaContext.Provider`: Komponentti, jolla kontekstin arvo tarjotaan eteenpäin. Tämä siis kääritään kontekstia käyttävien lapsikomponenttien/koko sovelluksen ympärille.
- Itse kontekstiobjekti, joka annetaan `useContext`-hookille kontekstin lukemista varten. Kontekstiobjekti sisältää varsinaiset kontekstin tiedot.

Meillä on siis määritettynä yhteen kontekstitiedostoon `TehtavaContext.tsx` kontekstin tarjoaja (Provider, `TehtavaContext.Provider`) ja kontekstin tiedot `useContext`-hook.

#### 4.4 Provider-komponentin määrittely

Määritellään seuraavaksi kontekstin tarjoaja (Provider). Kontekstin tarjoaja kääritään muiden sovelluksen komponenttien ympärille, eli se vastaanottaa propseina muita React-komponentteja (`children: React.ReactNode`).

```tsx
interface Props {
  children: React.ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {...}
```

`TehtavaProvider` on funktiokomponentti, joka vastaanottaa `children`-propsin. `children` viittaa kaikkiin komponentteihin, jotka sijoitetaan `<TehtavaProvider>`-tagin sisälle. `React.ReactNode` on TypeScript-tyyppi, joka kattaa kaikenlaiset React-elementit.

Huomaa, että `TehtavaProvider` ei poikkea ollenkaan Reactin muista funktiokomponenteista. Se on määritelty nuolifunktiona vakion arvoksi `const TehtavaProvider = () => {...}`. Nuolifunktion parametrit (eli tiedot, jotka menevät kaarisulkeiden `()` väliin, sisältävät komponentin propsit). Nuolen jälkeiset aaltosulkeet `{}` määrittävät funktion koodilohkon.

#### 4.5 Kontekstin hallitsemat tilamuuttujat

Kun kontekstin tarjoajan runko on alustettu, sen sisään voidaan alkaa rakentamaan kontekstin käsittelemiä ominaisuuksia ja toimintoja. Määritellään Provider-funktion sisälle aluksi sovelluksen tilamuuttujat. Nämä tulevat siis `TehtavaProvider`-nuolifunktion sisältämään koodilohkoon, aaltosulkeiden `{}` väliin:

```tsx
  const haettu = useRef(false);

  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<any>({
    tehtava: {},
    auki: false,
  });

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);
```

- `const haettu = useRef(false);`: Viittaus siihen, onko palvelimelle tallennettavat tehtävät haettu asiakassovellukseen. Tavallinen boolean-arvo.
- 

| Muuttuja | Tyyppi | Tarkoitus |
|----------|--------|-----------|
| `haettu` | `useRef(false)` | Viittaus siihen, onko palvelimelle tallennettavat tehtävät haettu asiakassovellukseen. Tavallinen boolean-arvo. |
| `lisaysDialogi` | `boolean` | Lisäysdialogin näkyvyyttä hallitseva tilamuuttuja (true = auki). Itse lisäysdialogi luodaan myöhemmin. |
| `poistoDialogi` | `any` | Poistodialogin näkyvyyden tila ja poistettavan tehtävän tiedot. Poistodialogi luodaan myös myöhemmin. |
| `tehtavat` | `Tehtava[]` | Tilamuuttuja palvelimelta haettavien tehtävien tallentamiselle. Tehtävät tallennetaan `Tehtava`-rajapinnan muotoisia objekteja sisältävään taulukkoon (`array`). |

#### 4.6 Tehtävien hallintametodit

Lisätään seuraavaksi heti `TehtavaProvider`-komponentin tilamuuttujien alle tehtävien käsittelyyn liittyvät funktiot. Tehtävälistassa luonnollisesta halutaan olevan mahdollisuus uusien tehtävien lisäämiseen, tehtävien poistamiseen ja yksittäisen tehtävän suorituksen vaihtamiseen.

```tsx
  const lisaaTehtava = (uusiTehtava: Tehtava): void => {
    tallennaTehtavat([...tehtavat, uusiTehtava]);
  };

  const vaihdaSuoritus = (id: string): void => {
    const paivitetyt = tehtavat.map((tehtava) =>
      tehtava.id === id
        ? { ...tehtava, suoritettu: !tehtava.suoritettu }
        : tehtava,
    );

    tallennaTehtavat(paivitetyt);
  };

  const poistaTehtava = (id: string): void => {
    tallennaTehtavat(tehtavat.filter((tehtava) => tehtava.id !== id));
  };
```

| Funktio | Kuvaus |
| --- | --- |
| `lisaaTehtava` | Ottaa vastaan uuden `Tehtava`-muotoisen objektin ja tallentaa sen kontekstin määrittelemään `tehtava`-tilamuuttujaan. Koska `tehtavat` on taulukko, uuden tehtävän lisäämiseksi taulukosta on ensiksi luotava kopio spread-operaattorilla (`...tehtavat`) ja uusi tehtävä lisätään taulukon jatkoksi. |
| `vaihdaSuoritus` | Ottaa vastaan käyttöliittymässä valitun tehtävän `id`-arvon. `tehtavat`-taulukossa olevan tiedon päivittämiseen voidaan käyttää TypeScript-taulukon `map`-metodia. Metodin callback ottaa vastaan argumenttina yksittäisen `tehtava`-objektin joka kierroksella, ja tekee vertailuoperaation kyseisen kierroksen `tehtava`-objektin `id`-arvon ja  `vaihdaSuoritus`-funktioon annetun argumentin `id` välillä. Vertailuoperaatio tehdään ternary operaationa, eli kysymysmerkin `?` jälkeinen osa suoritetaan, kun vertailu on true (eli `tehtava.id` ja `id` vastaavat). Tässä tehdään taas taulukon kopiointi "spreadauksella" ja vaihdetaan aktiivisen tehtävän `suoritettu`-kentän arvo päinvastaiseksi (jos oli suoritettu --> ei suoritettu, ja toisinpäin). Jos vertailu ei tällä kierroksella tuottanut tulosta, niin palautetaan vain kyseinen tehtävä takaisin ja jatketaan seuraavaan kierrokseen. Kun `tehtavat.map()` on käyty läpi, `paivitetut`-vakio sisältää uuden tehtävälistan, jossa valitun tehtävän suoritus on vaihdettu. Lopuksi päivitetyllä tehtävälistalla kutsutaan `tallennaTehtavat()`-funktiota, joka lähettää tiedon eteenpäin palvelimelle. Katsotaan tätä myöhemmin. |
| `poistaTehtava` | Ottaa vastaan `id`-argumentin samoin kuin `vaihdaSuoritus`. Tässä funktiossa tehdään vain yksinkertainen tehtävien tallennus suodatetulla listalla, joka sisältää kaikki muut tehtävät paitsi argumenttina annettua `id`-arvoa vastaavan tehtävän. Koska palvelin päivittää tehtävien tiedot aina kokonaisena listana eikä yksi tehtävä kerrallaan, on poisto helpoin tehdä vain lähettämällä palvelimelle lista, josta on suodatettu pois valittu tehtävä. Silloin käytännössä poistamme tehtävän, koska tallennettu tehtävälista ei sisältänyt valittua tehtävää ja se ylikirjoittaa kaiken aikaisemman tiedon palvelimelta. |

Kaikki kolme metodia kutsuvat lopuksi `tallennaTehtavat`-funktiota, joka lähettää päivitetyn listan palvelimelle.

#### 4.7 Yhteyden muodostaminen palvelimelle HTTP-kutsuilla käyttäen `fetch`-metodia

Nyt kun tehtäviin liittyville tiedoille on määritetty tilamuuttujat ja tehtävälistaa käsittelevät metodit, on hyvä aika määrittää varsinaiset palvelinkutsun funktiot Provider-komponenttiin. Samoin kuin edellisessä vaiheessa, alla olevat funktiot kirjoitetaan suoraan edellisten perään `TehtavaProvider`-komponentin sisälle. Toinen funktioista tallentaa tehtävät lähettämällä koko tehtävälistan `POST`-metodilla JSON-muodossa palvelimen REST API -reittiin. Haun funktio tekee yksinkertaisen `GET`-pyynnön palvelimelle ja saa vastauksena palvelimella olevat tehtävät yhtenä listana, joka tallennetaan kontekstin tarjoajan eli `TehtavaProvider`-komponentin `tehtavat`-tilamuuttujaan.

```tsx
  // Kaikkien tehtävien lähettäminen palvelimelle POST-metodilla
  const tallennaTehtavat = async (tehtavat: Tehtava[]) => {
    await fetch("http://localhost:3008/api/tehtavalista", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tehtavat }),
    });

    setTehtavat([...tehtavat]);
  };

  // Kaikkien tehtävien hakeminen palvelimelta GET-metodilla
  const haeTehtavat = async () => {
    const yhteys = await fetch("http://localhost:3008/api/tehtavalista");
    const data = await yhteys.json();
    setTehtavat(data);
  };
```

Alla oleva taulukko kuvaa yllä olevat funktiot hieman tarkemmin. Koska nyt tehdään verkon yli pyyntöjä palvelinsovellukseen, jossa parhaassa tapauksessa on vielä tietokanta käytössä, niin pyynnön tekemisen ja vastauksen saamisen välillä voi kulua *n* määrä millisekunteja aikaa. Tämän takia pyyntöjä tekevät funktiot on määriteltävä asynkroonisiksi avainsanalla `async` ja pyynnön tekevä kutsu käsketään odottamaan `await` vastausta palvelimelta `fetch`-metodin suorittamaan pyyntöön. Tämä on siis ihan peruskäytäntö kaikessa ohjelmoinnissa, jossa voidaan olettaa funktion kutsun ja sen käsittelyn välillä tapahtuvan viivettä. Kaikki verkon yli tapahtuvat kyselyt ja etenkin tietokantaoperaatiot ovat aina jonkin verran viiveellisiä johtuen muun muassa verkon nopeudesta, palvelinkoneen tehoista, jne. Asynkroonisia funktioita on toki käsitelty jo aiemmissa materiaaleissa, mutta hyvä muistutella kuitenkin, miksi näitä välillä käytetään. Sitten kun tehdään sovelluksen sisäisiä funktioita ja operaatioita, niin asiat tapahtuvat yleensä viiveettä, jolloin asynkroonisuutta ei tarvita, kuten edellisen vaiheen funktioissa.

| Funktio | Kuvaus |
| --- | --- |
| `tallennaTehtavat` | Funktio ottaa vastaan argumenttina kontekstin koko tehtävälistan, koska se lähetetään palvelimelle, joka käsittelee tehtävälistaa kokonaisuudessaan. `fetch`-metodi ottaa vastaan HTTP-pyynnöstä riippuen yhden tai kaksi argumenttia. Ensimmäinen argumentti on pyynnön osoite, tässä tapauksessa palvelimen REST API:n reitti `/api/tehtavalista`. Koska tässä funktiossa tallennetaan tietoa palvelimelle, se on lähetettävä mielellään POST-pyyntönä, jossa tiedot on koodattu osaksi pyynnön asetuksen tietoja `body`-osaan. `fetch`-metodin toisena argumenttina annetaankin HTTP-pyynnön asetukset JSON-muodossa. Asetukset sisältävät muun muassa HTTP-metodin määrityksen `method: "POST"`, otsikkotiedot `headers`, joka on myös JSON-muotoinen objekti `{ "Content-Type": "application/json" }`, ja lopuksi annetaan pyynnön varsinainen tietosisältö `body`-osassa, joka on tässä tapauksessa JSON-merkkijonoksi muunnettu kontekstin `tehtavat`-taulukko `body: JSON.stringify({ tehtavat })`. Huomaa, että `stringify`-metodin argumentti on objektimuodossa (aaltosulkeet, joiden sisälle taulukko sijoitetaan). Lopuksi vielä päivitetään kontekstin tehtävät vastaamaan lähetettyä tehtävälistaa. |
| `haeTehtavat` | Tämä funktio suorittaa yksinkertaisen `GET`-pyynnön palvelimelle, eikä tarvitse argumentteja. Funktiossa muodostetaan vakio `yhteys`, johon sijoitetaan `fetch`-metodilla suoritetun pyynnön vastauksena saamat tehtävät. Palvelin ottaa `GET`-pyynnön vastaan ja palauttaa vastauksena JSON-objektin muotoisen merkkijonon, joka tallennetaan `yhteys`-vakioon. Tämän jälkeen merkkijonon muodossa oleva tehtävälista-data muunnetaan TypeScriptin ymmärtämään muotoon JSON-objektiksi, joka on siis TypeScript-taulukko `array` sisältäen yksittäisiä `tehtava`-muotoisia JSON-objekteja. Lopuksi kontekstin `tehtavat`-tilamuuttujan sisältämä tehtävälista päivitetään vastaamaan pyynnössä palvelimelta saatua tehtävälistaa. |

Palvelimen osoite `http://localhost:3008` on kovakoodattu, koska kyseessä on kehitysympäristö. Tuotantosovelluksessa osoite luettaisiin ympäristömuuttujasta.

#### 4.8 Tehtävien haku asiakassovelluksen käynnistyessä

Lopuksi ennen `TehtavaProvider`-komponentin JSX-palautusosaa, määritetään vielä funktion efektit/sivuvaikutukset, jotka ajetaan joko automaattisesti komponentin aktivoituessa tai mahdollisten seurattavien riippuvuuksien (`useEffect() => {}, [riippuvuudet]);`) päivittyessä. Tässä tapauksessa seurattavia riippuvuuksia ei ole ja `useEffect()` suoritetaan kerran sovelluksen käynnistyessä.

```tsx
  useEffect(() => {
    if (!haettu.current) {
      haeTehtavat();
    }

    return () => {
      haettu.current = true;
    };
  }, []);
```

`useEffect` tarkistaa ensin, mikä on `haettu`-viittauksen tila (`true`/`false`). `useEffect` suorittaa `haeTehtavat`-funktion, kun Provider renderöidään ensimmäisen kerran. Tyhjä riippuvuustaulukko (`[]`) tarkoittaa, että efekti ajetaan vain kerran. `useRef`-viittaus `haettu` estää kaksinkertaisen haun: React StrictMode renderöi komponentit kahdesti kehitystilassa, joten ilman tarkistusta tehtävät haettaisiin turhaan kahteen kertaan. Kun tehtävät on haettu, `useEffect()` palauttaa callback-funktion, jossa `haettu`-tieto asetetaan `true`:ksi.

Tämän osion ainut tehtävä on siis vain hakea tehtävät palvelimelta kun asiakassovellus käynnistyy ensimmäisen kerran.

#### 4.9 Providerin palautus

Provider-komponentin viimeinen osa on varsinainen React-sovelluksen palautus, joka tarjotaan Providerin lapsikomponenteille. Palautus on Reactin JSX-merkkausta, jossa määritellään Provider-komponentin rakenne. Provider toimii muiden komponenttien käärijänä, jolloin sen avaavan ja sulkevan tunnisteen (`TehtavaContext.Provider`) väliin sijoitetaan komponentin propsina annetut lapsikomponentit.

```tsx
  return (
    <TehtavaContext.Provider
      value={{
        tehtavat,
        setTehtavat,
        lisaysDialogi,
        setLisaysDialogi,
        poistoDialogi,
        setPoistoDialogi,
        lisaaTehtava,
        poistaTehtava,
        vaihdaSuoritus,
      }}
    >
      {children}
    </TehtavaContext.Provider>
  );
};
```

`TehtavaContext.Provider` on kontekstin tarjoajakomponentti. `value`-propsi sisältää kaikki tilamuuttujat, setterit ja metodit, jotka lapsikomponentit voivat käyttää `useContext`-hookilla. `{children}` renderöi kaikki Provider-komponentin sisälle sijoitetut komponentit.

>[!warning]
Vain `value`-propsissa listatut ominaisuudet ovat käytettävissä muissa komponenteissa. Jos jokin tieto tai metodi puuttuu listasta, se ei näy kontekstissa.

Nyt demosovelluksen vaikein ja pisin yksittäinen vaihe on oikeastaan suoritettu. Ylläolevat vaihe 4:n alaosiot olivat tämän demon ydinasia Reactin Context API:n käyttöönotosta ja kontekstin tarjoajan muodostamisesta. Seuraavaksi luodaan asiakassovelluksen muut komponentit, luodaan näkymät ja perehdytään vielä kontekstin käyttöön lapsikomponenteissa `useContext`-hookilla.

### Vaihe 5: Sovelluksen käynnistyspiste (main.tsx)

Vielä ennen kontekstin käyttämistä, kontekstin tarjoaja eli `TehtavaProvider`, pitää määrittää käyttöönotetuksi. Koska konteksti halutaan tarjota koko sovelluksen kaikkiin komponentteihin, se on helpoin kääriä React-sovelluksen käynnistyspisteessä eli `main.tsx`-tiedostossa `App`-komponentin ympärille. Muokataan `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { TehtavaProvider } from "./context/TehtavaContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TehtavaProvider>
      <App />
    </TehtavaProvider>
  </StrictMode>,
);
```

`TehtavaProvider` kääritään `App`-komponentin ympärille. Tämä tarkoittaa, että `App` ja kaikki sen sisällä olevat komponentit voivat käyttää tehtävien kontekstia. Roboto-fonttien CSS-importit ovat MUI:n typografiaa varten.

Poistetaan myös Viten luomat oletustyylit `src/App.css` ja `src/index.css`, koska MUI hoitaa tyylityksen.

### Vaihe 6: Otsikkokomponentti (Otsikko.tsx)

Luodaan seuraavaksi sovelluksen otsikkokomponentti omaksi tiedostokseen. Samoin tehdään sovelluksen muille komponenteille. Kaikki komponentit kannattaa sijoittaa yhteen paikkaan asiakassovelluksen lähdekoodien kansiossa `/src`. Luodaan tämä alle uusi kansio `src/components/` ja sinne tiedosto `Otsikko.tsx` alla olevilla koodeilla:

```tsx
import { Typography } from "@mui/material";

const Otsikko = () => {
  return (
    <>
      <Typography variant="h5">Demo 8: Context API (useContext)</Typography>
      <Typography variant="h6" sx={{ marginTop: "10px" }}>
        Tehtävälista
      </Typography>
    </>
  );
};

export default Otsikko;
```

Komponentti näyttää sovelluksen otsikon MUI:n `Typography`-komponentilla. `variant`-propsi määrittää tekstin tyylin (h5 = otsikko, h6 = alaotsikko). `sx`-propsi on MUI:n tapa antaa inline-tyylejä CSS-objektina (tässä annetaan alaotsikolle vähän marginaalia). `<>...</>` on Reactin **fragmentti**, joka käärii muut elementit. React-komponenteissa return voi palauttaa vain yhden juuritason JSX-elementin, jonka takia kaikki komponentin sisältämät muut komponentit/elementit pitää kääriä joko tyhjän fragmentin sisään tai jonkun muun komponentin sisään.

Tässä vaiheessa voidaan viimeistään käynnistää kehityspalvelin ja tarkistaa, että sovellus latautuu selaimessa osoitteessa `http://localhost:3000`. Sovellus ei vielä näytä mitään hyödyllistä, koska `App.tsx` käyttää vielä Viten oletussisältöä.

### Vaihe 7: App-komponentti (App.tsx)

Luodaan seuraavaksi sovelluksen päänäkymä eli `App`-komponentti, joka käärii sisäänsä kaikki muut sovelluksen renderöitävät komponentit. Muokataan `src/App.tsx`:

```tsx
import { useContext } from "react";
import { Button, Container, Stack } from "@mui/material";
import Otsikko from "./components/Otsikko";
import Tehtavalista from "./components/Tehtavalista";
import LisaaTehtava from "./components/LisaaTehtava";
import { TehtavaContext } from "./context/TehtavaContext";

const App = () => {
  const { setLisaysDialogi } = useContext(TehtavaContext);

  return (
    <Container>
      <Stack spacing={2}>
        <Otsikko />

        <Button
          variant="contained"
          onClick={() => setLisaysDialogi(true)}
        >
          Lisää uusi tehtävä
        </Button>

        <Tehtavalista />

        <LisaaTehtava />
      </Stack>
    </Container>
  );
};

export default App;
```

>[!warning]
Komponentti heittää nyt virheitä, koska kutsutaan sellaisia komponentteja (`Tehtavalista`, `LisaaTehtava`), joita ei ole vielä luotu. Tehdään ne seuraavissa vaiheissa.

Tässä otetaan käyttöön myös React Context API:n `useContext`-hook:

```tsx
const { setLisaysDialogi } = useContext(TehtavaContext);
```

`useContext(TehtavaContext)` lukee kontekstin arvon lähimmästä ylätason Providerista (joka on `main.tsx`:ssä). Destrukturoinnilla poimitaan vain `setLisaysDialogi`, koska App-komponentti tarvitsee kontekstista ainoastaan lisäysdialogin avaamisen toiminnon.

MUI-komponentit muodostavat sivun rakenteen:

| Komponentti | Kuvaus |
|-------------|--------|
| `Container` | Keskittää sisällön ja rajaa maksimileveyden |
| `Stack` | Pinoaa lapsikomponentit pystysuunnassa tasaisin välein (`spacing={2}`) |
| `Button` | Painike, `variant="contained"` tekee siitä täytetyn (sininen tausta) |

### Vaihe 8: Tehtävälistan komponentti (Tehtavalista.tsx)

Luodaan seuraavaksi varsinaisen tehtävälistan renderöivä komponentti. Luodaan tiedosto `src/components/Tehtavalista.tsx` alla olevilla koodeilla:

```tsx
import { useContext } from "react";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBox from "@mui/icons-material/CheckBox";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PoistaTehtava from "./PoistaTehtava";
import { TehtavaContext } from "../context/TehtavaContext";
import type { Tehtava } from "../context/TehtavaContext";
```

`TehtavaContext` tuodaan normaalilla `import`-lauseella, koska sitä käytetään `useContext`-hookin parametrina ajonaikaisesti. `Tehtava` tuodaan `import type` -lauseella, koska sitä käytetään vain tyyppimäärittelynä `map`-funktion parametrissa. Lisätään seuraavaksi tiedostoon varsinainen `Tehtavalista`-komponentin rakenne.

```tsx
const Tehtavalista = () => {
  const { tehtavat, setPoistoDialogi, vaihdaSuoritus } =
    useContext(TehtavaContext);

  return (
    <>
      <List>
        {tehtavat.map((tehtava: Tehtava, idx: number) => {
          return (
            <ListItem
              key={idx}
              secondaryAction={
                <IconButton
                  onClick={() =>
                    setPoistoDialogi({ tehtava: tehtava, auki: true })
                  }
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <IconButton
                  onClick={() => {
                    vaihdaSuoritus(tehtava.id);
                  }}
                >
                  {tehtava.suoritettu ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </IconButton>
              </ListItemIcon>
              <ListItemText primary={tehtava.nimi} />
            </ListItem>
          );
        })}
      </List>
      <PoistaTehtava />
    </>
  );
};

export default Tehtavalista;
```

Kontekstista poimitaan kolme ominaisuutta `useContext`-hookilla:

| Ominaisuus | Käyttö |
|------------|--------|
| `tehtavat` | Kontekstin ylläpitämä tehtävälista, joka on taulukko. Tämän komponentin palautuksessa, jossa muodostetaan komponentin rakenne, tehtävälista käydään läpi `map`-metodilla, jonka sisällä jokaisesta tehtävästä luodaan oma listaelementti. Jokainen listaelementti sisältää ikonipainikkeena roskakorin, joka kutsuu kontekstin poistodialogia. |
| `setPoistoDialogi` | Avaa poistodialogin ja välittää poistettavan tehtävän tiedot. |
| `vaihdaSuoritus` | Kääntää tehtävän suoritusmerkinnän (checkbox). |

`tehtavat.map()` iteroi jokaisen tehtävän ja renderöi `ListItem`-komponentin. `key={idx}` on Reactin vaatima yksilöivä avain listaelementille. `secondaryAction` sijoittaa roskakorikuvakkeen (`DeleteIcon`) listaelementin oikeaan reunaan. `ListItemIcon` sisältää checkbox-kuvakkeen: `CheckBox` näytetään, kun tehtävä on suoritettu, ja `CheckBoxOutlineBlank`, kun se on suorittamatta. Ehdollinen renderöinti tapahtuu ternary-operaattorilla (`ehto ? tosi : epätosi`).

`PoistaTehtava`-komponentti sijoitetaan listan jälkeen. Se renderöi MUI:n `Dialog`-komponentin, joka on oletuksena piilossa ja näytetään vasta, kun kontekstin `poistoDialogi.auki` on `true`.

>[!warning]
`PoistaTehtava`-komponenttia ei ole vielä luotu. Se lisätään vaiheessa 10.

### Vaihe 9: Tehtävän lisäysdialogi (LisaaTehtava.tsx)

Luodaan seuraavaksi komponentti tehtävän lisäämisen dialogille omaan tiedostoonsa. Luodaan tiedosto `src/components/LisaaTehtava.tsx` ja lisätään sinne seuraavat koodit:

```tsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useContext, useRef } from "react";
import { TehtavaContext } from "../context/TehtavaContext";
import type { Tehtava } from "../context/TehtavaContext";

const LisaaTehtava = () => {
  const { lisaysDialogi, setLisaysDialogi, lisaaTehtava } =
    useContext(TehtavaContext);

  const nimiRef = useRef<HTMLInputElement>(null);

  const kasitteleLisays = (): void => {
    const uusiTehtava: Tehtava = {
      id: crypto.randomUUID(),
      nimi: nimiRef.current!.value || "(nimetön tehtävä)",
      suoritettu: false,
    };

    lisaaTehtava(uusiTehtava);

    setLisaysDialogi(false);
  };

  return (
    <Dialog
      open={lisaysDialogi}
      onClose={() => setLisaysDialogi(false)}
      fullWidth={true}
      slotProps={{ paper: { sx: { position: "fixed", top: 100 } } }}
    >
      <DialogTitle>Lisää uusi tehtävä</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={nimiRef}
          variant="outlined"
          label="Tehtävän nimi"
          fullWidth={true}
          sx={{ marginTop: "10px" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={kasitteleLisays}>Lisää</Button>
        <Button onClick={() => setLisaysDialogi(false)}>Peruuta</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LisaaTehtava;
```

Kontekstista käytetään kolmea ominaisuutta:

| Ominaisuus | Käyttö |
|------------|--------|
| `lisaysDialogi` | Ohjaa MUI:n `Dialog`-komponentin `open`-propsia (true = dialogi näkyvissä). Sama kuin edellisen vaiheen poistonäkymässä. |
| `setLisaysDialogi` | Sulkee dialogin asettamalla arvon `false`:ksi |
| `lisaaTehtava` | Kontekstin metodi, joka lisää uuden tehtävän ja tallentaa sen palvelimelle. Tämä funktio ohjelmoitiin vaiheessa 4 muiden kontekstin toimintojen kanssa. |

**`useRef` lomakekentän lukemiseen**

`useRef<HTMLInputElement>(null)` luo viittauksen, joka kiinnitetään tekstikenttään `inputRef`-propsilla. `useRef` sopii lomakekenttien lukemiseen, koska se ei aiheuta komponentin uudelleenrenderöintiä arvon muuttuessa (toisin kuin `useState`). Kentän arvo luetaan `nimiRef.current!.value` -ominaisuudesta.

**`crypto.randomUUID()`**

Uudelle tehtävälle luodaan yksilöllinen tunniste selaimen sisäänrakennetulla `crypto.randomUUID()`-metodilla. Kaikki nykyaikaiset selaimet tukevat tätä.

**MUI Dialog -komponenttirakenne**

MUI:n dialogi koostuu neljästä osasta: `Dialog` (kehys), `DialogTitle` (otsikko), `DialogContent` (sisältö) ja `DialogActions` (painikkeet). `slotProps`-propsi asettaa dialogin kiinteästi sivun yläosaan CSS:llä. `fullWidth={true}` levittää dialogin koko säiliön levyiseksi.

### Vaihe 10: Tehtävän poistodialogi (PoistaTehtava.tsx)

Lopuksi luodaa vielä tehtävän poistamiselle varmistusdialogi, joka aukeaa tehtävän roskakori-ikonia painettaessa. Luodaan tämäkin omaan tiedostoon `src/components/PoistaTehtava.tsx`:

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { TehtavaContext } from "../context/TehtavaContext";

const PoistaTehtava = () => {
  const { poistoDialogi, setPoistoDialogi, poistaTehtava } =
    useContext(TehtavaContext);

  const kasittelePoisto = () => {
    poistaTehtava(poistoDialogi.tehtava.id);

    setPoistoDialogi({ ...poistoDialogi, auki: false });
  };

  return (
    <Dialog
      open={poistoDialogi.auki}
      onClose={() => setPoistoDialogi({ ...poistoDialogi, auki: false })}
      fullWidth={true}
      slotProps={{ paper: { sx: { position: "fixed", top: 100 } } }}
    >
      <DialogTitle>Poista tehtävä</DialogTitle>
      <DialogContent>
        <Typography>
          Haluatko varmasti poistaa tehtävän: "{poistoDialogi.tehtava.nimi}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={kasittelePoisto}>Poista</Button>
        <Button
          onClick={() => setPoistoDialogi({ ...poistoDialogi, auki: false })}
        >
          Peruuta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoistaTehtava;
```

Poistodialogi toimii samalla periaatteella kuin lisäysdialogi. Kontekstista poimitaan `poistoDialogi` (dialogin tila ja poistettavan tehtävän tiedot), `setPoistoDialogi` (dialogin sulkeminen) ja `poistaTehtava` (tehtävän poistometodi).

`kasittelePoisto`-funktio kutsuu ensin `poistaTehtava`-metodia tehtävän `id`:llä ja sulkee sitten dialogin. Dialogin sulkemisessa käytetään spread-operaattoria (`...poistoDialogi`), jotta tehtävän tiedot säilyvät objektissa samalla kun `auki`-arvo muutetaan `false`:ksi. Sama spread-tekniikka on käytössä `onClose`-käsittelijässä ja "Peruuta"-painikkeessa.

### Vaihe 11: Sovelluksen käynnistäminen ja testaaminen

Sovellus on nyt valmis testattavaksi! Jos seurasit edellisiä vaiheita tarkkaan, sinulla pitäisi olla nyt käsissäsi toimiva sovellus, joka käyttää Reactin Context API:a tehtävälistan tehtävien käsittelyyn. Tehtävät haetaan erilliseltä palvelimelta, joka tallentaa ne pysyvästi palvelimella sijaitsevaan JSON-tiedostoon.

Sinun on käynnistettävä sekä React-asiakassovelluksen kehityspalvelin, että palvelimen kehityspalvelin omissa komentokehotteissa. Voit avata VS Codessa kaksi terminaalia samanaikaisesti ja suorittaa niille alla olevat komennot. Pidä huoli, että olet avannut yhden terminaalin `server/`-kansiossa ja toisen `client/`-kansiossa (terminaalissa komentoa edeltävä polku).

Käynnistetään ensin palvelin `server/`-kansiossa:

```bash
cd server
npm install # Jos et ole vielä asentanut palvelimen node-paketteja
npm run dev
```

Käynnistetään sitten asiakassovellus `client/`-kansiossa (toisessa terminaalissa):

```bash
cd client
npm run dev
```

Avataan selaimessa osoite `http://localhost:3000`. Sovellus näyttää tehtävälistan. Tehtäviä voi lisätä painamalla "Lisää uusi tehtävä" -painiketta, merkitä suoritetuiksi checkbox-kuvakkeella ja poistaa roskakorikuvakkeella.

### Projektin lopullinen rakenne

```
demo08/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LisaaTehtava.tsx      # Uuden tehtävän lisäysdialogi
│   │   │   ├── Otsikko.tsx           # Sovelluksen otsikkokomponentti
│   │   │   ├── PoistaTehtava.tsx     # Tehtävän poiston vahvistusdialogi
│   │   │   └── Tehtavalista.tsx      # Tehtävien listaus ja toiminnot
│   │   ├── context/
│   │   │   └── TehtavaContext.tsx     # Konteksti, Provider, tila ja metodit
│   │   ├── App.tsx                   # Pääkomponentti
│   │   └── main.tsx                  # Sovelluksen käynnistyspiste
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── server/
    ├── data/
    │   └── tehtavalista.json         # Tehtävien tallennustiedosto
    ├── index.ts                      # Express-palvelin (REST API)
    └── package.json
```

---

## 3. React Context API: muistilista

### Context API:n osat

| Osa | Funktio/Komponentti | Kuvaus |
|-----|---------------------|--------|
| Konteksti | `createContext(oletus)` | Luo kontekstiobjektin annetulla oletusarvolla |
| Provider | `<Konteksti.Provider value={...}>` | Tarjoaa kontekstin arvon lapsikomponenteille |
| Lukeminen | `useContext(Konteksti)` | Lukee kontekstin arvon lähimmästä Providerista |

### Kontekstin käyttö komponenteissa

| Komponentti | Kontekstista poimitut ominaisuudet |
|-------------|-----------------------------------|
| `App.tsx` | `setLisaysDialogi`, joka avaa `LisaaTehtava`-komponentin dialogin. |
| `Tehtavalista.tsx` | `tehtavat`, `setPoistoDialogi`, `vaihdaSuoritus` |
| `LisaaTehtava.tsx` | `lisaysDialogi`, `setLisaysDialogi`, `lisaaTehtava` |
| `PoistaTehtava.tsx` | `poistoDialogi`, `setPoistoDialogi`, `poistaTehtava` |

Jokainen komponentti poimii kontekstista destrukturoinnilla vain tarvitsemansa ominaisuudet. Eli vaikka kontekstiin määriteltiinkin liuta tilamuuttujia ja toimintoja, niin kontekstia käyttävät lapsikomponentit ottavat käyttöön vain tarvitut ominaisuudet.

### MUI-komponentit demossa

| Komponentti | Käyttö |
|-------------|--------|
| `Container` | Sivun sisällön keskitys ja maksimileveys |
| `Stack` | Elementtien pinoaminen pystysuunnassa |
| `Button` | Painikkeet (lisäys, poisto, peruutus) |
| `Typography` | Tekstielementit (otsikot) |
| `Dialog` | Ponnahdusikkuna (lisäys- ja poistodialogit) |
| `TextField` | Tekstikenttä (tehtävän nimi) |
| `List`, `ListItem` | Listaelementit |
| `IconButton` | Kuvakepainike (checkbox, roskakori) |

---

## Demon valmiin sovelluksen käynnistys

**1. Asenna palvelimen riippuvuudet:**

```bash
cd server
npm install
```

**2. Käynnistä palvelin:**

```bash
npm run dev
```

Palvelin käynnistyy osoitteeseen `http://localhost:3008`.

**3. Asenna asiakassovelluksen riippuvuudet (uudessa terminaalissa):**

```bash
cd client
npm install
```

**4. Käynnistä asiakassovellus:**

```bash
npm run dev
```

Asiakassovellus avautuu osoitteeseen `http://localhost:3000`.
