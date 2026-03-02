# Demo 5: Laitekomponentit

Tässä demossa tutustutaan Expon laitekomponentteihin, joiden avulla päästään käsiksi mobiililaitteen ominaisuuksiin ja tietoihin. Demosovellus näyttää laitteen perustiedot (merkki, malli, käyttöjärjestelmä) ja akun tilan sekä mahdollistaa puhelimen värisyttämisen painikkeella. Lisäksi otetaan käyttöön **React Native Paper** -käyttöliittymäkomponenttikirjasto, joka tarjoaa valmiiksi tyyliteltyjä Material Design -komponentteja.

---

## 1. Projektin alustaminen

Tämän demon alustaminen seuraa samaa kaavaa kuin demo 4. Tarkat ohjeet projektin luomisesta ja kehityspalvelimen käynnistämisestä löytyvät [demo 4:n README.md-tiedostosta](../demo04/README.md).

### Vaihe 1: Projektin luominen

Luo projektikansio ja alusta Expo-projekti SDK 54 -versiolla:

```bash
mkdir demo05
cd demo05
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huom!** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Käytä toistaiseksi `@sdk-54`-määrettä.

### Vaihe 2: Kehityspalvelimen käynnistäminen

```bash
npx expo start
```

Skannaa terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).

---

## 2. Expo-laitekomponentit

Expo tarjoaa laajan valikoiman valmiita SDK-komponentteja, joiden avulla päästään käsiksi mobiililaitteen ominaisuuksiin ilman natiivikoodia. Komponentit asennetaan `npx expo install` -komennolla, joka valitsee automaattisesti projektin Expo SDK -version kanssa yhteensopivan pakettiversion tavallisen `npm install` -komennon sijaan.

Tässä demossa käytetään kahta laitekomponenttia, `expo-device` ja `expo-battery`, joita käsitellään alla erikseen.

---

### expo-device

`expo-device` tarjoaa pääsyn laitteen staattisiin perustietoihin, kuten laitteen merkkiin, malliin ja käyttöjärjestelmän tietoihin. Tiedot ovat valmiiksi ladattuja ominaisuuksia, joita ei tarvitse hakea erikseen, vaan niihin viitataan suoraan `Device`-nimiavaruuden kautta.

**Asennus:**

```bash
npx expo install expo-device
```

**Dokumentaatio:** [expo-device – Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/device/)

**Käyttöönotto ja ominaisuudet:**

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

---

### expo-battery

`expo-battery` tarjoaa pääsyn laitteen akun tilaan. Toisin kuin laitteen perustiedot, akun tila ei ole staattinen ominaisuus, vaan se haetaan asynkronisella funktiokutsulla. Akun latauksen tilan muutoksia voidaan lisäksi seurata reaaliajassa tapahtumakuuntelijalla.

**Asennus:**

```bash
npx expo install expo-battery
```

**Dokumentaatio:** [expo-battery – Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/battery/)

**Käyttöönotto:**

Komponentti tuodaan samaan tapaan kuin `expo-device`:

```tsx
import * as Battery from 'expo-battery';
```

**Akun varauksen hakeminen:**

`getBatteryLevelAsync()` on asynkroninen metodi, joka palauttaa akun varauksen lukuna välillä 0–1. `getBatteryStateAsync()` puolestaan palauttaa akun latauksen nykyisen tilan `BatteryState`-luetteloarvona. Molempia kutsutaan `await`-avainsanan kanssa:

```tsx
const taso = await Battery.getBatteryLevelAsync();
// palauttaa esim. 0.85, joka vastaa 85 % varausta

const tila = await Battery.getBatteryStateAsync();
// palauttaa Battery.BatteryState-luetteloarvon
```

**BatteryState-luettelo:**

`Battery.BatteryState` on luettelo-tyyppiä (enum), joka kuvaa akun latauksen tilaa. Käytettävissä olevat arvot on listattu komponentin [BatteryState-dokumentaatiossa](https://docs.expo.dev/versions/v54.0.0/sdk/battery/#batterystate):

| Arvo | Merkitys |
|------|----------|
| `Battery.BatteryState.UNKNOWN` | Tila ei ole tiedossa |
| `Battery.BatteryState.UNPLUGGED` | Laite ei ole laturissa |
| `Battery.BatteryState.CHARGING` | Akku latautuu aktiivisesti |
| `Battery.BatteryState.FULL` | Akku on täynnä, mutta laite on edelleen kiinni laturissa |

**Huomioi**, että `CHARGING` ja `FULL` ovat erillisiä tiloja. Kun akku on täynnä mutta laite on yhä laturissa, tila on `FULL` eikä enää `CHARGING`. Sovelluksessa molemmat tilat tulkitaan "latauksessa"-tiedoksi, koska molemmat tarkoittavat, että laite on kytkettynä laturiin.

**Latauksen tilan kuuntelu:**

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

---

## 3. React Native Paper

[React Native Paper](https://callstack.github.io/react-native-paper/docs/guides/getting-started/) on Googlen **Material Design** -periaatteita noudattava käyttöliittymäkomponenttikirjasto React Native -sovelluksille. Se tarjoaa valmiiksi tyyliteltyjä komponentteja, kuten painikkeita, listoja, yläpalkkeja ja dialogeja, joten kehittäjän ei tarvitse rakentaa kaikkia peruselementtejä tyhjästä.

### Asennus

React Native Paper asennetaan tavallisella `npm install` -komennolla. Kirjasto edellyttää `react-native-safe-area-context` -pakettia vertaisriippuvuutenaan, joten se asennetaan samalla:

```bash
npm install react-native-paper
npx expo install react-native-safe-area-context
```

`react-native-safe-area-context` on asennettava `npx expo install` -komennolla, jotta Expo valitsee SDK-version kanssa yhteensopivan version.

**Dokumentaatio:** [React Native Paper – Getting started](https://callstack.github.io/react-native-paper/docs/guides/getting-started/)

### PaperProvider ja Safe Area Context

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

### Käytettävät komponentit

Tässä demossa käytetään seuraavia React Native Paper -komponentteja:

**[Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/)** on sovelluksissa tyypillinen yläpalkki. `Appbar.Header` on yläpalkin säilökomponentti, `Appbar.Content` näyttää otsikkotekstin ja `Appbar.Action` lisää ikonipainikkeen. Ikonit tulevat **MaterialCommunityIcons**-ikonistosta, joka sisältyy React Native Paperiin oletuksena. Ikonien nimiä voi selata [MaterialCommunityIcons-hakutyökalusta](https://materialdesignicons.com/).

**[List.Accordion](https://callstack.github.io/react-native-paper/docs/components/List/ListAccordion/)** on avautuva listasäilö, jonka otsikkoa painamalla lista avautuu tai sulkeutuu. Sisälle sijoitetaan [`List.Item`](https://callstack.github.io/react-native-paper/docs/components/List/ListItem/)-komponentteja, joissa `title` on listaelementtien otsikko ja `description` näyttää tarkemman tiedon otsikon alla.

**[Button](https://callstack.github.io/react-native-paper/docs/components/Button/)** tarjoaa tavallista React Native -painiketta monipuolisemmat ominaisuudet, kuten tuen ikoneille ja useille visuaalisille tyyleille `mode`-propsin kautta. `mode="contained"` luo täytetyn taustavärin omaavan painikkeen.

---

## 4. Sovelluksen ohjelmointi vaiheittain

### Vaihe 1: Pakettien asentaminen

Sammuta kehityspalvelin tarvittaessa `Ctrl + C`:llä ja asenna kaikki demon tarvitsemat paketit ennen koodauksen aloittamista:

```bash
npx expo install expo-device expo-battery react-native-safe-area-context
npm install react-native-paper
```

Käynnistä kehityspalvelin asennusten jälkeen uudelleen:

```bash
npx expo start
```

### Vaihe 2: React Native Paperin runko

Korvaa `App.tsx`:n oletussisältö rakentamalla ensin sovelluksen perusrunko React Native Paperin komponenteilla. Tässä vaiheessa lisätään `PaperProvider`, `Appbar` ja tyhjä `View`-säilö sisältöä varten:

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

Tallenna tiedosto ja tarkista, että kehityspalvelin näyttää sovelluksessa tyhjän valkoisen näkymän ja yläpalkin otsikolla.

### Vaihe 3: Laitteen perustiedot expo-device-komponentilla

Lisää laitteen perustiedot näkymään `expo-device`-komponentilla. Päivitä importit tuomaan `expo-device` sekä `List`-komponentti React Native Paperista, ja lisää `List.Accordion`-komponentti `View`-säilön sisään:

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

`List.Accordion`-komponentin `left`-propsi ottaa funktion, joka palauttaa listan vasemmalle puolelle sijoitettavan elementin. `{...props}` välittää `List.Icon`-komponentille tarvittavat tyylit automaattisesti listalta. `Device.brand`, `Device.modelName`, `Device.osName` ja `Device.osVersion` ovat staattisia ominaisuuksia, joten ne voidaan sijoittaa suoraan `description`-propsiin ilman tilamuuttujaa tai asynchronisuutta. `?? 'Ei saatavilla'` on varasijoitus, joka näytetään silloin, kun ominaisuus palauttaa `null`, esimerkiksi emulaattorilla tai laitteella, jolta tieto ei ole saatavilla.

Tallenna tiedosto ja avaa lista puhelimella. Listan pitäisi näyttää laitteen tiedot oikein.

### Vaihe 4: Akkutiedot expo-battery-komponentilla

Lisää akkutiedot näkymään. Akun tila ei ole staattinen ominaisuus kuten laitteen perustiedot, joten se tarvitsee tilamuuttujat ja `useEffect`-hookin. Päivitä importit ja lisää tila sekä toinen `List.Accordion` laitteiston listan jälkeen:

```tsx
import { View } from 'react-native';
import { Appbar, List, PaperProvider } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export default function App() {

    const [akkulataus, setAkkulataus] = useState<number>(0);
    const [latauksessa, setLatauksessa] = useState<string>('');

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

                <List.Accordion
                    title="Akkutietoja"
                    left={props => <List.Icon {...props} icon="battery" />}
                >
                    <List.Item title="Latauksen määrä" description={`${(100 * akkulataus).toFixed(2)} %`} />
                    <List.Item title="Latauksessa" description={latauksessa} />
                </List.Accordion>

            </View>
        </PaperProvider>
    );
}
```

`useEffect` suoritetaan kerran komponentin ensimmäisen renderöinnin jälkeen, koska riippuvuustaulukko `[]` on tyhjä. Sisällä suoritetaan välittömästi kutsuttava asynkroninen nuolifunktio `(async () => { ... })()`, jolla haetaan sekä akun varaustaso että latauksen alkutila. Tämä rakenne tarvitaan siksi, että `useEffect`-hook ei itse voi olla `async`-funktio. Latauksen tila haetaan `getBatteryStateAsync()`-metodilla ja suoritetaan tarkistus `CHARGING`- ja `FULL`-tilojen varalta, koska molemmat tarkoittavat laiteen laturiin kytkettynä olemista.

`latausKuuntelija` rekisteröi tapahtumakäsittelijän, joka päivittää `latauksessa`-tilamuuttujan aina, kun laitteen latauksen tila muuttuu. `useEffect` palauttaa siivousfunktion `return () => latausKuuntelija.remove()`, joka poistaa kuuntelijan, kun komponentti poistetaan näkymästä. Tämä estää muistin vuotamisen.

Akkutietojen `description`-ominaisuudessa käytetään template literal -syntaksia: `(100 * akkulataus).toFixed(2)` kertoo akkulukeman sadalla prosenttiosuudeksi ja pyöristää sen kahteen desimaaliin. Template literal tarkoitti vain sitä, että merkkijono kirjoitetaan backtick-merkkien (\`) sisään, jolloin muuttujat voidaan suoraan upottaa tekstiin. 

### Vaihe 5: Värinäpainike Vibration-rajapinnalla

Lisää painike, joka värisyttää laitetta. `Vibration`-rajapinta tulee suoraan React Nativesta eikä vaadi erillisiä asennuksia. Päivitä `react-native`-tuonti lisäämällä `Vibration` ja lisää `Button`-tuonti React Native Paperista sekä painike `View`-säilön loppuun:

```tsx
import { View, Vibration } from 'react-native';
import { Appbar, Button, List, PaperProvider } from 'react-native-paper';
```

```tsx
                <Button
                    style={{ marginVertical: 10 }}
                    mode="contained"
                    onPress={() => Vibration.vibrate(2000)}
                    icon="vibrate"
                >Värinää!</Button>
```

`Vibration.vibrate(2000)` värisyttää laitetta 2000 millisekuntia eli 2 sekuntia. `marginVertical: 10` lisää pystysuuntaiset välit painikkeen yli- ja alapuolelle, jotta se ei osu kiinni listoihin.

### Vaihe 6: StatusBar

Lisää lopuksi `StatusBar`-komponentti `View`-komponentin loppuun. Se hallinnoi mobiililaitteen tilapalkin ulkoasua sovelluksen käytön aikana:

```tsx
import { StatusBar } from 'expo-status-bar';
```

```tsx
    <View>
        {/*Aiemmat koodit...*/}
        <StatusBar style="auto" />
    </View>
```

Lopullinen ohjelmakoodi vastaa nyt demon `App.tsx`-tiedostoa kokonaisuudessaan.

---

## 5. Muistilista

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
| `npx expo start` | Käynnistää Expo-kehityspalvelimen |
| `a` (kehityspalvelimessa) | Avaa sovelluksen Android-emulaattorissa (vaatii Android Studion) |
| `i` (kehityspalvelimessa) | Avaa sovelluksen iOS-simulaattorissa (vaatii Xcoden, macOS) |
| `r` (kehityspalvelimessa) | Lataa sovellus uudelleen mobiililaitteella |
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
