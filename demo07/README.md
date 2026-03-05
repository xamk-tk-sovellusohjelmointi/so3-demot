# Demo 7: Expo SQLite

## Oppimistavoitteet

Tämän demon jälkeen opiskelija osaa:
- selittää, miksi `SQLiteProvider` + `onInit` -malli on suositeltava tapa alustaa tietokanta React Native -sovelluksessa
- asentaa ja konfiguroida `expo-sqlite`-paketin Expo-projektiin
- luoda taulun, lisätä rivejä ja hakea dataa `execAsync`-, `runAsync`- ja `getAllAsync`-metodeilla
- käyttää `useSQLiteContext()`-hookia tietokantaolion hakemiseen komponentissa
- toteuttaa modaali-ikkunan React Native Paperin `Dialog`- ja `Portal`-komponenteilla

## 1. SQLite mobiilisovelluksissa

### Mitä SQLite on?

[SQLite](https://www.sqlite.org/) on kevyt relaatiotietokantajärjestelmä, joka tallentaa koko tietokannan yhteen tiedostoon laitteen muistiin. Se ei tarvitse erillistä palvelinta eikä verkkoyhteyttä, minkä takia se sopii erinomaisesti mobiilisovelluksiin paikallisen datan tallentamiseen. Demo 3:ssa käytettiin SQLiteä palvelinpuolella Prisman kautta — tässä demossa sama tietokantamoottori otetaan käyttöön suoraan mobiililaitteella.

### expo-sqlite

[`expo-sqlite`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) on Expon SDK-komponentti, joka tarjoaa pääsyn laitteen paikalliseen SQLite-tietokantaan. Toisin kuin demo 3:n Prisma-ORM, `expo-sqlite` käyttää suoraa SQL-syntaksia kyselyissä.

**Asennus:**

```bash
npx expo install expo-sqlite
```

### SQLiteProvider ja onInit

Tietokannan avaaminen ja alustaminen (taulujen luominen, alkudatan lisääminen) ovat **asynkronisia** operaatioita — ne vaativat `await`-kutsun. React-komponenttifunktio on kuitenkin synkroninen: `function App()` ei voi olla `async`, eikä sen sisällä voi suoraan kutsua `await`:ia. Tämä luo ongelman: miten varmistetaan, ettei mikään komponentti yritä käyttää tietokantaa ennen kuin se on valmis?

[`SQLiteProvider`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#sqliteprovider) ratkaisee tämän ongelman. Se on React-kontekstikomponentti, joka hoitaa kolme asiaa automaattisesti: avaa tietokannan, kutsuu `onInit`-alustus­funktion ja asettaa tietokantaolion React-kontekstiin kaikkien lapsikomponenttien saataville. Provider ei renderöi lapsikomponentteja ennen kuin `onInit` on suoritettu loppuun. Tämä tarkoittaa, ettei tarvita null-tarkistuksia eikä tietokantaa tarvitse välittää propsina.

```tsx
import { SQLiteProvider } from 'expo-sqlite';

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            {/* lapsikomponentit — renderöidään vasta kun tietokanta on valmis */}
        </SQLiteProvider>
    );
}
```

| Prop | Tarkoitus |
|------|-----------|
| `databaseName` | Tietokantatiedoston nimi. Jos tiedostoa ei ole olemassa, se luodaan automaattisesti. |
| `onInit` | Valinnainen asynkroninen funktio, joka suoritetaan kerran heti tietokannan avaamisen jälkeen. Saa tietokantaolion parametrikseen. |

`SQLiteProvider` noudattaa samaa Provider-mallia kuin demo 5:ssä käyttöön otettu `PaperProvider` — juurikomponentti kääritään kontekstiin, ja lapsikomponentit hakevat kontekstin arvon hookilla.

### useSQLiteContext

[`useSQLiteContext()`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#usesqlitecontext) on React-hook, joka hakee `SQLiteProvider`-kontekstista tietokantaolion. Hookia voidaan käyttää missä tahansa `SQLiteProvider`:n sisällä olevassa komponentissa:

```tsx
import { useSQLiteContext } from 'expo-sqlite';

function Ostoslista() {
    const db = useSQLiteContext();
    // db on nyt käytettävissä tietokantakyselyihin
}
```

Tietokantaolio ei ole React-tilamuuttuja (`useState`), vaan pysyvä viittaus, jonka `SQLiteProvider` hallinnoi.

### Tietokantakyselyt

`expo-sqlite` tarjoaa kolme asynkronista päämetodia tietokantaoperaatioihin:

**`db.execAsync(sql)`** suorittaa yhden tai useamman SQL-lauseen ilman paluuarvoa. Sopii taulujen luomiseen ja alkudatan lisäämiseen:

```tsx
await db.execAsync(`
    CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
    INSERT INTO ostokset (tuote) VALUES ('Maito');
`);
```

**`db.runAsync(sql, parametrit)`** suorittaa yhden SQL-lauseen parametreilla. Parametrit annetaan `?`-paikkamerkin tilalle järjestyksessä, mikä estää SQL-injektiohyökkäykset:

```tsx
await db.runAsync("INSERT INTO ostokset (tuote) VALUES (?)", tuote);
await db.runAsync("DELETE FROM ostokset");
```

**`db.getAllAsync<T>(sql)`** suorittaa `SELECT`-kyselyn ja palauttaa tulokset taulukkona. Tyyppiparametri `<T>` kertoo TypeScriptille, millaisia olioita taulukko sisältää:

```tsx
const rivit = await db.getAllAsync<Ostos>("SELECT * FROM ostokset");
```

Kaikki metodit ovat asynkronisia, joten niiden eteen laitetaan `await`. Funktiot, jotka kutsuvat näitä metodeja, täytyy merkitä `async`-avainsanalla.

### Dialog ja Portal

Tässä demossa otetaan käyttöön kaksi uutta React Native Paper -komponenttia.

[`Dialog`](https://callstack.github.io/react-native-paper/docs/components/Dialog/) on modaali-ikkuna, joka avautuu sovelluksen päälle pyytämään käyttäjältä tietoa tai vahvistusta. Se koostuu useasta alikomponentista:

```tsx
<Dialog visible={onkoAuki} onDismiss={suljeFunktio}>
    <Dialog.Title>Otsikko</Dialog.Title>
    <Dialog.Content>
        <TextInput label="Syöte" mode="outlined" />
    </Dialog.Content>
    <Dialog.Actions>
        <Button onPress={tallenna}>Tallenna</Button>
    </Dialog.Actions>
</Dialog>
```

| Prop / alikomponentti | Tarkoitus |
|------------------------|-----------|
| `visible` | Ohjaa, onko dialogi näkyvissä (`true` / `false`) |
| `onDismiss` | Kutsutaan, kun käyttäjä sulkee dialogin napauttamalla sen ulkopuolelle |
| `Dialog.Title` | Dialogin otsikko |
| `Dialog.Content` | Dialogin varsinainen sisältö (esim. tekstikenttä) |
| `Dialog.Actions` | Toimintopainikkeet dialogin alaosassa |

[`Portal`](https://callstack.github.io/react-native-paper/docs/components/Portal/) renderöi lapsielementtinsä sovelluksen juuren tasolle, normaalin komponenttipuun ulkopuolelle. Tämä on välttämätöntä dialogeille ja muille pop-up-elementeille, jotta ne näkyvät kaiken muun sisällön päällä:

```tsx
<Portal>
    <Dialog>...</Dialog>
</Portal>
```

`Portal` vaatii toimiakseen `PaperProvider`-kontekstin, joka on otettu käyttöön demo 5:ssä.

### Demosovellus

Demossa 7 rakennetaan yksinkertainen **ostoslistasovellus**, joka tallentaa ostokset laitteen paikalliseen SQLite-tietokantaan. Käyttäjä voi lisätä uusia ostoksia Dialog-komponentilla sekä tyhjentää koko listan yhdellä painalluksella. Demoversio alustaa tietokannan siemendatalla jokaisella käynnistyskerralla, jotta sovellus alkaa aina samasta tunnetusta tilasta.

Demo 3:sta poiketen tässä demossa tietokantaa käytetään suoraan SQL-lauseilla ilman ORM-kerrosta (Prisma). Uutena konseptina tulee `SQLiteProvider`-kontekstikomponentti tietokannan asynkroniseen alustamiseen sekä React Native Paperin `Dialog`- ja `Portal`-komponentit modaali-ikkunan toteuttamiseen. Projektin alustaminen ja React Native Paperin perusasetukset seuraavat samaa kaavaa kuin demoissa 4–6 — tarkat ohjeet löytyvät tarvittaessa [demo 4:n](../demo04/README.md) ja [demo 5:n](../demo05/README.md) README-tiedostoista.

---

## 2. Demosovelluksen rakentuminen vaihe vaiheelta

### Vaihe 1: Projektin luominen ja kehityspalvelimen käynnistäminen

Luodaan projektikansio ja alustetaan Expo-projekti SDK 54 -versiolla, kuten aiemmissa demoissa:

```bash
mkdir demo07
cd demo07
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huomio:** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Toistaiseksi käytetään `@sdk-54`-määrettä.

Käynnistetään kehityspalvelin ja tarkistetaan, että oletussovellus avautuu Expo Go:ssa:

```bash
npx expo start
```

Skannataan terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).

### Vaihe 2: Pakettien asentaminen ja app.json-konfiguraatio

Sammutetaan kehityspalvelin `Ctrl + C`:llä ja asennetaan demon tarvitsemat paketit:

```bash
npx expo install expo-sqlite react-native-safe-area-context
npm install react-native-paper
```

`expo-sqlite` on tietokannan SQLite-komponentti ja `react-native-safe-area-context` on React Native Paperin vaatima riippuvuus, kuten demo 5:ssä. Molemmat asennetaan `npx expo install` -komennolla SDK-yhteensopivuuden varmistamiseksi. `react-native-paper` asennetaan tavallisella `npm install` -komennolla, koska se ei ole Expo SDK -paketti.

Lisätään `expo-sqlite`-plugin `app.json`-tiedoston `plugins`-taulukkoon:

```json
{
  "expo": {
    "name": "demo07",
    "slug": "demo07",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-sqlite"
    ]
  }
}
```

`"plugins": ["expo-sqlite"]` rekisteröi `expo-sqlite`-paketin Expon config plugin -järjestelmään. Plugin huolehtii natiivipuolen konfiguraatiosta automaattisesti.

Käynnistetään kehityspalvelin asennusten jälkeen uudelleen:

```bash
npx expo start
```

### Vaihe 3: Tietorakenteet ja tietokannan alustus

Korvataan `App.tsx`:n oletussisältö aloittamalla TypeScript-rajapinnoilla ja tietokannan alustusfunktiolla:

```tsx
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

interface Ostos {
    id: number;
    tuote: string;
}

interface DialogiData {
    auki: boolean;
    teksti: string;
}

async function alustaKanta(db: SQLiteDatabase): Promise<void> {
    await db.execAsync("DROP TABLE IF EXISTS ostokset");
    await db.execAsync(`
        CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
        INSERT INTO ostokset (tuote) VALUES ('Maito');
        INSERT INTO ostokset (tuote) VALUES ('Kahvi');
        INSERT INTO ostokset (tuote) VALUES ('Leipä');
    `);
}
```

`Ostos`-rajapinta kuvaa yhden tietokantarivin rakennetta: `id` on automaattinen kokonaislukuavain ja `tuote` on tuotteen nimi. TypeScript käyttää tätä `getAllAsync<Ostos>`-kutsun yhteydessä, jolloin palautettu taulukko on tyypitetty oikein.

`DialogiData`-rajapinta kuvaa dialogin tilaa: `auki` kertoo, onko dialogi näkyvissä, ja `teksti` sisältää tekstikentän arvon.

`alustaKanta` on asynkroninen funktio, joka annetaan `SQLiteProvider`:n `onInit`-propsille. Funktio saa tietokantaolion parametrikseen — huomaa `type SQLiteDatabase` -importti, joka tuo vain TypeScript-tyypin ilman suoritusaikaista koodia. Funktio ensin poistaa aiemman taulun (`DROP TABLE IF EXISTS`) ja luo sen uudelleen kolmella siemenrivillä. Taulun pudottaminen käynnistyksen yhteydessä varmistaa, että demosovellus alkaa aina samasta tunnetusta tilasta.

> **Huomio:** Tuotantosovelluksessa taulua ei tietenkään pudoteta joka käynnistyksellä. Sen sijaan käytettäisiin `CREATE TABLE IF NOT EXISTS` -lausetta, joka luo taulun vain jos sitä ei vielä ole olemassa, ja data säilyisi sovelluskertojen välillä.

### Vaihe 4: App-komponentti ja SQLiteProvider

Lisätään `App`-komponentti, joka käärii sovelluksen `SQLiteProvider`- ja `PaperProvider`-konteksteihin:

```tsx
import { PaperProvider } from 'react-native-paper';

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            <PaperProvider>
                <Ostoslista />
            </PaperProvider>
        </SQLiteProvider>
    );
}
```

`App` ei itse sisällä mitään logiikkaa tai tilaa. Sen ainoa tehtävä on asettaa kontekstit kuntoon ja renderöidä `Ostoslista`-komponentti. Tämä on tyypillinen React-arkkitehtuurimalli, jossa juurikomponentti huolehtii konteksteista ja varsinainen sovelluslogiikka on erillisessä lapsikomponentissa.

`SQLiteProvider` on ulompi konteksti: se avaa tietokantatiedoston `ostokset.db`, kutsuu `alustaKanta`-funktiota ja asettaa tietokantaolion kontekstiin. `PaperProvider` on sisempi konteksti, kuten demo 5:ssä. Molemmat kontekstit ovat `Ostoslista`-komponentin käytettävissä.

### Vaihe 5: Ostoslista-komponentti ja tietokantakyselyt

Lisätään `Ostoslista`-komponentti, joka hoitaa sovelluksen logiikan:

```tsx
import { useEffect, useState } from 'react';

function Ostoslista() {

    const db = useSQLiteContext();
    const [dialogi, setDialogi] = useState<DialogiData>({ auki: false, teksti: "" });
    const [ostokset, setOstokset] = useState<Ostos[]>([]);

    const haeOstokset = async (): Promise<void> => {
        const rivit = await db.getAllAsync<Ostos>("SELECT * FROM ostokset");
        setOstokset(rivit);
    };

    const lisaaOstos = async (): Promise<void> => {
        await db.runAsync("INSERT INTO ostokset (tuote) VALUES (?)", dialogi.teksti);
        await haeOstokset();
        setDialogi({ ...dialogi, auki: false, teksti: "" });
    };

    const tyhjennaLista = async (): Promise<void> => {
        await db.runAsync("DELETE FROM ostokset");
        await haeOstokset();
    };

    useEffect(() => {
        haeOstokset();
    }, []);

    // return (...) — käyttöliittymä lisätään seuraavassa vaiheessa
}
```

`useSQLiteContext()` hakee tietokantaolion `SQLiteProvider`-kontekstista. Tietokanta ei ole tilamuuttuja, vaan pysyvä viittaus, jota ei tarvitse tallentaa `useState`:en.

`haeOstokset` hakee kaikki tietokannan rivit `getAllAsync`-metodilla ja päivittää `ostokset`-tilamuuttujan. `<Ostos>`-tyyppiparametri varmistaa, että palautetut rivit ovat oikein tyypitettyjä.

`lisaaOstos` lisää uuden tuotteen tietokantaan `runAsync`-metodilla. `?`-paikkamerkki korvautuu `dialogi.teksti`-arvolla. Lisäyksen jälkeen lista haetaan uudelleen ja dialogi suljetaan. `await haeOstokset()` varmistaa, että lista päivittyy ennen kuin dialogi sulkeutuu.

`tyhjennaLista` poistaa kaikki rivit `DELETE FROM ostokset` -lauseella ja hakee listan uudelleen.

`useEffect` kutsuu `haeOstokset()`-funktiota kerran komponentin ensilatauksessa, kuten demo 5:ssä. Tyhjä riippuvuustaulukko `[]` varmistaa, että efekti suoritetaan vain kerran. Tietokanta on jo alustettu `alustaKanta`-funktiossa ennen kuin `Ostoslista` renderöidään, joten haku palauttaa heti alkurivit.

### Vaihe 6: Käyttöliittymä

Lisätään `Ostoslista`-komponentin `return`-lauseen sisältö. Tässä vaiheessa tarvitaan loput importit — alla on koko tiedoston lopulliset importit koottuna yhteen:

```tsx
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { Appbar, Button, Dialog, List, PaperProvider, Portal, Text, TextInput } from 'react-native-paper';
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';
```

Lisätään `return`-lause `Ostoslista`-komponenttiin:

```tsx
    return (
        <>
            <Appbar.Header>
                <Appbar.Content title="Demo 7: SQLite" />
            </Appbar.Header>

            <ScrollView style={{ padding: 20 }}>

                <Text variant="headlineSmall">Ostoslista</Text>

                {ostokset.length > 0
                    ? ostokset.map((ostos) => (
                        <List.Item
                            key={ostos.id}
                            title={ostos.tuote}
                        />
                    ))
                    : <Text>Ei ostoksia</Text>
                }

                <Button
                    style={{ marginTop: 20 }}
                    mode="contained"
                    icon="plus"
                    onPress={() => setDialogi({ ...dialogi, auki: true })}
                >Lisää uusi ostos</Button>

                <Button
                    style={{ marginTop: 20 }}
                    buttonColor="red"
                    mode="contained"
                    icon="delete"
                    onPress={tyhjennaLista}
                >Tyhjennä lista</Button>

            </ScrollView>

            <Portal>
                <Dialog
                    visible={dialogi.auki}
                    onDismiss={() => setDialogi({ ...dialogi, auki: false })}
                >
                    <Dialog.Title>Lisää uusi ostos</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Ostos"
                            mode="outlined"
                            value={dialogi.teksti}
                            placeholder="Kirjoita ostos..."
                            onChangeText={(uusiTeksti) => setDialogi({ ...dialogi, teksti: uusiTeksti })}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={lisaaOstos}>Lisää listaan</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <StatusBar style="auto" />
        </>
    );
```

Käyttöliittymä koostuu kolmesta osasta: yläpalkista, vieritettävästä sisältöalueesta ja modaali-ikkunasta.

`Appbar.Header` ja `Appbar.Content` luovat yläpalkin, kuten aiemmissa demoissa. `ScrollView` mahdollistaa sisällön vierittämisen, jos lista kasvaa ruutua pidemmäksi.

Listan renderöinnissä `ostokset.map()` käy taulukon läpi ja palauttaa jokaiselle riville `List.Item`-komponentin. `key={ostos.id}` käyttää tietokannan pääavainta Reactin listaelementin tunnisteena — tämä on parempi kuin taulukon indeksin käyttäminen, koska `id` on yksilöllinen ja pysyvä myös rivien lisäyksen ja poiston jälkeen. Jos lista on tyhjä, näytetään "Ei ostoksia" -teksti ehdollisella renderöinnillä.

"Lisää uusi ostos" -painike avaa dialogin asettamalla `dialogi.auki` todeksi. "Tyhjennä lista" -painike kutsuu `tyhjennaLista`-funktiota, joka poistaa kaikki rivit tietokannasta.

`Portal`-komponentti sijoitetaan `ScrollView`-komponentin ulkopuolelle. Vaikka `Portal` renderöi sisältönsä sovelluksen juuren tasolle joka tapauksessa, sijoittaminen selkeästi muun sisällön ulkopuolelle tekee rakenteesta helpommin luettavan.

`Dialog`-komponentin `visible`-prop seuraa `dialogi.auki`-tilaa. `TextInput`-komponentissa `value={dialogi.teksti}` tekee kentästä **kontrolloidun** — React-tila ohjaa kentän arvoa, ja kun `dialogi.teksti` nollataan ostoksen lisäämisen tai dialogin sulkemisen yhteydessä, kenttä tyhjenee automaattisesti. `onChangeText` päivittää tilamuuttujan jokaisella näppäinpainalluksella.

Lopullinen ohjelmakoodi vastaa nyt demon `App.tsx`-tiedostoa kokonaisuudessaan.

### Projektin lopullinen rakenne

```
demo07/
├── assets/                  # Ikonit ja splash screen
├── node_modules/            # Asennetut riippuvuudet (ei versionhallintaan)
├── App.tsx                  # Sovelluksen pääkomponentti (ostoslistasovellus)
├── app.json                 # Expon konfiguraatio ja expo-sqlite plugin
├── index.ts                 # Sovelluksen aloituspiste
├── package.json             # Riippuvuudet ja käynnistyskomennot
└── tsconfig.json            # TypeScript-konfiguraatio
```

---

## 3. Expo SQLite: muistilista

### expo-sqlite-metodit

| Metodi | Käyttötarkoitus |
|--------|-----------------|
| `db.execAsync(sql)` | Suorittaa yhden tai useamman SQL-lauseen ilman paluuarvoa (taulujen luonti, alkudata) |
| `db.runAsync(sql, parametrit)` | Suorittaa yhden SQL-lauseen parametreilla (`INSERT`, `UPDATE`, `DELETE`); `?` on paikkamerkki arvolle |
| `db.getAllAsync<T>(sql)` | Suorittaa `SELECT`-kyselyn ja palauttaa rivit tyypitettynä taulukkona |

### SQLiteProvider ja useSQLiteContext

| Ominaisuus | Käyttötarkoitus |
|------------|-----------------|
| `<SQLiteProvider databaseName onInit>` | Avaa tietokannan ja asettaa sen kontekstiin; `onInit` suoritetaan kerran avauksen jälkeen |
| `useSQLiteContext()` | Hakee tietokantaolion kontekstista; käytetään `SQLiteProvider`:n sisällä olevissa komponenteissa |
| `type SQLiteDatabase` | TypeScript-tyyppi `onInit`-funktion parametrille |

### React Native Paper — uudet komponentit

| Komponentti | Dokumentaatio | Käyttötarkoitus |
|-------------|---------------|-----------------|
| `<Portal>` | [Portal](https://callstack.github.io/react-native-paper/docs/components/Portal/) | Renderöi sisältönsä sovelluksen juuren tasolle (vaatii `PaperProvider`:n) |
| `<Dialog>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Modaali-ikkuna; `visible` ohjaa näkyvyyttä, `onDismiss` sulkee |
| `<Dialog.Title>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin otsikko |
| `<Dialog.Content>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin sisältöalue |
| `<Dialog.Actions>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin toimintopainikkeet |

Aiemmin käyttöön otetuista komponenteista (`Appbar`, `Button`, `List.Item`, `Text`, `TextInput`, `PaperProvider`) löytyvät kuvaukset [demo 5:n muistilistasta](../demo05/README.md).

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo uuden Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo install <paketti>` | Asentaa SDK-version kanssa yhteensopivan Expo-paketin |
| `npx expo start` | Käynnistää Expo-kehityspalvelimen |

---

## Sovelluksen käynnistys

Jos projekti kloonataan valmiina tai halutaan käynnistää se uudelleen:

**1. Asennetaan riippuvuudet:**

```bash
npm install
```

`npm install` asentaa `package.json`-tiedostossa listatut riippuvuudet `node_modules/`-kansioon.

**2. Käynnistetään kehityspalvelin:**

```bash
npx expo start
```

Skannataan terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).