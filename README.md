# covid-19-croatia

COVID-19 cases for Croatia are recorded inside the `covid_hr.csv` file.

## Generate

Run the `index.js` script with Node.js to generate cumulative cases per day, cases per city and cases per county.
A .geojson file for Croatia is also generated for map visualizations.

## Notes

This data was first collected by scrapping posts from https://civilna-zastita.gov.hr/. Due to inconsistencies with their reporting some of
the data might be incorrect (ie. the location and date of a case) and had to be filled with data from various news portals.
