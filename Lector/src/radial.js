let instance = null;
//const radialCanvas = document.getElementById('radial_diagram').getContext('2d');

const fontColor = '#e6f7ff';

const labels = [
  ['Доступність', 'матеріалів'],
  ['Надання', 'питань до заліку'],
  ['Відповідність', 'практик лекціям'],
  ['Об\'єктивність', 'оцінювання'],
  ['Пyнктуальність'],
  ['Організація', 'лекційного часу'],
  ['Актуальність ', 'матеріалу'],
  'Ввічливість',
  ['Своєчасність', 'та достатність', 'інформування']
];

const teachersFactory = (name, data) => ({
  label: name,
  backgroundColor: '#48abddb4',
  borderColor: fontColor,
  data,
  pointRadius: '0',
  borderWidth: '3',
});

const datasets = [
  teachersFactory('Стешин В. В.', Array(9).fill(0).map(() => Math.random() * 4 + 1))
];

const marksData = { labels, datasets };

let chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scale: {
    angleLines: {
      display: true,
      color: fontColor,
      lineWidth: 2
    },
    gridLines: {
      display: true,
      color: fontColor,
      lineWidth: 2
    },
    ticks: {
      display: true,
      beginAtZero: true,
      min: 1,
      max: 5,
      stepSize: 1,
      fontSize: 24,
      fontColor: fontColor,
      backdropColor: '#08141a',
    },
    pointLabels: {
      fontSize: 24,
      fontColor: fontColor
    }
  },
  legend: {
    display: false,
  },
};

function radialDiagram(values = null) {
  if (!instance) {
    const radialCanvas = document.getElementById('radial_diagram').getContext('2d');
    instance = new Chart(radialCanvas, {
      type: 'radar',
      data: marksData,
      options: chartOptions
    });
  } else if (values) {
    // console.log(values);
    instance.data.datasets[0].data = values;
    instance.update();
  }
}
