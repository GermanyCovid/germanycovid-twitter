import axios from "axios";

export namespace DataService {

    const numberFormat = new Intl.NumberFormat("de-DE");

    export function getData(type: "germany" | "vaccinations" | "vaccinations-history-7" | "intensivregister"): Promise<{ current: any, last: any }> {
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

    export function getMap(type: "districts" | "states" | "hospitalization"): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            axios.get("https://api.corona-zahlen.org/map/" + (type === "hospitalization" ? "states/hospitalization" : type), { responseType: "arraybuffer" })
                .then((response) => resolve(Buffer.from(response.data, "binary")))
                .catch((error) => reject(error));
        });
    }

    export function getPercentageChange(oldNumber: number, newNumber: number) {
        let change = (((oldNumber - newNumber) / oldNumber) * 100).toFixed(1);
        if (change.charAt(0) === "-") {
            change = "+" + numberFormat.format(Number(change)).substring(1);
        } else {
            change = "-" + numberFormat.format(Number(change));
        }
        return change;
    }

    export function getChange(newNumber: number) {
        let change = String(newNumber);
        if (change.charAt(0) === "-") {
            change = "-" + numberFormat.format(Number(change)).substring(1);
        } else {
            change = "+" + numberFormat.format(Number(change));
        }
        return change;
    }

    export function isHoliday() {
        const date = new Date();
        if (date.getDay() === 0 || date.getDay() === 6) return true;
        if (date.getDate() === 1 && date.getMonth() === 0) {
            return true;
        } else if (date.getDate() === 18 && date.getMonth() === 3) {
            return true;
        } else if (date.getDate() === 1 && date.getMonth() === 4) {
            return true;
        } else if (date.getDate() === 13 && date.getMonth() === 4) {
            return true;
        } else if (date.getDate() === 24 && date.getMonth() === 4) {
            return true;
        } else if (date.getDate() === 3 && date.getMonth() === 9) {
            return true;
        } else if (date.getDate() === 31 && date.getMonth() === 9) {
            return true;
        } else if (date.getDate() === 1 && date.getMonth() === 10) {
            return true;
        } else if (date.getDate() === 25 && date.getMonth() === 11) {
            return true;
        } else return date.getDate() === 26 && date.getMonth() === 11;
    }

}
