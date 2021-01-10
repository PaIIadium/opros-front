const mapDiagrams = new Map();

const backgroundColor = '#FFD200';
// const fontColor = '#cdeeff';

function linearDiagram(id, values) {

  const data = {
    labels: [ '5', '4', '3', '2', '1' ].reverse(),
    datasets: [{
      data: values,
      backgroundColor: backgroundColor,
      // borderColor: fontColor,
      // borderWidth: '3',
      id: 'y-axis-marks',
    }]
  };

  const linearChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        barPercentage: 1,
        categoryPercentage: 0.6,
        ticks: {
          fontColor: fontColor,
          // fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          fontFamily: 'BebasNeue Book',
          fontSize: 25,
          beginAtZero: true,
          // backdropColor: '#30344A',
          maxTicksLimit: 6,
        },
        gridLines: {
          display: false
        },
      }],
      xAxes: [{
        id: 'y-axis-marks',
        ticks: {
          fontColor: fontColor,
          // fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          fontFamily: 'BebasNeue Book',
          fontSize: 25,
          beginAtZero: true
        },
        gridLines: {
          display: false,
        },
      }]
    },
    legend: {
      display: false,
    },
  };

  if (!mapDiagrams.has(id)) {
    const linearCanvas = document.getElementById(id).getContext('2d');
    const chart = new Chart(linearCanvas, {
      type: 'bar',
      data: data,
      options: linearChartOptions
    });
    mapDiagrams.set(id, chart);
  } else {
    const chart = mapDiagrams.get(id);
    chart.data.datasets[0].data = values;
    chart.update();
  }
}
