import express from "express";
import path from "path";
import { prisma } from "./lib/prisma";
import multer from "multer";
import fs from "fs/promises";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3003;

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

app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));

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

app.get("/lataa", (req: express.Request, res: express.Response) => {
    res.render("lataa", { virhe: "", teksti: "" });
});

app.get("/", async (req: express.Request, res: express.Response): Promise<void> => {
        res.render("index", {kuvat: await prisma.kuva.findMany()});
    },
);

app.listen(port, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});
