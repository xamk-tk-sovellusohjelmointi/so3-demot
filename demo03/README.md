# Demo 3: Tiedostojen upload

## Oppimistavoitteet

Tämän demon jälkeen opiskelija:

- tietää, mitä server-side rendering (SSR) ja template-moottorit ovat
- osaa käyttää EJS-template-moottoria Express-palvelimessa HTML-sivujen renderöintiin
- osaa toteuttaa tiedostojen latauksen palvelimelle Multer-middlewarella
- osaa alustaa Prisma 7 -tietokannan SQLite-ajurilla ja tallentaa tietoja tietokantaan
- osaa tarjoilla staattisia tiedostoja (CSS, fontit, kuvat) Express-palvelimesta

---

## 1. Keskeiset käsitteet

### EJS – template-moottori

[EJS](https://ejs.co/) (Embedded JavaScript) on **template-moottori**, jonka avulla palvelin voi tuottaa dynaamisia HTML-sivuja. Tätä kutsutaan **server-side renderingiksi** (SSR), jossa palvelin muodostaa valmiin HTML-sivun ohjelmallisesti ja lähettää sen selaimelle. EJS-tiedostot ovat tavallisia HTML-tiedostoja, joihin on upotettu JavaScript-koodia erityisten tunnisteiden sisään:

| Tunniste | Käyttötarkoitus |
|----------|-----------------|
| `<%= muuttuja %>` | Tulostaa muuttujan arvon HTML-sivulle |
| `<%- include('tiedosto') %>` | Sisällyttää toisen EJS-tiedoston |
| `<% koodi %>` | Suorittaa JavaScript-koodia ilman tulostusta |

Esimerkiksi `<%= kuva.teksti %>` tulostaa tietokannasta haetun kuvatekstin HTML-sivulle, ja `<% kuvat.forEach(...) %>` iteroi kuvien listan.

Expressissä template-moottori otetaan käyttöön `app.set("view engine", "ejs")` -asetuksella, jonka jälkeen `res.render("index", { kuvat })` renderöi `views/index.ejs`-tiedoston ja välittää sille `kuvat`-muuttujan käytettäväksi templatessa. Express etsii renderöitävät tiedostot automaattisesti `views/`-kansiosta.

### Multer – tiedostojen lataus

Selainpohjainen **tiedostojen lataus** (file upload) tapahtuu HTML-lomakkeella, jonka `enctype`-attribuutti on `multipart/form-data`. Tämä tarkoittaa, että lomakkeen data lähetetään palvelimelle binäärimuodossa tavallisen tekstimuodon sijaan, jota Express ei osaa käsitellä oletuksena.

[Multer](https://github.com/expressjs/multer) on Express-middleware, joka käsittelee `multipart/form-data`-muotoisia pyyntöjä. Se lukee ladatun tiedoston pyynnön tiedoista, tallentaa sen väliaikaisesti palvelimen levylle ja kiinnittää tiedoston tiedot `req.file`-objektiin reitinkäsittelijän käytettäväksi.

Multerin käsittelemä tiedoston lataus etenee demossa kolmessa vaiheessa:

1. Selain lähettää lomakkeen ja liitetyn tiedoston `POST`-pyyntönä palvelimelle.
2. Multer vastaanottaa binääridatan, validoi tiedoston (koko, tyyppi) ja tallentaa sen väliaikaiseen kansioon.
3. Reitinkäsittelijä siirtää tai kopioi tiedoston lopulliseen sijaintiin ja tallentaa metatiedot tietokantaan.

### Prisma – ORM ja tietokantahallinta

[Prisma](https://www.prisma.io/) on moderni ORM (Object-Relational Mapper) Node.js-sovelluksille. ORM tarkoittaa, että tietokantakyselyt kirjoitetaan TypeScript-koodina SQL:n sijaan, ja Prisma muuntaa ne automaattisesti oikeaksi SQL:ksi. Tämä mahdollistaa tyyppiturvallisen tietokantakäsittelyn eli TypeScript tietää tietokantataulujen kentät ja niiden tyypit, joten virheet havaitaan koodieditorissa ennen suoritusta.

Prismaan kuuluu kolme osaa:

- **Prisma Schema** (`prisma/schema.prisma`): kuvaa tietokannan taulut ja niiden kentät deklaratiivisella syntaksilla. Schema on sekä tietokannan rakenteen lähde, että TypeScript-tyyppien pohja.
- **Prisma Migrate**: muuntaa skeeman muutokset SQL-migraatiotiedostoiksi ja suorittaa ne tietokantaan.
- **Prisma Client** (`generated/prisma/`): automaattisesti generoitu TypeScript-asiakasobjekti, jonka kautta tietokantakyselyt tehdään koodissa.

### SQLite

[SQLite](https://www.sqlite.org/) on kevyt relaatiotietokanta, joka tallentaa koko tietokannan yhteen tiedostoon (`.db`). Se ei tarvitse erillistä palvelinta eikä asennusta, minkä takia se sopii erinomaisesti pieniin sovelluksiin ja kehitysympäristöihin. Demossa tietokanta on `dev.db`-tiedostossa projektin juuressa.

### Demosovellus

Demossa 3 toteutetaan **kuvagalleriasovellus**, johon käyttäjä voi ladata kuvia lomakkeen kautta. Ladatut kuvat tallennetaan palvelimen tiedostojärjestelmään ja niiden metatiedot (kuvateksti, tiedostonimi, aikaleima) kirjataan tietokantaan. Sovelluksen etusivu hakee kuvat tietokannasta ja renderöi ne EJS-templatella.

Demon keskeinen ydinaihe on **tiedostojen lataaminen palvelimelle Multer-middlewarella**. Tiedostojen lataus on verkkosovellusten perustoiminnallisuus, jolla voidaan toteuttaa esimerkiksi profiilikuvien vaihtaminen, dokumenttien jakamista ja kuvagallerioita. Demo opettaa, miten pyynnössä lähetetyn tiedoston binääridata vastaanotetaan, validoidaan ja tallennetaan turvallisesti palvelimen tiedostojärjestelmään.

Sovelluksessa on kaksi sivua, jotka toteuttavat seuraavat HTTP-metodit:

| Sivu | Metodi | Polku | Kuvaus |
|------|--------|-------|--------|
| index.ejs (Kuvagallerian etusivu) | GET | `/` | Hakee kuvat tietokannasta ja näyttää ne korttilistana |
| lataa.ejs (Kuvien lataussivu) | GET | `/lataa` | Näyttää lomakkeen kuvan lataamiseen |
| lataa.ejs (Kuvan vastaanotto) | POST | `/lataa` | Vastaanottaa kuvan, validoi, tallentaa ja ohjaa etusivulle |

---

## 2. Projektin alustaminen

### Vaihe 1: Projektin kansio

Luodaan uusi kansio projektia varten ja avataan se VS Codessa:

```bash
mkdir demo03 # Kansion voi myös luoda VS Coden käyttöliittymässä tai resurssinhallinnassa ja avata sen suoraan VS Codeen
cd demo03
```

Alustetaan Node.js-projekti oletustiedoilla:

```bash
npm init -y
```

Lisätään `package.json`:iin `"type": "module"`, jotta projekti käyttää ES-moduulisyntaksia, sekä käynnistysskripti:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts"
  }
}
```

`tsx watch` käynnistää palvelimen ja seuraa tiedostomuutoksia. Aina kun tiedosto tallennetaan, palvelin käynnistyy automaattisesti uudelleen. Sovellus käynnistetään komennolla `npm run dev`.

### Vaihe 2: Riippuvuuksien asentaminen

```bash
npm install express ejs multer dotenv @prisma/client @prisma/adapter-better-sqlite3 bootstrap-icons
npm install --save-dev typescript tsx @types/node @types/express @types/multer @types/better-sqlite3 prisma
```

Paketit jaetaan kahteen ryhmään:

**Suorituksen aikaiset riippuvuudet (`npm install`):**
- `express`: Web-sovelluskehys HTTP-palvelimelle
- `ejs`: Template-moottori HTML-sivujen renderöintiin
- `multer`: Middleware tiedostojen lataukseen lomakkeelta
- `dotenv`: Lataa `.env`-tiedoston muuttujat `process.env`-objektiin
- `@prisma/client`: Prisma Clientin runko
- `@prisma/adapter-better-sqlite3`: SQLite-ajurisovitin Prisma 7:lle
- `bootstrap-icons`: Bootstrap-ikonisto

**Kehitysriippuvuudet (`--save-dev`):**
- `typescript`, `tsx`: TypeScript-tuki ja kehityspalvelin
- `@types/*`: TypeScript-tyypit Node.js:lle, Expressille, Multerille ja better-sqlite3:lle
- `prisma`: Prisma CLI -työkalu (`init`, `migrate`, `generate`). Tarvitaan vain kehitysvaiheessa.

> **Huomio:** Bootstrap CSS -tyylikirjastoa ei asenneta npm-pakettina. Sen sijaan `bootstrap.min.css`-tiedoston sisältö on ladattu Bootstrapin verkkosivuilta ja kopioitu käsin `public/css/`-kansioon. Tämä lähestymistapa on valittu, koska `express.static` tarjoilee tiedostot `public/`-kansiosta eikä `node_modules/`-kansiosta, joten CSS-tiedoston on joka tapauksessa sijaittava `public/`-kansiossa. Bootstrap Icons sen sijaan asennetaan npm-pakettina, koska se sisältää fonttitiedostoja, jotka kopioidaan `node_modules/`-kansiosta `public/fonts/`-kansioon. Asentamalla tyylitiedostot ja fontit paikallisiin tiedostoihin voidaan välttää yhdistäminen kolmannen osapuolen palveluihin.

### Vaihe 3: TypeScript-konfiguraatio

Alustetaan TypeScript-konfiguraatio:

```bash
npx tsc --init
```

Komento luo `tsconfig.json`-tiedoston oletuasetuksilla. Muokataan tiedosto seuraavanlaiseksi:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "target": "es2023",
    "lib": ["esnext"],
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "esModuleInterop": true,
    "noEmit": true,
    "moduleResolution": "bundler"
  }
}
```

Osa asetuksista tulee `tsc --init` -komennosta oletuksena. Projektin ja Prisman kannalta oleellisimmat asetukset:

| Asetus | Arvo | Selitys |
|--------|------|---------|
| `module` | `"esnext"` | Prisma 7 edellyttää ESNext-moduulisyntaksia |
| `moduleResolution` | `"bundler"` | Prisman ajurisovittimen tuonti vaatii `bundler`-resoluution |
| `target` | `"es2023"` | Käännöskohde – Node.js 24 tukee ES2023-syntaksia täysin |
| `strict` | `true` | Tiukka tyyppitarkistus |
| `noEmit` | `true` | TypeScript ei tuota JavaScript-tiedostoja, koska `tsx` suorittaa TypeScriptin suoraan |
| `esModuleInterop` | `true` | Mahdollistaa CommonJS-moduulien tuonnin ES-syntaksilla (esim. `import express from "express"`) |

---

## 3. Prisma-tietokannan alustaminen

Ohjeet pohjautuvat [Prisman viralliseen ohjeistukseen](https://www.prisma.io/docs/prisma-orm/quickstart/sqlite). Alla sama työnkulku selitettynä auki lyhyemmin.

### Vaihe 1: prisma init

Alustetaan Prisma-projekti komennolla:

```bash
npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

Komento luo automaattisesti kolme tiedostoa:

- **`prisma/schema.prisma`** – tietomallin määrittelytiedosto. `--datasource-provider sqlite` asettaa tietokannan tyypiksi SQLiten.
- **`prisma.config.ts`** – Prisma CLI:n konfiguraatiotiedosto projektin juureen.
- **`.env`** – ympäristömuuttujatiedosto tietokantaosoitteelle.

`--output ../generated/prisma` asettaa Prisma Clientin generointipolun. Polku on suhteessa `prisma/`-kansion sijaintiin: `../generated/prisma` tarkoittaa projektin juuressa olevaa `generated/prisma/`-kansiota. Tämä on Prisma 7:n vaatima eksplisiittinen määrittely.

> **Huomio:** Prisma luo `.env`-tiedoston, joka sisältää tietokantaosoitteen. `.env`-tiedostoa **ei tule** ladata GitHubiin, koska se voi sisältää arkaluontoisia tietoja. Tiedosto lisätään automaattisesti `.gitignore`-tiedostoon. Tästä syystä `.env`-tiedosto ei ole mukana kloonatussa projektissa, ja se on luotava käsin uudelleen **palvelimen juureen** (tämä tehdään kohta).

Alustuksen jälkeen `prisma/schema.prisma` näyttää tältä:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

`provider = "prisma-client"` on Prisma 7:n uusi generaattori (vanhemmissa versioissa käytettiin `prisma-client-js`). Datasource-lohkossa ei ole `url`-kenttää, koska tietokantaosoite on siirretty `prisma.config.ts`-tiedostoon.

Generoitu `prisma.config.ts` näyttää tältä:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

`import "dotenv/config"` lataa `.env`-tiedoston muuttujat ennen kuin ympäristömuuttujia luetaan. `env("DATABASE_URL")` on Prisman oma apufunktio, joka lukee nimetyn ympäristömuuttujan. Se toimii kuten `process.env["DATABASE_URL"]`, mutta tuottaa selkeämmän virheilmoituksen, jos ympäristömuuttuja puuttuu. `defineConfig` on Prisman apufunktio, joka tyypittää konfiguraatio-objektin.

Generoitu `.env`-tiedosto sisältää tietokantaosoitteen:

```
DATABASE_URL="file:./dev.db"
```

`file:./dev.db` on SQLite:n yhteysmerkkijonoformaatti. `./` viittaa projektin juurikansioon. Prisma luo `dev.db`-tiedoston automaattisesti ensimmäisen migraation yhteydessä.

### Vaihe 2: Tietomallin määrittely

Lisätään `Kuva`-malli `prisma/schema.prisma`-tiedostoon:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Kuva {
  id       Int      @id @default(autoincrement())
  teksti   String
  tiedosto String
  aika     DateTime @default(now())
}
```

`model Kuva` määrittelee tietokantataulun kuvagallerian kuvien metatiedoille. Kenttien selitykset:

| Kenttä | Prisma-tyyppi | Huomio |
|--------|--------------|--------|
| `id` | `Int` | `@id` = pääavain, `@default(autoincrement())` = kasvaa automaattisesti |
| `teksti` | `String` | Kuvan kuvateksti |
| `tiedosto` | `String` | Tiedoston nimi `public/img/`-kansiossa |
| `aika` | `DateTime` | `@default(now())` = asetetaan automaattisesti tallennushetkeen |

### Vaihe 3: Migraatio ja Prisma Clientin generointi

Luodaan ensimmäinen migraatio:

```bash
npx prisma migrate dev --name init
```

Komento tekee kaksi asiaa. Ensimmäisenä se luo migraatiotiedoston `prisma/migrations/`-kansioon – tiedosto sisältää SQL-lausekkeen, joka luo `Kuva`-taulun. Toiseksi se luo SQLite-tietokantatiedoston `dev.db` projektin juureen ja ajaa migraation.

Generoidaan sen jälkeen Prisma Client skeeman pohjalta:

```bash
npx prisma generate
```

Komento tuottaa TypeScript-koodin `generated/prisma/`-kansioon. Kansio sisältää muun muassa `client.ts`-tiedoston, josta `PrismaClient` ja `Kuva`-tyyppi tuodaan sovelluskoodiin. `prisma migrate dev` ei generoi clientiä automaattisesti, joten `prisma generate` on suoritettava erikseen. Schemaan tehtävien muutosten jälkeen molemmat komennot on ajettava uudelleen.

`generated/`-kansiota ei lisätä versionhallintaan, koska se generoidaan aina paikallisesti `prisma generate` -komennolla.

### Vaihe 4: Prisma-asiakasobjekti

Luodaan `lib/`-kansio projektin juureen ja sinne `prisma.ts`-tiedosto:

```typescript
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env["DATABASE_URL"] ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

`lib/prisma.ts` alustaa Prisma-asiakasobjektin ja vie sen muiden moduulien käytettäväksi. Prisma 7 vaatii eksplisiittisen **ajurisovittimen** (driver adapter) jokaiselle tietokantayhteydelle. `PrismaBetterSqlite3` on SQLite-yhteyden adapteri, joka välittää Prisma Clientin kyselyt `better-sqlite3`-kirjastolle. `PrismaClient` vastaanottaa adapterin parametrina.

---

## 4. Palvelinsovelluksen alustaminen ja EJS:n käyttöönotto

Ennen EJS-näkymien rakentamista luodaan toimiva palvelinrunko, jossa EJS on otettu käyttöön. Varmistetaan, että perusasetukset toimivat ennen lisätoiminnallisuuksien toteuttamista.

### Vaihe 1: index.ts-palvelinrunko

Luodaan `index.ts` projektin juureen:

```typescript
import express from "express";
import path from "path";
import { prisma } from "./lib/prisma";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3003;

app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));

app.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
    res.render("index", { kuvat: await prisma.kuva.findMany() });
});

app.listen(port, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});
```

`app.set("view engine", "ejs")` kertoo Expressille, että `res.render()`-kutsuissa käytetään EJS-template-moottoria. Express etsii renderöitävät tiedostot automaattisesti `views/`-kansiosta.

`express.static()` rekisteröi middlewaren, joka tarjoilee `public/`-kansion tiedostot suoraan HTTP-pyyntöihin. `path.resolve(import.meta.dirname, "public")` rakentaa absoluuttisen polun `public/`-kansioon. `import.meta.dirname` on ES-moduuleissa saatavilla oleva vakio, joka kertoo nykyisen tiedoston sijainnin.

`prisma.kuva.findMany()` hakee kaikki `Kuva`-taulun rivit tietokannasta ja palauttaa ne taulukkona.

### Vaihe 2: Ensimmäinen EJS-näkymä

Luodaan `views/`-kansio ja sinne `index.ejs` väliaikaisella sisällöllä:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demo 3</title>
</head>
<body>
    <h1>Kuvagalleria</h1>
    <p>Kuvia tietokannassa: <%= kuvat.length %></p>
</body>
</html>
```

Käynnistetään palvelin ja tarkistetaan, että sivu avautuu:

```bash
npm run dev
```

Avataan selaimessa `http://localhost:3003`. Sivulla pitäisi näkyä otsikko ja kuvien lukumäärä (0, koska tietokanta on tyhjä).

---

## 5. Staattiset tiedostot ja Bootstrap

### Vaihe 1: Kansiorakenne

Luodaan `public/`-kansio alikansiorakenteineen:

```
public/
├── css/       # Bootstrap CSS ja omat tyylit
├── fonts/     # Ikonit ja fontit
└── img/       # Ladattujen kuvien tallennuskansio
```

### Vaihe 2: Bootstrap CSS

Bootstrap CSS -tiedostoa ei asenneta npm-pakettina, vaan se ladataan Bootstrapin verkkosivuilta ([getbootstrap.com](https://getbootstrap.com/)) ja tallennetaan käsin `public/css/bootstrap.min.css`-tiedostoksi. Vaihtoehtoisesti voidaan kopioida suoraan CDN-linkistä:

```bash
curl -o public/css/bootstrap.min.css https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css
```

Tämä lähestymistapa tarkoittaa, että Bootstrap CSS on osa projektin staattisia tiedostoja eikä sitä tarvitse asentaa uudelleen `npm install` -komennolla. Tiedosto tarjoillaan `express.static`-middlewaren kautta.

### Vaihe 3: Bootstrap Icons

Bootstrap Icons on asennettu npm-pakettina. Kopioidaan tiedostot `public/fonts/`-kansioon:

```bash
cp -r node_modules/bootstrap-icons/font public/fonts/bootstrap-icons/
```

Komento kopioi `font/`-kansion kokonaisuudessaan (CSS-tiedosto ja fonttitiedostot) `public/fonts/bootstrap-icons/font/`-polkuun.

Toinen vaihtoehto on avata node_modules-kansio, etsiä bootstrap-icons-alikansio ja kopioida se käsin public-kansioon.

### Vaihe 4: Omat tyylit

Luodaan `public/css/style.css` omia tyylejä varten:

```css
.display-1 {
    font-size: 24pt;
}

.display-2 {
    font-size: 18pt;
}

.container {
    margin-top: 30px;
}

form {
    margin-top: 20px;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 10px;
}

.card {
    margin: 10px 0;
    width: 18rem;
}

.alert {
    margin: 10px 0;
}
```

### Vaihe 5: Header- ja footer-templatejen luominen

Luodaan `views/includes/`-kansio ja sinne `header.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/fonts/bootstrap-icons/font/bootstrap-icons.min.css">
    <link href="/css/style.css" rel="stylesheet">
    <title>Demo 3</title>
</head>
<body>

    <div class="container-lg">
        
    <h1 class="display-1">Demo 3: Tiedostojen upload</h1>
```

Linkkien polut alkavat `/`-merkillä, mikä tarkoittaa, että ne viittaavat `express.static`-middlewaren kautta tarjoiltuihin tiedostoihin `public/`-kansiossa. `/css/bootstrap.min.css` vastaa `public/css/bootstrap.min.css` ja `/fonts/bootstrap-icons/font/bootstrap-icons.min.css` vastaa `public/fonts/bootstrap-icons/font/bootstrap-icons.min.css`.

`container-lg` on Bootstrapin leveyteen rajoitettu konttielementti, joka toimii muuten kuten `container`, mutta on hieman leveämpi suurilla näytöillä.

Luodaan `views/includes/footer.ejs`:

```html
    </div>
    
</body>
</html>
```

---

## 6. EJS-näkymät

### Vaihe 1: Kuvagallerian etusivu (index.ejs)

Korvataan `views/index.ejs`:n sisältö käyttämään header- ja footer-templateja sekä näyttämään ladatut kuvat:

```html
<%- include('includes/header'); %>

    <h2 class="display-2">Kuvagalleria</h2>

    <a href="/lataa" type="button" class="btn btn-primary"><i class="bi bi-plus-lg"></i> Lisää uusi kuva</a>

    <% if (kuvat.length > 0) { %>

        <% kuvat.forEach((kuva) => { %>
            
            <div class="card">
                <img class="card-img-top" src="/img/<%=kuva.tiedosto%>" alt="<%=kuva.tiedosto%>">
                <div class="card-body">
                    <p class="card-title"><%=kuva.teksti%></p>
                    <p class="card-text">Ladattu: <%=kuva.aika.toLocaleString()%></p>
                </div>
            </div>
            

        <% }); %>

    <% } else { %>

        <p>Ei kuvia</p>

    <% } %>

<%- include('includes/footer'); %>
```

`<%- include('includes/header') %>` sisällyttää header-tiedoston. Miinus-merkki (`-`) tarkoittaa, että sisällytettyä HTML-koodia ei escapoida (erikoismerkkejä ei muuteta HTML-entiteeteiksi), mikä on oikea tapa HTML-tiedostojen sisällyttämiseen.

`<% if (kuvat.length > 0) { %>` tarkistaa, onko tietokannassa kuvia. Jos ei ole, näytetään "Ei kuvia" -teksti. `<% kuvat.forEach((kuva) => { %>` iteroi kuvat-taulukon. `<%= kuva.tiedosto %>` tulostaa tiedoston nimen, josta rakentuu kuvan URL muodossa `/img/abc123.jpeg`. `kuva.aika.toLocaleString()` muotoilee `DateTime`-objektin paikallisen ajan mukaiseksi merkkijonoksi.

### Vaihe 2: Kuvan latauslomake (lataa.ejs)

Luodaan `views/lataa.ejs` latauslomakkeelle:

```html
<%- include("./includes/header"); %>

    <h2 class="display-2">Lisää uusi kuva galleriaan</h2>

    <% if (Boolean(virhe)) { %>

        <div class="alert alert-danger" role="alert"><%=virhe%></div>

    <% } %>

    <form action="/lataa" method="post" enctype="multipart/form-data">
        <div class="mb-3">
            <label for="tiedosto" class="form-label">Lataa tiedosto koneeltasi...</label>
            <input type="file" name="tiedosto" id="tiedosto" class="form-control" aria-describedby="tiedostoApu">
            <div id="tiedostoApu" class="form-text">Lataa vain jpg/jpeg/gif -kuvia</div>
        </div>
        <div class="mb-3">
            <label for="teksti" class="form-label">Kuvateksti</label>
            <input type="text" name="teksti" id="teksti" class="form-control" value="<%=teksti%>">
        </div>
        <button type="submit" class="btn btn-primary">Lähetä</button>
        <a type="button" href="/" class="btn btn-secondary">Palaa etusivulle</a>
    </form>

<%- include("./includes/footer"); %>
```

**`<form>`-elementin attribuutit**

Lomake-elementti määrittelee, miten ja minne selaimen keräämä data lähetetään:

| Attribuutti | Arvo | Selitys |
|-------------|------|---------|
| `action` | `"/lataa"` | Polku, johon lomakkeen data lähetetään. Vastaa palvelimen `app.post("/lataa", ...)` -reittikäsittelijää. |
| `method` | `"post"` | HTTP-metodi. `POST` lähettää datan pyynnön rungossa, ei URL-osoitteessa kuten `GET`. |
| `enctype` | `"multipart/form-data"` | Koodaustapa, jolla selain pakkaa lomakkeen datan. Tämä on **välttämätön** tiedostojen latauksessa. Ilman sitä selain lähettäisi lomakkeen tavallisena tekstinä (`application/x-www-form-urlencoded`), eikä Multer saisi tiedoston binääridataa. |

**Syötekentät ja `name`-attribuutti**

Jokaisella syötekentällä on `name`-attribuutti, joka määrittää **avaimen**, jolla kentän arvoon päästään käsiksi palvelimella. Tämä on lomakkeen ja palvelimen välisen tiedonkulun kannalta keskeisin attribuutti:

| Kenttä | `name` | `type` | Palvelimella saatavilla |
|--------|--------|--------|------------------------|
| Tiedostovalitsin | `"tiedosto"` | `file` | `req.file` (Multerin kautta) |
| Kuvateksti | `"teksti"` | `text` | `req.body.teksti` |

`name="tiedosto"` vastaa Multer-konfiguraation `.single("tiedosto")`-kutsua. Multer etsii pyynnöstä nimenomaan tämännimisen kentän ja kiinnittää ladatun tiedoston `req.file`-objektiin. `name="teksti"` puolestaan päätyy `req.body.teksti`-arvoksi, koska Express jäsentää lomakkeen tekstikentät `req.body`-objektiin kenttien nimien mukaan.

**Muut attribuutit**

`id`-attribuutti yhdistää syötekentän `<label>`-elementin `for`-attribuuttiin. Kun `<label for="tiedosto">` ja `<input id="tiedosto">` vastaavat toisiaan, käyttäjä voi klikata labelia valitakseen kentän. `aria-describedby="tiedostoApu"` yhdistää tiedostokentän sen alla olevaan ohjetekstiin saavutettavuutta varten.

Bootstrap-luokat `form-label`, `form-control`, `form-text`, `mb-3` ja `btn` ovat Bootstrapin lomakekomponenttien tyyliluokkia, jotka tuottavat yhtenäisen ulkoasun ilman erillistä CSS-määrittelyä.

**EJS-logiikka: virheilmoitus ja kenttien esitäyttö**

`Boolean(virhe)` muuntaa merkkijonon totuusarvoksi. Tyhjä merkkijono `""` muuntuu arvoksi `false`, jolloin virheilmoitusta ei näytetä. Kun palvelin renderöi lomakkeen virhetilanteessa (`res.render("lataa", { virhe: "...", teksti: req.body.teksti })`), `virhe` sisältää virheviestin ja `<div class="alert alert-danger">` tulee näkyviin.

`value="<%=teksti%>"` palauttaa käyttäjän aiemmin kirjoittaman kuvatekstin syötekenttään silloin, kun palvelin renderöi lomakkeen uudelleen virheen jälkeen. Tämä parantaa käyttökokemusta, koska käyttäjän ei tarvitse kirjoittaa kuvatekstiä uudelleen korjatessaan esimerkiksi väärää tiedostomuotoa.

---

## 7. Reittikäsittelijät ja Multer

### Vaihe 1: Multerin väliaikainen tallennuskansio

Multer tarvitsee kansion, johon se tallentaa ladatut tiedostot väliaikaisesti. Luodaan `tmp/`-kansio projektin juureen.

> **Huomio:** `tmp/`-kansion on oltava olemassa ennen palvelimen käynnistämistä. Jos kansio puuttuu, Multer kaatuu virheeseen tiedoston tallennuksen yhteydessä.

### Vaihe 2: Multer-konfiguraatio

Lisätään `index.ts`:ään tuonnit ja Multer-konfiguraatio. Lopullinen `index.ts` sisältää kaikki tuonnit tiedoston alussa:

```typescript
import express from "express";
import path from "path";
import { prisma } from "./lib/prisma";
import multer from "multer";
import fs from "fs/promises";
```

Lisätään Multer-konfiguraatio Express-palvelimen porttiasetuksen jälkeen:

```typescript
const uploadHandler: express.RequestHandler = multer({
    dest: path.resolve(import.meta.dirname, "tmp"),
    limits: {
        fileSize: (1024 * 1024 * 0.5), // Sallitaan alle 500kt tiedostot
    },
    fileFilter: (req, file, callback,) => {
        const sallitutKuvatyypit = ["image/jpeg", "image/gif"];

        if (sallitutKuvatyypit.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error());
        }
    }
}).single("tiedosto");
```

`dest` on kansio väliaikaiselle tallennukselle. Multer nimeää ladatut tiedostot satunnaisilla hajautusarvoilla ilman päätettä (esim. `abc123def456`). `limits.fileSize` asettaa sallitun maksimikoon tavuina. `fileFilter` saa jokaiselle ladattavalle tiedostolle `file`-objektin, jonka `mimetype`-kenttä kertoo tiedoston tyypin (esim. `"image/jpeg"`). Jos tyyppi kuuluu sallittuihin, `callback(null, true)` hyväksyy tiedoston. Muutoin `callback(new Error())` hylkää sen ja Multer välittää virheen reitinkäsittelijälle. `.single("tiedosto")` kertoo Multerille, että käsitellään yksi tiedosto, jonka lomakekentän nimi on `"tiedosto"`.

`fs/promises` on Node.js:n tiedosto-operaatioiden moduuli. `promises`-versio palauttaa promiseja, joita voidaan odottaa `await`-avainsanalla.

### Vaihe 3: POST /lataa -reitti

Lisätään reitti kuvan vastaanottamiseen. Reitti käyttää `uploadHandler`-middlewarea, jota kutsutaan manuaalisesti reitinkäsittelijän sisällä:

```typescript
app.post("/lataa", async (req: express.Request, res: express.Response) => {

        uploadHandler(req, res, async (err: any) => {

            if (err instanceof multer.MulterError) {

                res.render("lataa", {
                    virhe: "Tiedosto on tiedostokooltaan liian suuri (> 500kt).",
                    teksti: req.body.teksti,
                });
            } else if (err) {

                res.render("lataa", {
                    virhe: "Väärä tiedostomuoto. Käytä ainoastaan jpg/jpeg/gif-kuvia",
                    teksti: req.body.teksti,
                });
            } else {
                if (req.file) {
                    let tiedostonimi: string = `${req.file.filename}.jpeg`;

                    await fs.copyFile(
                        path.resolve(import.meta.dirname, "tmp", req.file.filename),
                        path.resolve(import.meta.dirname, "public", "img", tiedostonimi),
                    );

                    await prisma.kuva.create({
                        data: {
                            teksti: req.body.teksti || "Nimetön kuva",
                            tiedosto: tiedostonimi,
                        },
                    });
                }
                res.redirect("/");
            }
        });
});
```

`uploadHandler` ottaa kolme argumenttia: `req`, `res` ja callback-funktion, joka kutsutaan latauksen jälkeen. Jos lataus epäonnistuu, callback saa virheolion ensimmäisenä argumenttinaan.

Virheenkäsittely on jaettu kahteen haaraan: `multer.MulterError` syntyy Multerin omasta logiikasta, esimerkiksi liian suuren tiedoston hylkäämisestä. Muu virhe (`else if (err)`) tulee `fileFilter`-funktiosta väärän MIME-tyypin tapauksessa. Molemmissa tapauksissa lomake renderöidään uudelleen virheviestillä ja käyttäjän aiemmin kirjoittama `teksti`-kenttä palautetaan.

Jos virheitä ei ole, Multer on tallentanut tiedoston `tmp/`-kansioon nimellä ilman päätettä. Tiedoston nimeen lisätään `.jpeg`-pääte (`req.file.filename + ".jpeg"`), ja se kopioidaan `fs.copyFile()`-metodilla `public/img/`-kansioon, josta `express.static` tarjoilee sen selaimelle. Lopuksi kuvan metatiedot tallennetaan tietokantaan `prisma.kuva.create()`-kutsulla ja käyttäjä ohjataan etusivulle `res.redirect("/")`.

### Vaihe 4: GET /lataa -reitti

Lisätään reitti latauslomakkeen näyttämiseen:

```typescript
app.get("/lataa", (req: express.Request, res: express.Response) => {
    res.render("lataa", { virhe: "", teksti: "" });
});
```

Renderöi `views/lataa.ejs`-tiedoston tyhjillä arvoilla. `virhe`- ja `teksti`-muuttujat ovat templatessa käytettyjä muuttujia – ne annetaan tyhjinä merkkijonoina, jotta template ei kaadu puuttuvaan muuttujaan.

### Vaihe 5: GET / -reitti (päivitetty)

Etusivun `GET /` -reitti on luotu jo osiossa 4. Se pysyy ennallaan:

```typescript
app.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
        res.render("index", {kuvat: await prisma.kuva.findMany()});
    },
);
```

> **Huomio:** Reittien järjestys `index.ts`:ssä ei vaikuta Expressin toimintaan – Express valitsee reitin aina HTTP-metodin (`GET`, `POST`) ja polun (`/lataa`, `/`) perusteella.

---

## 8. Projektin lopullinen rakenne

```
demo03/
├── lib/
│   └── prisma.ts          # Prisma-asiakasobjektin alustus
├── prisma/
│   ├── schema.prisma      # Tietokantaskeema
│   └── migrations/        # SQL-migraatiotiedostot (versionhallinnassa)
├── public/
│   ├── css/
│   │   ├── bootstrap.min.css   # Bootstrap CSS (ladattu CDN:stä käsin)
│   │   └── style.css           # Omat tyylit
│   ├── fonts/
│   │   └── bootstrap-icons/
│   │       └── font/           # Bootstrap Icons (kopioitu node_modulesista)
│   └── img/               # Ladattujen kuvien tallennuskansio
├── views/
│   ├── includes/
│   │   ├── header.ejs     # Sivun ylätunniste
│   │   └── footer.ejs     # Sivun alatunniste
│   ├── index.ejs          # Kuvagallerian etusivu
│   └── lataa.ejs          # Kuvan latauslomake
├── generated/             # Prisma Clientin generoitu koodi (ei versionhallintaan)
├── tmp/                   # Multerin väliaikainen tallennuskansio
├── .env                   # Ympäristömuuttujat (ei versionhallintaan)
├── index.ts               # Palvelimen päämoduuli
├── package.json
├── prisma.config.ts       # Prisma CLI:n konfiguraatio (luotu automaattisesti)
└── tsconfig.json
```

---

## 9. Muistilista

### Prisma CLI -komennot

| Komento | Selitys |
|---------|---------|
| `npx prisma init --datasource-provider sqlite --output ../generated/prisma` | Luo `schema.prisma`, `prisma.config.ts` ja `.env` automaattisesti |
| `npx prisma migrate dev --name <nimi>` | Luo migraation skeeman muutoksista ja suorittaa sen tietokantaan |
| `npx prisma generate` | Generoi TypeScript-asiakasobjektin `generated/prisma/`-kansioon |
| `npx prisma studio` | Avaa visuaalisen tietokantaeditorin selaimessa |

Schemaan tehdyn muutoksen jälkeen on ajettava aina molemmat: ensin `prisma migrate dev`, sitten `prisma generate`.

### EJS-tunnisteet

| Tunniste | Selitys |
|----------|---------|
| `<%= arvo %>` | Tulostaa arvon HTML-sivulle (erikoismerkit escapoitu) |
| `<%- html %>` | Tulostaa arvon escapoimatta; käytetään `include()`-kutsuissa |
| `<% koodi %>` | Suorittaa JavaScript-koodia |
| `<%- include('polku') %>` | Sisällyttää toisen EJS-tiedoston |

### Multer-konfiguraation asetukset

| Asetus | Selitys |
|--------|---------|
| `dest` | Kansio, johon ladatut tiedostot tallennetaan väliaikaisesti |
| `limits.fileSize` | Suurin sallittu tiedostokoko tavuina |
| `fileFilter` | Funktio, joka hyväksyy tai hylkää tiedoston mimetyypin perusteella |
| `.single("kenttänimi")` | Käsittelee yhden tiedoston; kenttänimi vastaa lomakkeen `name`-attribuuttia |

### Expressin metodit

| Metodi | Selitys |
|--------|---------|
| `app.set("view engine", "ejs")` | Asettaa EJS:n template-moottoriksi |
| `app.use(express.static("public"))` | Tarjoilee `public/`-kansion tiedostot staattisesti |
| `res.render("sivu", { data })` | Renderöi `views/sivu.ejs`:n ja välittää `data`-objektin muuttujana |
| `res.redirect("/")` | Ohjaa selaimen toiseen osoitteeseen |
| `req.file` | Multerin kiinnittämä ladattu tiedostoobjekti |
| `req.body` | Lomakkeen tekstikentät |

---

## Sovelluksen käynnistys

Jos projekti on kloonattu GitHubista, `.env`-tiedostoa ja `dev.db`-tietokantaa ei ole mukana. Ne on luotava ennen käynnistystä:

**1. Asenna riippuvuudet:**

```bash
npm install
```

**2. Luo `.env`-tiedosto** projektin juureen ja lisää siihen tietokantaosoite:

```
DATABASE_URL="file:./dev.db"
```

**3. Luo tietokanta** ajamalla migraatio ja generoimalla Prisma Client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**4. Käynnistä palvelin:**

```bash
npm run dev
```

Jos `generated/`-kansio ja `dev.db` ovat jo olemassa (tietokanta on alustettu aiemmin), riittää:

```bash
npm install
npm run dev
```

Avaa selaimessa `http://localhost:3003`.