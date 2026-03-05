# Demo 7: Expo SQLite

Demossa 7 toteutetaan yksinkertainen ostoslistasovellus Expon **SQLite**-komponentin avulla. Sovellus tallentaa ostokset laitteen paikalliseen SQLite-tietokantaan, jolloin ne säilyvät myös sovelluksen sulkemisen jälkeen. Käyttäjä voi lisätä ostoksia listaan erillisellä React Native Paperin [Dialog-komponentilla](https://callstack.github.io/react-native-paper/docs/components/Dialog/) sekä tyhjentää koko listan yhdellä painalluksella.

---

## 1. Projektin alustaminen

Tämän demon alustaminen seuraa samaa kaavaa kuin edelliset demot. Tarkat ohjeet projektin luomisesta ja kehityspalvelimen käynnistämisestä löytyvät [demo 4:n README.md-tiedostosta](../demo04/README.md).

### Vaihe 1: Projektin luominen

Luo projektikansio ja alusta Expo-projekti SDK 54 -versiolla:

```bash
mkdir demo07
cd demo07
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huom!** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Käytä toistaiseksi `@sdk-54`-määrettä.

### Vaihe 2: Kehityspalvelimen käynnistäminen

```bash
npx expo start
```

Skannaa terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).

---

## 2. expo-sqlite

`expo-sqlite` on Expon SDK-komponentti, joka tarjoaa pääsyn laitteen paikalliseen SQLite-tietokantaan. SQLite on kevyt relaatiotietokantajärjestelmä, joka tallentaa tiedon laitteen muistiin tiedostona. Se sopii erinomaisesti mobiilisovelluksiin, joissa tarvitaan paikallista tietojen tallennusta ilman verkkoyhteyttä.

**Asennus:**

```bash
npx expo install expo-sqlite
```

**Dokumentaatio:** [expo-sqlite – Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/)

---

### SQLiteProvider

[`SQLiteProvider`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#sqliteprovider) on React-kontekstikomponentti, joka avaa tietokantayhteyden ja asettaa sen saataville kaikille sen sisällä oleville komponenteille. Se kääritään sovelluksen juurikomponentin ympärille:

```tsx
import { SQLiteProvider } from 'expo-sqlite';

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            {/* lapsikomponentit */}
        </SQLiteProvider>
    );
}
```

- `databaseName` määrittää tietokantatiedoston nimen. Jos tiedostoa ei ole olemassa, se luodaan automaattisesti.
- `onInit` on valinnainen asynkroninen funktio, joka suoritetaan kerran heti tietokannan avaamisen jälkeen. Se saa tietokantaolion parametrikseen. Tässä funktiossa kannattaa luoda taulut ja lisätä alkudata.

---

### useSQLiteContext

[`useSQLiteContext()`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#usesqlitecontext) on React-hook, joka hakee `SQLiteProvider`-kontekstista tietokantaolion. Hookia voidaan käyttää missä tahansa `SQLiteProvider`:n sisällä olevassa komponentissa:

```tsx
import { useSQLiteContext } from 'expo-sqlite';

function Ostoslista() {
    const db = useSQLiteContext();
    // db on nyt käytettävissä tietokantakyselyihin
}
```

Tämä on suositeltava tapa käyttää tietokantayhteyttä, koska tietokantaolio ei tarvitse olla React-tilamuuttuja (`useState`). `SQLiteProvider` huolehtii yhteyden elinkaaren hallinnasta.

---

### Tietokantakyselyt

`expo-sqlite` tarjoaa kolme asynkronista päämetodia tietokantaoperaatioihin:

**`db.execAsync(sql)`** suorittaa yhden tai useamman SQL-lauseen ilman paluuarvoa. Sopii taulujen luomiseen ja alustamiseen:

```tsx
await db.execAsync(`
    CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
    INSERT INTO ostokset (tuote) VALUES ('Maito');
`);
```

**`db.runAsync(sql, parametrit)`** suorittaa yhden SQL-lauseen parametreilla. Parametrit annetaan `?`-merkin tilalle järjestyksessä, mikä estää SQL-injektiohyökkäykset:

```tsx
await db.runAsync("INSERT INTO ostokset (tuote) VALUES (?)", tuote);
await db.runAsync("DELETE FROM ostokset");
```

**`db.getAllAsync<T>(sql)`** suorittaa `SELECT`-kyselyn ja palauttaa tulokset taulukkona. Tyyppiparametri `<T>` kertoo TypeScriptille, millaisia olioita taulukko sisältää:

```tsx
const rivit = await db.getAllAsync<Ostos>("SELECT * FROM ostokset");
setOstokset(rivit);
```

Kaikki metodit ovat asynkronisia, joten niiden eteen laitetaan `await`. Funktiot, jotka kutsuvat näitä metodeja, täytyy merkitä `async`-avainsanalla.

---

## 3. React Native Paper

Demossa käytetään useita React Native Paper -komponentteja. Asennusohjeet ovat samat kuin [demo 5:n dokumentaatiossa](../demo05/README.md):

```bash
npm install react-native-paper
npx expo install react-native-safe-area-context
```

Tässä demossa käyttöön tulevat uutena `Dialog` ja `Portal`.

### Dialog

[`Dialog`](https://callstack.github.io/react-native-paper/docs/components/Dialog/) on modaali-ikkuna, joka avautuu sovelluksen päälle pyytämään käyttäjältä tietoa tai vahvistusta. Se koostuu useasta alikomponentista:

```tsx
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

<Dialog visible={dialogi.auki} onDismiss={() => setDialogi({ ...dialogi, auki: false })}>
    <Dialog.Title>Lisää uusi ostos</Dialog.Title>
    <Dialog.Content>
        <TextInput label="Ostos" mode="outlined" />
    </Dialog.Content>
    <Dialog.Actions>
        <Button onPress={lisaaOstos}>Lisää listaan</Button>
    </Dialog.Actions>
</Dialog>
```

- `visible` ohjaa, onko dialogi näkyvissä. Se on `true` tai `false`.
- `onDismiss` kutsutaan, kun käyttäjä sulkee dialogin napauttamalla sen ulkopuolelle.
- `Dialog.Title` on dialogin otsikko.
- `Dialog.Content` sisältää dialogin sisällön, tässä tapauksessa tekstikentän.
- `Dialog.Actions` sisältää toimintopainikkeet.

### Portal

[`Portal`](https://callstack.github.io/react-native-paper/docs/components/Portal/) renderöi lapsielementtinsä sovelluksen juuren tasolle, normaalin komponenttipuun ulkopuolelle. Tämä on välttämätöntä dialogeille ja muille pop-up-elementeille, jotta ne näkyvät muiden elementtien päällä riippumatta siitä, missä kohtaa komponenttipuuta `Portal` on kirjoitettu:

```tsx
<Portal>
    <Dialog>...</Dialog>
</Portal>
```

`Portal` vaatii toimiakseen `PaperProvider`-kontekstin, joka asetetaan sovelluksen juuressa.

---

## 4. Sovelluksen ohjelmointi vaiheittain

### Vaihe 1: Pakettien asentaminen

Sammuta kehityspalvelin `Ctrl + C`:llä ja asenna demon tarvitsemat paketit:

```bash
npx expo install expo-sqlite react-native-safe-area-context
npm install react-native-paper
```

Käynnistä kehityspalvelin asennusten jälkeen uudelleen:

```bash
npx expo start
```

### Vaihe 2: Tietorakenteet ja tietokannan alustus

Korvaa `App.tsx`:n oletussisältö aloittamalla TypeScript-rajapinnoilla ja tietokannan alustuksella. Rajapinnat määrittävät tietotyypit, joita sovellus käyttää.

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

`Ostos`-rajapinta kuvaa yhden tietokantarivin rakennetta: `id` on automaattinen numeroavain ja `tuote` on tuotteen nimi. TypeScript käyttää tätä `getAllAsync<Ostos>`-kutsun yhteydessä, jolloin palautettu taulukko on tyypitetty oikein.

`DialogiData`-rajapinta kuvaa dialogin tilaa: `auki` kertoo, onko dialogi näkyvissä, ja `teksti` sisältää tekstikentän arvon.

`alustaKanta` on asynkroninen funktio, joka suoritetaan kerran kun `SQLiteProvider` avaa tietokannan. Se ensin poistaa aiemman taulun (`DROP TABLE IF EXISTS`) ja luo sen uudelleen siemenriveineen. `IF EXISTS` estää virheen, jos taulua ei vielä ole olemassa. Demoympäristössä taulun tyhjentäminen käynnistyksen yhteydessä varmistaa, että sovellus alkaa aina samasta tunnetusta tilasta.

### Vaihe 3: App-komponentti ja SQLiteProvider

Lisää `App`-komponentti, joka käärii sovelluksen `SQLiteProvider`- ja `PaperProvider`-konteksteihin:

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

`App` ei itse sisällä mitään logiikkaa tai tilaa. Sen ainoa tehtävä on asettaa kontekstit kuntoon ja renderöidä `Ostoslista`-komponentti. Tämä on tyypillinen React-arkkitehtuurimalli, jossa juurikomponentti huolehtii konteksteista ja varsinainen logiikka on erillisessä komponentissa.

`SQLiteProvider` avaa tietokantatiedoston `ostokset.db` ja kutsuu `alustaKanta`-funktiota ennen kuin lapsikomponentit renderöidään. Tietokantaolio asetetaan kontekstiin, josta `Ostoslista` hakee sen `useSQLiteContext()`-hookilla.

### Vaihe 4: Ostoslista-komponentti ja tietokantakyselyt

Lisää `Ostoslista`-komponentti, joka hoitaa sovelluksen logiikan ja käyttöliittymän:

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

    // ...
}
```

`useSQLiteContext()` hakee tietokantaolion `SQLiteProvider`-kontekstista. Tietokanta ei ole tilamuuttuja, vaan pysyvä viittaus, jota ei tarvitse tallentaa `useState`:en.

`haeOstokset` hakee kaikki tietokannan rivit `getAllAsync`-metodilla ja päivittää `ostokset`-tilamuuttujan. Funktio on asynkroninen `await`-kutsun vuoksi.

`lisaaOstos` lisää uuden tuotteen tietokantaan `runAsync`-metodilla. `?`-paikkamerkki korvautuu `dialogi.teksti`-arvolla. Lisäyksen jälkeen lista haetaan uudelleen ja dialogi suljetaan. `await haeOstokset()` varmistaa, että lista päivittyy ennen kuin dialogi sulkeutuu.

`tyhjennaLista` poistaa kaikki rivit `DELETE FROM ostokset` -lauseella ja hakee listan uudelleen.

`useEffect` kutsuu `haeOstokset()`:ia kerran komponentin ensilatauksessa. Tyhjä riippuvuustaulukko `[]` varmistaa, että efekti suoritetaan vain kerran. Tietokanta on jo alustettu `alustaKanta`-funktiossa ennen kuin `Ostoslista` renderöidään, joten haku palauttaa heti alkurivin.

### Vaihe 5: Käyttöliittymä

Lisää `return`-lauseen sisältö `Ostoslista`-komponenttiin. Päivitä ensin importit:

```tsx
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { Appbar, Button, Dialog, List, PaperProvider, Portal, Text, TextInput } from 'react-native-paper';
```

Lisää sitten `return`:

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

Listan renderöinnissä `ostokset.map()` käy taulukon läpi ja palauttaa jokaiselle riville `List.Item`-komponentin. `key={ostos.id}` käyttää tietokannan pääavainta Reactin listaelementin tunnisteena. Tämä on parempi kuin taulukon indeksin käyttäminen, koska `id` on yksilöllinen ja pysyvä myös rivien lisäyksen ja poiston jälkeen.

`Portal` sijoitetaan `ScrollView`-komponentin ulkopuolelle. Vaikka `Portal` renderöi sisältönsä sovelluksen juuren tasolle joka tapauksessa, sijoittaminen selkeästi muun sisällön ulkopuolelle tekee rakenteesta helpommin luettavan.

Lopullinen ohjelmakoodi vastaa nyt demon `App.tsx`-tiedostoa kokonaisuudessaan.

---

## 5. Muistilista

### expo-sqlite

| Ominaisuus | Käyttötarkoitus |
|------------|-----------------|
| `<SQLiteProvider databaseName onInit>` | Avaa tietokannan ja asettaa sen kontekstiin; `onInit` suoritetaan kerran avauksen jälkeen |
| `useSQLiteContext()` | Hakee tietokantaolion kontekstista; käytetään `SQLiteProvider`:n sisällä olevissa komponenteissa |
| `db.execAsync(sql)` | Suorittaa yhden tai useamman SQL-lauseen ilman paluuarvoa |
| `db.runAsync(sql, parametrit)` | Suorittaa yhden SQL-lauseen parametreilla; `?` on paikkamerkki arvolle |
| `db.getAllAsync<T>(sql)` | Suorittaa `SELECT`-kyselyn ja palauttaa rivit tyypitettynä taulukkona |

### React Native Paper -komponentit

| Komponentti | Dokumentaatio | Käyttötarkoitus |
|-------------|---------------|-----------------|
| `<PaperProvider>` | [Provider](https://callstack.github.io/react-native-paper/docs/components/Provider/) | Koko sovelluksen juurikomponentti, alustaa teeman ja Portal-kontekstin |
| `<Appbar.Header>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkki, sijoittuu automaattisesti tilapalkin alapuolelle |
| `<Appbar.Content>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkin otsikkoteksti |
| `<List.Item>` | [List](https://callstack.github.io/react-native-paper/docs/components/List.Item/) | Yksittäinen listarivi `title`-tekstillä |
| `<Button>` | [Button](https://callstack.github.io/react-native-paper/docs/components/Button/) | Material Design -painike; `mode="contained"` tekee siitä täytetyn |
| `<Portal>` | [Portal](https://callstack.github.io/react-native-paper/docs/components/Portal/) | Renderöi sisältönsä sovelluksen juuren tasolle |
| `<Dialog>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Modaali-ikkuna käyttäjän syötettä tai vahvistusta varten |
| `<TextInput>` | [TextInput](https://callstack.github.io/react-native-paper/docs/components/TextInput/) | Material Design -tekstikenttä; `mode="outlined"` tekee siitä reunustetun |
| `<Text>` | [Text](https://callstack.github.io/react-native-paper/docs/components/Text/) | Material Design -tyyliä noudattava tekstikomponentti; `variant` ohjaa kokoa |

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo uuden Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo install <paketti>` | Asentaa SDK-version kanssa yhteensopivan Expo-paketin |
| `npm install <paketti>` | Asentaa npm-paketin (käytetään React Native Paper -asennuksessa) |
| `npx expo start` | Käynnistää Expo-kehityspalvelimen |
| `Ctrl + C` | Sammuttaa kehityspalvelimen |

---

## Sovelluksen käynnistys

Jos kloonasit projektin valmiina tai haluat käynnistää sen uudelleen:

```bash
npm install
npx expo start
```

`npm install` asentaa `package.json`-tiedostossa listatut riippuvuudet `node_modules/`-kansioon. Tämä on tarpeen aina, kun kloonat projektin tai `node_modules/`-kansio puuttuu, koska sitä ei lisätä versionhallintaan.

`npx expo start` käynnistää kehityspalvelimen. Skannaa terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).
