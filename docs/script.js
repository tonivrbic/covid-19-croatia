var ctx = document.getElementById("casesChart").getContext("2d");
var ctxBar = document.getElementById("casesBarChart").getContext("2d");
var ctxPerCountyBar = document
  .getElementById("casesPerCountyBarChart")
  .getContext("2d");
var cbChangeView = document.getElementById("cb-change-view");
var casesChart;

cbChangeView.addEventListener("change", event => {
  console.log(casesChart.options.scales.yAxes);
  if (event.target.checked) {
    casesChart.options.scales.yAxes.forEach(axe => {
      axe.type = "logarithmic";
      axe.ticks = {
        autoSkipPadding: 20,
        // sampleSize: 20,
        callback: value => value.toString()
      };
    });
  } else {
    casesChart.options.scales.yAxes.forEach(axe => {
      axe.type = "linear";
    });
  }
  casesChart.update();
});

var map = initMap();

fetch("counties_hr_covid.geojson")
  .then(data => {
    return data.json();
  })
  .then(geojson => {
    var max = geojson.features
      .map(x => x.properties.total_cases)
      .reduce((a, b) => {
        return Math.max(a, b);
      });

    L.geoJSON(geojson, {
      style: function(feature) {
        if (feature.properties.total_cases / max == 0) {
          return {
            fillOpacity: 1,
            fillColor: "#eeeeee"
          };
        } else if (feature.properties.total_cases / max < 0.2) {
          return {
            fillColor: "#ffe0b2",
            fillOpacity: 1
          };
        } else if (feature.properties.total_cases / max < 0.4) {
          return {
            fillColor: "#ffb74d",
            fillOpacity: 1
          };
        } else if (feature.properties.total_cases / max < 0.6) {
          return {
            fillColor: "#ff9800",
            fillOpacity: 1
          };
        } else if (feature.properties.total_cases / max < 0.8) {
          return {
            fillColor: "#f57c00",
            fillOpacity: 1
          };
        } else {
          return {
            fillColor: "#e65100",
            fillOpacity: 1
          };
        }
      }
    })
      .bindPopup(function(layer) {
        return `<div>
                    <div><strong>${layer.feature.properties.name}</strong></div>
                    <div>Ukupno: ${layer.feature.properties.total_cases}</div>
                    <div>Trenutno: ${layer.feature.properties.active}</div>
                    <div>Ozdravljeni: ${layer.feature.properties.recovered}</div>
                    <div>Umrli: ${layer.feature.properties.died}</div>
                </div>`;
      })
      .addTo(map);
  });

fetch("casesPerDay.json")
  .then(data => {
    return data.json();
  })
  .then(data => {
    var infectedAndRecoveredDatasets = [
      {
        label: "Zaraženi",
        data: data.map(point => ({ t: new Date(point.date), y: +point.cases })),
        backgroundColor: ["rgba(0, 0, 0, 0)"],
        borderColor: ["rgba(235, 158, 52, 1)"],
        borderWidth: 3,
        pointBackgroundColor: "rgba(235, 158, 52, 1)",
        pointRadius: 5,
        pointHoverRadius: 10
      },
      {
        label: "Ozdravljeni",
        data: data.map(point => ({
          t: new Date(point.date),
          y: +point.recovered
        })),
        backgroundColor: ["rgba(0, 0, 0, 0)"],
        borderColor: ["rgba(0, 171, 9, 1)"],
        borderWidth: 3,
        pointBackgroundColor: "rgba(0, 171, 9, 1)",
        pointRadius: 5,
        pointHoverRadius: 10
      }
    ];

    casesChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: infectedAndRecoveredDatasets
      },
      options: {
        legend: {
          position: "chartArea"
        },
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "linear",
              time: {
                displayFormats: {
                  day: "DD.MM."
                },
                tooltipFormat: "DD.MM.YYYY.",
                unit: "day"
              }
            }
          ]
        }
      }
    });

    new Chart(ctxBar, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Zaraženi",
            data: data.map(point => ({
              t: new Date(point.date),
              y: point.new_cases
            })),
            backgroundColor: "rgba(235, 158, 52, 0.7)",
            borderColor: "rgba(235, 158, 52, 1)"
          },
          {
            label: "Ozdravljeni",
            data: data.map(point => ({
              t: new Date(point.date),
              y: point.new_recovered
            })),
            backgroundColor: "rgba(0, 171, 9, 0.7)",
            borderColor: "rgba(0, 171, 9, 1)"
          }
        ]
      },
      options: {
        legend: {
          position: "bottom"
        },
        scales: {
          xAxes: [
            {
              type: "time",
              distribution: "linear",
              time: {
                tooltipFormat: "DD.MM.YYYY.",
                displayFormats: {
                  day: "DD.MM."
                },
                unit: "day"
              }
            }
          ]
        }
      }
    });
  });

fetch("casesPerCounty.json")
  .then(data => {
    return data.json();
  })
  .then(data => {
    console.log(data);
    new Chart(ctxPerCountyBar, {
      type: "horizontalBar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Zaraženi",
            data: Object.values(data).map(x => x.cases),
            backgroundColor: "rgba(235, 158, 52, 0.7)"
          },
          {
            label: "Ozdravljeni",
            data: Object.values(data).map(x => x.recovered),
            backgroundColor: "rgba(0, 171, 9, 0.7)"
          }
        ]
      },
      options: {
        legend: {
          position: "bottom"
        },
        maintainAspectRatio: false
      }
    });
  });

function initMap() {
  var map = L.map("map", {
    scrollWheelZoom: false
  }).setView([44.505, 16.5], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  return map;
}
