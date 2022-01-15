function Output() {
  let output = {
    uuid: [],
    Input: [],
    Remarks: [],
    MPN: [],
    Brand: [],
    Hyperlink: [],
    ASIN: [],
    Customer_Review_Count: [],
    Recent_Review_Date: [],
    Average_Ratings: [],
    Main_Reviews: [],
    Number_of_answered_questions: [],
    Rank: [],
    Sub_Rank_1: [],
    Sub_Rank_2: [],
    Amazon_Status: [],
    BuyBoxSeller: [],
    BB_Price: [],
    Number_of_FBA_vendors: [],
    Amazon_referral_fee: [],
    Pick_And_Pack: [],
    SNL_Ship_to_FBA: [],
    Thirty_Day_Storage: [],
    Ship_to_FBA: [],
    FBAorMF: [],
    Variable_Closing_Fee: [],
    Order_Handling: [],
    Weight_Handling: [],
    Sales_Rank_Category: [],
    Label: [],
    Lowest_MF_price: [],
    Lowest_FBA_Price: [],
    FBA_Seller_1: [],
    FBA_Seller_2: [],
    FBA_Seller_3: [],
    FBA_Seller_4: [],
    Single_Location: [],
    Purchase_Qty: [],
    Vendor_Offer: [],
    Variation: [],
    Item_sold_as_subscribe_and_saved: [],
    Number_of_SNL_Sellers: [],
    Item_eligible_for_SNL: [],
    longest_side: [],
    median_side: [],
    shortest_side: [],
    item_package_weight_should_always_be_in_ounces: [],
    SNL_Fullfillment_cost: [],
    Discount_Required: [],
    Breakeven: [],
    Difference_from_SP: [],
    Percentage_Diff_from_SP: [],
    Fullfilment_Cost_Subtotal: [],
    SNL_Breakeven: [],
    SNL_Difference_from_SP: [],
    SNL_Percentage_Diff_from_SP: [],
    Weight_in_lbs: [],
    Length_Girth: [],
    Size_Tier: [],
    Value: [],
    Vendor_Offer_BE: [],
    Amazon_Commission: [],
    Purchase_Price_Base: [],
    Suggested_PPP: [],
    SPA: [],
    SNL_Order_handling: [],
    SNL_Pick_and_pack: [],
  };
  return output;
}

function Resp() {
  let resp = {
    isAsin: false,
    Total: 0,
    Success: 0,
    Fail: 0,
    Status: "Idle",
    Fail_List: [],
    All_Status: 0,
    fileName: "Input.xlsx",
  };
  return resp;
}

module.exports = { Output, Resp };
