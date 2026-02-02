import express from "express";
import path from "path";
import { prisma } from "./lib/prisma";
import multer, { type FileFilterCallback } from "multer";
import fs from "fs/promises";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3003;

// Määritetään multer ladattujen tiedostojen käsittelyä varten
const uploadHandler: express.RequestHandler = multer({
    // Mihin multer tallentaa ladatut kuvat. Voidaan ajatella tässä demossa väliaikaisena sijaintina ennen pysyvää tallennusta
    dest: path.resolve(import.meta.dirname, "tmp"),
    // Tarkistetaan kuvan koko ennen lataamista palvelimelle
    limits: {
        fileSize: 1024 * 1024 * 0.5, // Sallitaan alle 500kt tiedostot
    },
    // Tarkistetaan tiedostomuoto
    fileFilter: (req, file, callback,) => {
        const sallitutKuvatyypit = ["image/jpeg", "image/gif"];

        // Jos tiedostomuoto on sallittu
        if (sallitutKuvatyypit.includes(file.mimetype)) {
            callback(null, true); // Hyväksytään
        } else {
            callback(new Error());
        }
    },
    
}).single("file");

app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));

// Otetaan middleware käyttöön yksittäisessä reitissä
app.post("/upload", async (req: express.Request, res: express.Response) => {

        // Kutsutaan multer middleware vasta täällä callbackin sisällä virhetilanteiden käsittelyä ja tulostusta varten
        uploadHandler(req, res, async (err: any) => {
            // Jos kyseessä on multerin oma validointivirhe, tässä tapauksessa limits-asetuksen aiheuttamana
            if (err instanceof multer.MulterError) {
                // Renderöidään lataussivu uudestaan virheilmoituksen kanssa
                res.render("upload", {
                    virhe: "Tiedosto on tiedostokooltaan liian suuri (> 500kt).",
                    teksti: req.body.teksti,
                });
            } else if (err) { // Jos kyseessä on tiedostomuotoon liittyvä oma virhe (new Error())
                res.render("upload", {
                    virhe: "Väärä tiedostomuoto. Käytä ainoastaan jpg-kuvia",
                    teksti: req.body.teksti,
                });
            } else {
                // Jos validointi menee läpi ja tiedosto ladataan palvelimelle
                if (req.file) {
                    // Määritetään tiedoston tallentamista varten varsinainen tiedostonimi päätteen kanssa.
                    let tiedostonimi: string = `${req.file.filename}.jpeg`;

                    // Kopioidaan kuva väliaikaisten tiedostojen kansiosta staattisiin tiedostoihin public/img
                    await fs.copyFile(
                        path.resolve(import.meta.dirname, "tmp", req.file.filename), // Alkuperäinen tiedosto tmp-kansiosta ilman päätettä
                        path.resolve(import.meta.dirname, "public", "img", tiedostonimi), // Kopio uudessa sijainnissa public/img päätteen kanssa
                    );

                    // Tallennetaan kuvan muut tiedot tietokantaan.
                    await prisma.kuva.create({
                        data: {
                            teksti: req.body.description || "Nimetön kuva",
                            tiedosto: tiedostonimi,
                        },
                    });

                    // Nyt kuva itsessään on palvelimen staattisissa tiedostoissa ja sen hakemiseen tarvittavat tiedot ovat Prisman tietokannassa
                }
                res.redirect("/");
            }
        });
    },
);

app.get("/upload", (req: express.Request, res: express.Response) => {
    res.render("upload", { virhe: "", teksti: "" });
});

app.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
        res.render("index", {kuvat: await prisma.kuva.findMany()});
    },
);

app.listen(port, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});
