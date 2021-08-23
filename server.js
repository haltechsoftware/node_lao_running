import express from "express";
import cors from "cors";
import 'dotenv/config';


const app = express();

const corsOptions = {
  origin: "http://localhost:8080"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));


// simple route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to bezkoder application."
  });
});

import run from "./app/routes/run_result.routes";
run(app);

import user from "./app/routes/user.routes";
user(app);

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});