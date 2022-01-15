const reader = require("xlsx");
const { Resp } = require("../OutputColumns");

const ExcelReader = () => {
  try {
    let TempASINs;
    const FinalASINs = [];
    const VendorOffer = [];
    const ASINs_List = [];
    const XLSX = reader.readFile(__dirname + "/AmazonInput/Input.xlsx");
    const ASINs = reader.utils.sheet_to_csv(XLSX.Sheets[XLSX.SheetNames[0]]);
    ASINs.split("\n").forEach((asin) => {
      ASINs_List.push(asin);
    });
    TempASINs = ASINs_List.filter(function (str) {
      return str.split(",").join("");
    });
    TempASINs = TempASINs.filter(function (str) {
      return /\S/.test(str);
    });
    for (let i = 1; i < TempASINs.length; i++) {
      let asin = TempASINs[i];
      const data = asin.split(",");
      FinalASINs.push(data[0].trim());
      VendorOffer.push(data[1].replace("$", "").trim());
    }
    return {
      ASINs: FinalASINs,
      VendorOffer: VendorOffer,
    };
  } catch (e) {
    console.trace(e);
    Resp["Status"] = "Idle";
  }
};

module.exports = ExcelReader;
