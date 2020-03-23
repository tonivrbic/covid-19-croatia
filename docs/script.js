window.addEventListener("load", () => {
  var ctx = document.getElementById("casesChart").getContext("2d");
  var ctxBar = document.getElementById("casesBarChart").getContext("2d");
  var ctxPerCountyBar = document
    .getElementById("casesPerCountyBarChart")
    .getContext("2d");
  var cbChangeView = document.getElementById("cb-change-view");
  var casesChart;

  cbChangeView.addEventListener("change", event => {
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
          var style = {
            fillOpacity: 1,
            weight: 1,
            color: "rgba(0,0,0,0.6)"
          };
          if (feature.properties.total_cases / max == 0) {
            return {
              ...style,
              fillColor: "#eeeeee"
            };
          } else if (feature.properties.total_cases / max < 0.2) {
            return {
              ...style,
              fillColor: "#ffe0b2"
            };
          } else if (feature.properties.total_cases / max < 0.4) {
            return {
              ...style,
              fillColor: "#ffb74d"
            };
          } else if (feature.properties.total_cases / max < 0.6) {
            return {
              ...style,
              fillColor: "#ff9800"
            };
          } else if (feature.properties.total_cases / max < 0.8) {
            return {
              ...style,
              fillColor: "#f57c00"
            };
          } else {
            return {
              ...style,
              fillColor: "#e65100"
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
          data: data.map(point => ({
            t: new Date(point.date),
            y: +point.cases
          })),
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
});
