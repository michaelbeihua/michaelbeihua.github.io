function renderGraph() {
    const ctx = document.getElementById('myChart').getContext('2d');

    const lvmhBrands = ['Loewe', 'Fendi', 'Louis Vuitton', 'Christian Dior', 'Kenzo', 'Marc Jacobs'];
    const keringBrands = ['Bottega Veneta', 'Gucci', 'Saint Laurent', '', 'Alexander McQueen', 'Balenciaga'];

    const lvmhScores = [0.59, 0.43, 0.35, 0.03, -0.03, -0.33];
    const keringScores = [0.81, 0.59, 0.51, 0, -0.37, -0.69];

    // Adjusted labels for LVMH and Kering
    const labels = lvmhBrands.map((brand, index) => `${brand} vs ${keringBrands[index]}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'LVMH',
                data: lvmhScores,
                backgroundColor: function(context) {
                    // Grey for positive, lighter grey for negative
                    return context.raw >= 0 ? 'rgba(0,5,27,0.9)' : 'rgba(0, 5, 27, 0.7)';
                },
                hoverBackgroundColor: 'rgba(0, 5, 27, 1)',
                datalabels: {
                    align: function(context) {
                        // LVMH label positioning: 'end' for positive, 'start' for negative
                        return context.dataset.data[context.dataIndex] >= 0 ? 'end' : 'start';
                    },
                    anchor: function(context) {
                        // LVMH label anchoring: 'end' for positive, 'start' for negative
                        return context.dataset.data[context.dataIndex] >= 0 ? 'end' : 'start';
                    },
                    color: '#000',
                    offset: 4,
                    formatter: function(value, context) {
                        return lvmhBrands[context.dataIndex];
                    }
                }
            },
            {
                label: 'Kering',
                data: keringScores.map(score => -score), // Negate scores for diverging effect
                backgroundColor: function(context) {
                    // Black for positive, lighter black (dark grey) for negative
                    return context.raw <= 0 ? 'rgba(241,228,219,255)' : 'rgba(241,228,219,0.7)';
                },
                datalabels: {
                    align: function(context) {
                        // Kering label positioning: 'start' for original positive (displayed negative), 'end' for original negative (displayed positive)
                        return context.dataset.data[context.dataIndex] <= 0 ? 'start' : 'end';
                    },
                    anchor: function(context) {
                        // Kering label anchoring: 'start' for original positive (displayed negative), 'end' for original negative (displayed positive)
                        return context.dataset.data[context.dataIndex] <= 0 ? 'start' : 'end';
                    },
                    color: '#000',
                    offset: 4,
                    formatter: function(value, context) {
                        return keringBrands[context.dataIndex];
                    }
                }
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y', // Horizontal bar chart
        layout: {
            padding: {
                left: 50,  // Adjust as needed
                // right: 20,
                // top: 10,
                // bottom: 10
            }
        },
        scales: {
            x: {
                stacked: true,
                beginAtZero: true,
                min: -1, // Ensures enough space for negative values
                max: 1,  // Ensures enough space for positive values
                title: {
                    display: true,
                    text: 'Sentiment (+-)'
                },
                grid: {
                    display: false,
                },
                ticks: {
                    stepSize: 1, // Specify the step size for ticks
                    callback: function(value) {
                        return Math.abs(value).toFixed(2); // Show the absolute value with two decimal places
                    }
                },
            },
            y: {
                stacked: true,
                display: false
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return ''; // Remove title
                    },
                    label: function(context) {
                        let label = context.dataset.label;
                        let score = context.raw;
                        if (context.datasetIndex === 1) {
                            label = keringBrands[context.dataIndex];
                            score = -score; // Correctly display negative value
                        } else {
                            label = lvmhBrands[context.dataIndex];
                        }
                        return `${label}: ${score.toFixed(2)}`;
                    }
                }
            },
            datalabels: {
                color: 'black',
                align: function(context) {
                    // Adjust alignment based on positive or negative values, handling labels near zero
                    return context.dataset.data[context.dataIndex] > 0 ? 'start' : 'end';
                },
                anchor: function(context) {
                    // Ensure labels are anchored correctly for visibility at either end of the bar
                    return context.dataset.data[context.dataIndex] > 0 ? 'start' : 'end';
                },
                offset: 4, // Adjusted for better visibility and avoiding overlap near the center
                formatter: function(value, context) {
                    // Return the brand name for each bar
                    return context.datasetIndex === 0 ? lvmhBrands[context.dataIndex] : keringBrands[context.dataIndex];
                }
            }
        }
    };

    var chart = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
        plugins: [ChartDataLabels]
    });
}
