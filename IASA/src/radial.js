let instance = null;
//const radialCanvas = document.getElementById('radial_diagram').getContext('2d');

const fontColor = '#ffffff';

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
  backgroundColor: '#FFD200B4',
  borderColor: "#FFD200",
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
      fontFamily: 'BebasNeue Book',
      backdropColor: '#141414',
    },
    pointLabels: {
      fontSize: 24,
      fontColor: fontColor,
      fontFamily: 'BebasNeue Book',
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
