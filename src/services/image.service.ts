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

                const change = ((data.last.casesPer100k - data.current.casesPer100k) / data.current.casesPer100k) * 100;
                image.setElement(
                    numberFormat.format(data.current.casesPer100k),
                    numberFormat.format(Number(Math.abs(change).toFixed(1))) + "%",
                    1660, 825
                );
                resolve(image.build());
            });
        });
    }

}