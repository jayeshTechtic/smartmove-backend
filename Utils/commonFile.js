/**
 * CommonFile.js
 *
 * List of all the common methods here.
 */
var nodemailer = require("nodemailer");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const sha512 = require("js-sha512").sha512;
const jwt = require("jsonwebtoken");
const config = require("dotenv").config();
const CategoryModel = require("../src/schema/category.schema");
const translate = require("translate-google");
const UserModel = require("../src/schema/user.schema");
const { ObjectId } = require("bson");

// print console log
/*
    write down the Params 
    No of Params
    message: message,
    data1: data1,
    data2: data2,
    data3: data3 
*/
let printConsole = (message, data1 = null, data2 = null, data3 = null) => {
  console.log(message, data1, data2, data3);
};

// Send email to any user
/*
    write down the Params 
    No of Params
    mailTo: mailTo,
    mailSubject: mailSubject,
    mailHtml: mailHtml,
    attachment: attachment 
*/
let sendMail = (mailTo, mailSubject, mailHtml, attachment) => {
  try {
    // connect with mailtrap account
    const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // parameter which needs to send in mail
    var mailOptions = {
      from: process.env.MAIL_FROM,
      to: mailTo,
      // to: "techtic.avani@gmail.com",
      subject: mailSubject,
      html: mailHtml,
      Attachments: attachment,
    };

    // send the mail using given option
    transport.sendMail(mailOptions, function (err, info) {
      if (err) {
        printConsole(err);
        throw err;
      } else {
        printConsole("Email sent: " + info.response);
        return "Email sent: " + info.response;
      }
    });
  } catch (error) {
    printConsole(error);
  }
};

// encryt your password
/*
    write down the Params 
    No of Params
    password: password,
    salt: salt 
*/
// let sha512Funtion = async (password, salt) => {
//     try {
//         const m2 = crypto.createHash("sha512");
//         const hash = m2.update(password).digest("hex");
//         var sha512_2 = sha512(hash + salt);
//         return sha512_2;
//     } catch (error) {
//         printConsole(error);
//     }
// }

// encryt user data before creating jwt token
/*
    write down the Params 
    No of Params
    obj: user data object,
    key: key 
*/
let encrypt = async (obj, key) => {
  const text = JSON.stringify(obj);
  const cipher = CryptoJS.AES.encrypt(text, key.toString()).toString();
  return cipher;
};

// decryt user data before decryting jwt token
/*
    write down the Params 
    No of Params
    encryptedText: encryptedText,
    key: key 
*/
let decrypt = async (encryptedText, key) => {
  const decipher = CryptoJS.AES.decrypt(encryptedText, key.toString());
  return JSON.parse(decipher.toString(CryptoJS.enc.Utf8));
};

// create jwt token
/*
    write down the Params 
    No of Params
    data: data
*/
let createJwtToken = async (data, userId) => {
  try {
    return jwt.sign({ data, user_id: userId }, config.parsed.JWT_SECRET, {
      expiresIn: "7d", // expires in 7 days
    });
  } catch (error) {
    throw error;
  }
};

// create refresh jwt token
/*
    write down the Params 
    No of Params
    token: token
    userData: userData
*/
let refreshJwtToken = async (token, userData) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    const payload = decoded["payload"];
    if (payload) {
      delete payload.iat;
      delete payload.exp;
    }
    return createJwtToken(userData);
  } catch (error) {
    throw error;
  }
};

// get List of cateogry for todo List
/*
    write down the Params 
    No of Params
*/
let getListOfCategory = () => {
  try {
    return CategoryModel.find();
  } catch (error) {
    throw error;
  }
};

// transale the text in given language
/*
    write down the Params 
    No of Params
    textToTranslate: textToTranslate
*/
let translateTheText = async (textToTranslate) => {
  try {
    printConsole(process.env.USER_SELECTED_LANGUAGE);
    return await translate(textToTranslate, {
      to: process.env.USER_SELECTED_LANGUAGE,
    })
      .then((translation) => {
        printConsole(translation);
        return translation;
      })
      .catch((error) => {
        console.error("Error during translation:", error);
      });
  } catch (error) {
    throw error;
  }
};

// create refresh jwt token
/*
    write down the Params 
    No of Params
    user_id: user_id
*/
let setGlobalLanguage = async (user_id) => {
  try {
    const data = await UserModel.findOne(
      { _id: new ObjectId(user_id) },
      { language: 1 }
    );
    process.env.USER_SELECTED_LANGUAGE = data ? data?.language : "de";
    console.log(process.env.USER_SELECTED_LANGUAGE, data && data?.language);
  } catch (error) {
    throw error;
  }
};

let getUserbyProfileId = async (profile_id) => {
  try {
    const user = await UserModel.findOne({
      "profiles._id": profile_id,
    });
    if (!user || !user.profiles || user.profiles.length === 0) {
      throw new Error("User or profile not found");
    }
    return user;
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
};

// send push notification
/*
    write down the Params 
    No of Params
    title
    body,
    token
*/
const admin = require("firebase-admin");
const googleServicesPushMotification = require("./../google-services-push-notification.json");
const InvitedUserModel = require("../src/schema/invitedUser.schema");

admin.initializeApp({
  credential: admin.credential.cert(googleServicesPushMotification),
});

let sendPushNotification = async ({ title, body, token }) => {
  try {
    // const registrationToken =
    //   "dMzNVbi7S1SFAvlh3u15eB:APA91bGx_4uDy0eXNb3SEzwy720hRJoa_Q3mH_AzabavfyVBVD6Cpb_pDL3-cm_g5PqdWT5I5PrPuRHk2_R2PIpvJPXHlHr9Ycse_Eoe7Qo5WJCB_h7pchdmTBjmm21Lfh5Fi0rBcDTk";

    // const message = {
    //   notification: {
    //     title: "Title of the notification",
    //     body: "Body of the notification",
    //   },
    //   token: registrationToken,
    // };
    // console.log("title-------", title);
    // console.log("body--------", body);
    // console.log("token-------", token);
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        return true;
        console.error("Error sending message:", error);
      });
  } catch (error) {
    return true;
    // throw error;
  }
};

let sendPushNotificationOnActions = async (body, decoded) => {
  const isThereAnyUserIvitedwithCurrentProfileId = await InvitedUserModel.find({
    profile_id: body.profile_id,
  });

  if (
    isThereAnyUserIvitedwithCurrentProfileId &&
    isThereAnyUserIvitedwithCurrentProfileId?.length > 0
  ) {
    await Promise.all(
      isThereAnyUserIvitedwithCurrentProfileId.map(async (data) => {
        const id1 = new ObjectId(data.parent_id);
        const id2 = new ObjectId(decoded.user_id);

        // send notification to all co-users
        if (id1.equals(id2)) {
          const coUserList = await UserModel.find(
            {
              email: data.email,
            },
            { device: 1 }
          );
          if (coUserList && coUserList?.length > 0) {
            coUserList.forEach((couser) => {
              if (couser?.device && couser?.device?.length > 0) {
                couser?.device.forEach((token) => {
                  if (token?.token) {
                    const payload = {
                      title: "Smartmove",
                      body: "",
                      token: token?.token,
                    };
                    payload.body = `${
                      decoded.first_name + " " + decoded.last_name
                    } has made one or more changes`;
                    sendPushNotification(payload);
                  }
                });
              }
            });
          }
        } else {
          // send notification to main-users
          let userData = await getUserbyProfileId(body.profile_id);
          if (userData?.device && userData?.device?.length > 0) {
            userData?.device.forEach((token) => {
              if (token?.token) {
                const payload = {
                  title: "Smartmove",
                  body: "",
                  token: token?.token,
                };
                payload.body = `${
                  decoded.first_name + " " + decoded.last_name
                } has made one or more changes`;
                sendPushNotification(payload);
              }
            });
          }
        }
      })
    );
  }
};

// Sort object in descending based on value
const sortedObj = (obj) => {
  return Object.fromEntries(
    Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
  );
}

module.exports = {
  printConsole,
  sendMail,
  // sha512Funtion,
  encrypt,
  decrypt,
  createJwtToken,
  refreshJwtToken,
  getListOfCategory,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotification,
  sendPushNotificationOnActions,
  sortedObj
};
