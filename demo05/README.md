# Demo 5: Laitekomponentit

## Oppimistavoitteet

Tämän demon jälkeen opiskelija:
- tietää, mitä Expon laitekomponentit ovat ja miten ne asennetaan
- osaa hakea laitteen perustiedot `expo-device`-komponentilla
- osaa hakea akun tilan asynkronisesti `expo-battery`-komponentilla ja seurata sen muutoksia tapahtumakuuntelijalla
- osaa ottaa käyttöön React Native Paper -komponenttikirjaston ja ymmärtää `PaperProvider`-komponentin roolin
- osaa käyttää `useEffect`-hookia asynkronisen datan hakemiseen ja tapahtumakuuntelijoiden hallintaan

---

## 1. Expo-laitekomponentit ja React Native Paper

### Expo-laitekomponentit

Expo tarjoaa laajan valikoiman valmiita SDK-komponentteja, joiden avulla päästään käsiksi mobiililaitteen ominaisuuksiin ilman natiivikoodia. Komponentit asennetaan `npx expo install` -komennolla, joka valitsee automaattisesti projektin Expo SDK -version kanssa yhteensopivan pakettiversion tavallisen `npm install` -komennon sijaan.

Tässä demossa käytetään kahta laitekomponenttia: `expo-device` ja `expo-battery`.

### expo-device

`expo-device` tarjoaa pääsyn laitteen staattisiin perustietoihin, kuten laitteen merkkiin, malliin ja käyttöjärjestelmän tietoihin. Tiedot ovat valmiiksi ladattuja ominaisuuksia, joita ei tarvitse hakea erikseen, vaan niihin viitataan suoraan `Device`-nimiavaruuden kautta.

Komponentti tuodaan `import * as` -syntaksilla, jolloin kaikki sen tarjoamat ominaisuudet ovat käytettävissä `Device`-etuliitteen kautta:

```tsx
import * as Device from 'expo-device';
```

Laitteen tiedot luetaan suoraan `Device`-objektin ominaisuuksista:

```tsx
Device.brand        // laitteen merkki, esim. "Samsung" tai "Apple"
Device.modelName    // laitteen malli, esim. "Galaxy S23" tai "iPhone 15"
Device.osName       // käyttöjärjestelmä, esim. "Android" tai "iOS"
Device.osVersion    // käyttöjärjestelmän versio, esim. "14"
```

Kaikki `expo-device`-komponentin tarjoamat ominaisuudet löytyvät komponentin [SDK 54 -dokumentaatiosta](https://docs.expo.dev/versions/v54.0.0/sdk/device/).

### expo-battery

`expo-battery` tarjoaa pääsyn laitteen akun tilaan. Toisin kuin laitteen perustiedot, akun tila ei ole staattinen ominaisuus, vaan se haetaan asynkronisella funktiokutsulla. Akun latauksen tilan muutoksia voidaan lisäksi seurata reaaliajassa tapahtumakuuntelijalla.

Komponentti tuodaan samaan tapaan kuin `expo-device`:

```tsx
import * as Battery from 'expo-battery';
```

**Akun varauksen hakeminen**

`getBatteryLevelAsync()` on asynkroninen metodi, joka palauttaa akun varauksen lukuna välillä 0–1. `getBatteryStateAsync()` puolestaan palauttaa akun latauksen nykyisen tilan `BatteryState`-luetteloarvona. Molempia kutsutaan `await`-avainsanan kanssa:

```tsx
const taso = await Battery.getBatteryLevelAsync();
// palauttaa esim. 0.85, joka vastaa 85 % varausta

const tila = await Battery.getBatteryStateAsync();
// palauttaa Battery.BatteryState-luetteloarvon
```

**BatteryState-luettelo**

`Battery.BatteryState` on luettelo-tyyppiä (enum), joka kuvaa akun latauksen tilaa. Käytettävissä olevat arvot on listattu komponentin [BatteryState-dokumentaatiossa](https://docs.expo.dev/versions/v54.0.0/sdk/battery/#batterystate):

| Arvo | Merkitys |
|------|----------|
| `Battery.BatteryState.UNKNOWN` | Tila ei ole tiedossa |
| `Battery.BatteryState.UNPLUGGED` | Laite ei ole laturissa |
| `Battery.BatteryState.CHARGING` | Akku latautuu aktiivisesti |
| `Battery.BatteryState.FULL` | Akku on täynnä, mutta laite on edelleen kiinni laturissa |

> **Huomio:** `CHARGING` ja `FULL` ovat erillisiä tiloja. Kun akku on täynnä mutta laite on yhä laturissa, tila on `FULL` eikä enää `CHARGING`. Sovelluksessa molemmat tilat tulkitaan "latauksessa"-tiedoksi, koska molemmat tarkoittavat, että laite on kytkettynä laturiin.

**Latauksen tilan kuuntelu**

Latauksen tilan muutoksia seurataan `addBatteryStateListener()`-tapahtumakuuntelijalla, joka käynnistyy aina, kun laitteen latauksen tila vaihtuu. Tapahtumakäsittelijä saa parametrinaan `BatteryStateEvent`-olion, jonka `batteryState`-kenttä sisältää uuden tilan `BatteryState`-luetteloarvona:

```tsx
const kuuntelija = Battery.addBatteryStateListener((e: Battery.BatteryStateEvent) => {
    if (e.batteryState === Battery.BatteryState.CHARGING || e.batteryState === Battery.BatteryState.FULL) {
        // laite on kytketty laturiin
    }
});

// Kuuntelija poistetaan siivousfunktiossa muistin vuotamisen estämiseksi
return () => kuuntelija.remove();
```

Dokumentaatio: [expo-battery – Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/battery/)

### React Native Paper

[React Native Paper](https://callstack.github.io/react-native-paper/docs/guides/getting-started/) on Googlen **Material Design** -periaatteita noudattava käyttöliittymäkomponenttikirjasto React Native -sovelluksille. Se tarjoaa valmiiksi tyyliteltyjä komponentteja, kuten painikkeita, listoja, yläpalkkeja ja dialogeja, joten kehittäjän ei tarvitse rakentaa kaikkia peruselementtejä tyhjästä.

**PaperProvider ja Safe Area Context**

React Native Paper edellyttää, että koko sovelluksen näkymä kääritään [`PaperProvider`](https://callstack.github.io/react-native-paper/docs/components/Provider/)-komponentin sisään. `PaperProvider` huolehtii kirjaston teema-asetuksista sekä alustaa `react-native-safe-area-context` -paketin Safe Area -kontekstin koko sovellukselle.

Demossa 4 sovelluksen juurikomponenttina käytettiin `SafeAreaView`-komponenttia, joka estää käyttöliittymää piirtymästä laitteen kameran tai tilapalkin päälle. Kun React Native Paper on käytössä, `PaperProvider` korvaa tämän tarpeen alustamalla Safe Area -kontekstin sisäisesti. Käytännössä `Appbar.Header`-komponentti osaa hyödyntää tätä kontekstia ja sijoittuu automaattisesti tilapalkin alapuolelle oikeaan kohtaan ilman erillistä `SafeAreaView`-käärettä.

```tsx
import { PaperProvider } from 'react-native-paper';

export default function App() {
    return (
        <PaperProvider>
            {/* Appbar.Header sijoittuu automaattisesti tilapalkin alapuolelle */}
            {/* SafeAreaView:ta ei tarvita erikseen */}
        </PaperProvider>
    );
}
```

**Käytettävät komponentit**

Tässä demossa käytetään seuraavia React Native Paper -komponentteja:

**[Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/)** on sovelluksissa tyypillinen yläpalkki. `Appbar.Header` on yläpalkin säilökomponentti, `Appbar.Content` näyttää otsikkotekstin ja `Appbar.Action` lisää ikonipainikkeen. Ikonit tulevat **MaterialCommunityIcons**-ikonistosta, joka sisältyy React Native Paperiin oletuksena. Ikonien nimiä voi selata [MaterialCommunityIcons-hakutyökalusta](https://materialdesignicons.com/).

**[List.Accordion](https://callstack.github.io/react-native-paper/docs/components/List/ListAccordion/)** on avautuva listasäilö, jonka otsikkoa painamalla lista avautuu tai sulkeutuu. Sisälle sijoitetaan [`List.Item`](https://callstack.github.io/react-native-paper/docs/components/List/ListItem/)-komponentteja, joissa `title` on listaelementtien otsikko ja `description` näyttää tarkemman tiedon otsikon alla.

**[Button](https://callstack.github.io/react-native-paper/docs/components/Button/)** tarjoaa tavallista React Native -painiketta monipuolisemmat ominaisuudet, kuten tuen ikoneille ja useille visuaalisille tyyleille `mode`-propsin kautta. `mode="contained"` luo täytetyn taustavärin omaavan painikkeen.

### Demosovellus

Tässä demossa rakennetaan sovellus, joka näyttää laitteen perustiedot (merkki, malli, käyttöjärjestelmä) ja akun tilan avautuvissa listoissa sekä mahdollistaa puhelimen värisyttämisen painikkeella. Käyttöliittymä toteutetaan kokonaan React Native Paperin komponenteilla.

Demo 4:stä poiketen tämä demo ottaa käyttöön ulkoisen komponenttikirjaston (React Native Paper) ja hyödyntää Expon laiterajapintoja. Uutena React-käsitteenä demoissa tulee `useEffect`-hook, jota käytetään asynkronisen datan hakemiseen ja tapahtumakuuntelijoiden hallintaan. Projektin alustaminen seuraa samaa kaavaa kuin demo 4:ssä — tarkat ohjeet löytyvät tarvittaessa [demo 4:n README.md-tiedostosta](../demo04/README.md).

---

## 2. Demosovelluksen rakentuminen vaihe vaiheelta

### Vaihe 1: Projektin luominen

Luodaan projektikansio ja alustetaan Expo-projekti SDK 54 -versiolla, kuten demo 4:ssä:

```bash
mkdir demo05
cd demo05
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huomio:** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Toistaiseksi käytetään `@sdk-54`-määrettä.

### Vaihe 2: Kehityspalvelimen käynnistäminen

Käynnistetään kehityspalvelin ja tarkistetaan, että oletussovellus avautuu Expo Go:ssa:

```bash
npx expo start
```

Skannataan terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).

### Vaihe 3: Pakettien asentaminen

Sammutetaan kehityspalvelin `Ctrl + C`:llä ja asennetaan kaikki demon tarvitsemat paketit ennen koodauksen aloittamista:

```bash
npx expo install expo-device expo-battery react-native-safe-area-context
npm install react-native-paper
```

`expo-device`, `expo-battery` ja `react-native-safe-area-context` asennetaan `npx expo install` -komennolla, joka valitsee Expo SDK -version kanssa yhteensopivat paketit. `react-native-paper` puolestaan asennetaan tavallisella `npm install` -komennolla, koska se ei ole Expo SDK -paketti.

Käynnistetään kehityspalvelin asennusten jälkeen uudelleen:

```bash
npx expo start
```

### Vaihe 4: React Native Paperin runko

Korvataan `App.tsx`:n oletussisältö rakentamalla ensin sovelluksen perusrunko React Native Paperin komponenteilla. Tässä vaiheessa lisätään `PaperProvider`, `Appbar` ja tyhjä `View`-säilö sisältöä varten:

```tsx
import { View } from 'react-native';
import { Appbar, PaperProvider } from 'react-native-paper';

export default function App() {
    return (
        <PaperProvider>
            <Appbar.Header>
                <Appbar.Content title="Demo 5: Laitekomponentit" />
                <Appbar.Action icon="atom" />
            </Appbar.Header>
            <View style={{ marginHorizontal: 10 }}>
                {/* sisältö lisätään seuraavissa vaiheissa */}
            </View>
        </PaperProvider>
    );
}
```

`PaperProvider` on koko sovelluksen juurikomponentti, joka alustaa Material Design -teeman ja Safe Area -kontekstin. `Appbar.Header` sijoittuu näytön yläreunaan ja ottaa tilapalkin korkeuden automaattisesti huomioon. `View`-komponentille asetettu `marginHorizontal: 10` lisää vaakasuuntaiset välit, jotta sisältö ei osu näytön reunoihin.

Tallennetaan tiedosto ja tarkistetaan, että kehityspalvelin näyttää sovelluksessa tyhjän valkoisen näkymän ja yläpalkin otsikolla.

### Vaihe 5: Laitteen perustiedot expo-device-komponentilla

Lisätään laitteen perustiedot näkymään `expo-device`-komponentilla. Päivitetään importit tuomaan `expo-device` sekä `List`-komponentti React Native Paperista, ja lisätään `List.Accordion`-komponentti `View`-säilön sisään:

```tsx
import { View } from 'react-native';
import { Appbar, List, PaperProvider } from 'react-native-paper';
import * as Device from 'expo-device';

export default function App() {
    return (
        <PaperProvider>
            <Appbar.Header>
                <Appbar.Content title="Demo 5: Laitekomponentit" />
                <Appbar.Action icon="atom" />
            </Appbar.Header>
            <View style={{ marginHorizontal: 10 }}>

                <List.Accordion
                    title="Perustietoja laitteesta"
                    left={props => <List.Icon {...props} icon="memory" />}
                >
                    <List.Item title="Merkki" description={Device.brand ?? 'Ei saatavilla'} />
                    <List.Item title="Malli" description={Device.modelName ?? 'Ei saatavilla'} />
                    <List.Item title="Käyttöjärjestelmä" description={Device.osName ?? 'Ei saatavilla'} />
                    <List.Item title="Versio" description={Device.osVersion ?? 'Ei saatavilla'} />
                </List.Accordion>

            </View>
        </PaperProvider>
    );
}
```

`List.Accordion`-komponentin `left`-propsi ottaa funktion, joka palauttaa listan vasemmalle puolelle sijoitettavan elementin. `{...props}` välittää `List.Icon`-komponentille tarvittavat tyylit automaattisesti listalta. `Device.brand`, `Device.modelName`, `Device.osName` ja `Device.osVersion` ovat staattisia ominaisuuksia, joten ne voidaan sijoittaa suoraan `description`-propsiin ilman tilamuuttujaa tai asynkronisuutta. `?? 'Ei saatavilla'` on varasijoitus, joka näytetään silloin, kun ominaisuus palauttaa `null`, esimerkiksi emulaattorilla tai laitteella, jolta tieto ei ole saatavilla.

Tallennetaan tiedosto ja avataan lista puhelimella. Listan pitäisi näyttää laitteen tiedot oikein.

### Vaihe 6: Akkutiedot expo-battery-komponentilla

Lisätään akkutiedot näkymään. Akun tila ei ole staattinen ominaisuus kuten laitteen perustiedot, joten se tarvitsee tilamuuttujat ja `useEffect`-hookin.

**Importit ja tilamuuttujat**

Päivitetään importit tuomaan `Battery`, `useEffect` ja `useState` sekä lisätään tilamuuttujat komponentin sisään:

```tsx
import { View } from 'react-native';
import { Appbar, List, PaperProvider } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export default function App() {

    const [akkulataus, setAkkulataus] = useState<number>(0);
    const [latauksessa, setLatauksessa] = useState<string>('');
```

`akkulataus` tallentaa akun varaustason lukuarvona ja `latauksessa` tallentaa laturissa olemisen merkkijonona ("Kyllä" tai "Ei").

**useEffect-hook**

Lisätään `useEffect`-hook tilamuuttujien jälkeen, ennen `return`-lausetta:

```tsx
    useEffect(() => {

        (async () => {
            setAkkulataus(await Battery.getBatteryLevelAsync());
            const tila = await Battery.getBatteryStateAsync();
            if (tila === Battery.BatteryState.CHARGING || tila === Battery.BatteryState.FULL) {
                setLatauksessa('Kyllä');
            } else {
                setLatauksessa('Ei');
            }
        })();

        const latausKuuntelija = Battery.addBatteryStateListener((e: Battery.BatteryStateEvent) => {
            if (e.batteryState === Battery.BatteryState.CHARGING || e.batteryState === Battery.BatteryState.FULL) {
                setLatauksessa('Kyllä');
            } else {
                setLatauksessa('Ei');
            }
        });

        return () => latausKuuntelija.remove();

    }, []);
```

`useEffect` suoritetaan kerran komponentin ensimmäisen renderöinnin jälkeen, koska riippuvuustaulukko `[]` on tyhjä. Sisällä suoritetaan **välittömästi kutsuttava asynkroninen nuolifunktio** `(async () => { ... })()`, jolla haetaan sekä akun varaustaso että latauksen alkutila. Tämä rakenne tarvitaan siksi, että `useEffect`-hook ei itse voi olla `async`-funktio.

`latausKuuntelija` rekisteröi tapahtumakäsittelijän, joka päivittää `latauksessa`-tilamuuttujan aina, kun laitteen latauksen tila muuttuu. `useEffect` palauttaa **siivousfunktion** `return () => latausKuuntelija.remove()`, joka poistaa kuuntelijan, kun komponentti poistetaan näkymästä. Tämä estää muistin vuotamisen.

**Akkutietojen näkymä**

Lisätään toinen `List.Accordion` ensimmäisen laitteistolistan jälkeen `View`-säilön sisään:

```tsx
                <List.Accordion
                    title="Akkutietoja"
                    left={props => <List.Icon {...props} icon="battery" />}
                >
                    <List.Item title="Latauksen määrä" description={`${(100 * akkulataus).toFixed(2)} %`} />
                    <List.Item title="Latauksessa" description={latauksessa} />
                </List.Accordion>
```

Akkutietojen `description`-ominaisuudessa käytetään **template literal** -syntaksia: `(100 * akkulataus).toFixed(2)` kertoo akkulukeman sadalla prosenttiosuudeksi ja pyöristää sen kahteen desimaaliin. Template literal tarkoittaa sitä, että merkkijono kirjoitetaan backtick-merkkien (`` ` ``) sisään, jolloin muuttujat voidaan suoraan upottaa tekstiin `${...}`-syntaksilla.

### Vaihe 7: Värinäpainike Vibration-rajapinnalla

Lisätään painike, joka värisyttää laitetta. `Vibration`-rajapinta tulee suoraan React Nativesta eikä vaadi erillisiä asennuksia. Päivitetään `react-native`-tuonti lisäämällä `Vibration` ja lisätään `Button`-tuonti React Native Paperista:

```tsx
import { View, Vibration } from 'react-native';
import { Appbar, Button, List, PaperProvider } from 'react-native-paper';
```

Lisätään painike `View`-säilön loppuun, toisen `List.Accordion`-komponentin jälkeen:

```tsx
                <Button
                    style={{ marginVertical: 10 }}
                    mode="contained"
                    onPress={() => Vibration.vibrate(2000)}
                    icon="vibrate"
                >Värinää!</Button>
```

`Vibration.vibrate(2000)` värisyttää laitetta 2000 millisekuntia eli 2 sekuntia. `mode="contained"` luo täytetyn taustavärin omaavan painikkeen. `marginVertical: 10` lisää pystysuuntaiset välit painikkeen yli- ja alapuolelle, jotta se ei osu kiinni listoihin.

### Vaihe 8: StatusBar

Lisätään lopuksi `StatusBar`-komponentti `View`-säilön loppuun, painikkeen jälkeen. `StatusBar` hallinnoi mobiililaitteen tilapalkin ulkoasua sovelluksen käytön aikana:

```tsx
import { StatusBar } from 'expo-status-bar';
```

```tsx
                <StatusBar style="auto" />
```

Tallennetaan tiedosto. Lopullinen ohjelmakoodi vastaa nyt demon `App.tsx`-tiedostoa kokonaisuudessaan.

### Projektin lopullinen rakenne

```
demo05/
├── assets/                  # Ikonit ja splash screen
├── node_modules/            # Asennetut riippuvuudet (ei versionhallintaan)
├── App.tsx                  # Sovelluksen pääkomponentti (laitetieto-sovellus)
├── app.json                 # Expon konfiguraatio
├── index.ts                 # Sovelluksen aloituspiste
├── package.json             # Riippuvuudet ja käynnistyskomennot
└── tsconfig.json            # TypeScript-konfiguraatio
```

---

## 3. Muistilista

### Expo-laitekomponentit

| Komponentti | Asennus | Käyttötarkoitus |
|-------------|---------|-----------------|
| `expo-device` | `npx expo install expo-device` | Laitteen perustiedot: merkki, malli, käyttöjärjestelmä |
| `expo-battery` | `npx expo install expo-battery` | Akun varaus ja latauksen tila |
| `expo-camera` | `npx expo install expo-camera` | Kameran käyttö ja kuvien ottaminen |
| `expo-location` | `npx expo install expo-location` | GPS-sijaintitieto |
| `expo-sensors` | `npx expo install expo-sensors` | Kiihtyvyysanturi, gyroskooppi ja muut anturit |

### React Native Paper -komponentit

| Komponentti | Dokumentaatio | Käyttötarkoitus |
|-------------|---------------|-----------------|
| `<PaperProvider>` | [Provider](https://callstack.github.io/react-native-paper/docs/components/Provider/) | Koko sovelluksen juurikomponentti, alustaa teeman ja Safe Area -kontekstin |
| `<Appbar.Header>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Sovelluksen yläpalkki, sijoittuu automaattisesti tilapalkin alapuolelle |
| `<Appbar.Content>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkin otsikkoteksti |
| `<Appbar.Action>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkin ikonipainike |
| `<Button>` | [Button](https://callstack.github.io/react-native-paper/docs/components/Button/) | Painike, tukee ikoneita ja useita tyylejä `mode`-propsin kautta |
| `<List.Accordion>` | [ListAccordion](https://callstack.github.io/react-native-paper/docs/components/List/ListAccordion/) | Avautuva listasäilö |
| `<List.Item>` | [ListItem](https://callstack.github.io/react-native-paper/docs/components/List/ListItem/) | Yksittäinen listaelementti otsikolla ja kuvauksella |
| `<List.Icon>` | [ListIcon](https://callstack.github.io/react-native-paper/docs/components/List/ListIcon/) | Ikoni listan vasemmalle tai oikealle puolelle |

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo uuden Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo install <paketti>` | Asentaa SDK-version kanssa yhteensopivan Expo-paketin |
| `npm install <paketti>` | Asentaa ei-Expo-paketin (esim. React Native Paper) |
| `npx expo start` | Käynnistää Expo-kehityspalvelimen |
| `r` (kehityspalvelimessa) | Lataa sovellus uudelleen mobiililaitteella |
| `Ctrl + C` | Sammuttaa kehityspalvelimen |

---

## Sovelluksen käynnistys

Jos projekti kloonataan valmiina tai halutaan käynnistää se uudelleen:

**1. Asennetaan riippuvuudet:**

```bash
npm install
```

`npm install` asentaa `package.json`-tiedostossa listatut riippuvuudet `node_modules/`-kansioon. Tämä on tarpeen aina, kun projekti kloonataan tai `node_modules/`-kansio puuttuu, koska sitä ei lisätä versionhallintaan.

**2. Käynnistetään kehityspalvelin:**

```bash
npx expo start
```

Skannataan terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).