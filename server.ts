import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
------------------------------------
ROOT PAGE (Browser ikifungua domain)
------------------------------------
*/
app.get("/", (req: Request, res: Response) => {
  res.send("BENMASS MITAMBO API INA FANYA KAZI SAWA");
});

/*
------------------------------------
USSD / API ENDPOINT
Inaruhusu GET na POST
------------------------------------
*/
app.all("/ussd", (req: Request, res: Response) => {
  const text: string = (req.body.text as string) || (req.query.text as string) || "";
  let response = "";

  if (text === "") {
    response = `CON Karibu BENMASS MITAMBO
1. Akaunti
2. Salio
3. Msaada`;
  } else if (text === "1") {
    response = "END Akaunti yako imefunguliwa.";
  } else if (text === "2") {
    response = "END Salio lako ni Tsh 10,000.";
  } else if (text === "3") {
    response = "END Wasiliana na huduma kwa wateja.";
  } else {
    response = "END Chaguo sio sahihi.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

/*
------------------------------------
HANDLE METHODS ZISIZORUHUSIWA
------------------------------------
*/
app.use((req: Request, res: Response) => {
  res.status(405).send("405 Method Not Allowed");
});

/*
------------------------------------
PORT
------------------------------------
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server ina run kwenye port " + PORT);
});
