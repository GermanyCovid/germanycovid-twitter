import Twit from "twit";
import { DataService } from "./data.service";
import { LogService } from "./log.service";

export namespace TwitterService {

    const twitter = new Twit({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET,
        strictSSL: true
    });
    const numberFormat = new Intl.NumberFormat("de-DE");

    export function init() {
        LogService.logInfo("Twitter Bot @GermanyCovid.");
        try {
            const stream = twitter.stream("statuses/filter", { track: ["@GermanyCovid"] });
            stream.on("tweet", async (event) => {
                if (event.in_reply_to_status_id === null) return;
                if (event.in_reply_to_screen_name === "GermanyCovid") return;
                const id = event.id_str;
                LogService.logInfo("@" + event.user.screen_name + " mentioned us in a tweet.");

                const mentions: [] = event.entities.user_mentions.filter((value: any) => value.screen_name === "GermanyCovid");
                if (event.text === "@GermanyCovid" || mentions.length > 1) {
                    sendMentionReply(id);
                } else {
                    twitter.get("statuses/show/" + event.in_reply_to_status_id_str, (err, result: any, response) => {
                        if (err) return;
                        const replyMentions: [] = result.entities.user_mentions.filter((value: any) => value.screen_name === "GermanyCovid");
                        if (replyMentions.length !== 0) return;
                        sendMentionReply(id);
                    });
                }
            });
        } catch (error) {
            LogService.logError("Connection error to Twitter has occurred.");
        }
    }

    export function postTweet(status: string, image: Buffer) {
        const base64Image = image.toString("base64");
        twitter.post("media/upload", { media_data: base64Image }, (err, data: any, response) => {
            const mediaId = data.media_id_string;
            if (!err) {
                twitter.post("statuses/update", { status, media_ids: [mediaId] }, (err1, data1, response1) => {
                    if (!err1) {
                        LogService.logInfo("Posted tweet updated.");
                    } else {
                        LogService.logError("Error while posting tweet update.");
                    }
                });
            } else {
                LogService.logError("Error while uploading media.");
            }
        });
    }

    function sendMentionReply(id: string) {
        Promise.all([
            DataService.getData("germany"),
            DataService.getData("intensivregister")
        ]).then(([germany, intensivRegister]) => {
            twitter.post("statuses/update", {
                status: "Hier Dein Überblick zur Pandemie in Deutschland:\n\n" +
                    "📅 7-Tage-Inzidenz: " + numberFormat.format(Number(germany.current.weekIncidence.toFixed(1))) + " (Vortag: " + numberFormat.format(Number(germany.last.weekIncidence.toFixed(1))) + ")\n" +
                    "☠️ Todesfälle: " + numberFormat.format(germany.current.deaths) + " (+ " + numberFormat.format(germany.current.delta.deaths) + ")\n" +
                    "🤒 Infektionen: " + numberFormat.format(germany.current.cases) + " (+ " + numberFormat.format(germany.current.delta.cases) + ")\n" +
                    "🦠 Genesene: " + numberFormat.format(germany.current.recovered) + " (+ " + numberFormat.format(germany.current.delta.recovered) + ")\n" +
                    "🏥 Intensivpatienten: " + numberFormat.format(intensivRegister.current.overallSum.faelleCovidAktuell) +
                    " (" + DataService.getChange((intensivRegister.last.overallSum.faelleCovidAktuell - intensivRegister.current.overallSum.faelleCovidAktuell) / -1) + ")",
                in_reply_to_status_id: id,
                auto_populate_reply_metadata: true
            }, (err, data, response) => {
                if (!err) {
                    LogService.logInfo("An overview of the statistics was sent.");
                } else {
                    LogService.logError("Error while responding to the mention.");
                }
            });
        });
    }

}