const fs = require("fs").promises;
const csv = require("csvtojson");
const converter = require("json-2-csv");

(async () => {
  let countiesGeoJson = JSON.parse(
    await fs.readFile("counties_original.geojson", "UTF-8")
  );
  let cases = await csv().fromFile("covid_hr.csv");

  let casesPerCounty = sumarizeCases(cases, "county");

  fs.writeFile("docs/casesPerCounty.json", JSON.stringify(casesPerCounty));

  await generateCsv(casesPerCounty, "generated/cases_per_county.csv");

  await generateCumulativeCasesCsv(cases);

  await generateCountyGeoJson(countiesGeoJson, casesPerCounty);
})();

async function generateCumulativeCasesCsv(casesRecords) {
  let casesObject = {};
  let cases = 0;
  let recovered = 0;
  let died = 0;

  for (const record of casesRecords) {
    cases += +record.new_cases;
    recovered += +record.new_recovered;
    died += +record.new_died;

    if (!casesObject[record.date]) {
      casesObject[record.date] = {
        date: record.date,
        cases: cases,
        recovered: recovered,
        died: died,
        new_cases: +record.new_cases,
        new_recovered: +record.new_recovered,
        new_died: +record.new_died,
      };
    } else {
      casesObject[record.date] = {
        date: record.date,
        cases: cases,
        recovered: recovered,
        died: died,
        new_cases: casesObject[record.date].new_cases + +record.new_cases,
        new_recovered:
          casesObject[record.date].new_recovered + +record.new_recovered,
        new_died: casesObject[record.date].new_died + +record.new_died,
      };
    }
  }

  console.log("cases:", cases);
  console.log("recovered:", recovered);
  console.log("died:", died);

  fs.writeFile(
    "docs/casesPerDay.json",
    JSON.stringify(Object.values(casesObject))
  );

  await fs.writeFile(
    "generated/cases_per_day.csv",
    await converter.json2csvAsync(Object.values(casesObject))
  );
}

async function generateCountyGeoJson(countiesGeoJson, casesPerCounty) {
  for (const feature of countiesGeoJson.features) {
    feature.properties.total_cases = casesPerCounty[feature.properties.name]
      ? casesPerCounty[feature.properties.name].cases
      : 0;
    feature.properties.recovered = casesPerCounty[feature.properties.name]
      ? casesPerCounty[feature.properties.name].recovered
      : 0;
    feature.properties.died = casesPerCounty[feature.properties.name]
      ? casesPerCounty[feature.properties.name].died
      : 0;
    feature.properties.active =
      feature.properties.total_cases -
      feature.properties.recovered -
      feature.properties.died;
  }
  await fs.writeFile(
    "generated/counties_hr_covid.geojson",
    JSON.stringify(countiesGeoJson)
  );
  await fs.writeFile(
    "docs/counties_hr_covid.geojson",
    JSON.stringify(countiesGeoJson)
  );
}

async function generateCsv(casesObject, path) {
  let list = [];
  for (const key in casesObject) {
    if (casesObject.hasOwnProperty(key)) {
      const element = casesObject[key];
      list.push({ name: key, ...element });
    }
  }
  await fs.writeFile(path, await converter.json2csvAsync(list));
}

function sumarizeCases(cases, key) {
  let casesPerKey = {};
  for (const c of cases) {
    if (!casesPerKey[c[key]]) {
      casesPerKey[c[key]] = {
        cases: 0,
        recovered: 0,
        died: 0,
      };
    }
    casesPerKey[c[key]].cases += +c.new_cases;
    casesPerKey[c[key]].recovered += +c.new_recovered;
    casesPerKey[c[key]].died += +c.new_died;
  }

  let entries = Object.entries(casesPerKey);
  let sortedEntries = entries.sort((a, b) => b[1].cases - a[1].cases);
  var sortedCases = Object.fromEntries(sortedEntries);
  console.table(sortedCases);
  return sortedCases;
}
