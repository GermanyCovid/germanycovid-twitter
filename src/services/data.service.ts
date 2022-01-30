import axios from "axios";

export namespace DataService {

    export function getData(type: "germany" | "vaccinations" | "vaccinations-history" | "intensivregister"): Promise<{ current: any, last: any }> {
        return new Promise((resolve, reject) => {
            const now = new Date();
            const lastDate = new Date();
            lastDate.setDate(lastDate.getDate() - 1);

            Promise.all([
                axios.get("https://data.germanycovid.de/" + type + "_" + now.toLocaleDateString("de-DE").replace(/\./g, "-") + ".json"),
                axios.get("https://data.germanycovid.de/" + type + "_" + lastDate.toLocaleDateString("de-DE").replace(/\./g, "-") + ".json")
            ])
                .then(([current, last]) => resolve({ current: current.data, last: last.data }))
                .catch((error) => reject(error));
        });
    }

    export function getMap(type: "districts" | "states"): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            axios.get("https://api.corona-zahlen.org/map/" + type, { responseType: "arraybuffer" })
                .then((response) => resolve(Buffer.from(response.data, "binary")))
                .catch((error) => reject(error));
        });
    }

}