const Keys = require("./Keys");
const AmazonScraper = require("./AmazonScraper");
const { RevenueCalc, FormulaCalc } = require("./AmazonCalc");
const WriteData = require("./DataWriter");
const Access = Keys.ACCESS_KEY;
const Secret = Keys.SECRET_KEY;
const Seller = Keys.MERCHANT_ID;
const AuthToken = Keys.ACCESS_KEY;
const MarketplaceID = Keys.MARKETPLACE_ID;
const MWS = require("amazon-mws")(Access, Secret);
MWS.setHost("mws.amazonservices.com");
let Output = {};
let Resp = {};

let ASIN = "";
let DIM;
let PD = false;

function AddToOutput(Key, Value) {
  Output[Key].push(Value);
}

function PrintAll(index) {
  for (let Key in Output) {
    console.log(`${Key}: ${Output[Key][index]}`);
  }
}

function Sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ProductNotAvailableForASIN(index, asin, vendoroffer, id, err) {
  return new Promise(async (resolve, reject) => {
    try {
      let duplicate = false;
      Resp["Fail_List"].forEach((t) => {
        if (t.indexOf(asin) !== -1) {
          duplicate = true;
        }
      });
      if (duplicate == false) {
        for (let Key in Output) {
          if (typeof Output[Key][index] == "undefined") {
            AddToOutput(Key, "-");
          }
        }
        Output["Remarks"][index] = "Delisted ASIN";
        Resp["Fail"] = Resp["Fail"] + 1;
        Resp["Fail_List"].push(`${asin}\t${vendoroffer}\t${err}`);
        resolve(true);
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function getASIN_DIM(response) {
  return new Promise((resolve, reject) => {
    try {
      if (
        typeof response.Products.Product.Identifiers !== "undefined" &&
        typeof response.Products.Product.Identifiers.MarketplaceASIN !==
          "undefined"
      ) {
        ASIN = response.Products.Product.Identifiers.MarketplaceASIN.ASIN;
      } else {
        reject("No ASIN in the MWS Response");
      }
      if (
        typeof response.Products.Product.AttributeSets !== "undefined" &&
        response.Products.Product.AttributeSets.ItemAttributes
          .PackageDimensions !== null &&
        typeof response.Products.Product.AttributeSets.ItemAttributes
          .PackageDimensions !== "undefined"
      ) {
        DIM =
          response.Products.Product.AttributeSets.ItemAttributes
            .PackageDimensions;
        PD = true;
      } else if (
        typeof response.Products.Product.AttributeSets !== "undefined" &&
        response.Products.Product.AttributeSets.ItemAttributes
          .ItemDimensions !== null &&
        typeof response.Products.Product.AttributeSets.ItemAttributes
          .ItemDimensions !== "undefined"
      ) {
        DIM =
          response.Products.Product.AttributeSets.ItemAttributes.ItemDimensions;
      } else {
        DIM = null;
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function getSalesRank(response, index) {
  return new Promise((resolve, reject) => {
    try {
      if (
        typeof response.Products.Product.SalesRankings !== "undefined" &&
        typeof response.Products.Product.SalesRankings.SalesRank !== "undefined"
      ) {
        let SalesRankCount =
          response.Products.Product.SalesRankings.SalesRank.length;
        if (SalesRankCount > 0) {
          for (let i = 0; i < SalesRankCount; i++) {
            if (i == 0) {
              AddToOutput(
                "Rank",
                String(
                  response.Products.Product.SalesRankings.SalesRank[i].Rank
                )
              );
              AddToOutput(
                "Sales_Rank_Category",
                String(
                  response.Products.Product.SalesRankings.SalesRank[i]
                    .ProductCategoryId
                )
                  .split("_display_on_website")
                  .join("")
                  .split("_")
                  .join(" ")
                  .trim()
                  .toUpperCase()
              );
            } else if (i == 1) {
              AddToOutput(
                "Sub_Rank_1",
                response.Products.Product.SalesRankings.SalesRank[i].Rank
              );
            } else if (i == 2) {
              AddToOutput(
                "Sub_Rank_2",
                response.Products.Product.SalesRankings.SalesRank[i].Rank
              );
            }
          }
        } else {
          AddToOutput("Rank", "-");
          AddToOutput("Sales_Rank_Category", "-");
          AddToOutput("Sub_Rank_1", "-");
          AddToOutput("Sub_Rank_2", "-");
        }
      } else {
        AddToOutput("Rank", "-");
        AddToOutput("Sales_Rank_Category", "-");
        AddToOutput("Sub_Rank_1", "-");
        AddToOutput("Sub_Rank_2", "-");
      }
      if (typeof Output["Sub_Rank_1"][index] == "undefined") {
        AddToOutput("Sub_Rank_1", "-");
      } else if (typeof Output["Sub_Rank_2"][index] == "undefined") {
        AddToOutput("Sub_Rank_2", "-");
      } else if (typeof Output["Rank"][index] == "undefined") {
        AddToOutput("Rank", "-");
      } else if (typeof Output["Sales_Rank_Category"][index] == "undefined") {
        AddToOutput("Sales_Rank_Category", "-");
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function ObtainBasicProductDetails(Dim) {
  return new Promise((resolve, reject) => {
    try {
      if (Dim) {
        if (PD) {
          AddToOutput(
            "longest_side",
            Math.round(parseFloat(Dim.Length.Value) * 100) / 100
          );
          AddToOutput(
            "median_side",
            Math.round(parseFloat(Dim.Width.Value) * 100) / 100
          );
          AddToOutput(
            "shortest_side",
            Math.round(parseFloat(Dim.Height.Value) * 100) / 100
          );
          if (String(Dim.Weight.Units).indexOf("pounds") !== -1) {
            AddToOutput(
              "item_package_weight_should_always_be_in_ounces",
              Math.round(parseFloat(Dim.Weight.Value) * 16 * 100) / 100
            );
          } else if (String(Dim.Weight.Units).indexOf("ounces") !== -1) {
            AddToOutput(
              "item_package_weight_should_always_be_in_ounces",
              Math.round(parseFloat(Dim.Weight.Value) * 100) / 100
            );
          } else {
            AddToOutput("item_package_weight_should_always_be_in_ounces", "-");
          }
        } else {
          AddToOutput(
            "longest_side",
            Math.round(parseFloat(Dim.Length.Value) * 100) / 100
          );
          AddToOutput(
            "median_side",
            Math.round(parseFloat(Dim.Width.Value) * 100) / 100
          );
          AddToOutput(
            "shortest_side",
            Math.round(parseFloat(Dim.Height.Value) * 100) / 100
          );
          AddToOutput("item_package_weight_should_always_be_in_ounces", 0);
        }
      } else {
        AddToOutput("longest_side", 0);
        AddToOutput("median_side", 0);
        AddToOutput("shortest_side", 0);
        AddToOutput("item_package_weight_should_always_be_in_ounces", 0);
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetSNLFullfillmentCost(index) {
  return new Promise((resolve, reject) => {
    try {
      if (
        Output["longest_side"][index] > 0 &&
        Output["median_side"][index] > 0 &&
        Output["shortest_side"][index] > 0 &&
        Output["item_package_weight_should_always_be_in_ounces"][index] > 0
      ) {
        let length = Output["longest_side"][index];
        let width = Output["median_side"][index];
        let height = Output["shortest_side"][index];
        let weight =
          Output["item_package_weight_should_always_be_in_ounces"][index];

        const smallStandardDimentions = [15, 12, 0.75];
        const largeStandardDimentions = [18, 14, 8];
        let dimVerificationCount = 0;
        smallStandardDimentions.forEach((dim) => {
          if (length <= dim || height <= dim || width <= dim) {
            dimVerificationCount += 1;
          }
        });
        if (dimVerificationCount == smallStandardDimentions.length) {
          if (weight <= 6) {
            AddToOutput("SNL_Fullfillment_cost", 2.35);
            resolve(true);
          } else if (weight > 6 && weight <= 12) {
            AddToOutput("SNL_Fullfillment_cost", 2.49);
            resolve(true);
          } else if (weight > 12 && weight <= 16) {
            AddToOutput("SNL_Fullfillment_cost", 3.0);
            resolve(true);
          } else {
            AddToOutput("SNL_Fullfillment_cost", 0);
            resolve(true);
          }
        } else {
          dimVerificationCount = 0;
          largeStandardDimentions.forEach((dim) => {
            if (length <= dim || height <= dim || width <= dim) {
              dimVerificationCount += 1;
            }
          });
          if (dimVerificationCount == largeStandardDimentions.length) {
            if (weight > 1 && weight <= 2) {
              AddToOutput("SNL_Fullfillment_cost", 4.21);
              resolve(true);
            } else if (weight > 2 && weight <= 3) {
              AddToOutput("SNL_Fullfillment_cost", 4.94);
              resolve(true);
            } else if (weight <= 6) {
              AddToOutput("SNL_Fullfillment_cost", 2.53);
              resolve(true);
            } else if (weight > 6 && weight <= 12) {
              AddToOutput("SNL_Fullfillment_cost", 2.8);
              resolve(true);
            } else if (weight > 12 && weight <= 16) {
              AddToOutput("SNL_Fullfillment_cost", 3.59);
              resolve(true);
            } else {
              AddToOutput("SNL_Fullfillment_cost", 0);
              resolve(true);
            }
          }
        }
      } else {
        AddToOutput("SNL_Fullfillment_cost", 0);
        resolve(true);
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function CleanOutput() {
  return new Promise((resolve, reject) => {
    try {
      let keys = {
        Weight_Handling: "Weight_Handling",
        Order_Handling: "Order_Handling",
        Pick_And_Pack: "Pick_And_Pack",
        Thirty_Day_Storage: "Thirty_Day_Storage",
        Variable_Closing_Fee: "Variable_Closing_Fee",
        Amazon_referral_fee: "Amazon_referral_fee",
        Fullfilment_Cost_Subtotal: "Fullfilment_Cost_Subtotal",
        Ship_to_FBA: "Ship_to_FBA",
        Single_Location: "Single_Location",
        item_package_weight_should_always_be_in_ounces:
          "item_package_weight_should_always_be_in_ounces",
        shortest_side: "shortest_side",
        BB_Price: "BB_Price",
        SNL_Fullfillment_cost: "SNL_Fullfillment_cost",
      };
      for (let key in Output) {
        Output[key].forEach(function (item, i) {
          if (
            item == "NaN" ||
            item == "-Infinity" ||
            item == "" ||
            item == "undefined"
          ) {
            if (key in keys) {
              Output[key][i] = 0;
            } else {
              Output[key][i] = "-";
            }
          }
        });
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function isAsin(asin, isASIN) {
  if (isASIN == false) {
    if (asin.length == 13) {
      return {
        isAsin: false,
        IdType: "EAN",
        Id: asin,
      };
    } else if (asin.length == 12) {
      return {
        isAsin: false,
        IdType: "UPC",
        Id: asin,
      };
    } else {
      let str = "";
      for (let i = 0; i < 12 - asin.Length; i++) {
        str = str + "0";
      }
      let Id = (str.trim() + asin.trim()).trim();
      return {
        isAsin: false,
        IdType: "UPC",
        Id: Id,
      };
    }
  } else {
    return {
      isAsin: true,
      IdType: "ASIN",
      Id: asin,
    };
  }
}

const CheckProductAvailableForAsin = (
  Asin,
  VendorOffer,
  index,
  id,
  Resp_d,
  Output_d,
  isASIN
) => {
  return new Promise(async (resolve, reject) => {
    try {
      Output = Output_d;
      Resp = Resp_d;
      let Result = isAsin(Asin, isASIN);
      let IdType = Result.IdType;
      let Id = Result.Id;

      await MWS.products.searchFor(
        {
          Version: "2011-10-01",
          Action: "GetMatchingProductForId",
          SellerId: Seller,
          MWSAuthToken: AuthToken,
          MarketplaceId: MarketplaceID,
          IdType: IdType,
          "IdList.Id.1": Id,
        },
        async function (error, response) {
          if (error) {
            console.log("Error in CheckProductAvailableForAsin:");
            console.trace(error);
            await ProductNotAvailableForASIN(
              index,
              Asin,
              VendorOffer,
              id,
              error
            );
            reject("Product is not Available");
          }
          if (
            response &&
            typeof response.Products !== "undefined" &&
            typeof response.Products.Product !== "undefined" &&
            response.Products.Product !== null
          ) {
            AddToOutput("uuid", id);
            AddToOutput("Remarks", "Available");
            AddToOutput("Vendor_Offer", VendorOffer);
            AddToOutput("Input", Asin);
            AddToOutput("Number_of_SNL_Sellers", "1");
            AddToOutput("SNL_Order_handling", "1");
            AddToOutput("SNL_Pick_and_pack", "0.75");
            await getASIN_DIM(response)
              .then(async () => {
                await getSalesRank(response, index).catch((err) => {
                  console.trace(err);
                  reject(err);
                });
                await ObtainBasicProductDetails(DIM).catch((err) => {
                  console.trace(err);
                  reject(err);
                });
                await GetSNLFullfillmentCost(index).catch((err) => {
                  console.trace(err);
                  reject(err);
                });
                await AmazonScraper(ASIN, index, AddToOutput, Output)
                  .then(async () => {
                    await RevenueCalc(index, MWS, AddToOutput, Output).catch(
                      (err) => {
                        console.trace(err);
                        reject(err);
                      }
                    );
                    await FormulaCalc(VendorOffer, index, AddToOutput).catch(
                      (err) => {
                        console.trace(err);
                        reject(err);
                      }
                    );
                    await CleanOutput()
                      .then(async () => {
                        await WriteData(index, Output)
                          .then(() => {
                            Resp["Success"] = Resp["Success"] + 1;
                            resolve(true);
                          })
                          .catch((err) => {
                            console.trace(err);
                            reject(err);
                          });
                      })
                      .catch((err) => {
                        console.trace(err);
                        reject(err);
                      });
                  })
                  .catch(async (err) => {
                    await ProductNotAvailableForASIN(
                      index,
                      Asin,
                      VendorOffer,
                      id,
                      err
                    );
                    console.trace(err);
                    reject(err);
                  });
              })
              .catch(async (err) => {
                await ProductNotAvailableForASIN(
                  index,
                  Asin,
                  VendorOffer,
                  id,
                  err
                );
                console.trace(err);
                reject(err);
              });
          } else {
            await ProductNotAvailableForASIN(
              index,
              Asin,
              VendorOffer,
              id,
              "Product is not Available"
            );
            reject("Product is not Available");
          }
        }
      );
    } catch (err) {
      // await ProductNotAvailableForASIN(index, Asin, VendorOffer, id, err);
      console.trace(err);
      // reject(err);
    }
  });
};

module.exports = {
  CheckProductAvailableForAsin,
  AddToOutput,
  isAsin,
  ASIN,
  MWS,
};
