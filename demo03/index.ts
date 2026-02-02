import express, { type Application } from 'express';
import path from 'path';
import { prisma } from "./lib/prisma";
import multer from 'multer';
import type { MIMEType } from 'util';

const app : express.Application = express();
const port : number = Number(process.env.PORT) || 3003;
const upload : multer.Multer = multer({ dest: "tmp/"});

app.set("view engine", "ejs");
app.use(express.static(path.resolve(import.meta.dirname, "public")));

app.get("/", async (req : express.Request, res : express.Response) : Promise<void> => {
    let kuvat = await prisma.kuva.findMany();
    res.render("index", { kuvat : [] });
});

app.get("/api/upload", (req : express.Request, res : express.Response) => {
    res.render("upload");
});

app.post("/api/upload", upload.single("file"), async (req : express.Request, res : express.Response) => {
    console.log(req.file?.mimetype.toString().split("/")[1], req.body.description);

    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Palvelin käynnistettiin osoitteeseen: http://localhost:${port}`);
});