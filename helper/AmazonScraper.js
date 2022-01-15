const { AxiosGet } = require("./HttpReq");
const Cheerio = require("cheerio");
const Keys = require("./Keys");
const AMAZON_URL = Keys.AMAZON_URL;

Array.prototype.last = function () {
  return this[this.length - 1];
};

function Sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Initialize(Asin, index, AddToOutput, Output) {
  return new Promise(async (resolve, reject) => {
    try {
      AddToOutput("ASIN", Asin);
      const Link = `${AMAZON_URL}${Asin}/`;
      AddToOutput("Hyperlink", Link);
      console.log(`Scrapping Started for: ${Link}`);
      const Res = await AxiosGet(Asin, Link).catch((err) => {
        console.trace(err);
        reject(err);
      });
      if (typeof Res !== "undefined") {
        let res = Res.data.split("\n").join("");
        const $ = Cheerio.load(res);
        $.prototype.exists = function (selector) {
          return this.find(selector).length > 0;
        };
        if ($("body").exists("#availability")) {
          const Availability = $("#availability").text().trim().toLowerCase();
          if (Availability.indexOf("currently unavailable") !== -1) {
            Output["Remarks"][index] = "Currently unavailable";
          }
        }
        if ($("body").exists("#bylineInfo")) {
          var Brand = $("#bylineInfo").text().split("by ");
          AddToOutput(
            "Brand",
            Brand[Brand.length - 1].replace("Brand: ", "").trim()
          );
        } else if ($("body").exists("#brand")) {
          var Brand = $("#bylineInfo").text().split("by ");
          AddToOutput(
            "Brand",
            Brand[Brand.length - 1].replace("Brand: ", "").trim()
          );
        } else if ($("body").exists("product-title_feature_div")) {
          var Brand = $("#bylineInfo").text().split("by ");
          AddToOutput(
            "Brand",
            Brand[Brand.length - 1].replace("Brand: ", "").trim()
          );
        } else {
          AddToOutput("Brand", "NA");
        }
        if ($("body").exists("#zeitgeistBadge_feature_div")) {
          var label = $("zeitgeistBadge_feature_div").text().trim();
          if (label.length == 0) {
            AddToOutput("Label", "NA");
          } else if (label.indexOf(" in ") !== -1) {
            label = label.split(" in ")[0];
            AddToOutput("Label", label.split("\n").join("").trim());
          } else {
            AddToOutput("Label", label.split("\n").join("").trim());
          }
        } else {
          AddToOutput("Label", "NA");
        }
        if ($("body").exists(".swatchAvailable")) {
          AddToOutput("Variation", "Yes");
        } else {
          AddToOutput("Variation", "No");
        }
        if (res.indexOf("<span>Subscribe now</span>") !== -1) {
          AddToOutput("Item_sold_as_subscribe_and_saved", "Yes");
        } else {
          AddToOutput("Item_sold_as_subscribe_and_saved", "No");
        }
        resolve({ $, res });
      } else {
        reject("Axios GET Request is Failing...");
      }
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetNumberOfAnsweredQuestions(Asin, AddToOutput) {
  return new Promise(async (resolve, reject) => {
    try {
      const Link = `https://www.amazon.com/ask/questions/asin/${Asin}/1/ref=ask_ql_psf_ql_hza`;
      const Res = await AxiosGet(Asin, Link).catch((err) => {
        console.trace(err);
        reject(err);
      });
      const $ = Cheerio.load(Res.data);
      $.prototype.exists = function (selector) {
        return this.find(selector).length > 0;
      };
      if ($("body").exists(".askPaginationHeaderMessage span")) {
        var QnA = $(".askPaginationHeaderMessage span")
          .text()
          .trim()
          .split(" of ");
        AddToOutput(
          "Number_of_answered_questions",
          QnA[1].split("questions").join("").split("question").join("").trim()
        );
      } else {
        AddToOutput("Number_of_answered_questions", 0);
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetRecentReview(Asin, AddToOutput) {
  return new Promise(async (resolve, reject) => {
    try {
      const Url = `https://www.amazon.com/product-reviews/${Asin}/ref=cm_cr_getr_d_paging_btm_next_2?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`;
      const Res = await AxiosGet(Asin, Url).catch((err) => {
        console.trace(err);
        reject(err);
      });
      if (typeof Res !== "undefined") {
        const $ = Cheerio.load(Res.data);
        $.prototype.exists = function (selector) {
          return this.find(selector).length > 0;
        };
        if ($("body").exists("#cm_cr-review_list .review-date")) {
          var ReviewDate = $("#cm_cr-review_list .review-date")
            .text()
            .split(" on ")[1]
            .split("Reviewed in the United States")
            .join("")
            .split("-")
            .join("")
            .split(",")
            .join("")
            .trim();
          AddToOutput("Recent_Review_Date", ReviewDate);
        } else {
          AddToOutput("Recent_Review_Date", "-");
        }
        if ($("body").exists("#filter-info-section span")) {
          var CustomerReviewCount = $("#filter-info-section span")
            .text()
            .split(" | ")[1]
            .replace("global", "")
            .replace("reviews", "")
            .replace("review", "")
            .replace(",", "")
            .trim();
          var MainReviews = $("#filter-info-section span")
            .text()
            .split(" | ")[0]
            .replace("global", "")
            .replace("ratings", "")
            .replace("rating", "")
            .replace(",", "")
            .trim();
          AddToOutput("Customer_Review_Count", CustomerReviewCount);
          AddToOutput("Main_Reviews", MainReviews);
        } else {
          AddToOutput("Customer_Review_Count", "0");
          AddToOutput("Main_Reviews", "0");
        }
        if ($("body").exists("#cm_cr-product_info .a-color-base")) {
          var AvgRatings = $("#cm_cr-product_info .a-color-base")
            .text()
            .split(" out of ")[0]
            .trim();
          AddToOutput("Average_Ratings", AvgRatings);
        } else {
          AddToOutput("Average_Ratings", "-");
        }
        resolve(true);
      } else {
        reject("Axios GET Request is Failing...");
      }
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetSalesAndShippingPrice($, AddToOutput) {
  return new Promise((resolve, reject) => {
    try {
      let ShipCost;
      let Ship = 0;
      let BBPrice = 0;
      if (
        $("body").exists(
          "#exports_desktop_qualifiedBuybox_tlc_feature_div span.a-color-secondary"
        )
      ) {
        ShipCost = $(
          "#exports_desktop_qualifiedBuybox_tlc_feature_div span.a-color-secondary"
        )
          .text()
          .toLowerCase()
          .split("shipping")[0]
          .split("$")[1]
          .replace("$", "")
          .replace(",", "")
          .replace("+", "")
          .trim();
        Ship = Number(ShipCost);
      } else if (
        $("body").exists(
          "#freeShippingPriceBadging_feature_div span.a-color-secondary"
        )
      ) {
        ShipCost = $(
          "#freeShippingPriceBadging_feature_div span.a-color-secondary"
        )
          .text()
          .toLowerCase()
          .replace("$", "")
          .replace(",", "")
          .split("shipping")
          .join("")
          .replace("+", "")
          .trim();
        Ship = Number(
          ShipCost.split("shipping").join("").replace("+", "").trim()
        );
      } else if ($("body").exists("#price-shipping-message > span")) {
        ShipCost = $("#price-shipping-message > span")
          .text()
          .toLowerCase()
          .replace("$", "")
          .replace(",", "")
          .split("shipping")
          .join("")
          .replace("+", "")
          .trim();
        Ship = Number(
          ShipCost.split("shipping").join("").replace("+", "").trim()
        );
      }
      if ($("body").exists("#corePrice_feature_div span.a-offscreen")) {
        BBPrice = Number(
          $("#corePrice_feature_div span.a-offscreen")
            .text()
            .replace("$", "")
            .replace(",", "")
            .trim()
        );
      } else if ($("body").exists(".apexPriceToPay span.a-offscreen")) {
        BBPrice = Number(
          $(".apexPriceToPay span.a-offscreen")
            .text()
            .replace("$", "")
            .replace(",", "")
            .trim()
        );
      } else if ($("body").exists("#price")) {
        BBPrice = Number(
          $("#price").text().replace("$", "").replace(",", "").trim()
        );
      } else if ($("body").exists("#price_inside_buybox")) {
        BBPrice = Number(
          $("#price_inside_buybox")
            .text()
            .replace("$", "")
            .replace(",", "")
            .trim()
        );
      }
      AddToOutput("BB_Price", BBPrice + Ship);
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetSellerInfo($, AddToOutput, index, Output) {
  return new Promise((resolve, reject) => {
    try {
      let BBSeller = "-";
      let isAmazonSeller = false;
      if ($("body").exists(".tabular-buybox-text #sellerProfileTriggerId")) {
        BBSeller = $(".tabular-buybox-text #sellerProfileTriggerId")
          .text()
          .trim();
      } else if ($("body").exists("#merchant-info")) {
        BBSeller = $("#merchant-info").text().trim();
      } else if ($("body").exists(".tabular-buybox-text > span")) {
        BBSeller = $(".tabular-buybox-text > span").text().trim();
      }
      AddToOutput("BuyBoxSeller", BBSeller);
      if (BBSeller.toLowerCase().indexOf("amazon") !== -1) {
        isAmazonSeller = true;
        AddToOutput("FBAorMF", "FBA");
        AddToOutput("Lowest_FBA_Price", Output["BB_Price"][index]);
        AddToOutput("Lowest_MF_price", "-");
      } else {
        AddToOutput("FBAorMF", "MF");
        AddToOutput("Lowest_MF_price", Output["BB_Price"][index]);
        AddToOutput("Lowest_FBA_Price", "-");
      }
      if (isAmazonSeller) {
        if ($("body").exists("#availability")) {
          var AmazonStatus = $("#availability").text().trim();
          if (AmazonStatus.toLowerCase() == "temporarily out of stock") {
            AddToOutput(
              "Amazon_Status",
              "Amazon Seller but Temperarily Out of Stock"
            );
          } else if (AmazonStatus.toLowerCase() == "left in stock") {
            AddToOutput("Amazon_Status", "Amazon Seller with Limited Quantity");
          } else {
            AddToOutput("Amazon_Status", "Amazon Seller");
          }
        } else {
          AddToOutput("Amazon_Status", "Amazon Seller");
        }
      } else {
        AddToOutput("Amazon_Status", "Amazon is not the Seller");
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetMPN(res, AddToOutput) {
  return new Promise((resolve, reject) => {
    try {
      let ITN = res.indexOf(
        '<th class="a-color-secondary a-size-base prodDetSectionEntry">Item model number</th><td class="a-size-base prodDetAttrValue">'
      );
      if (ITN !== -1) {
        let ITN2 = res.indexOf("</td>", ITN);
        let MPN = res
          .substring(ITN, ITN2)
          .replace(
            '<th class="a-color-secondary a-size-base prodDetSectionEntry">Item model number</th><td class="a-size-base prodDetAttrValue">',
            ""
          )
          .replace("&lrm;", "")
          .trim();
        AddToOutput("MPN", MPN);
      } else {
        AddToOutput("MPN", "-");
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function GetNumberOfAmazonSellers(Asin, index, AddToOutput, Output) {
  return new Promise(async (resolve, reject) => {
    try {
      let Sellers = [];
      let NumberOfFBAVendors = 0;
      if (Output["FBAorMF"][index] == "FBA") {
        NumberOfFBAVendors = 1;
      }
      const Selector = "#aod-offer-list > .aod-information-block";
      const Url = `https://www.amazon.com/gp/aod/ajax/ref=auto_load_aod?asin=${Asin}&pc=dp`;
      const Res = await AxiosGet(Asin, Url, true).catch((err) => {
        console.trace(err);
        reject(err);
      });
      let res = `<body>${Res.data.split("\n").join("")}</body>`;
      const $ = Cheerio.load(res);
      $.prototype.exists = function (selector) {
        return this.find(selector).length > 0;
      };
      if ($("body").exists(Selector)) {
        $(Selector).each((i, el) => {
          let offer = $.html(el);
          let Offer_Html = Cheerio.load(offer);
          // let Price = Offer_Html(`#aod-price-${i + 1} > .a-price > .a-offscreen`).text();
          let Seller = Offer_Html("#aod-offer-soldBy .a-col-right > a");
          if (Seller.text().length > 0) {
            if (Seller.text().toLowerCase().indexOf("amazon") !== -1) {
              NumberOfFBAVendors += 1;
            } else {
              let SellerID = Seller.attr("href");
              Sellers.push(SellerID.split("seller=")[1].split("&")[0].trim());
            }
          }
        });
        AddToOutput("Number_of_FBA_vendors", NumberOfFBAVendors);
        if (Sellers.length == 1) {
          AddToOutput("FBA_Seller_1", Sellers[0]);
          AddToOutput("FBA_Seller_2", "-");
          AddToOutput("FBA_Seller_3", "-");
          AddToOutput("FBA_Seller_4", "-");
        } else if (Sellers.length == 2) {
          AddToOutput("FBA_Seller_1", Sellers[0]);
          AddToOutput("FBA_Seller_2", Sellers[1]);
          AddToOutput("FBA_Seller_3", "-");
          AddToOutput("FBA_Seller_4", "-");
        } else if (Sellers.length == 3) {
          AddToOutput("FBA_Seller_1", Sellers[0]);
          AddToOutput("FBA_Seller_2", Sellers[1]);
          AddToOutput("FBA_Seller_3", Sellers[2]);
          AddToOutput("FBA_Seller_4", "-");
        } else if (Sellers.length >= 4) {
          AddToOutput("FBA_Seller_1", Sellers[0]);
          AddToOutput("FBA_Seller_2", Sellers[1]);
          AddToOutput("FBA_Seller_3", Sellers[2]);
          AddToOutput("FBA_Seller_4", Sellers[3]);
        } else {
          AddToOutput("FBA_Seller_1", "-");
          AddToOutput("FBA_Seller_2", "-");
          AddToOutput("FBA_Seller_3", "-");
          AddToOutput("FBA_Seller_4", "-");
        }
      } else {
        AddToOutput("Number_of_FBA_vendors", NumberOfFBAVendors);
        AddToOutput("FBA_Seller_1", "-");
        AddToOutput("FBA_Seller_2", "-");
        AddToOutput("FBA_Seller_3", "-");
        AddToOutput("FBA_Seller_4", "-");
      }
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

const Scrape = (Asin, index, AddToOutput, Output) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof Asin !== "undefined" && Asin.length > 0 && Asin !== "-") {
        const { $, res } = await Initialize(
          Asin,
          index,
          AddToOutput,
          Output
        ).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetNumberOfAnsweredQuestions(Asin, AddToOutput).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetRecentReview(Asin, AddToOutput).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetSalesAndShippingPrice($, AddToOutput).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetSellerInfo($, AddToOutput, index, Output).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetMPN(res, AddToOutput).catch((err) => {
          console.trace(err);
          reject(err);
        });
        await GetNumberOfAmazonSellers(Asin, index, AddToOutput, Output).catch(
          (err) => {
            console.trace(err);
            reject(err);
          }
        );
        resolve(true);
      } else {
        reject("Error in MWS...");
      }
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
};

module.exports = Scrape;
