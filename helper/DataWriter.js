const Create_Tx_And_Insert = require("../../database/postgres_db_tx");
const AmazonUSA = require("../../models/amazon_usa");

async function InsertData(i, Output) {
  return new Promise(async (resolve, reject) => {
    try {
      const uuid = Output["uuid"][i];
      const Input = Output["Input"][i];
      const MPN = Output["MPN"][i];
      const Remarks = Output["Remarks"][i];
      const Brand = Output["Brand"][i];
      const Hyperlink = Output["Hyperlink"][i];
      const ASIN = Output["ASIN"][i];
      const Customer_Review_Count = Output["Customer_Review_Count"][i];
      const Recent_Review_Date = Output["Recent_Review_Date"][i];
      const Average_Ratings = Output["Average_Ratings"][i];
      const Number_of_answered_questions =
        Output["Number_of_answered_questions"][i];
      const Main_Reviews = Output["Main_Reviews"][i];
      const Rank = Output["Rank"][i];
      const Sub_Rank_1 = Output["Sub_Rank_1"][i];
      const Sub_Rank_2 = Output["Sub_Rank_2"][i];
      const Amazon_Status = Output["Amazon_Status"][i];
      const BuyBoxSeller = Output["BuyBoxSeller"][i];
      const BB_Price = Output["BB_Price"][i];
      const Number_of_FBA_vendors = Output["Number_of_FBA_vendors"][i];
      const Amazon_referral_fee = Output["Amazon_referral_fee"][i];
      const Pick_And_Pack = Output["Pick_And_Pack"][i];
      const SNL_Ship_to_FBA = Output["SNL_Ship_to_FBA"][i];
      const Thirty_Day_Storage = Output["Thirty_Day_Storage"][i];
      const Ship_to_FBA = Output["Ship_to_FBA"][i];
      const Variable_Closing_Fee = Output["Variable_Closing_Fee"][i];
      const Order_Handling = Output["Order_Handling"][i];
      const Weight_Handling = Output["Weight_Handling"][i];
      const Sales_Rank_Category = Output["Sales_Rank_Category"][i];
      const Label = Output["Label"][i];
      const Lowest_MF_price = Output["Lowest_MF_price"][i];
      const Lowest_FBA_Price = Output["Lowest_FBA_Price"][i];
      const FBA_Seller_1 = Output["FBA_Seller_1"][i];
      const FBA_Seller_2 = Output["FBA_Seller_2"][i];
      const FBA_Seller_3 = Output["FBA_Seller_3"][i];
      const FBA_Seller_4 = Output["FBA_Seller_4"][i];
      const Single_Location = Output["Single_Location"][i];
      const Purchase_Qty = Output["Purchase_Qty"][i];
      const Vendor_Offer = Output["Vendor_Offer"][i];
      const Variation = Output["Variation"][i];
      const Item_sold_as_subscribe_and_saved =
        Output["Item_sold_as_subscribe_and_saved"][i];
      const Number_of_SNL_Sellers = Output["Number_of_SNL_Sellers"][i];
      const Item_eligible_for_SNL = Output["Item_eligible_for_SNL"][i];
      const longest_side = Output["longest_side"][i];
      const median_side = Output["median_side"][i];
      const shortest_side = Output["shortest_side"][i];
      const item_package_weight_should_always_be_in_ounces =
        Output["item_package_weight_should_always_be_in_ounces"][i];
      const SNL_Fullfillment_cost = Output["SNL_Fullfillment_cost"][i];
      const Discount_Required = Output["Discount_Required"][i];
      const Breakeven = Output["Breakeven"][i];
      const Difference_from_SP = Output["Difference_from_SP"][i];
      const Percentage_Diff_from_SP = Output["Percentage_Diff_from_SP"][i];
      const Fullfilment_Cost_Subtotal = Output["Fullfilment_Cost_Subtotal"][i];
      const SNL_Breakeven = Output["SNL_Breakeven"][i];
      const SNL_Difference_from_SP = Output["SNL_Difference_from_SP"][i];
      const SNL_Percentage_Diff_from_SP =
        Output["SNL_Percentage_Diff_from_SP"][i];
      const Weight_in_lbs = Output["Weight_in_lbs"][i];
      const Length_Girth = Output["Length_Girth"][i];
      const Size_Tier = Output["Size_Tier"][i];
      const Value = Output["Value"][i];
      const Vendor_Offer_BE = Output["Vendor_Offer_BE"][i];
      const Amazon_Commission = Output["Amazon_Commission"][i];
      const Purchase_Price_Base = Output["Purchase_Price_Base"][i];
      const Suggested_PPP = Output["Suggested_PPP"][i];
      const SPA = Output["SPA"][i];

      let Data = {
        uuid: uuid,
        Input_ASIN: Input,
        Vendor_Offer: Vendor_Offer,
        Remarks: Remarks,
        MPN: MPN,
        Brand: Brand,
        Hyperlink: Hyperlink,
        ASIN: ASIN,
        Customer_Review_Count: Customer_Review_Count,
        Recent_Review_Date: Recent_Review_Date,
        Average_Ratings: Average_Ratings,
        Main_Reviews: Main_Reviews,
        Number_of_answered_questions: Number_of_answered_questions,
        Rank: Rank,
        Sub_Rank_1: Sub_Rank_1,
        Sub_Rank_2: Sub_Rank_2,
        Sales_Rank_Category: Sales_Rank_Category,
        Amazon_Status: Amazon_Status,
        BuyBoxSeller: BuyBoxSeller,
        BB_Price: BB_Price,
        Number_of_FBA_vendors: Number_of_FBA_vendors,
        Discount_Required: Discount_Required,
        Breakeven: Breakeven,
        Difference_from_SP: Difference_from_SP,
        Percentage_Diff_from_SP: Percentage_Diff_from_SP,
        Amazon_referral_fee: Amazon_referral_fee,
        Pick_And_Pack: Pick_And_Pack,
        SNL_Ship_to_FBA: SNL_Ship_to_FBA,
        Thirty_Day_Storage: Thirty_Day_Storage,
        Ship_to_FBA: Ship_to_FBA,
        Fullfilment_Cost_Subtotal: Fullfilment_Cost_Subtotal,
        Variable_Closing_Fee: Variable_Closing_Fee,
        Order_Handling: Order_Handling,
        Weight_Handling: Weight_Handling,
        Label: Label,
        Lowest_MF_price: Lowest_MF_price,
        Lowest_FBA_Price: Lowest_FBA_Price,
        SPA: SPA,
        FBA_Seller_1: FBA_Seller_1,
        FBA_Seller_2: FBA_Seller_2,
        FBA_Seller_3: FBA_Seller_3,
        FBA_Seller_4: FBA_Seller_4,
        Single_Location: Single_Location,
        Purchase_Price_Base: Purchase_Price_Base,
        Suggested_PPP: Suggested_PPP,
        Purchase_Qty: Purchase_Qty,
        Value: Value,
        Vendor_Offer_BE: Vendor_Offer_BE,
        Amazon_Commission: Amazon_Commission,
        Variation: Variation,
        Item_sold_as_subscribe_and_saved: Item_sold_as_subscribe_and_saved,
        Number_of_SNL_Sellers: Number_of_SNL_Sellers,
        Item_eligible_for_SNL: Item_eligible_for_SNL,
        longest_side: longest_side,
        median_side: median_side,
        shortest_side: shortest_side,
        item_package_weight_should_always_be_in_ounces:
          item_package_weight_should_always_be_in_ounces,
        SNL_Fullfillment_cost: SNL_Fullfillment_cost,
        SNL_Breakeven: SNL_Breakeven,
        SNL_Difference_from_SP: SNL_Difference_from_SP,
        SNL_Percentage_Diff_from_SP: SNL_Percentage_Diff_from_SP,
        Weight_in_lbs: Weight_in_lbs,
        Length_Plus_Girth: Length_Girth,
        Size_Tier: Size_Tier,
      };
      let Options = {
        Where: "Input_ASIN",
        Data: Data,
      };
      await Create_Tx_And_Insert(AmazonUSA, Options)
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          reject(e);
        });
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

function WriteData(i, Output) {
  return new Promise(async (resolve, reject) => {
    try {
      await InsertData(i, Output);
      resolve(true);
    } catch (err) {
      console.trace(err);
      reject(err);
    }
  });
}

module.exports = WriteData;
