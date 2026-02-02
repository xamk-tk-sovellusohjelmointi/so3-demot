import express from 'express';
import path from 'path';
import { prisma } from "./lib/prisma";
import multer, { type FileFilterCallback } from 'multer';
import fs from 'fs/promises';

const app : express.Application = express();
const port : number = Number(process.env.PORT) || 3003;

// Kaikkien latausten käsittelijä middleware
const uploadHandler : express.RequestHandler = multer({
    // Väliaikainen sijainti latauksille
    dest: path.resolve(import.meta.dirname, "tmp"),
    // Tarkistetaan tiedostomuoto ennen levylle kirjoittamista
    fileFilter: (req : express.Request, file : Express.Multer.File, callback : FileFilterCallback) => {
        const sallitutKuvatyypit = ["image/jpeg", "image/jpg"];

        // Jos tiedostomuoto on sallittu
        if (sallitutKuvatyypit.includes(file.mimetype)) {
            callback(null, true); // Hyväksytään
        } else {
            callback(new Error("Vain JPG/JPEG kuvat sallittu"));
        }
    },
    // Tarkistetaan ennen lataamista palvelimelle
    limits: {
        fileSize: (1024 * 1024 * 1.5) // Sallitaan alle 1.5MB tiedostot
    }
}).single("file");



app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));


// Otetaan middleware käyttöön yksittäisessä reitissä
app.post(
    "/api/upload",
    uploadHandler,
    async (req : express.Request, res : express.Response) => {

        // Jos tiedosto ladataan palvelimelle
        if (req.file) {
            // Muodostetaan tiedostolle tiedostonimi. Ladatun tiedoston alkuperäinen nimi ja .jpeg -pääte (riippumatta aiemmasta päätteestä)
            let tiedostonimi = `${req.file.filename}.jpeg`;

            // Kopioidaan kuva väliaikaisten tiedostojen kansiosta staattisiin tiedostoihin img-kansioon
            await fs.copyFile(
                path.resolve(import.meta.dirname, "tmp", req.file.filename), // Alkuperäinen tiedosto ilman päätettä
                path.resolve(import.meta.dirname, "public", "img", tiedostonimi) // Kopio uudessa sijainnissa päätteen kanssa
            );

            await prisma.kuva.create({
                data : {
                    teksti : req.body.description || "Nimetön kuva",
                    tiedosto : tiedostonimi
                }
            });
        }
        res.redirect("/");
});

app.get("/api/upload", (req : express.Request, res : express.Response) => {
    res.render("upload", { virhe : "", teksti : ""});
});

app.get("/", async (req : express.Request, res : express.Response) : Promise<void> => {

    let kuvat = await prisma.kuva.findMany();
    res.render("index", { kuvat });
});

// // Middleware reittien virheiden käsittelylle
// app.use((err : any, req : express.Request, res : express.Response, next : express.NextFunction) => {

//     if (!err) {
//         return next();
//     }
//     // Jos käsitellään tiedostojen latauksen reittiä
//     if (req.path === "upload") {
//         // Jos virhe tulee multerista
//         if (err instanceof multer.MulterError) {
//             return res.render(
//                 "lisaa",
//                 {
//                     virhe : "Tiedosto on tiedostokooltaan liian suuri (> 1.5Mt).",
//                     teksti : req.body.description || ""
//             });
//         // Muut palvelimen virheet
//         } else if (err) {
//             return res.render("upload", {
//                         virhe : "Väärä tiedostomuoto. Käytä ainoastaan jpg-kuvia",
//                         teksti : req.body.description
//                     });
//         }

//         next(err);
//     }

//     res.status(500).json({ virhe : "Palvelimella tapahtui odottamaton virhe" });
// });

app.listen(
    port,
    () => {
        console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
    }
);