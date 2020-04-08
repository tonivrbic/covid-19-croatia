window.addEventListener("load", () => {
  var ctx = document.getElementById("casesChart").getContext("2d");
  var ctxBar = document.getElementById("casesBarChart").getContext("2d");
  var ctxPerCountyBar = document
    .getElementById("casesPerCountyBarChart")
    .getContext("2d");
  var cbChangeView = document.getElementById("cb-change-view");
  var casesChart;

  cbChangeView.addEventListener("change", (event) => {
    if (event.target.checked) {
      casesChart.options.scales.yAxes.forEach((axe) => {
        axe.type = "logarithmic";
        axe.ticks = {
          autoSkipPadding: 20,
          callback: (value) => value.toString(),
        };
      });
    } else {
      casesChart.options.scales.yAxes.forEach((axe) => {
        axe.type = "linear";
      });
    }
    casesChart.update();
  });

  var map = initMap();

  fetch("counties_hr_covid.geojson")
    .then((data) => {
      return data.json();
    })
    .then((geojson) => {
      var max = geojson.features
        .map((x) => x.properties.total_cases)
        .reduce((a, b) => {
          return Math.max(a, b);
        });

      L.geoJSON(geojson, {
        style: function (feature) {
          var style = {
            fillOpacity: 1,
            weight: 1,
            color: "rgba(0,0,0,0.6)",
          };
          if (feature.properties.total_cases / max == 0) {
            return {
              ...style,
              fillColor: "#eeeeee",
            };
          } else if (feature.properties.total_cases / max < 0.2) {
            return {
              ...style,
              fillColor: "#ffe0b2",
            };
          } else if (feature.properties.total_cases / max < 0.4) {
            return {
              ...style,
              fillColor: "#ffb74d",
            };
          } else if (feature.properties.total_cases / max < 0.6) {
            return {
              ...style,
              fillColor: "#ff9800",
            };
          } else if (feature.properties.total_cases / max < 0.8) {
            return {
              ...style,
              fillColor: "#f57c00",
            };
          } else {
            return {
              ...style,
              fillColor: "#e65100",
            };
          }
        },
      })
        .bindPopup(function (layer) {
          return `<div>
                    <div><strong>${layer.feature.properties.name}</strong></div>
                    <div>Ukupno zaraženi: <strong>${layer.feature.properties.total_cases}</strong></div>
                    <div>Preminuli: <strong>${layer.feature.properties.died}</strong></div>
                  </div>`;
        })
        .addTo(map);

      for (const feature of geojson.features) {
        let shape = L.polygon(feature.geometry.coordinates);
        let center = shape.getBounds().getCenter();
        if (feature.properties.name === "Zagrebačka") {
          center.lat += 0.3;
          center.lng += 0.1;
        }
        L.marker([center.lng, center.lat], {
          icon: new L.DivIcon({
            className: "map-marker",
            html: `<span class="map-marker__number">${feature.properties.total_cases}</span>`,
          }),
        }).addTo(map);
      }
    });

  fetch("casesPerDay.json")
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      var infectedAndRecoveredDatasets = [
        {
          label: "Zaraženi",
          data: data.map((point) => ({
            t: new Date(point.date),
            y: +point.cases,
          })),
          backgroundColor: ["rgba(235, 158, 52, 1)"],
          borderColor: ["rgba(200, 120, 30, 1)"],
          borderWidth: 3,
          pointBackgroundColor: "rgba(235, 158, 52, 1)",
          pointRadius: 5,
          pointHoverRadius: 8,
          order: 3,
        },
        {
          label: "Ozdravljeni",
          data: data.map((point) => ({
            t: new Date(point.date),
            y: +point.recovered,
          })),
          backgroundColor: ["rgba(0, 171, 9, 1)"],
          borderColor: ["rgba(0, 130, 0, 1)"],
          borderWidth: 3,
          pointBackgroundColor: "rgba(0, 171, 9, 1)",
          pointRadius: 5,
          pointHoverRadius: 8,
          order: 2,
        },
        {
          label: "Preminuli",
          data: data.map((point) => ({
            t: new Date(point.date),
            y: +point.died,
          })),
          backgroundColor: ["rgba(171, 0, 9, 1)"],
          borderColor: ["rgba(130, 0, 0, 1)"],
          borderWidth: 3,
          pointBackgroundColor: "rgba(171, 0, 9, 1)",
          pointRadius: 5,
          pointHoverRadius: 8,
          order: 1,
        },
        {
          label: "Aktivni",
          data: data.map((point) => ({
            t: new Date(point.date),
            y: point.cases - point.recovered - point.died,
          })),
          backgroundColor: ["rgba(0, 0, 0, 0)"],
          borderColor: ["rgba(9, 54, 255, 1)"],
          borderWidth: 3,
          pointBackgroundColor: "rgba(9, 54, 255, 1)",
          pointRadius: 5,
          pointHoverRadius: 8,
          order: 4,
        },
      ];

      casesChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: infectedAndRecoveredDatasets,
        },
        options: {
          legend: {
            position: "chartArea",
          },
          tooltips: {
            mode: "index",
            position: "nearest",
            intersect: false,
          },
          scales: {
            xAxes: [
              {
                type: "time",
                distribution: "linear",
                time: {
                  displayFormats: {
                    day: "DD.MM.",
                  },
                  tooltipFormat: "DD.MM.YYYY.",
                  unit: "day",
                },
              },
            ],
          },
        },
      });

      new Chart(ctxBar, {
        type: "bar",
        labels: ["Zaraženi", "Ozdravljeni", "Preminuli"],
        data: {
          datasets: [
            {
              label: "Zaraženi",
              data: data.map((point) => ({
                t: new Date(point.date),
                y: point.new_cases,
              })),
              backgroundColor: "rgba(235, 158, 52, 0.7)",
              borderColor: "rgba(235, 158, 52, 1)",
            },
            {
              label: "Ozdravljeni",
              data: data.map((point) => ({
                t: new Date(point.date),
                y: point.new_recovered,
              })),
              backgroundColor: "rgba(0, 171, 9, 0.7)",
              borderColor: "rgba(0, 171, 9, 1)",
            },
            {
              label: "Preminuli",
              data: data.map((point) => ({
                t: new Date(point.date),
                y: point.new_died,
              })),
              backgroundColor: "rgba(171, 0, 9, 0.7)",
              borderColor: "rgba(171, 0, 9, 1)",
            },
          ],
        },
        options: {
          legend: {
            position: "bottom",
          },
          tooltips: {
            mode: "index",
            position: "nearest",
          },
          scales: {
            xAxes: [
              {
                type: "time",
                distribution: "linear",
                time: {
                  tooltipFormat: "DD.MM.YYYY.",
                  displayFormats: {
                    day: "DD.MM.",
                  },
                  unit: "day",
                },
                ticks: {
                  min: new Date("2020-02-24"),
                  max: new Date(data[data.length - 1].date).setDate(
                    new Date(data[data.length - 1].date).getDate() + 1
                  ),
                },
              },
            ],
          },
        },
      });
    });

  fetch("casesPerCounty.json")
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      new Chart(ctxPerCountyBar, {
        type: "horizontalBar",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: "Zaraženi",
              data: Object.values(data).map((x) => x.cases),
              backgroundColor: "rgba(235, 158, 52, 0.7)",
            },
            {
              label: "Preminuli",
              data: Object.values(data).map((x) => x.died),
              backgroundColor: "rgba(171, 0, 9, 0.7)",
            },
          ],
        },
        options: {
          legend: {
            position: "bottom",
          },
          maintainAspectRatio: false,
          aspectRatio: 1,
        },
      });
    });

  function initMap() {
    var map = L.map("map", {
      gestureHandling: true,
    }).setView([44.505, 16.5], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    return map;
  }
});
