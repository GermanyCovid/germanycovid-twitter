import dotenv from "dotenv";
import http from "http";
import express from "express";
import expressHandlebars from "express-handlebars";
import cors from "cors";
import morgan from "morgan";
import moment from "moment";
import cron from "node-cron";
import { ImageService } from "./services/image.service";

dotenv.config();

const app = express();
const httpServer = new http.Server(app);

ImageService.createGermanyImage();
ImageService.createIntensivRegisterImage();
cron.schedule("* 12 * * *", () => {
    console.log("RUNNING");
}, { timezone: "Europe/Berlin" });

morgan.token("date", (req: express.Request, res: express.Response) => {
    return moment().format("DD/MM/YYYY HH:mm:ss");
});

app.enable("trust proxy");
app.use(cors({ credentials: true, origin: "*" }));
app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(morgan(` :date[iso] | REQUEST | :method ":url" :status :res[content-length] - :response-time ms`));

app.use("**", (req, res: any, next: () => void) => {
    return res.status(404).end();
});

const port = process.env.PORT || 3000;
httpServer
    .listen(port, () => {
        // LATER
    })
    .on("error", (err) => {
        // LATER
        console.log(err);
    });