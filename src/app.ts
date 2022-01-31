import dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import fs from "fs";
import { ImageService } from "./services/image.service";
import { LogService } from "./services/log.service";
import { TwitterService } from "./services/twitter.service";

if (!fs.existsSync(process.env.FILE_PATH)) fs.mkdirSync(process.env.FILE_PATH, { recursive: true });
TwitterService.init();

ImageService.createGermanyImage().catch((err) => LogService.logError(err));
ImageService.createIntensivRegisterImage().catch((err) => LogService.logError(err));
ImageService.createMapImage("districts").catch((err) => LogService.logError(err));
ImageService.createMapImage("states").catch((err) => LogService.logError(err));
ImageService.createVaccinationsImage().catch((err) => LogService.logError(err));

cron.schedule("0 10 * * *", () => {
    ImageService.createMapImage("states").then((buffer) => {
        LogService.logInfo("Sending states tweet.");
        TwitterService.postTweet("► Aktuelle Lage am " + new Date().getDate() + "." + Number(new Date().getMonth()+1) + "." + new Date().getFullYear() + " ◄", buffer);
    }).catch((err) => LogService.logError(err));
}, { timezone: "Europe/Berlin" });

cron.schedule("0 11 * * *", () => {
    ImageService.createMapImage("districts").then((buffer) => {
        LogService.logInfo("Sending districts tweet.");
        TwitterService.postTweet("► Aktuelle Lage am " + new Date().getDate() + "." + Number(new Date().getMonth()+1) + "." + new Date().getFullYear() + " ◄", buffer);
    }).catch((err) => LogService.logError(err));
}, { timezone: "Europe/Berlin" });

cron.schedule("0 12 * * *", () => {
    ImageService.createGermanyImage().then((buffer) => {
        LogService.logInfo("Sending germany tweet.");
        TwitterService.postTweet("► Aktuelle Lage am " + new Date().getDate() + "." + Number(new Date().getMonth()+1) + "." + new Date().getFullYear() + " ◄", buffer);
    }).catch((err) => LogService.logError(err));
}, { timezone: "Europe/Berlin" });

cron.schedule("0 13 * * *", () => {
    ImageService.createIntensivRegisterImage().then((buffer) => {
        LogService.logInfo("Sending intensivregister tweet.");
        TwitterService.postTweet("► Intensivstationen am " + new Date().getDate() + "." + Number(new Date().getMonth()+1) + "." + new Date().getFullYear() + " ◄", buffer);
    }).catch((err) => LogService.logError(err));
}, { timezone: "Europe/Berlin" });

cron.schedule("0 14 * * *", () => {
    ImageService.createVaccinationsImage().then((buffer) => {
        LogService.logInfo("Sending vaccinations tweet.");
        TwitterService.postTweet("► Impfstatus am " + new Date().getDate() + "." + Number(new Date().getMonth() + 1) + "." + new Date().getFullYear() + " ◄", buffer);
    }).catch((err) => LogService.logError(err));
}, { timezone: "Europe/Berlin" });