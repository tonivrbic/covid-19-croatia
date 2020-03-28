const ejs = require("ejs");
const fs = require("fs").promises;

fs.readFile("docs/casesPerDay.json").then(str => {
  let casesPerDay = JSON.parse(str);

  let cases = casesPerDay.map(x => x.cases).reduce((a, b) => Math.max(a, b));
  let recovered = casesPerDay
    .map(x => x.recovered)
    .reduce((a, b) => Math.max(a, b));
  let died = casesPerDay.map(x => x.died).reduce((a, b) => Math.max(a, b));

  let dtf = new Intl.DateTimeFormat("hr", {
    year: "numeric",
    month: "long",
    day: "2-digit"
  });

  ejs.renderFile(
    "template.html",
    {
      cases,
      recovered,
      died,
      lastUpdated: dtf.format(new Date())
    },
    async (err, str) => {
      if (!err) {
        await fs.writeFile("docs/index.html", str);
      }
    }
  );
});
