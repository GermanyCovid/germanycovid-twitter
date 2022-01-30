import Canvas from "canvas";
import * as fs from "fs";
import { DataService } from "./data.service";

export namespace ImageService {

    const numberFormat = new Intl.NumberFormat("de-DE");
    Canvas.registerFont("./assets/POPPINS-BOLD.TTF", { family: "Poppins", weight: "bold" });
    Canvas.registerFont("./assets/POPPINS-REGULAR.TTF", { family: "Poppins", weight: "regular" });
    Canvas.registerFont("./assets/POPPINS-SEMIBOLD.TTF", { family: "Poppins", weight: "semibold" });

    class Stats {
        private canvas = Canvas.createCanvas(1920, 1080);
        private ctx = this.canvas.getContext("2d");
        private name: string;
        private warning = false;

        constructor(name: string, background: Canvas.Image) {
            const date = new Date();
            this.name = name;
            this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
            this.addText(date.getDate() + "." + Number(date.getMonth() + 1) + "." + date.getFullYear(), "white", 70, 1655, 195);
            this.ctx.save();
        }

        setElement(topText: string, bottomText: string, x: number, y: number, top?: boolean) {
            if (top) {
                this.addText(topText, "white", 100, x, y);
                this.addText(bottomText, "white", 35, x, y + 50, "regular");
            } else {
                this.addText(topText, "white", 59, x, y);
                this.addText(bottomText, "white", 22, x, y + 30, "regular");
            }
            this.ctx.restore();
            return this;
        }

        setWarning(text: string) {
            if (this.warning) return this;
            this.addText(text, "white", 22, 1200, 1045, "semibold");
            this.ctx.restore();
            this.warning = true;
            return this;
        }

        addText(text: string, color: string, size: number, x: number, y: number, weight?: string) {
            const fontWeight = weight || "bold";
            this.ctx.restore();
            this.ctx.fillStyle = color;
            this.ctx.textAlign = "center";
            this.ctx.font = fontWeight + " " + size + "px Poppins";
            this.ctx.fillText(text, x, y);
        }

        build() {
            const buffer = this.canvas.toBuffer();
            fs.writeFileSync("./assets/" + this.name + ".png", buffer);
            return buffer;
        }
    }

    export function createGermanyImage(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            Promise.all([
                Canvas.loadImage("./assets/cases_background.png"),
                DataService.getData("germany")
            ]).then(([background, data]) => {
                const image = new Stats("germany", background);
                image.setElement(
                    numberFormat.format(Number(data.current.weekIncidence.toFixed(1))),
                    "Vortag: " + numberFormat.format(Number(data.last.weekIncidence.toFixed(1))),
                    960, 520, true
                );

                image.setElement(
                    numberFormat.format(data.current.deaths),
                    "+ " + numberFormat.format(data.current.delta.deaths),
                    265, 825
                );

                image.setElement(
                    numberFormat.format(data.current.cases),
                    "+ " + numberFormat.format(data.current.delta.cases),
                    730, 825
                );

                image.setElement(
                    numberFormat.format(data.current.recovered),
                    "+ " + numberFormat.format(data.current.delta.recovered),
                    1195, 825
                );

                image.setElement(
                    numberFormat.format(data.current.casesPer100k),
                    DataService.getPercentageChange(data.last.casesPer100k, data.current.casesPer100k) + "%",
                    1660, 825
                );
                resolve(image.build());
            });
        });
    }

    export function createIntensivRegisterImage(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            Promise.all([
                Canvas.loadImage("./assets/bed_background.png"),
                DataService.getData("intensivregister")
            ]).then(([background, allData]) => {
                const currentData = allData.current.overallSum;
                const lastData = allData.last.overallSum;
                const image = new Stats("intensivregister", background);

                image.setElement(
                    numberFormat.format(currentData.intensivBettenBelegt),
                    numberFormat.format(currentData.bettenBelegtToBettenGesamtPercent) + "% | " + DataService.getChange(lastData.intensivBettenBelegt - currentData.intensivBettenBelegt),
                    960, 520, true
                );

                image.setElement(
                    numberFormat.format(currentData.faelleCovidAktuell),
                    numberFormat.format(currentData.covidToIntensivBettenPercent) + "% | " + DataService.getChange(lastData.faelleCovidAktuell - currentData.faelleCovidAktuell),
                    265, 835
                );

                image.setElement(
                    numberFormat.format(currentData.faelleCovidAktuellBeatmet),
                    numberFormat.format(currentData.faelleCovidAktuellBeatmetToCovidAktuellPercent) + "% | " + DataService.getChange(lastData.faelleCovidAktuellBeatmet - currentData.faelleCovidAktuellBeatmet),
                    730, 835
                );

                image.setElement(
                    numberFormat.format(currentData.intensivBettenFrei),
                    "von " + numberFormat.format(currentData.intensivBettenGesamt) + " Betten",
                    1195, 830
                );
                image.addText(numberFormat.format(currentData.bettenFreiToBettenGesamtPercent) + "% | " + DataService.getChange(lastData.intensivBettenFrei - currentData.intensivBettenFrei), "white", 22, 1195, 880, "regular");

                image.setElement(
                    numberFormat.format(currentData.intensivBettenFreiProStandort),
                    "Vortag: " + numberFormat.format(lastData.intensivBettenFreiProStandort),
                    1660, 835
                );

                resolve(image.build());
            });
        });
    }

    export function createMapImage(type: "districts" | "states") {
        return new Promise((resolve, reject) => {
            const canvas = Canvas.createCanvas(1920, 1080);
            const ctx = canvas.getContext("2d");
            DataService.getMap(type).then((mapBuffer) => {
                Promise.all([
                    Canvas.loadImage("./assets/map_background.png"),
                    Canvas.loadImage(mapBuffer)
                ]).then(([background, map]) => {
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    ctx.save();
                    ctx.drawImage(map, 780, 90, 655, 889);

                    const dateNow = new Date();
                    addText(ctx, dateNow.getDate() + "." + Number(dateNow.getMonth() + 1) + "." + dateNow.getFullYear(), "white", 70, 1655, 195);

                    fs.writeFileSync("./assets/" + type + ".png", canvas.toBuffer());
                    resolve(canvas.toBuffer());
                });
            });
        });
    }

    export function createVaccinationsImage(): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            if (DataService.isHoliday()) return reject("Holiday");
            Promise.all([
                Canvas.loadImage("./assets/vaccinations_background.png"),
                DataService.getData("vaccinations"),
                DataService.getData("vaccinations-history-7")
            ]).then(([background, data, historyData]) => {
                const image = new Stats("vaccinations", background);

                try {
                    const residents = 83000000;
                    const minResidents = (85 / 100) * residents;
                    const requiredVaccinations = minResidents * 2;
                    const missingVaccinations = requiredVaccinations - data.current.data.administeredVaccinations;

                    const history: [] = historyData.current.data.history;
                    let vaccinated = 0;
                    let boosterVaccinated = 0;
                    history.forEach((x: any) => {
                        vaccinated += x.firstVaccination + x.secondVaccination;
                        boosterVaccinated += x.boosterVaccination;
                    });
                    const r = vaccinated / 7;
                    const daysNeeded = missingVaccinations / r;
                    const expectedDate = new Date();
                    expectedDate.setDate(expectedDate.getDate() + daysNeeded);

                    image.setElement("Nicht verfügbar", "bei erforderlichen 85%", 960, 520, true);
                    image.setElement(numberFormat.format(Math.round(r + (boosterVaccinated / 7))), "Heute: " + numberFormat.format(data.current.data.delta + data.current.data.secondVaccination.delta + data.current.data.boosterVaccination.delta), 265, 825);

                    image.setElement(numberFormat.format(data.current.data.vaccinated), "+ ~" + numberFormat.format(data.current.data.delta) + " | " + numberFormat.format(Number((data.current.data.quote * 100).toFixed(1))) + "%", 730, 825);
                    image.setElement(numberFormat.format(data.current.data.secondVaccination.vaccinated), "+ ~" + numberFormat.format(data.current.data.secondVaccination.delta) + " | " + numberFormat.format(Number((data.current.data.secondVaccination.quote * 100).toFixed(1))) + "%", 1195, 825);

                    const boosterVaccinationQuote = data.current.data.boosterVaccination.vaccinated / residents;
                    image.setElement(numberFormat.format(data.current.data.boosterVaccination.vaccinated), "+ ~" + numberFormat.format(data.current.data.boosterVaccination.delta) + " | " + numberFormat.format(Number((boosterVaccinationQuote * 100).toFixed(1))) + "%", 1660, 825);
                } catch (err) {
                    return reject();
                }

                resolve(image.build());
            });
        });
    }

    function addText(ctx: Canvas.CanvasRenderingContext2D, text: string, color: string, size: number, x: number, y: number, weight?: string) {
        const fontWeight = weight || "bold";
        ctx.restore();
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.font = fontWeight + " " + size + "px Poppins";
        ctx.fillText(text, x, y);
    }

}