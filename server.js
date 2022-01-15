const app = require("express")();
const Json2csv = require("json2csv").Parser;
const multer = require("multer");
const { join } = require("path");
const { readFile } = require("fs");
const XLSX = require("xlsx");
const Fetch = require("node-fetch");
const InvokeMethod = require("./controllers/InvokeMethod");
const POSTGRES_Sequelize = require("../../database/database");
const { json, urlencoded } = require("express");
const generateArraysAndID = require("./generateArraysAndID");
const { AddFormulae } = require("./AmazonCalc");
const port = process.env.PORT || 3002;
let Output = {};
let Resp = {};
let id = "";
let filename = "";

const Export_Amazon_USA = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // const batchPath = join(`${__dirname}/batch_no.txt`);
      // readFile(`${batchPath}`, "utf-8", async (err, batch) => {
      await POSTGRES_Sequelize.query(
        `SELECT * FROM amazon_usa_data WHERE amazon_usa_data.uuid='${id}' ORDER BY id ASC`
      )
        .then((data) => {
          const jsonData = JSON.parse(JSON.stringify(data[1].rows));
          const json2csvParser = new Json2csv({ header: true });
          let csv = json2csvParser.parse(jsonData);
          resolve(csv);
        })
        .catch((e) => {
          console.trace(e);
          reject(e);
        });
      // });
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
};

const cleanWorkBook = (wb) => {
  return new Promise((resolve, reject) => {
    try {
      let Obj = wb.Sheets.Sheet1;
      for (let key in Obj) {
        if (typeof Obj[key].v !== "undefined") {
          Obj[key].v = Obj[key].v.split('"').join("");
        }
      }
      resolve(wb);
    } catch (e) {
      console.trace(e);
      reject(e);
    }
  });
};

const convertCsvToExcelBuffer = (csvString) => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayOfArrayCsv = csvString.split("\n").map((row) => {
        return row.split(",");
      });
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.aoa_to_sheet(arrayOfArrayCsv);
      ws = await AddFormulae(ws, XLSX, arrayOfArrayCsv);
      XLSX.utils.book_append_sheet(wb, ws);
      wb = await cleanWorkBook(wb);
      // XLSX.writeFile(wb, "Temporary_Output.xlsx", {
      //   type: "base64",
      // });
      const rawExcel = XLSX.write(wb, { type: "base64" });
      resolve(rawExcel);
    } catch (e) {
      console.trace(e);
      reject(e);
    }
  });
};

const convertCsvToExcel = async (data, req, res) => {
  await convertCsvToExcelBuffer(data.toString())
    .then((excelBuffer) => {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-disposition",
        `attachment; filename=AmazonUSA_Export_${new Date(Date.now())}.xlsx`
      );
      res.status(200).send(Buffer.from(excelBuffer, "base64"));
    })
    .catch((e) => {
      console.trace(e);
    });
};

app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);
var storage = multer.diskStorage({
  destination: "../../../../loadBalancer/Input/USA/",
  filename: function (req, file, cb) {
    filename = file.originalname;
    cb(null, file.originalname);
  },
});

app.use(multer({ storage: storage }).any());
app.set("views", join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.get("/amazon-usa-file-upload", (req, res) => {
  // let data = generateArraysAndID();
  // Output = data.Output;
  // Resp = data.Resp;
  // id = data.id;
  // Resp["fileName"] = filename;
  res.render("fileUpload");
});

app.post("/AmazonScrapper/Start", (req, res) => {
  let idType = req.body.idType;
  let username = req.body.username;
  let scrapper = req.body.scrapper;
  let filename = req.body.filename;
  let data = req.body.Data;
  let id = req.body.id;

  var opts = {
    method: "POST",
    body: {
      idType: idType,
      username: username,
      scrapper: scrapper,
      filename: filename,
      data: data,
      id: id,
    },
  };
  Fetch("http://127.0.0.1:3001/home/loadBalancer", opts)
    .then(() => {
      res.send({ success: true });
    })
    .catch((err) => {
      res.status(500).send({ success: false, error: err });
    });
});

app.post("/upload", function (req, res) {
  setTimeout(() => {
    res.redirect("/amazon-usa-file-upload");
  }, 2000);
});

app.get("/Resp", function (req, res) {
  const isAsin = Resp["isAsin"];
  const successCount = Resp["Success"];
  const failCount = Resp["Fail"];
  const Total = Resp["Total"];
  const Fail_List = Resp["Fail_List"];
  const Status = Resp["Status"];
  const All_Status = Resp["All_Status"];
  res.send({
    isAsin: isAsin,
    Success: successCount,
    Fail: failCount,
    Fail_List: Fail_List,
    Total: Total,
    Status: Status,
    All_Status: All_Status,
  });
});

app.post("/Resp", function (req, res) {
  if (req.body.Success) {
    Resp["Success"] += 1;
  }
  if (req.body.Fail) {
    Resp["Fail"] += 1;
  }
  if (req.body.Fail_List) {
    req.body.Fail_List.forEach((asin) => {
      Resp["Fail_List"].push(asin);
    });
  }
  if (req.body.All_Status) {
    Resp["All_Status"] += 1;
  }
  res.send({
    Message: "Updated The Resp",
  });
});

app.get("/Reset-Scrapper", (req, res) => {
  Resp["isAsin"] = false;
  Resp["Fail"] = 0;
  Resp["Success"] = 0;
  Resp["Total"] = 0;
  Resp["Fail_List"] = [];
  Resp["All_Status"] = 0;
  for (let Key in Output) {
    Output[Key] = [];
  }
  res.send({ Success: true });
});

app.post("/AmazonScrapper", async (request, response) => {
  await InvokeMethod(request, response, Resp, id, Output);
});

app.get("/amazon-usa-file-download", (req, res) => {
  if (Resp["Fail_List"].length > 0) {
    let ASINs = "";
    Resp["Fail_List"].forEach((a) => {
      ASINs = ASINs + a + "\n";
    });
    processFile(ASINs);
  } else {
    processFile("No Data");
  }
  function processFile(file) {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-disposition": `attachment; filename=FailedASIN_USA_${new Date(
        Date.now()
      )}.txt`,
    });
    res.end(file);
  }
  setTimeout(() => {
    var opts = {
      method: "GET",
      headers: {},
    };
    Fetch("http://127.0.0.1:3002/Reset-Scrapper", opts)
      .then(() => {})
      .catch((err) => {
        console.trace(err);
      });
  }, 2000);
});

app.get("/amazon-data-export", async (req, res) => {
  await Export_Amazon_USA()
    .then(async (data) => {
      await convertCsvToExcel(data, req, res);
    })
    .catch((err) => {
      console.trace(err);
    });
});

app.post("/currentUser", (req, res) => {});

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}/`);
});
