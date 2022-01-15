const Keys = require("./Keys");
const Seller = Keys.MERCHANT_ID;
const AuthToken = Keys.ACCESS_KEY;
const MarketplaceID = Keys.MARKETPLACE_ID;
const CurrencyCode = "USD";

function ExtractData(res, AddToOutput, index, Output) {
  return new Promise((resolve, reject) => {
    try {
      let RefFee;
      let FeeList =
        res.FeesEstimateResultList.FeesEstimateResult.FeesEstimate.FeeDetailList
          .FeeDetail;
      FeeList.forEach((feeObj, num) => {
        let FinalFee = String(feeObj.FinalFee.Amount);
        let FeeType = String(feeObj.FeeType);
        if (FeeType == "ReferralFee") {
          RefFee = FinalFee;
        } else if (FeeType == "FBAFees") {
          let FBAFeeList = feeObj.IncludedFeeDetailList.FeeDetail;
          FBAFeeList.forEach((FBAFeeObj, n) => {
            let FBAFinalFee = FBAFeeObj.FinalFee.Amount;
            let FBAFeeType = String(FBAFeeObj.FeeType);
            if (FBAFeeType == "FBAWeightHandling") {
              AddToOutput("Weight_Handling", FBAFinalFee);
            } else if (FBAFeeType == "FBAOrderHandling") {
              AddToOutput("Order_Handling", FBAFinalFee);
            } else if (FBAFeeType == "FBAPickAndPack") {
              AddToOutput("Pick_And_Pack", FBAFinalFee);
              AddToOutput(
                "Thirty_Day_Storage",
                Math.round(parseFloat(FinalFee) * 0.02 * 100) / 100
              );
            }
          });
        } else if (FeeType == "VariableClosingFee") {
          AddToOutput("Variable_Closing_Fee", FinalFee);
        }
      });
      let amz_ref_fee =
        Number(RefFee) + Number(Output["Variable_Closing_Fee"][index]);
      AddToOutput("Amazon_referral_fee", amz_ref_fee);
      let fbafeescal =
        Number(Output["Order_Handling"][index]) +
        Number(Output["Pick_And_Pack"][index]) +
        Number(Output["Weight_Handling"][index]) +
        Number(Output["Thirty_Day_Storage"][index]);
      if (fbafeescal <= 9.99) {
        fbafeescal = Math.round(fbafeescal * 0.12 * 100) / 100;
      } else if (fbafeescal > 9.99 && fbafeescal <= 12) {
        fbafeescal = Math.round(fbafeescal * 0.15 * 100) / 100;
      } else if (fbafeescal > 12 && fbafeescal <= 14) {
        fbafeescal = Math.round(fbafeescal * 0.2 * 100) / 100;
      } else if (fbafeescal > 14 && fbafeescal <= 23) {
        fbafeescal = Math.round(fbafeescal * 0.24 * 100) / 100;
      } else {
        fbafeescal = Math.round(fbafeescal * 0.5 * 100) / 100;
      }
      AddToOutput("Ship_to_FBA", fbafeescal);
      let fcs =
        Number(Output["Order_Handling"][index]) +
        Number(Output["Pick_And_Pack"][index]) +
        Number(Output["Weight_Handling"][index]) +
        Number(Output["Thirty_Day_Storage"][index]);
      AddToOutput("Fullfilment_Cost_Subtotal", fcs);
      AddToOutput("SNL_Ship_to_FBA", "0.18");
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function RevenueCalc(index, MWS, AddToOutput, Output) {
  return new Promise((resolve, reject) => {
    try {
      if (Number(Output["BB_Price"][index]) > 0) {
        const BBPrice = Output["BB_Price"][index];
        const ASIN = Output["ASIN"][index];
        MWS.products.search(
          {
            Version: "2011-10-01",
            Action: "GetMyFeesEstimate",
            SellerId: Seller,
            MWSAuthToken: AuthToken,
            "FeesEstimateRequestList.FeesEstimateRequest.1.MarketplaceId":
              MarketplaceID,
            "FeesEstimateRequestList.FeesEstimateRequest.1.IdType": "ASIN",
            "FeesEstimateRequestList.FeesEstimateRequest.1.IdValue": ASIN,
            "FeesEstimateRequestList.FeesEstimateRequest.1.IsAmazonFulfilled":
              "true",
            "FeesEstimateRequestList.FeesEstimateRequest.1.Identifier": "r2",
            "FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.CurrencyCode":
              CurrencyCode,
            "FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.ListingPrice.Amount":
              BBPrice,
            "FeesEstimateRequestList.FeesEstimateRequest.1.PriceToEstimateFees.Points.PointsNumber":
              "0",
          },
          async function (err, res) {
            if (err) {
              AddToOutput("Weight_Handling", 0);
              AddToOutput("Order_Handling", 0);
              AddToOutput("Pick_And_Pack", 0);
              AddToOutput("Thirty_Day_Storage", 0);
              AddToOutput("Variable_Closing_Fee", 0);
              AddToOutput("Amazon_referral_fee", 0);
              AddToOutput("Fullfilment_Cost_Subtotal", 0);
              AddToOutput("Ship_to_FBA", 0);
              AddToOutput("SNL_Ship_to_FBA", "0.18");
              // AddToOutput("Item_eligible_for_SNL", "No");
              console.trace(err);
              reject(err);
            }
            await ExtractData(res, AddToOutput, index, Output)
              .then(() => {
                resolve(true);
              })
              .catch((err) => {
                console.trace(err);
                reject(err);
              });
          }
        );
      } else {
        AddToOutput("Weight_Handling", 0);
        AddToOutput("Order_Handling", 0);
        AddToOutput("Pick_And_Pack", 0);
        AddToOutput("Thirty_Day_Storage", 0);
        AddToOutput("Variable_Closing_Fee", 0);
        AddToOutput("Amazon_referral_fee", 0);
        AddToOutput("Fullfilment_Cost_Subtotal", 0);
        AddToOutput("Ship_to_FBA", 0);
        AddToOutput("SNL_Ship_to_FBA", "0.18");
        // AddToOutput("Item_eligible_for_SNL", "No");
        resolve(true);
      }
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function numToAlpha(num) {
  var alpha = "";
  for (; num >= 0; num = parseInt(num / 26, 10) - 1) {
    alpha = String.fromCharCode((num % 26) + 0x41) + alpha;
  }
  return alpha;
}

function FormulaCalc(VendorOffer, index, AddToOutput) {
  return new Promise((resolve, reject) => {
    try {
      AddToOutput("SNL_Ship_to_FBA", "0.18");
      AddToOutput("Item_eligible_for_SNL", "-");
      AddToOutput("Single_Location", 0);
      AddToOutput("Purchase_Qty", 1);
      AddToOutput("SPA", 0);
      AddToOutput("Purchase_Price_Base", 0);
      AddToOutput("Suggested_PPP", 0);
      AddToOutput("Discount_Required", 0);
      AddToOutput("Value", 0);
      AddToOutput("Breakeven", 0);
      AddToOutput("Difference_from_SP", 0);
      AddToOutput("Percentage_Diff_from_SP", 0);
      AddToOutput("Vendor_Offer_BE", 0);
      AddToOutput("Amazon_Commission", 0);
      AddToOutput("SNL_Breakeven", 0);
      AddToOutput("SNL_Difference_from_SP", 0);
      AddToOutput("SNL_Percentage_Diff_from_SP", 0);
      AddToOutput("Weight_in_lbs", 0);
      AddToOutput("Length_Girth", 0);
      AddToOutput("Size_Tier", "-");
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

const AddFormulae = (ws, XLSX, DataArray) => {
  return new Promise((resolve, reject) => {
    try {
      let SPA_COL = numToAlpha(38);
      let Price_Col = numToAlpha(20);
      let Amazon_referral_fee_col = numToAlpha(26);
      let Thirty_Day_Storage_col = numToAlpha(29);
      let Ship_to_FBA_col = numToAlpha(30);
      let Fullfilment_Cost_Subtotal_col = numToAlpha(31);
      let Single_Location_col = numToAlpha(43);
      let Purchase_Price_Base_col = numToAlpha(44);
      let Suggested_PPP_col = numToAlpha(45);
      let Difference_from_SP_col = numToAlpha(24);
      let SNL_Ship_to_FBA_col = numToAlpha(28);
      let SNL_Fullfilment_Cost_Subtotal_col = numToAlpha(58);
      // let Discount_Required_col = numToAlpha(22);
      let VendorOffer_col = numToAlpha(3);
      let Value_col = numToAlpha(47);
      let Breakeven_col = numToAlpha(23);
      let SNL_Breakeven_col = numToAlpha(59);
      let SNL_Difference_from_SP_col = numToAlpha(60);
      let item_package_weight_should_always_be_in_ounces_col = numToAlpha(57);
      let Weight_in_lbs_col = numToAlpha(62);
      let longest_side_col = numToAlpha(54);
      let median_side_col = numToAlpha(55);
      let shortest_side_col = numToAlpha(56);
      for (let i = 1; i < DataArray.length; i++) {
        let n = i + 1;
        let SPA = ws[XLSX.utils.encode_cell({ r: i, c: 38 })];
        SPA.t = "n";
        SPA.z = "0.00";
        SPA.f = `=${Price_Col}${n}*0.98`;
        let Purchase_Price_Base = ws[XLSX.utils.encode_cell({ r: i, c: 44 })];
        Purchase_Price_Base.t = "n";
        Purchase_Price_Base.z = "0.00";
        Purchase_Price_Base.f = `=${SPA_COL}${n}-${Amazon_referral_fee_col}${n}-${Thirty_Day_Storage_col}${n}-${Ship_to_FBA_col}${n}-${Fullfilment_Cost_Subtotal_col}${n}-${Single_Location_col}${n}`;
        let Suggested_PPP = ws[XLSX.utils.encode_cell({ r: i, c: 45 })];
        Suggested_PPP.t = "n";
        Suggested_PPP.z = "0.00";
        Suggested_PPP.f = `=${Purchase_Price_Base_col}${n}*0.98`;
        let Discount_Required = ws[XLSX.utils.encode_cell({ r: i, c: 22 })];
        Discount_Required.t = "n";
        Discount_Required.z = "0.00";
        Discount_Required.f = `=(${Suggested_PPP_col}${n}-${VendorOffer_col}${n})/${VendorOffer_col}${n}`;
        let Value = ws[XLSX.utils.encode_cell({ r: i, c: 47 })];
        Value.t = "n";
        Value.z = "0.00";
        Value.f = `=${VendorOffer_col}${n}*1`;
        let Breakeven = ws[XLSX.utils.encode_cell({ r: i, c: 23 })];
        Breakeven.t = "n";
        Breakeven.z = "0.00";
        Breakeven.f = `=${VendorOffer_col}${n}+${Amazon_referral_fee_col}${n}+${Ship_to_FBA_col}${n}+${Fullfilment_Cost_Subtotal_col}${n}`;
        let Difference_from_SP = ws[XLSX.utils.encode_cell({ r: i, c: 24 })];
        Difference_from_SP.t = "n";
        Difference_from_SP.z = "0.00";
        Difference_from_SP.f = `=${SPA_COL}${n}-${Breakeven_col}${n}`;
        let Percentage_Difference_from_SP =
          ws[XLSX.utils.encode_cell({ r: i, c: 25 })];
        Percentage_Difference_from_SP.t = "n";
        Percentage_Difference_from_SP.z = "0.00";
        Percentage_Difference_from_SP.f = `=${Difference_from_SP_col}${n}/${SPA_COL}${n}`;
        let Vendor_Offer_BE = ws[XLSX.utils.encode_cell({ r: i, c: 48 })];
        Vendor_Offer_BE.t = "n";
        Vendor_Offer_BE.z = "0.00";
        Vendor_Offer_BE.f = `=1.1764*(${Value_col}${n}+${Amazon_referral_fee_col}${n}+${Ship_to_FBA_col}${n}+${Fullfilment_Cost_Subtotal_col}${n})`;
        let Amazon_Commission = ws[XLSX.utils.encode_cell({ r: i, c: 49 })];
        Amazon_Commission.t = "n";
        Amazon_Commission.z = "0.00";
        Amazon_Commission.f = `=${Amazon_referral_fee_col}${n}/${SPA_COL}${n}`;
        let SNL_Breakeven = ws[XLSX.utils.encode_cell({ r: i, c: 59 })];
        SNL_Breakeven.t = "n";
        SNL_Breakeven.z = "0.00";
        SNL_Breakeven.f = `=${Value_col}${n}+${Amazon_referral_fee_col}${n}+${SNL_Ship_to_FBA_col}${n}+${SNL_Fullfilment_Cost_Subtotal_col}${n}+0.25`;
        let SNL_Difference_from_SP =
          ws[XLSX.utils.encode_cell({ r: i, c: 60 })];
        SNL_Difference_from_SP.t = "n";
        SNL_Difference_from_SP.z = "0.00";
        SNL_Difference_from_SP.f = `=${Price_Col}${n}-${SNL_Breakeven_col}${n}`;
        let SNL_Percentage_Diff_from_SP =
          ws[XLSX.utils.encode_cell({ r: i, c: 61 })];
        SNL_Percentage_Diff_from_SP.t = "n";
        SNL_Percentage_Diff_from_SP.z = "0.00";
        SNL_Percentage_Diff_from_SP.f = `=${SNL_Difference_from_SP_col}${n}/${Price_Col}${n}`;
        let Weight_in_lbs = ws[XLSX.utils.encode_cell({ r: i, c: 62 })];
        Weight_in_lbs.t = "n";
        Weight_in_lbs.z = "0.00";
        Weight_in_lbs.f = `=${item_package_weight_should_always_be_in_ounces_col}${n}/16`;
        let Length_Girth = ws[XLSX.utils.encode_cell({ r: i, c: 63 })];
        Length_Girth.t = "n";
        Length_Girth.z = "0.00";
        Length_Girth.f = `=${longest_side_col}${n}+2*(${median_side_col}${n}+${shortest_side_col}${n})`;
        let Size_Tier = ws[XLSX.utils.encode_cell({ r: i, c: 64 })];
        Size_Tier.t = "n";
        Size_Tier.z = "0.00";
        Size_Tier.f = `=IF(AND(${Weight_in_lbs_col}${n}<=20,${longest_side_col}${n}<=18,${median_side_col}${n}<=14,${shortest_side_col}${n}<=8),"Standard Sized","Oversized")`;
        let Item_eligible_for_SNL = ws[XLSX.utils.encode_cell({ r: i, c: 53 })];
        Item_eligible_for_SNL.t = "s";
        Item_eligible_for_SNL.f = `=IF(AND(${longest_side_col}${n}<=18,${median_side_col}${n}<=14,${shortest_side_col}${n}<=8,${Weight_in_lbs_col}${n}<=12,${SNL_Breakeven_col}${n}<=7),"Yes","No")`;
      }
      resolve(ws);
    } catch (e) {
      console.trace(e);
      reject(e);
    }
  });
};

module.exports = { RevenueCalc, FormulaCalc, AddFormulae };
