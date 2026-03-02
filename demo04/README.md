# Demo 4: React Native -perusteet

## 1. React Native ja Expo

### Mikä on React Native?

React Native on Metan kehittämä avoimen lähdekoodin sovelluskehys mobiilisovellusten rakentamiseen. Sen avulla voidaan kirjoittaa yksi JavaScript- tai TypeScript-koodipohja, josta tuotetaan natiivi mobiilisovellus sekä Androidille että iOS:lle.

Tavallisessa web-kehityksessä React renderöi HTML-elementtejä selaimeen. React Native toimii samalla periaatteella, mutta sen sijaan, että se tuottaisi HTML:ää, se muuntaa React-komponentit suoraan mobiilialustan omiksi, natiiveiksi käyttöliittymäelementeiksi. Android-sovelluksessa esimerkiksi `<View>`-komponentti muuttuu Android-alustalle natiiviksi `ViewGroup`-elementiksi. Tästä johtuu sanan "Native" käyttö nimessä, sillä sovellus ei pyöri selainsäilössä vaan natiivina sovelluksena laitteella.

### Mikä on Expo?

Expo on React Nativen päälle rakennettu **sovelluskehys** (framework), joka yksinkertaistaa React Native -kehityksen aloittamista huomattavasti. Ilman Expoa React Native -projektin asentaminen vaatii monimutkaisia ympäristöasetuksia.

Expo abstraktoi nämä laitteisto- ja ympäristöasetukset kehittäjältä piiloon ja tarjoaa tilalle yksinkertaisen kehitystyökalun, joten käytännössä tarvitaan vain Node.js-suoritusympäristö ja Expo Go -sovellus mobiililaitteella.

Expo on myös [virallinen React Native -dokumentaation](https://reactnative.dev/docs/environment-setup) suosittelema aloitustapa uusille kehittäjille.

---

## 2. Esivaatimukset

### VS Code -laajennukset

Visual Studio Code ei tunnista React Native -syntaksia oletuksena yhtä hyvin kuin web-React-koodia. Seuraavat laajennukset parantavat kehityskokemusta:

- **React Native Tools** (Microsoft) on Microsoftin virallinen laajennus, joka tarjoaa syntaksikorostuksen, IntelliSensen ja debuggaustyökalut React Native -projekteille. Asenna se VS Coden Extensions-välilehdeltä hakemalla "React Native Tools".
- **Expo Tools** on valinnainen laajennus, joka tarjoaa Expo-kohtaisia ominaisuuksia.

### Expo Go -sovellus

Asenna **Expo Go** laitteellesi sovelluskaupasta. Sovellus löytyy hakusanalla "Expo Go".

Kehityksen aikana Expo-kehityspalvelin ja mobiililaite kommunikoivat saman lähiverkon kautta. Varmista, että sekä tietokone että mobiililaite ovat yhteydessä **samaan Wi-Fi-verkkoon**, esimerkiksi kotiverkkoon. Vaihtoehtoisesti voit käyttää mobiililaitteen **mobiilitukiasemaa** (hotspot) aktivoimalla hotspot laitteellasi ja yhdistämällä tietokoneen siihen.

---

## 3. Projektin luominen

### Vaihe 1: Projektin kansion luominen

Avaa VS Codessa uusi terminaali. Navigoi haluamaasi hakemistoon ja luo uusi kansio projektia varten:

```bash
mkdir demo04
cd demo04
```

Voit myös luoda kansion resurssinhallinnan kautta ja avata sen VS Codessa (**File → Open Folder**). Tällöin VS Coden terminaali avautuu automaattisesti projektikansiossa.

### Vaihe 2: Expo-projektin alustaminen

Luo uusi Expo-projekti TypeScript-pohjalla suorittamalla komento:

```bash
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huom!** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Käytä toistaiseksi `@sdk-54`-määrettä, jolla projekti alustetaan Expo SDK 54 -versioon. SDK 54 on vakaa versio, joka toimii Expo Go:n kanssa ongelmitta. Tämä on myös [Expon virallisen dokumentaation](https://docs.expo.dev/get-started/create-a-project/) suositus fyysisellä laitteella testaavalle.

Komennon osat:

- `npx`: suorittaa npm-paketin asentamatta sitä pysyvästi. `npx` hakee uusimman version `create-expo-app`-työkalusta ja ajaa sen.
- `create-expo-app@latest`: Expon virallinen projektin luontityökalu, jossa `@latest` varmistaa uusimman version käytön.
- `.`: piste tarkoittaa nykyistä kansiota, joten projekti luodaan nykyiseen kansioon uuden alikansion sijaan.
- `--template blank-typescript@sdk-54`: käyttää valmista "tyhjää" TypeScript-pohjaa SDK 54 -versiolla. Tämä on yksinkertaisin mahdollinen Expo-projekti, joka sisältää vain välttämättömät tiedostot ilman ylimääräisiä esimerkkejä tai navigaatiota.

Komento asentaa projektin riippuvuudet automaattisesti. Asennus voi kestää muutaman minuutin verkkoyhteyden nopeudesta riippuen.

### Vaihe 3: Projektin kansiorakenne

Kun projekti on luotu, kansiorakenne näyttää seuraavalta:

```
demo04/
├── assets/
├── node_modules/
├── App.tsx
├── app.json
├── index.ts
├── package.json
└── tsconfig.json
```

Keskeisimmät tiedostot:

- **`App.tsx`**: sovelluksen **pääkomponentti**, johon kirjoitetaan sovelluksen ensimmäinen näkymä. Tiedostopääte `.tsx` tarkoittaa TypeScript-tiedostoa, joka sisältää JSX-syntaksia.
- **`app.json`**: Expon konfiguraatiotiedosto, joka sisältää sovelluksen nimen, ikonin, väriteemat ja muut sovellustason asetukset.
- **`package.json`**: Node.js-projektin kuvaustiedosto, joka listaa projektin riippuvuudet (`react`, `react-native`, `expo` jne.) ja käynnistyskomennot.
- **`tsconfig.json`**: TypeScript-konfiguraatio, jonka Expo asettaa automaattisesti optimaalisille asetuksille React Native -kehitystä varten.
- **`assets/`**: sovelluksen staattiset resurssit, kuten ikonit ja latauskuva (splash screen).
- **`node_modules/`**: npm:n asentamat riippuvuudet. Tätä kansiota ei koskaan muokata käsin eikä lisätä versionhallintaan.

### Vaihe 4: Kehityspalvelimen käynnistäminen

Käynnistä Expo-kehityspalvelin komennolla:

```bash
npx expo start
```

Terminaaliin ilmestyy Expo-kehityspalvelimen käyttöliittymä, jossa näkyy QR-koodi ja useita pikanäppäimiä:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press j │ open debugger
› Press ? │ show all commands
```

**Metro** on React Nativen JavaScript-bundler, joka kokoaa kaikki projektin lähdekooditiedostot yhteen pakettiin ja toimittaa sen mobiililaitteelle tai emulaattorille.

### Vaihe 5: Sovelluksen avaaminen Expo Go -sovelluksella

QR-koodin skannaus riippuu käyttämästäsi alustasta:

- **Android**: avaa **Expo Go** -sovellus ja paina sovelluksen etusivulta **"Scan QR code"** -painiketta. Skannaa terminaaliin ilmestynyt QR-koodi.
- **iOS**: avaa laitteen oma **Kamera**-sovellus ja osoita se terminaalin QR-koodiin. Kamera tunnistaa koodin automaattisesti ja tarjoaa linkin, joka avaa sovelluksen Expo Go:ssa.

Expo Go lataa sovelluksen mobiililaitteelle verkon kautta. Ruudulla näkyy ensin Expon latauskuva, jonka jälkeen `App.tsx`-tiedostossa määritelty näkymä avautuu.

Sovellus **latautuu automaattisesti uudelleen** aina, kun tallennat muutoksia lähdekoodiin. Tätä kutsutaan live reloadingiksi, eikä kehittäjän tarvitse käynnistää sovellusta käsin jokaisen muutoksen jälkeen.

Testaa live reloading muokkaamalla `App.tsx`-tiedostossa olevaa tekstiä ja tallentamalla tiedosto (`Ctrl + S`). Muutos näkyy puhelimen ruudulla muutamassa sekunnissa.

---

## 4. React Native -komponentit

### Ero web-Reactiin

Sovellusohjelmointi 1 -opintojaksolla toteutettiin selainpohjaisia React-sovelluksia, jotka käyttivät HTML-elementtejä (`div`, `p`, `button` jne.). React Native ei käytä HTML-elementtejä, vaan sen sijaan React Native tarjoaa omia komponenttejaan, jotka vastaavat natiiveja mobiilielementtejä.

Seuraava taulukko kuvaa yleisimmät HTML-elementtien React Native -vastineet:

| Web (HTML) | React Native | Selitys |
|------------|--------------|---------|
| `<div>` | `<View>` | Yleiskäyttöinen säilökomponentti, jolla ryhmitellään muita komponentteja |
| `<p>`, `<h1>`, `<span>` | `<Text>` | Kaikki teksti on pakattava `<Text>`-komponentin sisään |
| `<img>` | `<Image>` | Kuvien näyttäminen |
| `<input type="text">` | `<TextInput>` | Tekstinsyöttökenttä |
| `<button>` | `<Button>` tai `<Pressable>` | Painettava alue painikkeille, linkeille ja klikattaville elementeille |
| `<ul>` + `<li>` | `<FlatList>` | Pitkien listojen tehokas renderöinti |
| `<div style="overflow: scroll">` | `<ScrollView>` | Vieritettävä näkymäsäilö |

Tärkein ero web-Reactiin on se, että **kaikki teksti on kirjoitettava `<Text>`-komponentin sisään**. React Native antaa virheen, jos teksti on suoraan `<View>`-komponentin lapsena ilman `<Text>`-komponenttia.

### StyleSheet ja tyylittely React Nativessa

React Nativessa ei käytetä CSS:ää. Tyylittely tapahtuu JavaScript-objekteilla, joiden syntaksi muistuttaa CSS:ää, mutta käyttää **camelCase**-muotoa. Esimerkiksi CSS:n `background-color` on React Nativessa `backgroundColor` ja `font-size` on `fontSize`.

Tyylit luodaan `StyleSheet.create()`-metodilla:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    säilö: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otsikko: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
});
```

`StyleSheet.create()` ei ole pakollinen, sillä tyylit voisi kirjoittaa suoraan komponentille `style={{ fontSize: 24 }}`, mutta `StyleSheet.create()` optimoi tyylit suorituskyvyn kannalta ja antaa paremman TypeScript-tuen. Paremmaksi käytännöksi katsotaan `StyleSheet.create()`-metodin käyttö.

React Native käyttää **Flexboxia** komponenttien sijoitteluun. Flexbox toimii hieman eri oletusarvoilla kuin web-CSS:ssä, sillä React Nativen `flexDirection` on oletuksena `column` (pystysuuntainen) toisin kuin web-CSS:ssä, jossa oletus on `row` (vaakasuuntainen).

### App.tsx pääkomponentti

Alla on esimerkki yksinkertaisesta `App.tsx`-komponentista, joka näyttää otsikon ja tekstikappaleen:

```tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.otsikko}>Heippa maailma!</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    säilö: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otsikko: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
```

Komponentin rakenne on tuttu web-Reactista:

- **`import`-lauseet**: tuodaan tarvittavat komponentit ja kirjastot. React Native -komponentit tuodaan `react-native`-paketista ja Expo-kohtaiset komponentit `expo-*`-paketeista.
- **Komponenttifunktio**: `App` on funktiokomponentti, joka palauttaa JSX-elementin.
- **`return`-lause**: palauttaa komponentin näkymän JSX-muodossa. Juuritasolla on aina yksi komponentti, tässä `<View>`.
- **`export default App`**: vie komponentin muiden tiedostojen käytettäväksi. Expo odottaa `App.tsx`-tiedoston vievän pääkomponentin `export default`-lauseella.
- **`StatusBar`**: Expon komponentti, joka hallinnoi mobiililaitteen tilapalkin ulkoasua. Tilapalkki on näytön yläreuna, jossa näkyy kellonaika, akun tila ja verkon signaali.

---

## 5. Sovelluksen ohjelmointi vaiheittain

Tässä osiossa rakennetaan yksinkertainen tervehdyssovellus, jossa käyttäjä syöttää nimensä tekstikenttään ja saa personoidun tervehdyksen painamalla nappia. Sovellus havainnollistaa `useRef`- ja `useState`-hookien käyttöä React Nativessa sekä ehdollista renderöintiä.

### Vaihe 1: react-native-safe-area-context -riippuvuuden asentaminen

Sovellus käyttää `SafeAreaView`-komponenttia, joka varmistaa, että käyttöliittymä ei piirry mobiililaitteen kameran tai ilmoituspalkin päälle. Komponentti tulee erillisestä `react-native-safe-area-context` -paketista, joka asennetaan `npx expo install` -komennolla.

Jos kehityspalvelin on käynnissä, sammuta se ensin `Ctrl + C`:llä, asenna paketti ja käynnistä palvelin uudelleen:

```bash
npx expo install react-native-safe-area-context
npx expo start
```

`npx expo install` eroaa tavallisesta `npm install` -komennosta siten, että se valitsee automaattisesti projektin Expo SDK -version kanssa yhteensopivan pakettiversion.

### Vaihe 2: Moduulien tuonti

Korvaa `App.tsx`:n oletussisältö tuomalla tarvittavat moduulit:

```tsx
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

Tuonnit jakaantuvat kolmeen ryhmään: Expon omat paketit (`expo-status-bar`), Reactin hookit (`react`) sekä React Native -komponentit (`react-native`, `react-native-safe-area-context`).

### Vaihe 3: Tilamuuttujat ja tekstikenttäviittaus

Lisää komponentin sisään tilamuuttuja ja `useRef`-viittaus:

```tsx
export default function App() {

    const tekstikentta = useRef<TextInput>(null);
    const [tervehdys, setTervehdys] = useState<string>('');
```

`useRef<TextInput>(null)` luo viittauksen, joka osoittaa myöhemmin `TextInput`-komponenttiin. Viittauksen avulla tekstikenttään pääsee käsiksi suoraan ilman tilamuuttujaa, mikä tarkoittaa, että jokainen näppäimenpainallus ei käynnistä komponentin uudelleenrenderöintiä. `useState<string>('')` puolestaan tallentaa tervehdysviestin, jonka muutos käynnistää renderöinnin ja päivittää näkymän.

### Vaihe 4: Tervehdysmetodi

Lisää `sanoHeippa`-funktio tilamuuttujien jälkeen:

```tsx
    const sanoHeippa = () => {
        const nimi = (tekstikentta.current as any)?.value ?? '';
        setTervehdys(`Heippa ${nimi}!`);
        tekstikentta.current?.clear();
    };
```

Funktio lukee tekstikentän senhetkisen arvon `tekstikentta.current.value`-ominaisuudesta, muodostaa tervehdysmerkkijonon template literalilla ja asettaa sen tilamuuttujaan. Lopuksi se tyhjentää tekstikentän `clear()`-metodilla. `TextInput`-komponentin `.value`-ominaisuus ei kuulu TypeScriptin tyyppimäärittelyihin, joten siihen tarvitaan `as any` -tyyppimuunnos. `?.`-operaattori varmistaa, että koodia ei yritetä ajaa ennen kuin viittaus on kiinnittynyt komponenttiin.

### Vaihe 5: Näkymän rakentaminen

Lisää `return`-lauseen sisältö:

```tsx
    return (
        <SafeAreaView style={styles.container}>

            <Text style={{ fontSize: 20 }}>Demo 4: React Native -perusteita</Text>

            <Text style={styles.alaotsikko}>Hello world</Text>

            <TextInput
                ref={tekstikentta}
                style={styles.tekstikentta}
                placeholder="Anna nimesi..."
                onChangeText={(teksti) => {
                    if (tekstikentta.current) {
                        (tekstikentta.current as any).value = teksti;
                    }
                }}
            />

            <Button
                title="Sano heippa"
                onPress={sanoHeippa}
            />

            {Boolean(tervehdys) && <Text style={styles.tervehdys}>{tervehdys}</Text>}

            <StatusBar style="auto" />

        </SafeAreaView>
    );
}
```

`SafeAreaView` toimii `View`-komponentin tapaan, mutta lisää automaattisesti tarvittavan ylätilan laitteen kameran ja ilmoituspalkin päälle. `ref={tekstikentta}` kiinnittää viittauksen `TextInput`-komponenttiin, jolloin `tekstikentta.current` viittaa kyseiseen komponenttiin muualla koodissa. `onChangeText` käynnistyy aina, kun käyttäjä kirjoittaa tekstikenttään, ja tallentaa arvon viittauksen kautta muistiin ilman tilamuuttujaa. `Boolean(tervehdys) && ...` on ehdollisen tulostuksen rakenne, joka renderöi `Text`-komponentin vain silloin, kun `tervehdys`-merkkijonossa on sisältöä.

### Vaihe 6: Tyylit

Lisää `StyleSheet`-määrittely komponentin alapuolelle:

```tsx
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 0,
        padding: 10,
    },
    alaotsikko: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    tekstikentta: {
        marginBottom: 20,
    },
    tervehdys: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 20,
    },
});
```

`container`-tyyli asettaa `flex: 1`:n, jolloin `SafeAreaView` täyttää koko näytön. `padding: 10` lisää sisäisen välin kaikille reunoille, joten sisältö ei osu suoraan näytön laitaan. Muut tyylit lisäävät välejä tekstielementtien välille `marginTop`- ja `marginBottom`-ominaisuuksilla.

---

## 6. Muistilista

### React Native -ydinkomponentit

| Komponentti | Käyttötarkoitus |
|-------------|-----------------|
| `<View>` | Yleiskäyttöinen säilökomponentti, vastaa web-kehityksen `<div>`-elementtiä |
| `<Text>` | Kaikki näkyvä teksti on kirjoitettava tämän komponentin sisään |
| `<Image>` | Kuvien näyttäminen tiedostosta tai URL-osoitteesta |
| `<TextInput>` | Tekstinsyöttökenttä, vastaa web-kehityksen `<input type="text">`-elementtiä |
| `<Pressable>` | Painettava alue käyttäjän kosketukselle, vastaa web-kehityksen `<button>`-elementtiä |
| `<ScrollView>` | Vieritettävä säilö tilanteisiin, joissa sisältö voi ylittää näytön koon |
| `<FlatList>` | Tehokas listarenderöinti suurille datajoukoille |
| `<StatusBar>` | Hallinnoi mobiililaitteen tilapalkin ulkoasua (Expo) |

### StyleSheet-ominaisuuksia

| Ominaisuus | Selitys | Esimerkki |
|------------|---------|-----------|
| `flex` | Flexbox-suhde tilankäytölle | `flex: 1` (täyttää kaiken tilan) |
| `flexDirection` | Lasten asettelu (`column`/`row`) | `flexDirection: 'row'` |
| `alignItems` | Poikittaisakselin tasaus | `alignItems: 'center'` |
| `justifyContent` | Pääakselin tasaus | `justifyContent: 'space-between'` |
| `backgroundColor` | Taustaväri | `backgroundColor: '#f0f0f0'` |
| `color` | Tekstin väri (vain `<Text>`) | `color: '#333333'` |
| `fontSize` | Tekstin koko | `fontSize: 18` |
| `fontWeight` | Tekstin paksuus | `fontWeight: 'bold'` |
| `margin` | Ulkoinen väli kaikille sivuille | `margin: 16` |
| `padding` | Sisäinen väli kaikille sivuille | `padding: 12` |
| `borderRadius` | Pyöristetyt kulmat | `borderRadius: 8` |

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo uuden Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo start` | Käynnistää Expo-kehityspalvelimen |
| `a` (kehityspalvelimessa) | Avaa sovelluksen Android-emulaattorissa (vaatii Android Studion) |
| `i` (kehityspalvelimessa) | Avaa sovelluksen iOS-simulaattorissa (vaatii Xcoden, macOS) |
| `w` (kehityspalvelimessa) | Avaa sovelluksen selaimessa |
| `r` (kehityspalvelimessa) | Lataa sovellus uudelleen mobiililaitteella |
| `j` (kehityspalvelimessa) | Avaa JavaScript-debuggerin |
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
