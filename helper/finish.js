// const fs = require("fs");

async function finish(Resp) {
  try {
    // await FixOutput(userData);
    Resp["Status"] = "Idle";
    // fs.writeFileSync(`${batchPath}`, `${batchNum + 1}`);
    // if (Resp["Fail_List"].length > 0) {
    // let ASINs = "";
    // if (fs.existsSync(__dirname + "/failedASIN.txt")) {
    //   fs.unlinkSync(__dirname + "/failedASIN.txt");
    // }
    // Resp["Fail_List"].forEach((a) => {
    //   ASINs = ASINs + a + "\n";
    // });
    // fs.writeFile(__dirname + "/failedASIN.txt", ASINs, (err) => {
    //   if (err) {
    //     console.trace(err);
    //   }
    // });
    // }
    console.log("Amazon Scrapper is Finished Successfuly...");
  } catch (e) {
    console.trace(e);
    Resp["Status"] = "Idle";
  }
}

module.exports = finish;
