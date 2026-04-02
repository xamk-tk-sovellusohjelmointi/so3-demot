# Demo 8: React Context API ja `use`-hook

## Oppimistavoitteet

Tämän demon jälkeen opiskelija osaa:

- luoda React-kontekstin `createContext`-funktiolla ja määritellä sen TypeScript-tyypit
- toteuttaa Provider-komponentin, joka sisältää sovelluksen tilan ja metodit
- käyttää React 19:n `use`-hookia kontekstin lukemiseen komponenteissa
- jakaa sovelluksen komponentit omiin tiedostoihinsa ja yhdistää ne kontekstin kautta
- kommunikoida palvelimen REST API:n kanssa `fetch`-funktiolla
- käyttää Material UI -komponenttikirjaston peruskomponentteja (Button, Dialog, List)

---

## 1. Keskeiset käsitteet

### Context API

**Context API** on Reactin sisäänrakennettu ominaisuus sovelluksen tilan jakamiseen komponenttien välillä. Perinteisesti Reactissa tietoa välitetään propsien kautta yläkomponentilta lapsikomponenteille. Kun sovellus kasvaa ja komponentteja on useita tasoja, propseja joudutaan ketjuttamaan usean komponentin läpi (**prop drilling**), vaikka välikomponentit eivät itse tarvitse kyseistä tietoa.

Context API ratkaisee tämän. Kontekstin avulla tila määritellään yhdessä paikassa (Provider-komponentissa), ja mikä tahansa lapsikomponentti voi lukea sen suoraan.

Context API koostuu kolmesta osasta:

| Osa | Kuvaus |
|-----|--------|
| `createContext()` | Funktio, joka luo kontekstiobjektin |
| `Provider` | Komponentti, joka kääritään sovelluksen ympärille ja tarjoaa kontekstin arvon |
| `use()` | Hook, jolla komponentti lukee kontekstin arvon (React 19) |

### Provider

**Provider** on tavallinen React-komponentti, joka kääritään sovelluksen (tai sen osan) ympärille. Provider sisältää sovelluksen tilamuuttujat (`useState`), metodit ja sivuvaikutukset (`useEffect`). Se välittää nämä lapsikomponenteille `value`-propsin kautta.

```tsx
<TehtavaProvider>
  <App />       {/* App ja kaikki sen lapsikomponentit voivat lukea kontekstin */}
</TehtavaProvider>
```

Kaikki Provider-komponentin sisällä olevat komponentit voivat käyttää kontekstin arvoja. Providerin ulkopuolella olevat komponentit eivät pääse kontekstiin käsiksi.

### React 19:n `use`-hook

React 19 tuo uuden `use`-hookin, joka korvaa aiemman `useContext`-hookin. Toiminta on sama: hook lukee kontekstin arvon lähimmästä ylätason Providerista.

```tsx
// Vanha tapa (React 18 ja aiemmat)
const { tehtavat } = useContext(TehtavaContext);

// Uusi tapa (React 19)
const { tehtavat } = use(TehtavaContext);
```

Kontekstin arvosta poimitaan halutut ominaisuudet **destrukturoinnilla** (aaltosulkeet). Jokainen komponentti ottaa kontekstista vain ne tiedot ja metodit, joita se tarvitsee.

### Material UI (MUI)

**Material UI** on React-komponenttikirjasto, joka tarjoaa valmiita käyttöliittymäkomponentteja Googlen Material Design -suunnittelujärjestelmän mukaisesti. Demossa käytetään MUI:n komponentteja kuten `Button`, `Dialog`, `List`, `Typography`, `Container` ja `Stack`.

MUI asennetaan npm-pakettina yhdessä Emotion-tyylimoottorin, Roboto-fontin ja ikonipaketin kanssa.

### Demosovellus

Demossa rakennetaan tehtävälista-sovellus, jossa React-asiakassovellus kommunikoi Express REST API -palvelimen kanssa. Sovelluksen tila hallitaan kokonaan Context API:n avulla yhdessä kontekstitiedostossa. Jokainen käyttöliittymäkomponentti lukee tarvitsemansa tiedot ja metodit suoraan kontekstista `use`-hookilla.

Palvelinsovellus on toteutettu valmiiksi `server/`-kansioon. Se tarjoaa kaksi REST API -reittiä:

| Metodi | Polku | Kuvaus |
|--------|-------|--------|
| GET | `/api/tehtavalista` | Palauttaa kaikki tehtävät JSON-taulukkona |
| POST | `/api/tehtavalista` | Korvaa tehtävälistan pyynnön rungon taulukolla |

Palvelin käynnistyy porttiin `3008` ja asiakassovellus porttiin `3000`.

---

## 2. Demosovelluksen rakentuminen vaihe vaiheelta

### Vaihe 1: Projektin luominen

Luodaan uusi Vite + React + TypeScript -projekti `client`-kansioon. Komento ajetaan `demo08/`-kansion juuresta:

```bash
npm create vite@latest client -- --template react-ts
```

Siirrytään projektin kansioon:

```bash
cd client
```

Vite luo valmiin projektirungon, johon sisältyy React, TypeScript ja kehityspalvelin.

### Vaihe 2: Riippuvuuksien asentaminen

Asennetaan Material UI ja siihen liittyvät paketit:

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

### Vaihe 3: Vite-konfiguraatio

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

### Vaihe 4: index.html

Muokataan projektin juuressa olevan `index.html`-tiedoston otsikko:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo 8</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Vaihe 5: Kontekstin luominen (TehtavaContext.tsx)

Tässä vaiheessa luodaan sovelluksen ydin: kontekstitiedosto, joka sisältää tyyppimäärittelyt, tilamuuttujat, metodit ja palvelinyhteyden. Tämä on demon tärkein tiedosto, koska koko sovelluksen tila hallitaan täällä.

Luodaan kansio `src/context/` ja sinne tiedosto `TehtavaContext.tsx`.

**Importit**

```tsx
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
```

`import type` -syntaksilla tuodaan tyypit, joita käytetään vain TypeScript-tyyppimäärityksissä. Ne eivät päädy lopulliseen JavaScript-koodiin. Ajonaikaisessa koodissa käytettävät funktiot (`createContext`, `useEffect` jne.) tuodaan normaalilla `import`-lauseella.

**Tyyppimäärittelyt**

Määritellään tehtävän rakenne ja kontekstin tarjoamat ominaisuudet:

```tsx
export interface Tehtava {
  id: string;
  nimi: string;
  suoritettu: boolean;
}

export interface PoistoDialogi {
  tehtava: Tehtava;
  auki: boolean;
}

export interface TehtavaContextType {
  tehtavat: Tehtava[];
  setTehtavat: Dispatch<SetStateAction<Tehtava[]>>;
  lisaysDialogi: boolean;
  setLisaysDialogi: Dispatch<SetStateAction<boolean>>;
  poistoDialogi: PoistoDialogi;
  setPoistoDialogi: Dispatch<SetStateAction<PoistoDialogi>>;
  lisaaTehtava: (uusiTehtava: Tehtava) => void;
  poistaTehtava: (id: string) => void;
  vaihdaSuoritus: (id: string) => void;
}
```

`Tehtava` kuvaa yksittäisen tehtävän rakenteen. `PoistoDialogi` yhdistää poistodialogin tilan (auki/kiinni) ja poistettavan tehtävän tiedot samaan objektiin. `TehtavaContextType` määrittelee kaikki ominaisuudet ja metodit, jotka konteksti tarjoaa muille komponenteille. `Dispatch<SetStateAction<...>>` on `useState`-hookin palauttaman setter-funktion tyyppi.

**Kontekstin luominen**

```tsx
export const TehtavaContext = createContext<TehtavaContextType>(null!);
```

`createContext` luo kontekstiobjektin, jota käytetään sekä Provider-komponentissa (`TehtavaContext.Provider`) että lapsikomponenteissa (`use(TehtavaContext)`). `null!` on oletusarvo: `null` tarkoittaa, että kontekstilla ei ole arvoa ennen kuin Provider tarjoaa sen, ja `!` (non-null assertion) kertoo TypeScriptille, että arvo on aina saatavilla ajonaikaisesti. Tämä on turvallista, koska Provider kääritään sovelluksen ylimmälle tasolle.

**Provider-komponentti**

```tsx
interface Props {
  children: ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {
```

`TehtavaProvider` on funktiokomponentti, joka vastaanottaa `children`-propsin. `children` viittaa kaikkiin komponentteihin, jotka sijoitetaan `<TehtavaProvider>`-tagin sisälle. `ReactNode` on TypeScript-tyyppi, joka kattaa kaikenlaiset React-elementit.

**Tilamuuttujat**

Providerin sisälle määritellään sovelluksen tilamuuttujat:

```tsx
  const haettu = useRef(false);

  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    tehtava: { id: "", nimi: "", suoritettu: false },
    auki: false,
  });

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);
```

| Muuttuja | Tyyppi | Tarkoitus |
|----------|--------|-----------|
| `haettu` | `useRef<boolean>` | Estää tehtävien hakemisen kahdesti (React StrictMode kutsuu `useEffect`-hookia kahdesti kehitystilassa) |
| `lisaysDialogi` | `boolean` | Lisäysdialogin näkyvyys (true = auki) |
| `poistoDialogi` | `PoistoDialogi` | Poistodialogin tila ja poistettavan tehtävän tiedot |
| `tehtavat` | `Tehtava[]` | Kaikki tehtävät taulukossa |

**Tehtävien hallintametodit**

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

`lisaaTehtava` luo uuden taulukon spread-operaattorilla (`...`), jossa vanhat tehtävät säilyvät ja uusi tehtävä lisätään loppuun. `vaihdaSuoritus` käy `map`-metodilla läpi kaikki tehtävät ja kääntää valitun tehtävän `suoritettu`-arvon päinvastaiseksi. Muut tehtävät palautetaan sellaisinaan. `poistaTehtava` suodattaa `filter`-metodilla pois tehtävän, jonka `id` vastaa annettua arvoa.

Kaikki kolme metodia kutsuvat lopuksi `tallennaTehtavat`-funktiota, joka lähettää päivitetyn listan palvelimelle.

**Palvelinyhteys**

```tsx
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

  const haeTehtavat = async () => {
    const yhteys = await fetch("http://localhost:3008/api/tehtavalista");
    const data = await yhteys.json();
    setTehtavat(data);
  };
```

`tallennaTehtavat` lähettää koko tehtävälistan POST-pyynnöllä palvelimelle JSON-muodossa ja päivittää samalla sovelluksen tilamuuttujan. `haeTehtavat` hakee tehtävät GET-pyynnöllä palvelimelta ja asettaa ne tilamuuttujaan.

Palvelimen osoite `http://localhost:3008` on kovakoodattu, koska kyseessä on kehitysympäristö. Tuotantosovelluksessa osoite luettaisiin ympäristömuuttujasta.

**Tehtävien haku käynnistyessä**

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

`useEffect` suorittaa `haeTehtavat`-funktion, kun Provider renderöidään ensimmäisen kerran. Tyhjä riippuvuustaulukko (`[]`) tarkoittaa, että efekti ajetaan vain kerran. `useRef`-viittaus `haettu` estää kaksinkertaisen haun: React StrictMode renderöi komponentit kahdesti kehitystilassa, joten ilman tarkistusta tehtävät haettaisiin turhaan kahteen kertaan.

**Providerin palautusarvo**

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

`TehtavaContext.Provider` on kontekstin tarjoajakomponentti. `value`-propsi sisältää kaikki tilamuuttujat, setterit ja metodit, jotka lapsikomponentit voivat käyttää `use`-hookilla. `{children}` renderöi kaikki Provider-komponentin sisälle sijoitetut komponentit.

> **Huomio:** Vain `value`-propsissa listatut ominaisuudet ovat käytettävissä muissa komponenteissa. Jos jokin tieto tai metodi puuttuu listasta, se ei näy kontekstissa.

### Vaihe 6: Sovelluksen käynnistyspiste (main.tsx)

Muokataan `src/main.tsx`:

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

`TehtavaProvider` kääritään `App`-komponentin ympärille. Tämä tarkoittaa, että `App` ja kaikki sen sisällä olevat komponentit voivat käyttää tehtävien kontekstia. Roboto-fonttien CSS-importit ovat MUI:n typografiaa varten, joka käyttää Roboto-fonttia oletuksena neljässä eri paksuudessa (300, 400, 500, 700).

Poistetaan myös Viten luomat oletustyylit `src/App.css` ja `src/index.css`, koska MUI hoitaa tyylityksen.

### Vaihe 7: Otsikkokomponentti (Otsikko.tsx)

Luodaan kansio `src/components/` ja sinne tiedosto `Otsikko.tsx`:

```tsx
import { Typography } from "@mui/material";

const Otsikko = () => {
  return (
    <>
      <Typography variant="h5">Demo 8: Context API (use)</Typography>
      <Typography variant="h6" sx={{ marginTop: "10px" }}>
        Tehtävälista
      </Typography>
    </>
  );
};

export default Otsikko;
```

Komponentti näyttää sovelluksen otsikon MUI:n `Typography`-komponentilla. `variant`-propsi määrittää tekstin tyylin (h5 = otsikko, h6 = alaotsikko). `sx`-propsi on MUI:n tapa antaa inline-tyylejä CSS-objektina. `<>...</>` on Reactin **fragmentti**, joka ryhmittää elementtejä ilman ylimääräistä DOM-elementtiä.

Tässä vaiheessa voidaan käynnistää kehityspalvelin ja tarkistaa, että sovellus latautuu selaimessa osoitteessa `http://localhost:3000`. Sovellus ei vielä näytä mitään hyödyllistä, koska `App.tsx` käyttää vielä Viten oletussisältöä.

### Vaihe 8: App-komponentti (App.tsx)

Muokataan `src/App.tsx`:

```tsx
import { use } from "react";
import { Button, Container, Stack } from "@mui/material";
import Otsikko from "./components/Otsikko";
import Tehtavalista from "./components/Tehtavalista";
import LisaaTehtava from "./components/LisaaTehtava";
import { TehtavaContext } from "./context/TehtavaContext";

const App = () => {
  const { setLisaysDialogi } = use(TehtavaContext);

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

Tässä otetaan käyttöön React 19:n `use`-hook:

```tsx
const { setLisaysDialogi } = use(TehtavaContext);
```

`use(TehtavaContext)` lukee kontekstin arvon lähimmästä ylätason Providerista (joka on `main.tsx`:ssä). Destrukturoinnilla poimitaan vain `setLisaysDialogi`, koska App-komponentti tarvitsee kontekstista ainoastaan lisäysdialogin avaamisen.

MUI-komponentit muodostavat sivun rakenteen:

| Komponentti | Kuvaus |
|-------------|--------|
| `Container` | Keskittää sisällön ja rajaa maksimileveyden |
| `Stack` | Pinoaa lapsikomponentit pystysuunnassa tasaisin välein (`spacing={2}`) |
| `Button` | Painike, `variant="contained"` tekee siitä täytetyn (sininen tausta) |

> **Huomio:** `Tehtavalista`- ja `LisaaTehtava`-komponentteja ei ole vielä luotu. Kehityspalvelin näyttää virheen, kunnes ne lisätään seuraavissa vaiheissa.

### Vaihe 9: Tehtävälistan komponentti (Tehtavalista.tsx)

Luodaan tiedosto `src/components/Tehtavalista.tsx`:

```tsx
import { use } from "react";
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

`TehtavaContext` tuodaan normaalilla `import`-lauseella, koska sitä käytetään `use`-hookin parametrina ajonaikaisesti. `Tehtava` tuodaan `import type` -lauseella, koska sitä käytetään vain tyyppimäärittelynä `map`-funktion parametrissa.

```tsx
const Tehtavalista = () => {
  const { tehtavat, setPoistoDialogi, vaihdaSuoritus } =
    use(TehtavaContext);

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

Kontekstista poimitaan kolme ominaisuutta:

| Ominaisuus | Käyttö |
|------------|--------|
| `tehtavat` | Tehtävälista, joka iteroidaan `map`-metodilla |
| `setPoistoDialogi` | Avaa poistodialogin ja välittää poistettavan tehtävän tiedot |
| `vaihdaSuoritus` | Kääntää tehtävän suoritusmerkinnän (checkbox) |

`tehtavat.map()` iteroi jokaisen tehtävän ja renderöi `ListItem`-komponentin. `key={idx}` on Reactin vaatima yksilöivä avain listaelementille. `secondaryAction` sijoittaa roskakorikuvakkeen (`DeleteIcon`) listaelementin oikeaan reunaan. `ListItemIcon` sisältää checkbox-kuvakkeen: `CheckBox` näytetään, kun tehtävä on suoritettu, ja `CheckBoxOutlineBlank`, kun se on suorittamatta. Ehdollinen renderöinti tapahtuu ternary-operaattorilla (`ehto ? tosi : epätosi`).

`PoistaTehtava`-komponentti sijoitetaan listan jälkeen. Se renderöi MUI:n `Dialog`-komponentin, joka on oletuksena piilossa ja näytetään vasta, kun `poistoDialogi.auki` on `true`.

> **Huomio:** `PoistaTehtava`-komponenttia ei ole vielä luotu. Se lisätään vaiheessa 11.

### Vaihe 10: Tehtävän lisäysdialogi (LisaaTehtava.tsx)

Luodaan tiedosto `src/components/LisaaTehtava.tsx`:

```tsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { use, useRef } from "react";
import { TehtavaContext } from "../context/TehtavaContext";
import type { Tehtava } from "../context/TehtavaContext";

const LisaaTehtava = () => {
  const { lisaysDialogi, setLisaysDialogi, lisaaTehtava } =
    use(TehtavaContext);

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
| `lisaysDialogi` | Ohjaa MUI:n `Dialog`-komponentin `open`-propsia (true = dialogi näkyvissä) |
| `setLisaysDialogi` | Sulkee dialogin asettamalla arvon `false`:ksi |
| `lisaaTehtava` | Kontekstin metodi, joka lisää uuden tehtävän ja tallentaa sen palvelimelle |

**`useRef` lomakekentän lukemiseen**

`useRef<HTMLInputElement>(null)` luo viittauksen, joka kiinnitetään tekstikenttään `inputRef`-propsilla. `useRef` sopii lomakekenttien lukemiseen, koska se ei aiheuta komponentin uudelleenrenderöintiä arvon muuttuessa (toisin kuin `useState`). Kentän arvo luetaan `nimiRef.current!.value` -ominaisuudesta.

**`crypto.randomUUID()`**

Uudelle tehtävälle luodaan yksilöllinen tunniste selaimen sisäänrakennetulla `crypto.randomUUID()`-metodilla. Kaikki nykyaikaiset selaimet tukevat tätä, joten erillistä `uuid`-kirjastoa ei tarvita.

**MUI Dialog -komponenttirakenne**

MUI:n dialogi koostuu neljästä osasta: `Dialog` (kehys), `DialogTitle` (otsikko), `DialogContent` (sisältö) ja `DialogActions` (painikkeet). `slotProps`-propsi asettaa dialogin kiinteästi sivun yläosaan CSS:llä. `fullWidth={true}` levittää dialogin koko säiliön levyiseksi.

### Vaihe 11: Tehtävän poistodialogi (PoistaTehtava.tsx)

Luodaan tiedosto `src/components/PoistaTehtava.tsx`:

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { use } from "react";
import { TehtavaContext } from "../context/TehtavaContext";

const PoistaTehtava = () => {
  const { poistoDialogi, setPoistoDialogi, poistaTehtava } =
    use(TehtavaContext);

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

### Vaihe 12: Sovelluksen käynnistäminen ja testaaminen

Käynnistetään ensin palvelin `server/`-kansiossa:

```bash
cd server
npm install
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
| Konteksti | `createContext<Tyyppi>(oletus)` | Luo kontekstiobjektin annetulla tyypillä |
| Provider | `<Konteksti.Provider value={...}>` | Tarjoaa kontekstin arvon lapsikomponenteille |
| Lukeminen | `use(Konteksti)` | Lukee kontekstin arvon (React 19) |
| Lukeminen (vanha) | `useContext(Konteksti)` | Lukee kontekstin arvon (React 18 ja aiemmat) |

### React 19:n uudistukset tässä demossa

| Vanha tapa | Uusi tapa (React 19) | Selitys |
|---|---|---|
| `useContext(TehtavaContext)` | `use(TehtavaContext)` | Uusi hook kontekstin lukemiseen |
| `React.FC<Props>` | `({ children }: Props) =>` | Tyypitys suoraan parametreissa |
| `React.Context<any>` | `createContext<TehtavaContextType>(null!)` | Täsmällinen tyypitys `any`:n sijaan |
| `uuid`-kirjasto | `crypto.randomUUID()` | Selaimen sisäänrakennettu metodi |
| `import type` ei käytössä | `import type { Tehtava }` | Tyypit tuodaan erikseen |

### Kontekstin käyttö komponenteissa

| Komponentti | Kontekstista poimitut ominaisuudet |
|-------------|-----------------------------------|
| `App.tsx` | `setLisaysDialogi` |
| `Tehtavalista.tsx` | `tehtavat`, `setPoistoDialogi`, `vaihdaSuoritus` |
| `LisaaTehtava.tsx` | `lisaysDialogi`, `setLisaysDialogi`, `lisaaTehtava` |
| `PoistaTehtava.tsx` | `poistoDialogi`, `setPoistoDialogi`, `poistaTehtava` |

Jokainen komponentti poimii kontekstista destrukturoinnilla vain tarvitsemansa ominaisuudet.

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

## Sovelluksen käynnistys

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
