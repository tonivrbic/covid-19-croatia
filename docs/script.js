var ctx = document.getElementById('casesChart').getContext('2d');
var ctxLogarithmic = document.getElementById('casesLogarithmicChart').getContext('2d');
var ctxBar = document.getElementById('casesBarChart').getContext('2d');

fetch('casesPerDay.json').then(data => {
    return data.json();
}).then(data => {
    var infectedAndRecoveredDatasets = [
        {
            label: "Slucajevi",
            data: data.map(point => ({ t: new Date(point.date), y: +point.cases })),
            backgroundColor: [
                'rgba(0, 0, 0, 0)'
            ],
            borderColor: [
                'rgba(235, 158, 52, 1)'
            ],
            borderWidth: 3,
            pointBackgroundColor: 'rgba(235, 158, 52, 1)',
            pointRadius: 5,
            pointHoverRadius: 10
        },
        {
            label: "Ozdravljeni",
            data: data.map(point => ({ t: new Date(point.date), y: +point.recovered })),
            backgroundColor: [
                'rgba(0, 0, 0, 0)'
            ],
            borderColor: [
                'rgba(0, 171, 9, 1)'
            ],
            borderWidth: 3,
            pointBackgroundColor: 'rgba(0, 171, 9, 1)',
            pointRadius: 5,
            pointHoverRadius: 10
        }
    ];

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: infectedAndRecoveredDatasets
        },
        options: {
            title: {
                display: true,
                text: "Ukupan broj zaraženih i ozdravljenih"
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    time: {
                        displayFormats: {
                            day: 'DD.MM.'
                        },
                        tooltipFormat: 'DD.MM.YYYY.',
                        unit: 'day'
                    }
                }]
            }
        }
    });

    new Chart(ctxLogarithmic, {
        type: 'line',
        data: {
            datasets: infectedAndRecoveredDatasets
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    time: {
                        tooltipFormat: 'DD.MM.YYYY.',
                        displayFormats: {
                            day: 'DD.MM.'
                        },
                        unit: 'day'
                    }
                }],
                yAxes: [{
                    type: 'logarithmic',
                    ticks: {
                        autoSkipPadding: 20,
                        sampleSize: 20,
                        callback: (value) => value.toString()
                    }
                }]
            }
        }
    });

    new Chart(ctxBar, {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: "Zaraženi",
                    data: data.map(point => ({ t: new Date(point.date), y: point.new_cases })),
                    backgroundColor: 'rgba(235, 158, 52, 0.7)',
                    borderColor: 'rgba(235, 158, 52, 1)',
                    borderWidth: 3
                },
                {
                    label: "Ozdravljeni",
                    data: data.map(point => ({ t: new Date(point.date), y: point.new_recovered })),
                    backgroundColor: 'rgba(0, 171, 9, 0.7)',
                    borderColor: 'rgba(0, 171, 9, 1)'

                }
            ]
        },
        options: {
            title: {
                display: true,
                text: "Broj zaraženih i ozdravljenih po danu"
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    time: {
                        tooltipFormat: 'DD.MM.YYYY.',
                        displayFormats: {
                            day: 'DD.MM.'
                        },
                        unit: 'day'
                    }
                }]
            }
        }
    });
})

