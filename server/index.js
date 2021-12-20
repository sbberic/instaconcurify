const express = require("express");
const app = express();
const port = 3001;
const axios = require("axios");
require("dotenv").config();
const qs = require("qs");
const cors = require("cors");

const CONCUR_ROOT = "https://us.api.concursolutions.com";

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", (req, res) => {
  //gets token and user_id
  //console.log(req.body);
  let accessToken, userId;
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
      accessToken = data.access_token;
      //get person id also, respond both
      axios
        .get(`${CONCUR_ROOT}/profile/v1/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((profileRes) => {
          const { data } = profileRes;
          userId = data.id;
          res.send(JSON.stringify({ token: accessToken, user_id: userId }));
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
  const userId = req.body.userId;
  const accessToken = req.headers.authorization.split(" ")[1];
  const data = {
    name: req.body.reportName,
    policyId: "6DCBDB616D2A424891AF5F5CC496A2F8",
    reportSource: "OTHER",
    reportDate: req.body.reportDate,
  };
  //console.log(JSON.stringify(data));

  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${(req.body.user_id==null?USER_ID:req.body.user_id)}/context/TRAVELER/reports`, JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json" , 
        "Authorization": `Bearer ${(req.body.access_token==null?ACCESS_TOKEN:req.body.access_token)}` },
    })
    .then((reportRes) => {
      const { data } = reportRes;
      res.send(JSON.stringify({ report_id: data.uri.split("/").pop() }));
    })
    .catch((err) => {
      console.error(err);
    });
});

const expenseTypeMap = {
  "Home WIFI": {
    id: "01025",
    name: "Home WIFI",
    code: "OTHER",
  },
  "Employee Meals - Lunch/Dinner": {
    id: "BRKFT",
    name: "Employee Meals - Lunch/Dinner",
    code: "OTHER",
  },
  "Travel - Air": {
    id: "AIRFR",
    name: "Travel - Air",
    code: "OTHER",
  },
  "Travel - Transporation": {
    id: "TAXIX",
    name: "Travel - Transporation",
    code: "OTHER",
  },
  "Travel - Meals (Employee)": {
    id: "01020",
    name: "Travel - Meals (Employee)",
    code: "OTHER",
  },
  "Travel - Lodging": { id: "LODNG", name: "Travel - Lodging", code: "OTHER" },
  "Team Building": { id: "01017", name: "Team Building", code: "OTHER" },
};

app.post("/add_expense", (req, res) => {
  //only handles USD for now

  // body params:
  //   expense_type
  //   transaction_date
  //   transaction_amount
  //   business_purpose
  //   vendor_description
  //   image_path
  //   image_base64
  //   report_id (optional)
  //   access_token (optional)
  //   user_id (optional)

  const userId = req.body.userId;
  const reportId = req.body.reportId;
  const accessToken = req.headers.authorization.split(" ")[1];

  //console.log(req.body);
  const expenseType = expenseTypeMap[req.body.expenseType];
  if (!expenseType) {
    res.send("Error: Unhandled expense_type: " + req.body.expenseType);
  }

  //image_id = uploadImage(req.body.image_path,req.body.image_base64,(req.body.user_id==null?"":req.body.user_id),(req.body.access_token==null?"":req.body.access_token));    //UNCOMMENT HERE TO ADD IMAGE

  const data = {
    expenseSource: "OTHER",
    exchangeRate: {
      value: 1.0,
      operation: "MULTIPLY",
    },
    expenseType,
    transactionAmount: {
      value: req.body.transactionAmount,
      currencyCode: "USD",
    },
    transactionDate: req.body.transaction_date,
    businessPurpose: req.body.business_purpose,
    vendorDescription: req.body.vendor_description //,   //UNCOMMENT HERE TO ADD IMAGE
    //receiptImageId: image_id                      //UNCOMMENT HERE TO ADD IMAGE
  };
  //console.log(JSON.stringify(data));

  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${(req.body.user_id==null?USER_ID:req.body.user_id)}/context/TRAVELER/reports/${(req.body.report_id==null?REPORT_ID:req.body.report_id)}/expenses`, JSON.stringify(data), {
      headers: { 
        "Content-Type": "application/json" , 
        "Authorization": `Bearer ${(req.body.access_token==null?ACCESS_TOKEN:req.body.access_token)}` },
    })
    .then((expenseRes) => {
      const { data } = expenseRes;
      const expense_id = data.uri.split("/").pop();

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