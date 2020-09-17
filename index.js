const request = require("request");
const cheerio = require("cheerio");

const fs = require("fs");
const util = require("util");

const Discord = require("discord.js-selfbot");
const client = new Discord.Client();
const token = "<PUT LOGIN TOKEN HERE>";

let cookie = undefined;
fs.readFile("./cookie.txt", "utf8", (err, val) => {
    if(err) {
        return console.log("Failed to read cookie.txt");
    }

    cookie = util.format(val);
    
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!\nWaiting for COD:BOCW beta codes..`);
    });

    client.on("message", msg => {
        let codes = msg.content.replace(/`/g, "").split("\n").filter(item => item);
        codes.forEach((code, i) => {
            setTimeout(() => {
                if(!code.match(/[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+/)) return;
                request("https://profile.callofduty.com/promotions/redeemCode/beta-partner", {
                    method: "POST",
                    headers: {
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "Accept-Language": "de",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Cookie": cookie,
                        "Host": "profile.callofduty.com",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
                    },
                    form: {
                        "code": code,
                        "selectedPlatform": "battle",
                        "selectedCountry": "DE"
                    },
                    json: true
                }, (err, res, body) => {
                    if(err || !body) return console.log("Error while redeeming code "+code);

                    const $ = cheerio.load(body);
                    let error = $("p").filter("[data-error-code]")[0].attribs["data-error-code"];

                    if(error == "invalidCode") {
                        return console.log("Code "+code+" is invalid");
                    }

                    if(error == "codeAlreadyRedeemed") {
                        return console.log("Code "+code+" has already been redeemed");
                    }

                    console.log("Code "+code+" has been successfully redeemed. Enjoy the beta!");
                    process.exit();
                });
            }, i * 500);
        });
    });

    client.login(token);
});