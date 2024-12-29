require("dotenv").config();
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const toEmail = process.env.TO_EMAIL;
const webScrapeUrl = process.env.WEBSCRAPE_URL;

function getTempEmailAndCheckInbox(text) {
  var nodemailer = require("nodemailer");

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: username,
      pass: password,
    },
  });

  var mailOptions = {
    from: username,
    to: toEmail,
    subject: "Scrape result",
    text: "Here is the result from the webscrape: \n" + text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

async function getWebScrapeResult(url) {
  const axios = require("axios");
  const cheerio = require("cheerio");
  let returnData;
  try {
    const response = await axios.get(url);
    console.log("Web scraping successful!");
    const $ = cheerio.load(response.data);
    const allParagraphs = $("p");
    // console.log(allParagraphs.text());

    const data = allParagraphs.map((index, element) => $(element).text()).get();
    returnData = data;
  } catch (error) {
    console.error("Error in web scraping: ", error);
    returnData = "error";
  }
  return returnData;
}

(async () => {
  const webscrapeResult = await getWebScrapeResult(webScrapeUrl);

  console.log(webscrapeResult); // This will now be the data or "error"

  // Check if scraping was successful before sending email
  if (webscrapeResult !== "error") {
    getTempEmailAndCheckInbox(webscrapeResult.join("\n")); // Join data array into a string
  } else {
    console.error("Error in web scraping, not sending email.");
  }
})();
