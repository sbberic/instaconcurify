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
    .post(
      `${CONCUR_ROOT}/expensereports/v4/users/${userId}/context/TRAVELER/reports`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
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

  const userId = req.body.userId;
  const reportId = req.body.reportId;
  const accessToken = req.headers.authorization.split(" ")[1];

  //console.log(req.body);
  const expenseType = expenseTypeMap[req.body.expenseType];
  if (!expenseType) {
    res.send("Error: Unhandled expense_type: " + req.body.expenseType);
  }

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
    transactionDate: req.body.transactionDate,
    businessPurpose: req.body.businessPurpose,
    vendorDescription: req.body.vendorDescription,
  };
  //console.log(JSON.stringify(data));

  axios
    .post(
      `${CONCUR_ROOT}/expensereports/v4/users/${userId}/context/TRAVELER/reports/${reportId}/expenses`,
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((expenseRes) => {
      const { data } = expenseRes;
      const expense_id = data.uri.split("/").pop();

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
