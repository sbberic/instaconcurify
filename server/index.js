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
  //console.log(req.body);

  const data = {
    name: req.body.report_name,
    policyId: "6DCBDB616D2A424891AF5F5CC496A2F8",
    reportSource: "OTHER"
  };
  //console.log(JSON.stringify(data));
  
  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${USER_ID}/context/TRAVELER/reports`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${ACCESS_TOKEN}` },
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
    businessPurpose: req.body.business_purpose
  };
  //console.log(JSON.stringify(data));
  
  axios
    .post(`${CONCUR_ROOT}/expensereports/v4/users/${USER_ID}/context/TRAVELER/reports/${REPORT_ID}/expenses`, JSON.stringify(data), {
      headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${ACCESS_TOKEN}` },
    })
    .then((expenseRes) => {
      const { data } = expenseRes;
      const expense_id = data.uri.split('/').pop();

      //then need to upload the image, get image_id, and attach image
      res.send(JSON.stringify({ expense_id: expense_id }));
    })
    .catch((err) => {
      console.error(err);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
