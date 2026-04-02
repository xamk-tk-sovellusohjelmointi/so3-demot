# Demo 8: React Context API

## Oppimistavoitteet

Tämän demon jälkeen opiskelija osaa:

- selittää, mikä React Context API on ja miksi sitä käytetään
- tunnistaa prop drilling -ongelman ja ratkaista sen kontekstilla
- luoda kontekstin `createContext`-funktiolla ja Provider-komponentilla
- lukea kontekstin arvoja React 19:n `use`-hookilla
- jakaa sovelluksen tilan ja metodit usean komponentin kesken ilman propseja
- yhdistää React-asiakassovelluksen Express REST API -palvelimeen

---

## 1. React-sovelluksen tilanhallinta

### Prop drilling

React-sovelluksissa tietoa välitetään komponenttien välillä **propsien** kautta. Yksinkertaisissa sovelluksissa tämä toimii hyvin: yläkomponentti antaa tiedon lapsikomponentille, ja lapsi käyttää sitä.

Sovelluksen kasvaessa syntyy tilanne, jossa propseja joudutaan välittämään usean komponenttikerroksen läpi. Välissä olevat komponentit eivät itse tarvitse tietoa, vaan ainoastaan siirtävät sen eteenpäin alemmalle tasolle. Tätä kutsutaan **prop drillingiksi**.

```
App (tila: tehtavat)
  └── Sisalto (props: tehtavat)          ← ei käytä itse, välittää vain eteenpäin
        └── Lista (props: tehtavat)      ← ei käytä itse, välittää vain eteenpäin
              └── Tehtava (props: tehtava) ← käyttää tietoa
```

Prop drilling tekee koodista vaikeammin ylläpidettävää. Jokainen välissä oleva komponentti on sidottu tietoon, jota se ei tarvitse.

### React Context API

**Context API** on Reactin sisäänrakennettu ratkaisu prop drilling -ongelmaan. Sen avulla tila ja metodit voidaan jakaa suoraan niitä tarvitseville komponenteille ilman välitason propseja.

Context API koostuu kolmesta osasta:

| Osa | Tehtävä |
|-----|---------|
| `createContext()` | Luo kontekstin (tietovaraston) |
| `Provider` | Komponentti, joka tarjoaa kontekstin arvon lapsikomponenteille |
| `use()` (React 19) | Hook, jolla lapsikomponentti lukee kontekstin arvon |

Kontekstin kanssa sama esimerkki yksinkertaistuu:

```
TehtavaProvider (tila: tehtavat)
  └── App
        └── Sisalto
              └── Lista
                    └── Tehtava ← lukee tehtävät suoraan kontekstista
```

Jokainen Provider-komponentin sisällä oleva komponentti voi lukea kontekstin arvon suoraan `use`-hookilla. Välitason komponenttien ei tarvitse tietää mitään välitettävästä datasta.

### Kolmannen osapuolen vaihtoehdot

Context API on Reactin oma ratkaisu, joka riittää hyvin useimpiin sovelluksiin. Laajemmissa projekteissa käytetään joskus erillisiä tilanhallintakirjastoja kuten **Redux**, **Zustand** tai **Jotai**. Tällä opintojaksolla keskitytään Context API:n käyttöön.

### Demosovellus

Demossa toteutetaan tehtävälista-sovellus (**fullstack**), jossa React-asiakassovellus kommunikoi Express REST API -palvelimen kanssa. Sovelluksessa voi lisätä tehtäviä, merkitä niitä suoritetuiksi ja poistaa niitä. Tehtävät tallentuvat palvelimelle JSON-tiedostoon.

Asiakassovelluksen käyttöliittymä rakennetaan **Material UI** (MUI) -komponenttikirjastolla. Sovelluksen tila ja logiikka hallitaan yhdessä kontekstitiedostossa, ja jokainen käyttöliittymäkomponentti lukee tarvitsemansa tiedot suoraan kontekstista.

| Komponentti | Tehtävä |
|-------------|---------|
| `TehtavaContext.tsx` | Konteksti ja Provider: tila, metodit, palvelinyhteys |
| `App.tsx` | Pääkomponentti: asettelu ja "Lisää tehtävä" -painike |
| `Otsikko.tsx` | Sovelluksen otsikko |
| `Tehtavalista.tsx` | Tehtävien listaus, suoritusmerkintä, poistopainike |
| `LisaaTehtava.tsx` | Lisäysdialogi uudelle tehtävälle |
| `PoistaTehtava.tsx` | Vahvistusdialogi tehtävän poistolle |

Palvelinsovellus tarjotaan valmiina. Se on yksinkertainen Express 5 REST API, joka tallentaa tehtävät paikalliseen JSON-tiedostoon.

| Metodi | Polku | Kuvaus |
|--------|-------|--------|
| GET | `/api/tehtavalista` | Palauttaa kaikki tehtävät JSON-taulukkona |
| POST | `/api/tehtavalista` | Korvaa tehtävälistan pyynnön rungon taulukolla |

## Sisällys

### [Asiakassovelluksen ohjeistus](./client/README.md)
### [Palvelinsovelluksen ohjeistus](./server/README.md)
