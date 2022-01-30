import dotenv from "dotenv";
import cron from "node-cron";
import { ImageService } from "./services/image.service";

dotenv.config();

ImageService.createGermanyImage();
ImageService.createIntensivRegisterImage();
ImageService.createMapImage("districts");
ImageService.createMapImage("states");
ImageService.createVaccinationsImage();
cron.schedule("* 12 * * *", () => {
    console.log("RUNNING");
}, { timezone: "Europe/Berlin" });