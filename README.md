# covid-19-croatia

COVID-19 cases for Croatia are recorded inside the `covid_hr.csv` dataset file. A visualization of the current dataset can be found on https://tonivrbic.github.io/covid-19-croatia/.

## Generate

Run the `index.js` script with Node.js to generate cumulative cases per day, cases per city and cases per county.
A .geojson file for Croatia is also generated for map visualizations.

## Notes

This data was first collected by scrapping posts from https://civilna-zastita.gov.hr/ and by following updates on https://koronavirus.hr. Due to inconsistencies with their reporting some of
the data might be incorrect (ie. the location and date of a case).

| date       | note                                                           |
| ---------- | -------------------------------------------------------------- |
| 2020-03-17 | Ministry stopped reporting cases by city\*                     |
| 2020-03-22 | Earthquake in Zagreb                                           |
| 2020-03-25 | Ministry stopped reporting recovered cases by county\*\*       |
| 2020-03-28 | Ministry merged cases from Zagreb county to the city of Zagreb |
| 2020-04-01 | Ministry from now on reports cases by place of residence\*\*\* |

- \*cases from now on have the city set to the capital of the county
- \*\*all recovered cases from now on are added to Zagreb
- \*\*\* Ministry from now on reports cases by place of residence, instead of the place where the test was conducted. They started again to report cases for Zagreb county (covid_hr.csv includes negative numbers for this day to align with the new reporting).
