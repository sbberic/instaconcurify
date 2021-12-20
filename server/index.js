const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios");
require("dotenv").config();
const qs = require("qs");
const cors = require("cors");

const CONCUR_ROOT = "https://us.api.concursolutions.com";
ACCESS_TOKEN = "";
REPORT_ID = "";
USER_ID = "";

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", (req, res) => {
  //gets token and user_id
  //console.log(req.body);

  const data = {
    client_id: process.env.CONCUR_CLIENT_ID,
    client_secret: process.env.CONCUR_CLIENT_SECRET,
    grant_type: "password",
    username: req.body.username,
    password: req.body.password,
  };
  //console.log(qs.stringify(data));
  axios
    .post(`${CONCUR_ROOT}/oauth2/v0/token`, qs.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((tokenRes) => {
      const { data } = tokenRes;
      //res.send(JSON.stringify({ token: data.access_token }));
      ACCESS_TOKEN = data.access_token;
      //get person id also, respond both 
      axios
        .get(`${CONCUR_ROOT}/profile/v1/me`, {
          headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` },
        })
        .then((profileRes) => {
          const { data } = profileRes;
          USER_ID = data.id;
          res.send(JSON.stringify({ token: ACCESS_TOKEN, user_id : USER_ID}));
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
});

/* 
//separate method to get user_id 
app.post("/get_user_id", (req, res) => {
  //console.log("Here's the not-empty token: "+ACCESS_TOKEN);

  //get person id also, respond both 
  axios
    .get(`${CONCUR_ROOT}/profile/v1/me`, {
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` },
    })
    .then((profileRes) => {
      const { data } = profileRes;
      USER_ID = data.id;
      res.send(JSON.stringify({ user_id : USER_ID}));
    })
    .catch((err) => {
      console.error(err);
    });

});
*/

app.post("/create_report", (req, res) => {
  // body params: 
  //   report_name
  //   access_token (optional)
  //   user_id (optional)

  //console.log(req.body);

  const data = {
    name: req.body.report_name,
    policyId: "6DCBDB616D2A424891AF5F5CC496A2F8",
    reportSource: "OTHER"
  };
  //console.log(JSON.stringify(data));
  
  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${(req.body.user_id==null?USER_ID:req.body.user_id)}/context/TRAVELER/reports`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${(req.body.access_token==null?ACCESS_TOKEN:req.body.access_token)}` },
    })
    .then((reportRes) => {
      const { data } = reportRes;
      REPORT_ID = data.uri.split('/').pop();
      res.send(JSON.stringify({ report_id: REPORT_ID }));
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/add_expense", (req, res) => {
  //only handles USD for now

  // body params: 
  //   expense_type
  //   transaction_date
  //   transaction_amount
  //   business_purpose
  //   image_path
  //   image_base64
  //   report_id (optional)
  //   access_token (optional)
  //   user_id (optional)

  //console.log(req.body);

  expense_type = {}
  switch (req.body.expense_type){
    case "Home WIFI" :
      expense_type = {
        id: "01025",
        name: "Home WIFI",
        code: "OTHER"
      };
      break;
    case "Employee Meals - Lunch/Dinner":
      expense_type ={
        id: "BRKFT",
        name: "Employee Meals - Lunch/Dinner",
        code: "OTHER"
      };
      break;
    default:
      res.send("Error: Unhandled expense_type: "+req.body.expense_type);
      break;
  }

  //image_id = uploadImage(req.body.image_path,req.body.image_base64,(req.body.user_id==null?"":req.body.user_id),(req.body.access_token==null?"":req.body.access_token));    //UNCOMMENT HERE TO ADD IMAGE

  const data = {
    expenseSource: "OTHER",
    exchangeRate: {
      "value": 1.0,
      "operation": "MULTIPLY"
    },
    expenseType: expense_type,
    transactionAmount: {
      "value": req.body.transaction_amount,
      "currencyCode": "USD"
    },
    transactionDate: req.body.transaction_date,
    businessPurpose: req.body.business_purpose //,   //UNCOMMENT HERE TO ADD IMAGE
    //receiptImageId: image_id                      //UNCOMMENT HERE TO ADD IMAGE
  };
  //console.log(JSON.stringify(data));
  
  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${(req.body.user_id==null?USER_ID:req.body.user_id)}/context/TRAVELER/reports/${(req.body.report_id==null?REPORT_ID:req.body.report_id)}/expenses`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${(req.body.access_token==null?ACCESS_TOKEN:req.body.access_token)}` },
    })
    .then((expenseRes) => {
      const { data } = expenseRes;
      const expense_id = data.uri.split('/').pop();

      res.send(JSON.stringify({ expense_id: expense_id }));
    })
    .catch((err) => {
      console.error(err);
    });
});

//endpoint for testing file upload on its own, without adding to an expense
app.post("/test_image", (req, res) => { 
  //console.log(req.body);
  const imageId = uploadImage(req.body.image_path,req.body.image_base64);
  res.send(imageId);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function uploadImage(imagePath,imageEncodedBase64,userId="",accessToken=""){
  fileExtension = imagePath.split('.').pop();
  contentType = "";

  switch (fileExtension){
    case "png":
    case "jpeg":
    case "jpg":
    case "tiff":
      contentType = `image/${fileExtension}`;
    case "pdf":
      contentType = "application/pdf"
  }

  axios
    .post(`${CONCUR_ROOT}/v4/users/${(userId==""?USER_ID:userId)}/image-only-receipts`, imageEncodedBase64, {
      headers: { "Content-Type": contentType , "Authorization": `Bearer ${(accessToken==""?ACCESS_TOKEN:accessToken)}` },
    })
    .then((imgRes) => {
      imgLoc  = imgRes.headers['Location'];
      imageId = imgLoc.split('/').pop();
    })
    .catch((err) => {
      console.error(err);
    });

  return imageId;
}