const { CheckProductAvailableForAsin } = require("./Helper");
// const fs = require("fs");
// const path = require("path");
const AmazonUSA = require("../../models/amazon_usa");
const finish = require("./finish");

async function start(Payload, Resp, id, Output) {
  try {
    await AmazonUSA.sync()
      .then(async () => {
        // const batchPath = path.join(__dirname, "./batch_no.txt");
        // var batchNum = Number(fs.readFileSync(`${batchPath}`, "utf-8"));
        checkStatus(Resp);
        Resp["Total"] = Payload.asins.length * 2;
        for (let index = 0; index < Payload.asins.length; index++) {
          const asin = Payload.asins[index];
          const offer = Payload.offers[index];
          await CheckProductAvailableForAsin(
            asin,
            offer,
            index,
            id,
            Resp,
            Output,
            Resp["isAsin"]
          ).catch((err) => {
            console.trace(err);
          });
        }
        Resp["All_Status"] += 1;
      })
      .catch((e) => {
        console.trace(e);
        Resp["Status"] = "Idle";
      });
  } catch (error) {
    console.trace(error);
    Resp["Status"] = "Idle";
  }
}

function checkStatus(Resp) {
  var ID = setInterval(async () => {
    if (Resp["All_Status"] == 1) {
      await finish(Resp);
      clearInterval(ID);
    }
  }, 250);
}

module.exports = start;
