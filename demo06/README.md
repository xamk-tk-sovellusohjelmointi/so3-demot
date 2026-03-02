# Demo 6: Expo Kamera

Demossa 6 toteutetaan kuvaussovellus Expon **Camera**-komponenttia käyttäen. Sovelluksessa käyttäjä voi ottaa useita kuvia laitteen kameralla, ja otetut kuvat näytetään aikaleimoineen vieritettävässä listassa aloitusnäkymässä. Sovellus demonstroi myös käyttöoikeuksien pyytämistä ajonaikaisesti sekä näkymien vaihtamista tilamuuttujan perusteella. Käyttöliittymässä otetaan käyttöön uusia komponentteja React Native Paperista: `FAB` (Floating Action Button) ja `Card`.

---

## 1. Projektin alustaminen

Tämän demon alustaminen seuraa samaa kaavaa kuin edelliset demot. Tarkat ohjeet projektin luomisesta ja kehityspalvelimen käynnistämisestä löytyvät [demo 4:n README.md-tiedostosta](../demo04/README.md).

### Vaihe 1: Projektin luominen

Luo projektikansio ja alusta Expo-projekti SDK 54 -versiolla:

```bash
mkdir demo06
cd demo06
npx create-expo-app@latest . --template blank-typescript@sdk-54
```

> **Huom!** Expo SDK 55 on siirtymävaiheessa, eikä Expo Go -sovelluksen julkaistu versio tue sitä vielä täysin. Käytä toistaiseksi `@sdk-54`-määrettä.

### Vaihe 2: Kehityspalvelimen käynnistäminen

```bash
npx expo start
```

Skannaa terminaaliin ilmestyvä QR-koodi Expo Go -sovelluksella (Android) tai laitteen Kamera-sovelluksella (iOS).

---

## 2. expo-camera

`expo-camera` on Expon SDK-komponentti, joka tarjoaa pääsyn laitteen kameraan ja kuvien ottamiseen. Kameran käyttämiseksi pitää tehdä kaksi asiaa: käyttöoikeuden pyytäminen laitteelta ja `CameraView`-elementin renderöiminen näkymässä, joka kuvaa laitteen kameran kuvaa reaaliajassa.

**Asennus:**

```bash
npx expo install expo-camera
```

**Dokumentaatio:** [expo-camera – Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/camera/)

---

### useCameraPermissions

[`useCameraPermissions()`](https://docs.expo.dev/versions/v54.0.0/sdk/camera/#hooks) on React-hook, joka palauttaa tiedon kameran käyttöoikeuksista sekä funktion niiden pyytämiseen:

```tsx
import { useCameraPermissions } from 'expo-camera';

const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();
```

Hookista saadaan taulukon ensimmäiseksi arvoksi objekti, joka kuvaa kameran käytön oikeuksia (`kameraLupa`) ja toiseksi arvoksi funktio oikeuden pyytämiseen (`pyydaKameraLupa`). Lupaobjektin `granted`-kenttä on `true`, jos käyttäjä on myöntänyt luvan, tai `false`, jos käyttäjä ei myöntänyt lupaa kameran käyttöön. Sovelluksen ensimmäisellä käynnistyskerralla lupaa ei ole vielä pyydetty, jolloin `kameraLupa` on `null`.

Oikeuksia pyydetään kutsumalla `pyydaKameraLupa()` asynkronisesti:

```tsx
await pyydaKameraLupa();
```

Ensimmäisen kutsun yhteydessä Expo Go näyttää käyttäjälle käyttöjärjestelmän lupapyyntö-dialogin. Kun käyttäjä on vastannut, `kameraLupa`-tila päivittyy automaattisesti.

---

### CameraView

`CameraView` on komponentti, joka renderöi laitteen kameran kuvan reaaliajassa. Jotta kamerakuva näkyy, komponentti pitää olla näkyvissä sovelluksen näkymässä. Tätä varten sovellukseen tullaan toteuttamaan ehdollinen tulostus sovelluksen aloitusnäkymän ja kuvausnäkymän välille, jotta kamera ei olisi päällä jatkuvasti.

`CameraView`-komponenttiin yhdistetään `useRef`-hook, jonka avulla komponentin metodeihin päästään käsiksi sen ulkopuolelta. `useRef` luo viittauksen renderöityyn komponenttiin, joka tallentuu `kameraRef.current`-kenttään. Tätä viittausta tarvitaan kuvan ottamiseen:

```tsx
import { CameraView } from 'expo-camera';
import { useRef } from 'react';

const kameraRef = useRef<CameraView>(null);

<CameraView style={styles.kuvaustila} ref={kameraRef}>
    {/* kuvauskontrollit */}
</CameraView>
```

Kuva otetaan `takePictureAsync()`-metodilla, johon päästään viittauksen kautta:

```tsx
const kuva = await kameraRef.current!.takePictureAsync();
```

`takePictureAsync()` on asynkroninen metodi, joka ottaa kuvan ja palauttaa `CameraCapturedPicture`-objektin. Huutomerkki (`!`) on TypeScriptin ei-null-väite, joka kertoo kääntäjälle, että `kameraRef.current` ei ole `null` siinä vaiheessa, kun metodia kutsutaan. Tämä pitää paikkansa, koska `takePictureAsync()` kutsutaan ainoastaan silloin kun `CameraView` on renderöity näkymään.

---

### CameraCapturedPicture

`CameraCapturedPicture` on TypeScript-tyyppi, joka kuvaa `takePictureAsync()`-metodin palauttamaa kuvaobjektia. Se ei sisällä kuvan kuvadataa, vaan ainoastaan `uri`-kentän, joka on polku kuvatiedostoon laitteen väliaikaisessa muistissa (kuvat häviävät käynnistysten välillä). Kuvan polkua hyödynnetään kuvan näyttämiseen sovelluksen aloitusnäkymässä kuvan ottamisen jälkeen.

---

## 3. React Native Paper

Demossa 5 esiteltiin **React Native Paper** -komponenttikirjaston asennus ja peruskäyttö. Tässä demossa kirjasto asennetaan uudelleen, ja käyttöön otetaan kaksi uutta komponenttia: `FAB` ja `Card`. Asennusohjeet ovat samat kuin [demo 5:n dokumentaatiossa](../demo05/README.md).

**Asennus:**

```bash
npm install react-native-paper
npx expo install react-native-safe-area-context
```

**Dokumentaatio:** [React Native Paper – Getting started](https://callstack.github.io/react-native-paper/docs/guides/getting-started/)

### FAB

[`FAB`](https://callstack.github.io/react-native-paper/docs/components/FAB/) (Floating Action Button) on painike, joka sijoitetaan kellumaan muun käyttöliittymän päälle. Se sijoitetaan yleensä näytön kulmaan absoluuttisella sijoittelulla:

```tsx
import { FAB } from 'react-native-paper';

<FAB
    style={styles.nappiOtaKuva}
    icon="camera"
    label="Ota kuva"
    onPress={otaKuva}
/>
```

`icon`-propsi määrittää painikkeessa näytettävän ikonin MaterialCommunityIcons-ikonistosta. `label`-propsi lisää ikonin viereen tekstitarran. `style`-propsilla painike sijoitetaan näytön kulmaan `position: 'absolute'`-tyylillä yhdistettynä `bottom`- ja `left`- tai `right`-arvoihin.

### Card

[`Card`](https://callstack.github.io/react-native-paper/docs/components/Card/) on korttimaisesti esittävä säilökomponentti, joka tarjoaa valmiin ulkoasun varjoineen ja pyöristettyine kulmineen. Säilön sisälle voidaan sijoittaa mitä tahansa React-elementtejä alikomponentteineen:

```tsx
import { Image } from 'react-native';
import { Card, Text } from 'react-native-paper';

<Card style={styles.kortti}>
    <Image
        source={{ uri: item.uri }}
        style={styles.korttiKuva}
        resizeMode="contain"
    />
    <Card.Content>
        <Text variant="bodySmall">{item.aikaleima.toLocaleString('fi-FI')}</Text>
    </Card.Content>
</Card>
```

`Card`-komponentin sisään sijoitettu `Image` näyttää kuvan kortin yläosassa. `resizeMode="contain"` skaalaa kuvan mahtumaan kokonaan kuva-alueeseen leikkaamatta, jolloin kuvasuhde säilyy ja mahdollinen tyhjä tila jää läpinäkyväksi. `Card.Content` on sisältöalue tekstille ja muulle tiedolle kortin alla. `Text`-komponentin `variant`-propsi ohjaa tekstin kokoa ja tyyliä Material Design -typografian mukaisesti.

---

## 4. Sovelluksen ohjelmointi vaiheittain

### Vaihe 1: Pakettien asentaminen

Sammuta kehityspalvelin `Ctrl + C`:llä ja asenna demon tarvitsemat paketit:

```bash
npx expo install expo-camera react-native-safe-area-context
npm install react-native-paper
```

Käynnistä kehityspalvelin asennusten jälkeen uudelleen:

```bash
npx expo start
```

### Vaihe 2: Kuvaustiedot-rajapinta ja sovelluksen runko

Korvaa `App.tsx`:n oletussisältö rakentamalla ensin sovelluksen tietorakenteet ja perusrunko. Sovelluksen kuvien ottamisen tilanhallinta on jaettu kahteen TypeScript-rajapintaan (interface) eri tarkoituksia varten:

```tsx
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';

interface Kuvaustiedot {
    kuvaustila?: boolean;
    virhe: string;
    info: string;
}

interface OtettuKuva {
    uri: string;
    aikaleima: Date;
}

export default function App() {

    const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
        kuvaustila: false,
        virhe: "",
        info: ""
    });
    const [kuvat, setKuvat] = useState<OtettuKuva[]>([]);

    const aloitusNakyma = () => {
        return null;
    }

    const kameraNakyma = () => {
        return null;
    }

    return (
        <PaperProvider>
            {!kuvaustiedot.kuvaustila ? aloitusNakyma() : kameraNakyma()}
        </PaperProvider>
    );

}
```

`Kuvaustiedot`-rajapinta sisältää kolme kenttää, jotka liittyvät kameranäkymän tilaan. `kuvaustila` on valinnainen totuusarvo (`?`-merkki), joka määrittää, kumpi näkymistä renderöidään. Valinnainen kenttä voi saada arvon `undefined`, joka käyttäytyy ehdollisessa tarkistuksessa samoin kuin `false`. `virhe` on merkkijono mahdolliselle virheilmoitukselle, jos käyttäjä kieltää kameraluvan. `info` on merkkijono, joka näytetään kameranäkymässä kuvan ottamisen aikana.

`OtettuKuva`-rajapinta kuvaa yksittäisen otetun kuvan tiedot. `uri` on kuvatiedoston sijainti laitteen välimuistissa ja `aikaleima` on kuvan ottamishetki. Otetut kuvat kerätään erilliseen `kuvat`-tilataulukkoon.

Sovelluksen `return`-lauseessa näkymä valitaan ternary-operaattorilla `kuvaustiedot.kuvaustila`-kentän perusteella. Jos `kuvaustila` ei ole `true`, renderöidään `aloitusNakyma()`, muuten `kameraNakyma()`. Molemmat ovat funktioita, jotka palauttavat React-elementtirakenteen, jotka määritellään seuraavissa vaiheissa.

### Vaihe 3: aloitusNakyma

Toteutetaan ensiksi kuvaussovelluksen aloitusnäkymä, joka tulostaa otetut kuvat listassa käyttäjälle. Aloitusnäkymän yläpalkissa on sovelluksen otsikko ja painike, jolla voidaan siirtyä aloitusnäkymästä kuvausnäkymään. Kuvausnäkymä toteutetaan vaiheessa 5.

Päivitä `aloitusNakyma`-funktio palauttamaan sovelluksen perusnäkymä, joka sisältää yläpalkin kamera-painikkeella sekä vieritettävän kuvalistan. Päivitä ensin importaukset:

```tsx
import { StatusBar } from 'expo-status-bar';
import { FlatList, Image, StyleSheet } from 'react-native';
import { Appbar, Card, PaperProvider, Text } from 'react-native-paper';
import { useState } from 'react';
```

Korvaa sitten `aloitusNakyma`:n palautus:

```tsx
    const aloitusNakyma = () => {
        return (
            <>
                <Appbar.Header>
                    <Appbar.Content title="Demo 6: Kamera" />
                    <Appbar.Action
                        icon="camera"
                        onPress={kaynnistaKamera}
                    />
                </Appbar.Header>

                {(Boolean(kuvaustiedot.virhe))
                    ? <Text style={styles.virhe}>{kuvaustiedot.virhe}</Text>
                    : null
                }

                <FlatList
                    data={kuvat}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <Text style={styles.tyhjaLista}>Ei otettuja kuvia vielä.</Text>
                    }
                    renderItem={({ item }) => (
                        <Card style={styles.kortti}>
                            <Image
                                source={{ uri: item.uri }}
                                style={styles.korttiKuva}
                                resizeMode="contain"
                            />
                            <Card.Content>
                                <Text variant="bodySmall" style={styles.aikaleima}>
                                    {item.aikaleima.toLocaleString('fi-FI')}
                                </Text>
                            </Card.Content>
                        </Card>
                    )}
                />

                <StatusBar style="auto" />
            </>
        );
    }
```

Näkymä kääritään tyhjään elementtiin `<>...</>`, koska `Appbar.Header` ja `FlatList` ovat rinnakkaisia elementtejä ja palautus voi olla aina vain yksi päätason elementti.

`Boolean(kuvaustiedot.virhe)` muuntaa merkkijonon totuusarvoksi. Tyhjä merkkijono `""` muuntuu arvoksi `false`, jolloin virheilmoitusta ei näytetä.

`FlatList` on React Nativen tehokas listakomponentti, joka renderöi näytöllä näkyvät listaelementit yksi kerrallaan. 
- `data`-propsi saa argumentiksi kuvataulukon, josta kuvien listaelementit generoidaan.
- `keyExtractor` palauttaa jokaiselle elementille uniikin avaimen perustuen `kuvat`-taulukon indekseihin. 
- `renderItem` määrittää, miten kukin elementti renderöidään.
- `ListEmptyComponent` näytetään, kun lista on tyhjä.
- `contentContainerStyle` tyylittää listan sisältöalueen.

Jokainen kuva renderöidään `Card`-komponentissa, jonka sisälle sijoitetaan `Image`-komponentti. 
- `resizeMode="contain"` näyttää kuvan kokonaan ilman rajausta.
- `Card.Content` sisältää aikaleiman, joka muotoillaan Date-objektin `toLocaleString('fi-FI')`-metodilla suomalaisen käytännön mukaisesti.

### Vaihe 4: Kameran käyttöoikeudet

Toteutetaan seuraavaksi ohjelman logiikka, joka pyytää luvan kameran käyttöön ja tulostaa kuvausnäkymän riippuen kuvaustilasta.

Lisää `useCameraPermissions`-hookki ja `kaynnistaKamera`-funktio. Päivitä `expo-camera`-tuonti:

```tsx
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
```

Lisää hookki ja funktio `App`-funktion alkuun tilamuuttujan alle:

```tsx
    const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();

    const kaynnistaKamera = async () => {
        await pyydaKameraLupa();
        setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila: kameraLupa?.granted,
            virhe: (!kameraLupa?.granted) ? "Ei lupaa kameran käyttöön." : ""
        });
    }
```

`kaynnistaKamera` on asynkroninen funktio. Ensimmäiseksi pyydetään kameralupa `await pyydaKameraLupa()`-kutsulla. Ensimmäisellä käynnistyskerralla kutsu avaa käyttöjärjestelmän lupapyyntö-dialogin. Kun käyttäjä on vastannut, `kameraLupa`-tila päivittyy, ja seuraavalla rivillä asetetaan `kuvaustiedot` sen mukaan.

`kameraLupa?.granted` käyttää optionaalista ketjutusta: jos `kameraLupa` on `null` (lupaa ei ole vielä haettu), lauseke palauttaa `undefined`, joka käyttäytyy kuten `false`. Jos lupa on myönnetty, `granted` on `true`, jolloin `kuvaustila` asettuu `true`:ksi ja näkymä vaihtuu kameraan.

Spread-syntaksi `...kuvaustiedot` säilyttää tilamuuttujan kaikki ennallaan olevat kentät ja päivittää vain erikseen määritellyt kentät (`kuvaustila` ja `virhe`).

### Vaihe 5: kameraNakyma ja CameraView

Lisää `useRef`-hookki ja päivitä `kameraNakyma`-funktio palauttamaan kameranäkymä `CameraView`-komponentteineen ja FAB-painikkeineen. Päivitä importit lisäämällä `useRef` sekä `FAB` React Native Paperista:

```tsx
import { useRef, useState } from 'react';
import { Appbar, FAB, PaperProvider, Text } from 'react-native-paper';
```

Lisää ref tilamuuttujien alle:

```tsx
    const kameraRef = useRef<CameraView>(null);
```

Korvaa `kameraNakyma`:

```tsx
    const kameraNakyma = () => {
        return (
            <CameraView style={styles.kuvaustila} ref={kameraRef}>

                {(Boolean(kuvaustiedot.info))
                    ? <Text style={{ color: "#fff" }}>{kuvaustiedot.info}</Text>
                    : null
                }

                <FAB
                    style={styles.nappiOtaKuva}
                    icon="camera"
                    label="Ota kuva"
                    onPress={otaKuva}
                />

                <FAB
                    style={styles.nappiSulje}
                    icon="close"
                    label="Sulje"
                    onPress={() => setKuvaustiedot({ ...kuvaustiedot, kuvaustila: false })}
                />

            </CameraView>
        );
    }
```

`CameraView` renderöi laitteen kameran kuvan täyttäen oman tilansa kokonaan. `ref={kameraRef}` kytkee viittauksen komponenttiin, jonka kautta kuvan ottaminen onnistuu. `CameraView`-komponentin sisälle sijoitetaan muut elementit absoluuttisesti tyyleillä, jolloin ne näkyvät kameran kuvan päällä.

Infoteksti näytetään samaan tapaan kuin aloitusnäkymässä: `Boolean(kuvaustiedot.info)` tarkistaa, onko infoteksti asetettu. Tekstin väri on valkoinen, jotta se erottuu kameran kuvasta.

Kumpikin `FAB`-painike sijoitetaan absoluuttisesti näytön alareunaan: "Ota kuva" vasemmalle ja "Sulje" oikealle. "Sulje"-painikkeen `onPress`-käsittelijä sulkee kameranäkymän asettamalla `kuvaustila` arvoon `false`. `otaKuva` määritellään seuraavassa vaiheessa.

### Vaihe 6: otaKuva-metodi

Lisää `otaKuva`-funktio `kaynnistaKamera`-funktion jälkeen. Funktio ottaa kuvan kameran kautta, lisää sen kuvataulukkoon aikaleimoineen ja palauttaa käyttäjän aloitusnäkymään. Lisää myös `CameraCapturedPicture` importteihin:

```tsx
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
```

```tsx
    const otaKuva = async () => {

        setKuvaustiedot({
            ...kuvaustiedot,
            info: "Odota hetki..."
        });

        const kuva: CameraCapturedPicture = await kameraRef.current!.takePictureAsync();

        setKuvat([{ uri: kuva.uri, aikaleima: new Date() }, ...kuvat]);
        setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila: false,
            info: ""
        });

    }
```

Funktio on asynkroninen, koska `takePictureAsync()` on asynkroninen metodi. Ennen kuvan ottamista asetetaan `info`-kentäksi "Odota hetki...", joka näkyy kameran kuvan päällä odotusviestinä.

`kameraRef.current!.takePictureAsync()` ottaa kuvan ja palauttaa `CameraCapturedPicture`-olion. `await` odottaa kuvan ottamisen suorittumista ennen kuin ohjelma jatkuu. Otettu kuva lisätään `kuvat`-taulukon alkuun `setKuvat([{ uri: kuva.uri, aikaleima: new Date() }, ...kuvat])` -kutsulla, jolloin uusin kuva näkyy listan ylimpänä. `new Date()` luo aikaleiman kutsumishetkellä. Tämän jälkeen `kuvaustila` asetetaan `false`:ksi, jolloin näkymä vaihtuu takaisin aloitusnäkymään, ja `info`-viesti tyhjennetään.

### Vaihe 7: StyleSheet ja loppuviimeistely

Lisää tyylit `StyleSheet.create()`-kutsuun `App`-funktion ulkopuolelle tiedoston loppuun. `StyleSheet` tuodaan jo `react-native`-importtiin mukana edellisistä vaiheista:

```tsx
const styles = StyleSheet.create({
    kuvaustila: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nappiSulje: {
        position: 'absolute',
        margin: 20,
        bottom: 0,
        right: 0
    },
    nappiOtaKuva: {
        position: 'absolute',
        margin: 20,
        bottom: 0,
        left: 0
    },
    lista: {
        padding: 10,
    },
    kortti: {
        marginBottom: 12,
    },
    korttiKuva: {
        width: '100%',
        aspectRatio: 3 / 4,
    },
    aikaleima: {
        marginTop: 8,
        color: '#666',
    },
    virhe: {
        margin: 10,
        color: 'red',
    },
    tyhjaLista: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
    },
});
```

`kuvaustila` käyttää `flex: 1`:tä ja keskitysarvoja, jotta `CameraView` peittää koko näytön.

`nappiOtaKuva` ja `nappiSulje` käyttävät `position: 'absolute'`-sijoittelua, jolloin ne kelluvat kameranäkymän päällä. `bottom: 0` sijoittaa ne näytön alareunaan ja `left: 0` tai `right: 0` ohjaa ne vastaavaan reunaan. `margin: 20` jättää välin näytön reunasta.

`lista` lisää 10 pikselin sisennyksen kuvalistan sisältöalueelle. `kortti` lisää alareunan välin korttirivien välille. `korttiKuva` asettaa kuvan leveydeksi koko saatavilla olevan tilan (`width: '100%'`) ja korkeuden lasketaan automaattisesti `aspectRatio: 3/4`-kuvasuhteesta, joka vastaa tyypillistä pystysuuntaista kamerakuvaa. `aikaleima` tyylittää aikaleiman pienemmäksi harmaiksi tekstiksi marginaalilla korttikuvan ja tekstin välille. `virhe` ja `tyhjaLista` tyylittävät vastaavat viestit näkyviksi.

Lopullinen ohjelmakoodi vastaa nyt demon `App.tsx`-tiedostoa kokonaisuudessaan.

---

## 5. Muistilista

### expo-camera

| Ominaisuus | Käyttötarkoitus |
|------------|-----------------|
| `useCameraPermissions()` | Hook, joka palauttaa lupaobjektin ja lupafunktion |
| `kameraLupa.granted` | `true`, jos käyttäjä on myöntänyt kameraluvan |
| `pyydaKameraLupa()` | Pyytää kameraluvan; avaa lupapyynnön ensimmäisellä kerralla |
| `<CameraView ref={kameraRef}>` | Renderöi kameran kuvavirran; `ref` mahdollistaa kuvan ottamisen |
| `kameraRef.current!.takePictureAsync()` | Ottaa kuvan asynkronisesti ja palauttaa `CameraCapturedPicture`-olion |
| `CameraCapturedPicture.uri` | Otetun kuvan sijainti laitteen muistissa |

### React Native Paper -komponentit

| Komponentti | Dokumentaatio | Käyttötarkoitus |
|-------------|---------------|-----------------|
| `<PaperProvider>` | [Provider](https://callstack.github.io/react-native-paper/docs/components/Provider/) | Koko sovelluksen juurikomponentti, alustaa teeman ja Safe Area -kontekstin |
| `<Appbar.Header>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkki, sijoittuu automaattisesti tilapalkin alapuolelle |
| `<Appbar.Content>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkin otsikkoteksti |
| `<Appbar.Action>` | [Appbar](https://callstack.github.io/react-native-paper/docs/components/Appbar/) | Yläpalkin ikonipainike |
| `<FAB>` | [FAB](https://callstack.github.io/react-native-paper/docs/components/FAB/) | Kelluva toimintapainike, sijoitetaan yleensä absoluuttisesti näytön kulmaan |
| `<Card>` | [Card](https://callstack.github.io/react-native-paper/docs/components/Card/) | Korttimaisesti esittävä säilökomponentti varjoineen ja pyöristettyine kulmineen |
| `<Card.Content>` | [Card](https://callstack.github.io/react-native-paper/docs/components/Card/) | Kortin tekstisisältöalue |
| `<Text>` | [Text](https://callstack.github.io/react-native-paper/docs/components/Text/) | Material Design -tyyliä noudattava tekstikomponentti; `variant`-propsi ohjaa kokoa |

### React Native -komponentit

| Komponentti | Käyttötarkoitus |
|-------------|-----------------|
| `<FlatList>` | Tehokas listakomponentti, joka renderöi vain näytöllä näkyvät elementit; `ListEmptyComponent` näytetään tyhjällä listalla |
| `<Image>` | Kuvakomponentti; `resizeMode="contain"` näyttää kuvan kokonaan ilman rajausta, `aspectRatio` asettaa kuva-alueen suhteen |

### Expo-komennot

| Komento | Selitys |
|---------|---------|
| `npx create-expo-app@latest . --template blank-typescript@sdk-54` | Luo uuden Expo SDK 54 + TypeScript -projektin nykyiseen kansioon |
| `npx expo install <paketti>` | Asentaa SDK-version kanssa yhteensopivan Expo-paketin |
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
