const ejs = require("ejs");
const fs = require("fs").promises;

Promise.all([
  fs.readFile("docs/casesPerDay.json"),
  fs.readFile("docs/casesPerCounty.json"),
]).then(([casesPerDayString, casesPerCountyString]) => {
  let casesPerDay = JSON.parse(casesPerDayString);
  let casesPerCounty = JSON.parse(casesPerCountyString);

  let cases = casesPerDay.map((x) => x.cases).reduce((a, b) => Math.max(a, b));
  let recovered = casesPerDay
    .map((x) => x.recovered)
    .reduce((a, b) => Math.max(a, b));
  let died = casesPerDay.map((x) => x.died).reduce((a, b) => Math.max(a, b));

  let dtf = new Intl.DateTimeFormat("hr", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  ejs.renderFile(
    "template.html",
    {
      cases,
      recovered,
      died,
      lastUpdated: dtf.format(new Date()),
      casesPerCounty: Object.entries(casesPerCounty),
    },
    async (err, str) => {
      if (!err) {
        await fs.writeFile("docs/index.html", str);
      }
    }
  );
});
