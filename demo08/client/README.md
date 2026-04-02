# Demo 8: React Context API ja `use`-hook

Tässä demossa rakennetaan tehtävälista-sovellus, jossa harjoitellaan Reactin Context API:n käyttöä. Context API:n avulla sovelluksen tila (state) voidaan jakaa kaikkien komponenttien kesken ilman, että tietoja tarvitsee välittää props-ketjujen kautta (ns. prop drilling).

Sovelluksessa käytetään React 19:n uutta `use`-hookia kontekstin lukemiseen, joka korvaa vanhan `useContext`-hookin.

## Sovelluksen rakenne

```
client/
  src/
    context/
      TehtavaContext.tsx      ← Kontekstin ja Providerin määrittely
    components/
      Otsikko.tsx             ← Otsikkokomponentti
      Tehtavalista.tsx        ← Tehtävien listaus
      LisaaTehtava.tsx        ← Uuden tehtävän lisäysdialogi
      PoistaTehtava.tsx       ← Tehtävän poistodialogi
    App.tsx                   ← Pääkomponentti
    main.tsx                  ← Sovelluksen käynnistyspiste
server/
  index.ts                    ← Express-palvelin (REST API)
  data/
    tehtavalista.json         ← Tehtävien tallennustiedosto
```

## Esivaatimukset

- Node.js asennettuna
- Palvelinsovellus (`server/`-kansio) toiminnassa portissa 3008

## Vaihe 1: Asiakassovelluksen luominen

Luo uusi Vite + React + TypeScript -projekti `client`-kansioon:

```bash
npm create vite@latest client -- --template react-ts
```

Siirry projektin kansioon:

```bash
cd client
```

## Vaihe 2: Riippuvuuksien asentaminen

Asenna Material UI ja siihen liittyvät paketit:

```bash
npm install @mui/material @emotion/react @emotion/styled @fontsource/roboto @mui/icons-material
```

Nämä paketit tarjoavat valmiin komponenttikirjaston (napit, dialogit, listat, ikonit jne.), joilla sovelluksen käyttöliittymä rakennetaan.

## Vaihe 3: Vite-konfiguraatio

Muokkaa `vite.config.ts`-tiedostoa ja aseta palvelimen portti:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

## Vaihe 4: index.html

Muokkaa `index.html`-tiedoston otsikko:

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

## Vaihe 5: Tehtävän konteksti (TehtavaContext.tsx)

Context API on Reactin sisäänrakennettu ominaisuus, jolla sovelluksen tila voidaan jakaa komponenttien kesken ilman propseja. Konteksti luodaan omaan tiedostoonsa ja se koostuu kahdesta osasta:

1. **Konteksti** (`createContext`) - tietovarasto
2. **Provider** - komponentti, joka tarjoaa kontekstin tiedot lapsikomponenteille

Luo kansio `src/context/` ja sinne tiedosto `TehtavaContext.tsx`:

```tsx
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
```

Huomaa `import type` -syntaksi. Tyypit, joita käytetään vain TypeScript-tyyppimäärityksissä (ei ajonaikaisessa koodissa), tuodaan `import type`-avainsanalla. Tämä on nykyaikainen TypeScript-käytäntö.

### 5.1 Tyyppimäärittelyt

Määritellään tehtävän rakenne ja kontekstin tyypit:

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

`TehtavaContextType` määrittelee kaikki ominaisuudet ja metodit, jotka konteksti tarjoaa muille komponenteille. Tämä korvaa vanhan `any`-tyypin ja antaa TypeScriptin tarkistaa, että kontekstin arvoja käytetään oikein.

### 5.2 Kontekstin luominen

```tsx
export const TehtavaContext = createContext<TehtavaContextType>(null!);
```

`null!`-merkintä tarkoittaa, että kontekstin oletusarvo on `null`, mutta TypeScript luottaa siihen, että Provider tarjoaa aina oikean arvon. Tämä on turvallista, koska Provider kääritään sovelluksen ylimmälle tasolle.

### 5.3 Provider-komponentti

Provider on funktiokomponentti, joka sisältää sovelluksen tilan ja välittää sen lapsikomponenteille:

```tsx
interface Props {
  children: ReactNode;
}

export const TehtavaProvider = ({ children }: Props) => {
```

Tässä `children` viittaa kaikkiin komponentteihin, jotka asetetaan `TehtavaProvider`-komponentin sisälle. Nämä lapsikomponentit saavat käyttöönsä kontekstin tiedot.

### 5.4 Tilamuuttujat

Providerin sisälle määritellään kaikki sovelluksen tilaan liittyvät muuttujat:

```tsx
  const haettu = useRef(false);

  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    tehtava: { id: "", nimi: "", suoritettu: false },
    auki: false,
  });

  const [tehtavat, setTehtavat] = useState<Tehtava[]>([]);
```

- `haettu` on `useRef`-viittaus, jolla estetään tehtävien hakeminen kahdesti (React StrictMode kutsuu `useEffect`-hookia kahdesti kehitystilassa)
- `lisaysDialogi` hallitsee lisäysdialogin näkyvyyttä (true/false)
- `poistoDialogi` hallitsee poistodialogin näkyvyyttä ja sisältää tiedon poistettavasta tehtävästä
- `tehtavat` sisältää kaikki tehtävät

### 5.5 Tehtävien hallintametodit

Lisätään metodit tehtävien lisäämiseen, suoritusmerkinnän vaihtamiseen ja poistamiseen:

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

- `lisaaTehtava` lisää uuden tehtävän olemassa olevien tehtävien perään spread-operaattorilla (`...`)
- `vaihdaSuoritus` käyttää `map`-metodia, joka käy läpi kaikki tehtävät ja vaihtaa klikkauksen kohteena olevan tehtävän `suoritettu`-arvon päinvastaiseksi. Muut tehtävät palautetaan sellaisinaan.
- `poistaTehtava` suodattaa tehtävistä pois sen, jonka `id` vastaa annettua arvoa

### 5.6 Palvelimen kanssa kommunikointi

Tehtävät tallennetaan palvelimelle ja haetaan sieltä:

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

- `tallennaTehtavat` lähettää tehtävät POST-pyynnöllä palvelimelle JSON-muodossa ja päivittää samalla sovelluksen tilamuuttujan
- `haeTehtavat` hakee tehtävät palvelimelta GET-pyynnöllä ja asettaa ne tilamuuttujaan

### 5.7 Tehtävien haku sovelluksen käynnistyessä

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

`useEffect` suorittaa `haeTehtavat`-funktion automaattisesti, kun komponentti renderöidään ensimmäisen kerran. `useRef`-viittauksella varmistetaan, että haku tehdään vain kerran.

### 5.8 Providerin palautus

Lopuksi Provider palauttaa kontekstin arvon, joka sisältää kaikki tilamuuttujat, setterit ja metodit:

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

`value`-ominaisuus sisältää kaiken, mitä lapsikomponentit voivat käyttää kontekstista. Jos haluat, että jokin tieto tai metodi on käytettävissä muissa komponenteissa, se pitää lisätä tähän.

## Vaihe 6: Sovelluksen käynnistyspiste (main.tsx)

Muokkaa `src/main.tsx`-tiedosto:

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

Tärkeää: `TehtavaProvider` kääritään `App`-komponentin ympärille, jolloin kaikki `App`-komponentin sisällä olevat komponentit voivat käyttää tehtävien kontekstia. Roboto-fonttien tuonti on MUI:n typografiaa varten.

Poista myös `src/App.css` ja `src/index.css` -tiedostot, koska MUI hoitaa tyylityksen.

## Vaihe 7: Otsikko-komponentti (Otsikko.tsx)

Luo kansio `src/components/` ja sinne tiedosto `Otsikko.tsx`:

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

Yksinkertainen komponentti, joka näyttää sovelluksen otsikon MUI:n `Typography`-komponentilla.

## Vaihe 8: App-komponentti (App.tsx)

Muokkaa `src/App.tsx`:

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

### React 19:n `use`-hook

Tässä otetaan käyttöön React 19:n uusi `use`-hook:

```tsx
const { setLisaysDialogi } = use(TehtavaContext);
```

`use` korvaa vanhan `useContext`-hookin. Se toimii samalla tavalla: lukee kontekstin arvon lähimmästä ylätason Providerista. Kontekstin arvosta poimitaan halutut ominaisuudet destrukturoinnilla (aaltosulkeet).

Tässä tarvitaan vain `setLisaysDialogi`, jotta "Lisää uusi tehtävä" -nappi voi avata lisäysdialogin.

## Vaihe 9: Tehtävälistan komponentti (Tehtavalista.tsx)

Luo tiedosto `src/components/Tehtavalista.tsx`:

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

Huomaa, että `TehtavaContext` tuodaan normaalilla `import`-lauseella (koska sitä käytetään `use`-hookin parametrina ajonaikaisesti), mutta `Tehtava` tuodaan `import type`-lauseella (koska sitä käytetään vain tyyppimäärittelynä).

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

Komponentissa käytetään kontekstista kolmea ominaisuutta:

- `tehtavat` - tehtävien lista, joka mapataan MUI:n `List`-komponenttiin
- `setPoistoDialogi` - avaa poistodialogin, kun roskakorikuvaketta painetaan. Dialogille välitetään tieto poistettavasta tehtävästä.
- `vaihdaSuoritus` - vaihtaa tehtävän suoritusmerkintää (checkbox), kun kuvaketta painetaan

Jokainen tehtävä renderöidään `ListItem`-komponenttina, jossa:
- `secondaryAction` sisältää poistopainikkeen (roskakorikuvake)
- `ListItemIcon` sisältää checkbox-kuvakkeen (täytetty = suoritettu, tyhjä = suorittamatta)
- `ListItemText` näyttää tehtävän nimen

`PoistaTehtava`-komponentti tuodaan listan jälkeen. Se on oletuksena piilossa ja näytetään vasta, kun käyttäjä painaa roskakorikuvaketta.

## Vaihe 10: Tehtävän lisäysdialogi (LisaaTehtava.tsx)

Luo tiedosto `src/components/LisaaTehtava.tsx`:

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

Kontekstista käytetään:

- `lisaysDialogi` - dialogin näkyvyys (true/false), ohjaa MUI:n `Dialog`-komponentin `open`-ominaisuutta
- `setLisaysDialogi` - dialogin sulkeminen asettamalla arvo `false`:ksi
- `lisaaTehtava` - kontekstin metodi uuden tehtävän lisäämiseen

`useRef`-hookilla luodaan viittaus tekstikenttään, josta luetaan käyttäjän kirjoittama tehtävän nimi. `useRef` ei aiheuta uudelleenrenderöintiä, kun arvo muuttuu, joten se sopii hyvin lomakekenttien arvon lukemiseen.

### crypto.randomUUID()

Uudelle tehtävälle luodaan yksilöllinen tunniste (UUID) selaimen sisäänrakennetulla `crypto.randomUUID()`-metodilla:

```tsx
id: crypto.randomUUID(),
```

Tämä korvaa aiemmin käytetyn erillisen `uuid`-kirjaston. Kaikki nykyaikaiset selaimet tukevat tätä suoraan, joten ylimääräistä riippuvuutta ei tarvita.

## Vaihe 11: Tehtävän poistodialogi (PoistaTehtava.tsx)

Luo tiedosto `src/components/PoistaTehtava.tsx`:

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

Poistodialogi toimii samalla periaatteella kuin lisäysdialogi:

- `poistoDialogi.auki` ohjaa dialogin näkyvyyttä
- `poistoDialogi.tehtava` sisältää poistettavan tehtävän tiedot (nimi ja id)
- Kun käyttäjä vahvistaa poiston, kutsutaan `poistaTehtava`-metodia tehtävän id:llä ja suljetaan dialogi

## Vaihe 12: Sovelluksen käynnistäminen

Käynnistä ensin palvelin (`server/`-kansiossa):

```bash
cd server
npm run dev
```

Käynnistä sitten asiakassovellus (`client/`-kansiossa):

```bash
cd client
npm run dev
```

Avaa selaimessa osoite `http://localhost:3000`. Sovellus näyttää tehtävälistan, johon voi lisätä uusia tehtäviä, merkitä niitä suoritetuiksi ja poistaa niitä.

## Yhteenveto: React 19:n uudistukset tässä demossa

| Vanha tapa | Uusi tapa (React 19) | Selitys |
|---|---|---|
| `useContext(TehtavaContext)` | `use(TehtavaContext)` | `use`-hook on React 19:n uusi tapa lukea kontekstia |
| `React.FC<Props>` | `({ children }: Props) =>` | Funktiokomponenttien tyypitys suoraan parametreissa |
| `React.ReactElement` paluutyyppi | Tyyppi päätellään automaattisesti | TypeScript päättelee paluutyypin, ei tarvitse kirjoittaa erikseen |
| `React.Context<any>` | `createContext<TehtavaContextType>(null!)` | Täsmällinen tyypitys `any`:n sijaan |
| `uuid`-kirjasto | `crypto.randomUUID()` | Selaimen sisäänrakennettu metodi, ei erillistä riippuvuutta |
| `import type` ei käytössä | `import type { Tehtava }` | Tyypit tuodaan erikseen `import type`-syntaksilla |
