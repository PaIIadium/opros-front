function gradient(firstColor, secondColor, coef) {
  const [r1, g1, b1] = firstColor;
  const [r2, g2, b2] = secondColor;
  const avg = [r1 + (r2 - r1) * coef, g1 + (g2 - g1) * coef, b1 + (b2 - b1) * coef];
  const max = Math.max(...avg);
  const maxFunc = (acc, val, ind, arr) => (acc > val ? acc : val);
  const firstColorMax = firstColor.reduce(maxFunc);
  const secondColorMax = secondColor.reduce(maxFunc);
  const normalizeCoef = firstColorMax + (secondColorMax - firstColorMax) * coef;
  const normalize = normalizeCoef / max;
  return avg.map(val => val * normalize);
}

function updateNumbers(contract, rso, cheating, respondents, dist1, dist2) {
  const contractEl = document.getElementById('contract-percent');
  contractEl.innerHTML = contract + '%';

  const listeningEl = document.getElementById('cheating');
  listeningEl.innerHTML = cheating + '%';
  const rsoEl = document.getElementById('rso');
  rsoEl.innerHTML = rso + '%';
  const distEl1 = document.getElementById('dist1');
  distEl1.innerHTML = dist1;
  const distEl2 = document.getElementById('dist2');
  distEl2.innerHTML = dist2;
  const formEl = document.getElementById('form');

  const respondentsEl = document.getElementById('respondents');
  respondentsEl.innerHTML = respondents;

  const colorContract = gradient([197, 0, 0], [7, 197, 0], contract / 83.3 - 0.2);
  const colorListening = gradient([197, 0, 0], [7, 197, 0], cheating / 83.3 - 0.2);
  const colorRSO = gradient([197, 0, 0], [7, 197, 0], rso / 83.3 - 0.2);
  const colorDist1 = gradient([197, 0, 0], [7, 197, 0], ((dist1 - 1) / 3.33) - 0.2);
  const colorDist2 = gradient([197, 0, 0], [7, 197, 0], ((dist2 - 1) / 3.33) - 0.2);

  const backgroundColor = gradient([26, 8, 8], [8, 26, 8], contract / 100);

  contractEl.style.color = `rgb(${colorContract[0]}, ${colorContract[1]}, ${colorContract[2]})`;
  listeningEl.style.color = `rgb(${colorListening[0]}, ${colorListening[1]}, ${colorListening[2]})`;
  rsoEl.style.color = `rgb(${colorRSO[0]}, ${colorRSO[1]}, ${colorRSO[2]})`;

  distEl1.style.color = `rgb(${colorDist1[0]}, ${colorDist1[1]}, ${colorDist1[2]})`;
  distEl2.style.color = `rgb(${colorDist2[0]}, ${colorDist2[1]}, ${colorDist2[2]})`;

  // formEl.style.backgroundColor = `rgb(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]})`;
}
