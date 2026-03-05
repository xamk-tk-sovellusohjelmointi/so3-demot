# Demo 7: Ostoslista ja Expo SQLite

## Oppimistavoitteet

Tämän demon jälkeen opiskelija osaa:
- asentaa ja konfiguroida `expo-sqlite`-paketin Expo-projektiin
- alustaa SQLite-tietokannan `SQLiteProvider`-kontekstikomponentilla ja `onInit`-funktiolla
- suorittaa tietokantakyselyitä `execAsync`-, `runAsync`- ja `getAllAsync`-metodeilla
- hakea tietokantaolion `useSQLiteContext()`-hookilla lapsikomponentissa
- toteuttaa modaali-ikkunan React Native Paperin `Dialog`- ja `Portal`-komponenteilla

## 1. Natiivisovelluksen tietokannan toteuttaminen Expon SQLite-komponentilla

Käydään aluksi läpi lyhyesti demosovelluksen Expo SQLite -komponentin keskeisiä käsitteitä. Luvussa 2 aloitetaan varsinainen sovelluksen toteuttaminen vaihe vaiheelta, joten tässä vaiheessa ei tarvitse vielä täysin hahmottaa SQLite-komponentin jokaisen ominaisuuden toimintaa.

### Mitä SQLite on?

[SQLite](https://www.sqlite.org/) on kevyt relaatiotietokantajärjestelmä, joka tallentaa natiivisovelluksen koko tietokannan yhteen tiedostoon mobiililaitteen muistiin. SQLite-tietokannan toteuttamiseen ei tarvita erillistä Express-palvelinsovellusta eikä verkkoyhteyttä, jonka takia se sopii mobiilisovelluksissa paikallisen datan tallentamiseen. Demo 3:ssa SQLiteä käytettiin palvelinpuolella Prisman kautta. Tässä demossa sama tietokantamoottori otetaan käyttöön suoraan mobiililaitteella.

### expo-sqlite

[`expo-sqlite`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) on Expon SDK-komponentti, jolla voidaan toteuttaa mobiililaitteen paikallinen SQLite-tietokanta. Toisin kuin demo 3:n Prisma ORM, joka käytti erillisiä tietokannan käsittelymetodeja `create()`, `findMany()` jne., `expo-sqlite` käyttää suoraa SQL-syntaksia tietokannan käsittelyyn, esim. `SELECT * FROM ostokset;`. Tässä demossa ei perehdytä tarkemmin SQL-kyselyjen muodostamiseen.

**Asennuskomento:**

```bash
npx expo install expo-sqlite
```

Asennus toteutetaan demon vaiheittaisessa ohjeistuksessa.

### Expon SQLite-tietokanta otetaan käyttöön SQLiteProvider ja onInit -ominaisuuksilla

Tässä demosovelluksessa ohjelman suorituksen ensimmäisiä operaatioita on tietokannan luominen ja alustaminen.

[`SQLiteProvider`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#sqliteprovider) hoitaa tämän. Se on ns. kontekstikomponentti, joka kääritään sovelluksen juureen samaan tapaan kuin demo 5:n `PaperProvider`. `SQLiteProvider` avaa tietokannan, kutsuu `onInit`-alustusfunktion ja jakaa tietokantaolion kaikille lapsikomponenteille. Provider ei renderöi lapsikomponentteja ennen kuin `onInit` on suoritettu loppuun, joten lapsikomponentit voivat luottaa siihen, että tietokanta on valmis käytettäväksi heti.

Provider on siis ominaisuus, joka tarjoaa jotain ohjelman muille osille. Tässä tapauksessa SQLiteProvider muodostaa tietokannan ja tarjoilee sen muualle sovelluksen käyttöön, jonka takia se on koko sovelluksen kontekstissa emokomponentti, jonka alle sovelluksen muu sisältö asetellaan.

```tsx
import { SQLiteProvider } from 'expo-sqlite';

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            {/* lapsikomponentit renderöidään vasta kun tietokanta on valmis */}
        </SQLiteProvider>
    );
}
```

| Prop | Tarkoitus |
|------|-----------|
| `databaseName` | Tietokantatiedoston nimi. Jos tiedostoa ei ole, se luodaan automaattisesti. |
| `onInit` | Asynkroninen funktio, joka suoritetaan kerran tietokannan avaamisen jälkeen. Funktio kutsuu tietokannan alustavaa funktiota, jolla tietokanta luodaan. |

### useSQLiteContext

[`useSQLiteContext()`](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#usesqlitecontext) on hook, jolla lapsikomponentti hakee tietokantaolion `SQLiteProvider`:lta. Toimintaperiaate on sama kuin muissakin Provider + hook -yhdistelmissä: Provider jakaa datan, hook lukee sen.

```tsx
import { useSQLiteContext } from 'expo-sqlite';

function Ostoslista() {
    const db = useSQLiteContext();
    // db on käytettävissä tietokantakyselyihin
}
```

### Tietokantakyselyiden toteuttaminen

`expo-sqlite` tarjoaa kolme asynkronista päämetodia:

**`db.execAsync(sql)`** suorittaa yhden tai useamman SQL-lauseen. Metodi ei palauta mitään dataa, joten se sopii taulujen luomiseen ja alkudatan lisäämiseen:

```tsx
await db.execAsync(`
    CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
    INSERT INTO ostokset (tuote) VALUES ('Maito');
`);
```

**`db.runAsync(sql, parametrit)`** suorittaa yhden SQL-lauseen. Arvot annetaan `?`-paikkamerkin kautta, jolloin `expo-sqlite` käsittelee ne turvallisesti eikä SQL-injektiohyökkäys ole mahdollinen:

```tsx
await db.runAsync("INSERT INTO ostokset (tuote) VALUES (?)", tuote);
await db.runAsync("DELETE FROM ostokset");
```

**`db.getAllAsync<T>(sql)`** suorittaa `SELECT`-kyselyn ja palauttaa kaikki tulosrivit taulukkona. Tyyppiparametri `<T>` kertoo TypeScriptille, minkä muotoisia palautetut oliot ovat:

```tsx
const rivit = await db.getAllAsync<Ostos>("SELECT * FROM ostokset");
```

Kaikki metodit ovat asynkronisia, joten niiden eteen laitetaan `await` ja kutsuva funktio merkitään `async`-avainsanalla.

### Dialog ja Portal

Tässä demossa otetaan käyttöön kaksi uutta React Native Paper -komponenttia.

[`Dialog`](https://callstack.github.io/react-native-paper/docs/components/Dialog/) on modaali-ikkuna, joka avautuu sovelluksen päälle esimerkiksi pyytämään käyttäjältä syötettä. Se koostuu alikomponenteista:

```tsx
<Dialog visible={auki} onDismiss={sulkevaFunktio}>
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
| `visible` | `true` näyttää dialogin, `false` piilottaa |
| `onDismiss` | Kutsutaan kun käyttäjä napauttaa dialogin ulkopuolelle |
| `Dialog.Title` | Dialogin otsikko |
| `Dialog.Content` | Dialogin sisältö (esim. tekstikenttä) |
| `Dialog.Actions` | Toimintopainikkeet alaosassa |

[`Portal`](https://callstack.github.io/react-native-paper/docs/components/Portal/) renderöi lapsielementtinsä sovelluksen juuren tasolle normaalin komponenttipuun ulkopuolelle. Dialogit vaativat tämän näkyäkseen kaiken muun sisällön päällä:

```tsx
<Portal>
    <Dialog>...</Dialog>
</Portal>
```

`Portal` vaatii `PaperProvider`-kontekstin, joka on otettu käyttöön demo 5:ssä.

### Demo 7: Ostoslista

Demossa 7 rakennetaan **ostoslistasovellus**, joka tallentaa käyttäjän syöttämät ostokset laitteen SQLite-tietokantaan. Käyttäjä voi lisätä ostoksia Dialog-komponentilla ja tyhjentää koko listan yhdellä painalluksella. Demo alustaa SQLite-tietokannan valmiilla esimerkkidatalla jokaisella käynnistyskerralla, jotta sovellus alkaa aina samasta tilasta.

Demo 3:sta poiketen tietokantaa käytetään suoraan SQL-lauseilla ilman ORM-kerrosta. Uusina käsitteinä tulevat `SQLiteProvider` tietokannan alustamiseen sekä `Dialog` ja `Portal` modaali-ikkunan toteuttamiseen. Projektin alustaminen ja React Native Paperin asetukset seuraavat samaa kaavaa kuin demoissa 4-6, ja tarkat ohjeet löytyvät tarvittaessa [demo 4:n](../demo04/README.md) ja [demo 5:n](../demo05/README.md) README-tiedostoista.

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

`expo-sqlite` ja `react-native-safe-area-context` asennetaan `npx expo install` -komennolla SDK-yhteensopivuuden varmistamiseksi. `react-native-paper` asennetaan tavallisella `npm install` -komennolla, kuten demo 5:ssä.

Lisätään `expo-sqlite`-plugin `app.json`-tiedoston `plugins`-taulukkoon (jos ei ole luotu automaattisesti):

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

`"plugins": ["expo-sqlite"]` rekisteröi paketin Expon config plugin -järjestelmään. Plugin hoitaa natiivipuolen konfiguraation automaattisesti.

Käynnistetään kehityspalvelin uudelleen:

```bash
npx expo start
```

### Vaihe 3: Käyttöliittymän perusrunko

Korvataan `App.tsx`:n oletussisältö rakentamalla ensin sovelluksen perusrunko. Tässä vaiheessa lisätään `PaperProvider`, `Appbar` ja tyhjä `ScrollView` sisältöä varten:

```tsx
import { ScrollView } from 'react-native';
import { Appbar, PaperProvider, Text } from 'react-native-paper';

export default function App() {
    return (
        <PaperProvider>
            <Appbar.Header>
                <Appbar.Content title="Demo 7: SQLite" />
            </Appbar.Header>
            <ScrollView style={{ padding: 20 }}>
                <Text variant="headlineSmall">Ostoslista</Text>
                {/* sisältö lisätään seuraavissa vaiheissa */}
            </ScrollView>

            <StatusBar style="auto" />
        </PaperProvider>
    );
}
```

Tallennetaan tiedosto ja tarkistetaan, että Expo Go näyttää yläpalkin ja "Ostoslista"-otsikon.

### Vaihe 4: Ostosten ja dialogin tietorakenteet

Lisätään tiedoston alkuun kaksi TypeScript-rajapintaa, jotka kuvaavat sovelluksen käyttämää dataa:

```typescript
// importit...

interface Ostos {
    id: number;
    tuote: string;
}

interface DialogiData {
    auki: boolean;
    teksti: string;
}

export default function App() {...}
```

`Ostos` kuvaa yhden ostosrivin tietokannassa: `id` on rivin yksilöivä numero ja `tuote` on tuotteen nimi (esim. "Maito"). `DialogiData` kuvaa lisäysdialogiin liittyvää tilaa: `auki` kertoo näkyykö dialogi ruudulla, ja `teksti` on se merkkijono, jonka käyttäjä kirjoittaa dialogin tekstikenttään.

### Vaihe 5: Tietokannan alustaminen

Lisätään rajapintojen jälkeen funktio, joka alustaa tietokannan käyttöön sovelluksen käynnistyessä. Päivitetään samalla `expo-sqlite`-importti:

```tsx
// Muut importit
import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

// Interfacet

async function alustaKanta(db: SQLiteDatabase): Promise<void> {
    // Ostokset-taulun nollaaminen (poistetaan kokonaan)
    await db.execAsync("DROP TABLE IF EXISTS ostokset");
    // Uuden vastaavan taulun luominen ja lähtötietojen lisääminen
    await db.execAsync(`
        CREATE TABLE ostokset (id INTEGER PRIMARY KEY AUTOINCREMENT, tuote TEXT);
        INSERT INTO ostokset (tuote) VALUES ('Maito');
        INSERT INTO ostokset (tuote) VALUES ('Kahvi');
        INSERT INTO ostokset (tuote) VALUES ('Leipä');
    `);
}

export default function App() {...}
```

`alustaKanta` saa parametrikseen tietokantaolion `db`, jonka tyyppi on `SQLiteDatabase`. `type`-avainsana importissa tarkoittaa, että kyseinen tuonti on pelkkä TypeScript-tyyppi.

Funktio tekee kaksi asiaa. Ensin `DROP TABLE IF EXISTS ostokset` poistaa `ostokset`-nimisen taulun kokonaan jos sellainen on jo olemassa. Käytännössä tämä tyhjentää kaiken aiemman datan. Sen jälkeen `CREATE TABLE` luo taulun uudelleen tyhjästä ja `INSERT`-lauseet lisäävät sinne kolme esimerkkituotetta. Näin demosovellus käynnistyy aina samasta tilasta.

> **Huomio:** Tuotantosovelluksessa taulua ei poistettaisi joka käynnistyksellä. Sen sijaan käytettäisiin `CREATE TABLE IF NOT EXISTS` -lausetta, joka luo taulun vain jos sitä ei vielä ole. Tällöin data säilyisi sovelluksen käyttökertojen välillä.

### Vaihe 6: App-komponentti ja SQLiteProvider

Muokataan `App`-komponenttia lisäämällä `SQLiteProvider` ulommaksi kääreeksi `PaperProvider`:n ympärille. Tässä vaiheessa korvataan vaiheessa 3 kirjoitettu `App`-funktio siten, että `<Appbar>` säilyy `App`-komponentissa ja `<ScrollView>` viedään uuteen `<Ostoslista>`-komponenttiin (luodaan seuraavaksi):

```tsx
import { PaperProvider } from 'react-native-paper';

export default function App() {
    return (
        <SQLiteProvider databaseName="ostokset.db" onInit={alustaKanta}>
            <PaperProvider>

                <Appbar.Header>
                    <Appbar.Content title="Demo 7: SQLite" />
                </Appbar.Header>

                <Ostoslista />

                <StatusBar style="auto" />

            </PaperProvider>
        </SQLiteProvider>
    );
}
```

`SQLiteProvider` avaa tietokantatiedoston `ostokset.db` ja kutsuu `alustaKanta`-funktiota ennen kuin lapsikomponentit renderöidään. `PaperProvider` tulee seuraavaksi.

`App` ei itse sisällä sovelluksen logiikkaa. Sen tehtävä on ainoastaan asettaa kontekstit, joita lapsikomponentit tarvitsevat. Varsinainen ostoslistalogiikka ja näkymä rakennetaan seuraavaksi `Ostoslista`-komponenttiin.

### Vaihe 7: Ostoslista-komponentin runko ja tilamuuttujat

Lisätään `Ostoslista`-komponentti `App`-funktion alapuolelle ulkopuolelle tästä. Aloitetaan komponentin rungosta, tilamuuttujista ja tietokantayhteyden hakemisesta:

```tsx
// Muut importit
import { useEffect, useState } from 'react';

// Interfacet

// Tietokannan alustus

export default function App() {...}

function Ostoslista() {

    const db = useSQLiteContext();
    const [dialogi, setDialogi] = useState<DialogiData>({ auki: false, teksti: "" });
    const [ostokset, setOstokset] = useState<Ostos[]>([]);

    // tietokantafunktiot lisätään seuraavassa vaiheessa

    return (
        <>
            <ScrollView style={{ padding: 20 }}>
                <Text variant="headlineSmall">Ostoslista</Text>
            </ScrollView>
        </>
    );
}
```

`useSQLiteContext()` hakee tietokantaolion `SQLiteProvider`:lta. Tietokantaolion kautta tehdään kaikki SQL-kyselyt. Se on pysyvä viittaus, jota ei tallenneta esim. tilamuuttujiin.

`dialogi`-tilamuuttuja ohjaa lisäysdialogin näkyvyyttä ja tekstikentän arvoa. `ostokset`-tilamuuttuja sisältää tietokannasta haetut ostosrivit taulukkona.

### Vaihe 8: Tietokantafunktiot

Lisätään `Ostoslista`-komponenttiin kolme funktiota tietokantaoperaatioille sekä `useEffect`-kutsu, joka hakee ostokset kun komponentti renderöidään ensimmäisen kerran:

```tsx
function Ostoslista() {

    // Tilamuuttujat

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

    return (...);

}
```

`haeOstokset` hakee kaikki rivit `ostokset`-taulusta ja tallentaa ne `ostokset`-tilamuuttujaan. `<Ostos>`-tyyppiparametri varmistaa, että palautetut rivit sisältävät `id`- ja `tuote`-kentät.

`lisaaOstos` lisää uuden rivin tietokantaan. `?`-paikkamerkki korvautuu `dialogi.teksti`-arvolla. Lisäyksen jälkeen lista haetaan uudelleen, jotta uusi ostos näkyy ruudulla. `await haeOstokset()` varmistaa, että lista päivittyy ennen kuin dialogi suljetaan ja tekstikenttä tyhjennetään.

`tyhjennaLista` poistaa kaikki rivit taulusta `DELETE FROM ostokset` -lauseella ja hakee sen jälkeen tyhjän listan.

`useEffect` kutsuu `haeOstokset()` kerran komponentin ensilatauksessa. Tietokanta on jo alustettu `alustaKanta`-funktiossa ennen kuin `Ostoslista` renderöidään, joten haku palauttaa heti kolme esimerkkiriviä.

### Vaihe 9: Ostoslistan näkymä ja painikkeet

Päivitetään `Ostoslista`-komponentin `return`-lause näyttämään ostoslista ja kaksi painiketta. Lisätään samalla `Button`- ja `List`-importit:

```tsx
import { Appbar, Button, List, PaperProvider, Text } from 'react-native-paper';
```

```tsx
    return (
        <>
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
        </>
    );
```

`ostokset.map()` käy taulukon läpi ja luo jokaiselle riville `List.Item`-komponentin, joka näyttää tuotteen nimen. `key={ostos.id}` on Reactin vaatima yksilöllinen tunniste listaelementille. Tietokannan pääavain `id` sopii tähän, koska se on aina yksilöllinen ja pysyvä. Jos `ostokset`-taulukko on tyhjä, näytetään sen sijaan "Ei ostoksia" -teksti.

"Lisää uusi ostos" -painike asettaa `dialogi.auki` todeksi, jolloin dialogi aukeaa (lisätään seuraavassa vaiheessa). "Tyhjennä lista" kutsuu `tyhjennaLista`-funktiota.

Tallennetaan ja tarkistetaan, että Expo Go näyttää kolme esimerkkituotetta ja kaksi painiketta. "Tyhjennä lista" -painikkeen pitäisi jo toimia.

### Vaihe 10: Lisäysdialogi

Lisätään `ScrollView`:n jälkeen `Portal`- ja `Dialog`-komponentit, joilla käyttäjä voi lisätä uuden ostoksen. Päivitetään importit:

```tsx
import { Appbar, Button, Dialog, List, PaperProvider, Portal, Text, TextInput } from 'react-native-paper';
```

Lisätään `Portal` `ScrollView`:n sulkevan tagin ja fragmentin sulkevan `</>` -tagin väliin:

```tsx
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
```

`Portal` sijoitetaan `ScrollView`:n ulkopuolelle, jotta koodin rakenne on selkeä. `Portal` renderöi sisältönsä joka tapauksessa sovelluksen juuren tasolle muiden elementtien päällä.

`Dialog`-komponentin `visible`-propsi seuraa `dialogi.auki`-tilaa. Kun käyttäjä painaa "Lisää uusi ostos" -painiketta, `dialogi.auki` muuttuu todeksi ja dialogi ilmestyy ruudulle. `onDismiss` sulkee dialogin, kun käyttäjä napauttaa sen ulkopuolelle.

`TextInput`-komponentissa `value={dialogi.teksti}` tekee kentästä **kontrolloidun**: React-tila ohjaa kentän sisältöä. Kun `lisaaOstos`-funktio nollaa `dialogi.teksti`-arvon tyhjäksi, tekstikenttä tyhjenee automaattisesti seuraavaa lisäystä varten. `onChangeText` päivittää tilaa jokaisella näppäinpainalluksella.

### Vaihe 11: Sovelluksen testaaminen

Nyt sovelluksen pitäisi toimia esimerkkidemon lailla. Sovellus listaa käynnistyessään tietokantaan alustettavat ostokset. Ostoksen lisääminen avaa dialogin, jossa uuden ostoksen tiedot voidaan lisätä tietokantaan. Ostoslistan tyhjentäminen poistaa ostokset tietokannasta ja nollaa listan.

---

## 3. Expo SQLite: muistilista

### expo-sqlite-metodit

| Metodi | Käyttötarkoitus |
|--------|-----------------|
| `db.execAsync(sql)` | Yksi tai useampi SQL-lause ilman paluuarvoa (taulujen luonti, alkudata) |
| `db.runAsync(sql, parametrit)` | Yksi SQL-lause parametreilla (`INSERT`, `UPDATE`, `DELETE`); `?` on paikkamerkki |
| `db.getAllAsync<T>(sql)` | `SELECT`-kysely, palauttaa rivit tyypitettynä taulukkona |

### SQLiteProvider ja useSQLiteContext

| Ominaisuus | Käyttötarkoitus |
|------------|-----------------|
| `<SQLiteProvider databaseName onInit>` | Avaa tietokannan ja asettaa sen kontekstiin; `onInit` suoritetaan kerran avauksen jälkeen |
| `useSQLiteContext()` | Hakee tietokantaolion kontekstista |
| `type SQLiteDatabase` | TypeScript-tyyppi `onInit`-funktion parametrille |

### React Native Paper: uudet komponentit

| Komponentti | Dokumentaatio | Käyttötarkoitus |
|-------------|---------------|-----------------|
| `<Portal>` | [Portal](https://callstack.github.io/react-native-paper/docs/components/Portal/) | Renderöi sisältönsä sovelluksen juuren tasolle (vaatii `PaperProvider`:n) |
| `<Dialog>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Modaali-ikkuna; `visible` ohjaa näkyvyyttä, `onDismiss` sulkee |
| `<Dialog.Title>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin otsikko |
| `<Dialog.Content>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin sisältöalue |
| `<Dialog.Actions>` | [Dialog](https://callstack.github.io/react-native-paper/docs/components/Dialog/) | Dialogin toimintopainikkeet |

Aiemmin käyttöön otetut komponentit (`Appbar`, `Button`, `List.Item`, `Text`, `TextInput`, `PaperProvider`) on kuvattu [demo 5:n muistilistassa](../demo05/README.md).

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo install <paketti>` | Asentaa SDK-yhteensopivan Expo-paketin |
| `npx expo start` | Käynnistää kehityspalvelimen |

---

## Sovelluksen käynnistys

**1. Asennetaan riippuvuudet:**

```bash
npm install
```

**2. Käynnistetään kehityspalvelin:**

```bash
npx expo start
```

Skannataan QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).