/**
 * Models/languageStrings.js
 *
 * Create mongoDB Schema for the language string details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const languageStrings = new Schema({
  appName: {
    type: String,
    default: "Smart Move",
  },
  E_Mail: {
    type: String,
    default: "",
  },
  smartMove: {
    type: String,
    default: "SmartMove",
  },
  todoTitle: {
    type: String,
    default: "",
  },
  Password: {
    type: String,
    default: "",
  },
  Log_In: {
    type: String,
    default: "",
  },
  Forgot_Password: {
    type: String,
    default: "",
  },
  Register: {
    type: String,
    default: "",
  },
  First_Name: {
    type: String,
    default: "",
  },
  Last_Name: {
    type: String,
    default: "",
  },
  Birthday: {
    type: String,
    default: "",
  },
  Country: {
    type: String,
    default: "",
  },
  Language: {
    type: String,
    default: "",
  },
  Conditions: {
    type: String,
    default: "",
  },
  Data_Protection: {
    type: String,
    default: "",
  },
  Back: {
    type: String,
    default: "",
  },
  Name: {
    type: String,
    default: "",
  },
  Enter_Relocated_Profile: {
    type: String,
    default: "",
  },
  Repeat_Password: {
    type: String,
    default: "",
  },
  Confirm_Password: {
    type: String,
    default: "",
  },
  Enter_Email: {
    type: String,
    default: "",
  },
  Valid_Email: {
    type: String,
    default: "",
  },
  Enter_Password: {
    type: String,
    default: "",
  },
  Enter_Repeat_Password: {
    type: String,
    default: "",
  },
  Valid_Password: {
    type: String,
    default: "",
  },
  Valid_Password_desc: {
    type: String,
    default: "",
  },
  Enter_FirstName: {
    type: String,
    default: "",
  },
  Enter_LastName: {
    type: String,
    default: "",
  },
  Select_Birthday: {
    type: String,
    default: "",
  },
  Enter_Country: {
    type: String,
    default: "",
  },
  Enter_Language: {
    type: String,
    default: "",
  },
  Please_Select_Conditions: {
    type: String,
    default: "",
  },
  Please_Select_Data: {
    type: String,
    default: "",
  },
  Password_Mismatch: {
    type: String,
    default: "",
  },
  Password_and_confirm_Mismatch: {
    type: String,
    default: "",
  },
  Moving_Profile: {
    type: String,
    default: "",
  },
  Invite_User: {
    type: String,
    default: "",
  },
  Log_Out: {
    type: String,
    default: "",
  },
  Delete_Account: {
    type: String,
    default: "",
  },
  Send: {
    type: String,
    default: "",
  },
  Currency: {
    type: String,
    default: "",
  },
  Notification_Change: {
    type: String,
    default: "",
  },
  Out_In: {
    type: String,
    default: "",
  },
  Out_Of: {
    type: String,
    default: "",
  },
  Terms_Use: {
    type: String,
    default: "",
  },
  Support: {
    type: String,
    default: "",
  },
  Smartmove_Premium: {
    type: String,
    default: "",
  },
  Function_Expansion: {
    type: String,
    default: "",
  },
  Accounting: {
    type: String,
    default: "",
  },
  Contents: {
    type: String,
    default: "",
  },
  Additional_User: {
    type: String,
    default: "",
  },
  Buy: {
    type: String,
    default: "",
  },
  Furniture: {
    type: String,
    default: "",
  },
  Calendar: {
    type: String,
    default: "",
  },
  Shopping_List: {
    type: String,
    default: "",
  },
  To_Do_List: {
    type: String,
    default: "",
  },
  Scale: {
    type: String,
    default: "",
  },
  Cardboard_Roomplanner: {
    type: String,
    default: "",
  },
  d3_Planner: {
    type: String,
    default: "",
  },
  Add_Furniture: {
    type: String,
    default: "",
  },
  Edit_Furniture: {
    type: String,
    default: "",
  },
  Title: {
    type: String,
    default: "",
  },
  Link: {
    type: String,
    default: "",
  },
  Dimensions: {
    type: String,
    default: "",
  },
  Price: {
    type: String,
    default: "",
  },
  Add: {
    type: String,
    default: "",
  },
  Enter_Title: {
    type: String,
    default: "",
  },
  Enter_Valid_Link: {
    type: String,
    default: "",
  },
  Enter_Width: {
    type: String,
    default: "",
  },
  Enter_Height: {
    type: String,
    default: "",
  },
  Enter_Length: {
    type: String,
    default: "",
  },
  Enter_Price: {
    type: String,
    default: "",
  },
  Total_Expenses: {
    type: String,
    default: "",
  },
  Save: {
    type: String,
    default: "",
  },
  Search: {
    type: String,
    default: "",
  },
  Completed: {
    type: String,
    default: "",
  },
  Are_you_sure_delete_furniture: {
    type: String,
    default: "",
  },
  Cancel: {
    type: String,
    default: "",
  },
  No_data_available: {
    type: String,
    default: "",
  },
  No_entries_added_yet: {
    type: String,
    default: "",
  },
  Update: {
    type: String,
    default: "",
  },
  English: {
    type: String,
    default: "",
  },
  German: {
    type: String,
    default: "",
  },
  Empty_checkbox: {
    type: String,
    default: "",
  },
  LogOut_Text: {
    type: String,
    default: "",
  },
  Delete_Text: {
    type: String,
    default: "",
  },
  Delete_item: {
    type: String,
    default: "",
  },
  Delete_relocation_profile: {
    type: String,
    default: "",
  },
  OK: {
    type: String,
    default: "",
  },
  SmartMove_tips: {
    type: String,
    default: "",
  },
  Submit: {
    type: String,
    default: "",
  },
  Change_Password: {
    type: String,
    default: "",
  },
  Something_went_wrong: {
    type: String,
    default: "",
  },
  Add_Profile: {
    type: String,
    default: "",
  },
  Please_enter_value: {
    type: String,
    default: "",
  },
  CHF: {
    type: String,
    default: "",
  },
  Euro: {
    type: String,
    default: "",
  },
  Pound: {
    type: String,
    default: "",
  },
  Currency_Change_Successfully: {
    type: String,
    default: "",
  },
  Continue_with_Apple: {
    type: String,
    default: "",
  },
  Continue_with_Google: {
    type: String,
    default: "",
  },
  Continue_with_Facebook: {
    type: String,
    default: "",
  },
  User: {
    type: String,
    default: "",
  },
  Measurements: {
    type: String,
    default: "",
  },
  Please_enter_your_email_address: {
    type: String,
    default: "",
  },
  Forgotten_password: {
    type: String,
    default: "",
  },
  Confirm_EMail: {
    type: String,
    default: "",
  },
  Please_enter_the_code: {
    type: String,
    default: "",
  },
  Confirm: {
    type: String,
    default: "",
  },
  Set_new_password: {
    type: String,
    default: "",
  },
  Please_set_your_new_password: {
    type: String,
    default: "",
  },
  New_Password: {
    type: String,
    default: "",
  },
  Confirm_new_password: {
    type: String,
    default: "",
  },
  Set: {
    type: String,
    default: "",
  },
  Please_enter_new_password: {
    type: String,
    default: "",
  },
  Please_enter_confirm_new_password: {
    type: String,
    default: "",
  },
  Please_enter_otp: {
    type: String,
    default: "",
  },
  Both_password_doesnot_match: {
    type: String,
    default: "",
  },
  create_new_relocation_profile: {
    type: String,
    default: "",
  },
  please_enter_a_relocation_profile_name: {
    type: String,
    default: "",
  },
  please_enter_valid_otp: {
    type: String,
    default: "",
  },
  French: {
    type: String,
    default: "",
  },
  Italian: {
    type: String,
    default: "",
  },
  Please_enter_the_code_register: {
    type: String,
    default: "",
  },
  Please_confirm_that_you_have_read: {
    type: String,
    default: "",
  },
  Terms_conditions: {
    type: String,
    default: "",
  },
  and: {
    type: String,
    default: "",
  },
  privacy_policy: {
    type: String,
    default: "",
  },
  Rate_SmartMove: {
    type: String,
    default: "",
  },
  Recommend_SmartMove: {
    type: String,
    default: "",
  },
  Are_you_satisfied: {
    type: String,
    default: "",
  },
  Evaluate: {
    type: String,
    default: "",
  },
  Please_enter_valid_link: {
    type: String,
    default: "",
  },
  Enter_Your_Feedback: {
    type: String,
    default: "",
  },
  Upgrade_plan_to_add_more_items_completed: {
    type: String,
    default: "",
  },
  Please_enter_price: {
    type: String,
    default: "",
  },
  Budget: {
    type: String,
    default: "",
  },
  Total: {
    type: String,
    default: "",
  },
  Cost: {
    type: String,
    default: "",
  },
  Remaining_budget: {
    type: String,
    default: "",
  },
  Just_add_something: {
    type: String,
    default: "",
  },
  Upgrade_plan_to_add_more_items: {
    type: String,
    default: "",
  },
  Write_your_feedback: {
    type: String,
    default: "",
  },
  Delete: {
    type: String,
    default: "",
  },
  Access_to_add_data: {
    type: String,
    default: "",
  },
  Please_Enter_Relocation_Profile_Name: {
    type: String,
    default: "",
  },
  Enter_Relocated_Profile: {
    type: String,
    default: "",
  },
  Create_New_Relocation_Profile: {
    type: String,
    default: "",
  },
  Please_enter_link: {
    type: String,
    default: "",
  },
  Not_valid_link: {
    type: String,
    default: "",
  },
  Saved: {
    type: String,
    default: "",
  },
  Favorites: {
    type: String,
    default: "",
  },
  Bought: {
    type: String,
    default: "",
  },
  User_Delete_Successfully: {
    type: String,
    default: "",
  },
  Select_Date_Of_Birth: {
    type: String,
    default: "",
  },
  Language_Change_Successfully: {
    type: String,
    default: "",
  },
  Main_user: {
    type: String,
    default: "",
  },
  Co_user: {
    type: String,
    default: "",
  },
  Austria: {
    type: String,
    default: "",
  },
  Germany: {
    type: String,
    default: "",
  },
  Switzerland: {
    type: String,
    default: "",
  },
  Invite_A_Co_User: {
    type: String,
    default: "",
  },
  Upgrade_plan_to_see_page_details: {
    type: String,
    default: "",
  },
  Send_email_again: {
    type: String,
    default: "",
  },
  Code_expires_description: {
    type: String,
    default: "",
  },
  Resend_in: {
    type: String,
    default: "",
  },
  Delete_Account_title: {
    type: String,
    default: "",
  },
  Logout_title: {
    type: String,
    default: "",
  },
  Please_check_your_internet_connection: {
    type: String,
    default: "",
  },
  Tap_to_open_camera: {
    type: String,
    default: "",
  },
  Delete_Measurement: {
    type: String,
    default: "",
  },
  Moving_profile_name: {
    type: String,
    default: "",
  },
  Delete_moving_profile: {
    type: String,
    default: "",
  },
  confirm: {
    type: String,
    default: "",
  },
  Loading: {
    type: String,
    default: "",
  },
  Delete_Item_list: {
    type: String,
    default: "",
  },
  Capture_measurement: {
    type: String,
    default: "",
  },
  Replace_measurement: {
    type: String,
    default: "",
  },
  You_can_add_only_2_rooms: {
    type: String,
    default: "",
  },
  todo_info: {
    type: String,
    default: "",
  },
  note: {
    type: String,
    default: "",
  },
  One_field_at_a_time: {
    type: String,
    default: "",
  },
  Please_enter_moving_profile_name: {
    type: String,
    default: "",
  },
  Enter_City: {
    type: String,
    default: "",
  },
  Place_of_residence: {
    type: String,
    default: "",
  },
  Subscription_modal_sub_title_one: {
    type: String,
    default: "",
  },
  Subscription_modal_sub_title_two: {
    type: String,
    default: "",
  },
  Subscription_modal_main_title: {
    type: String,
    default: "",
  },
  Renew_subscription: {
    type: String,
    default: "",
  },
  language_id: {
    type: Schema.Types.ObjectId,
    ref: "languages",
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const LanguageStringsModel = mongoose.model("LanguageStrings", languageStrings);

module.exports = LanguageStringsModel;
