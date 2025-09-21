google.charts.load('current', { packages: ['corechart'] });

let X = [], Y = [], Y1 = [], Y2 = [], Y3 = [], Y4 = [], Y5 = [], Y6 = [], Y7 = [];
let Xnorm = [], Ynorm = [];
let rangos10 = {}, rangos20 = {};

google.charts.setOnLoadCallback(() => {
  document.getElementById('generarDatos').addEventListener('click', iniciar);
});

function iniciar() {
  generarDatos();
  normalizarDatos();
  calcularPromedios();
  mostrarTablaOriginal();
  mostrarTablaNormalizada();
  mostrarTablaPromedios(rangos10, 'tabla-promedios-0-1', 'Promedios por Rango 0.1');
  mostrarTablaPromedios(rangos20, 'tabla-promedios-0-05', 'Promedios por Rango 0.05');
  dibujarGrafico(Xnorm, Ynorm, 'grafico-normalizado', 'Y Normalizado vs X Normalizado');
  dibujarGrafico(rangos10.xCentro, rangos10.yPromedio, 'grafico-promedios-0-1', 'Promedio Rango 0.1');
  dibujarGrafico(rangos20.xCentro, rangos20.yPromedio, 'grafico-promedios-0-05', 'Promedio Rango 0.05');
  dibujarGraficoCombinado();
}

function generarDatos() {
  X = Array.from({ length: 360 }, (_, i) => i);
  [Y1, Y2, Y3, Y4, Y5, Y6, Y7] = Array(7).fill().map(() => {
    const A = Math.random() - Math.random() * 10;
    const B = Math.random() - Math.random() * 10;
    const C = Math.random() - Math.random() * 10;
    return X.map(x => A * Math.sin((B * x + C) * Math.PI / 180));
  });
  Y = X.map((_, i) => Y1[i] + Y2[i] + Y3[i] + Y4[i] + Y5[i] + Y6[i] + Y7[i]);
}

function normalizarDatos() {
  Xnorm = X.map(x => x / 360);
  const minY = Math.min(...Y), maxY = Math.max(...Y);
  Ynorm = Y.map(y => (y - minY) / (maxY - minY));
}

function calcularPromedios() {
  rangos10 = generarPromedios(Xnorm, Ynorm, 0.1);
  rangos20 = generarPromedios(Xnorm, Ynorm, 0.05);
}

function generarPromedios(Xn, Yn, paso) {
  const Xa = [], Xb = [], xCentro = [], yPromedio = [];
  for (let i = 0; i < 1; i += paso) {
    Xa.push(i);
    Xb.push(i + paso);
    xCentro.push((i + i + paso) / 2);
    const valores = Yn.filter((_, j) => Xn[j] >= i && Xn[j] <= i + paso);
    yPromedio.push(valores.reduce((a, b) => a + b, 0) / valores.length);
  }
  return { Xa, Xb, xCentro, yPromedio };
}

function mostrarTablaOriginal() {
  const cont = document.getElementById('datos-originales');
  let html = `<h2>Datos Originales</h2><div class="scroll-tabla"><table><tr><th>X</th>${[...Array(7)].map((_, i) => `<th>Y${i + 1}</th>`).join('')}<th>Y Sumatoria</th></tr>`;
  for (let i = 0; i < X.length; i++) {
    html += `<tr><td>${X[i]}</td>${[Y1, Y2, Y3, Y4, Y5, Y6, Y7].map(Y => `<td>${Y[i].toFixed(2)}</td>`).join('')}<td>${Y[i].toFixed(2)}</td></tr>`;
  }
  html += `</table></div>`;
  cont.innerHTML = html;
}

function mostrarTablaNormalizada() {
  const cont = document.getElementById('datos-normalizados');
  let html = `<h2>Datos Normalizados</h2><div class="scroll-tabla"><table><tr><th>X</th><th>Y</th></tr>`;
  for (let i = 0; i < Xnorm.length; i++) {
    html += `<tr><td>${Xnorm[i].toFixed(3)}</td><td>${Ynorm[i].toFixed(3)}</td></tr>`;
  }
  html += `</table></div>`;
  cont.innerHTML = html;
}

function mostrarTablaPromedios(rangos, id, titulo) {
  const cont = document.getElementById(id);
  let html = `<h2>${titulo}</h2><div class="scroll-tabla"><table><tr><th>Xa</th><th>Xb</th><th>X Centro</th><th>Y Promedio</th></tr>`;
  for (let i = 0; i < rangos.Xa.length; i++) {
    html += `<tr><td>${rangos.Xa[i].toFixed(2)}</td><td>${rangos.Xb[i].toFixed(2)}</td><td>${rangos.xCentro[i].toFixed(2)}</td><td>${rangos.yPromedio[i].toFixed(3)}</td></tr>`;
  }
  html += `</table></div>`;
  cont.innerHTML = html;
}

function dibujarGrafico(Xg, Yg, id, titulo) {
  const data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Y');
  for (let i = 0; i < Xg.length; i++) {
    data.addRow([Xg[i], Yg[i]]);
  }
  const chart = new google.visualization.LineChart(document.getElementById(id));
  chart.draw(data, {
    title: titulo,
    width: 800,
    height: 400,
    legend: { position: 'none' }
  });
}

function dibujarGraficoCombinado() {
  const data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Y Normalizado');
  data.addColumn('number', 'Promedio 0.1');
  data.addColumn('number', 'Promedio 0.05');
  for (let i = 0; i < Xnorm.length; i++) {
    const x = Xnorm[i];
    const y = Ynorm[i];
    const y10 = buscarPromedio(x, rangos10);
    const y05 = buscarPromedio(x, rangos20);
    data.addRow([x, y, y10, y05]);
  }
  const chart = new google.visualization.LineChart(document.getElementById('grafico-combinado'));
  chart.draw(data, {
    title: 'Gráfico Combinado',
    width: 800,
    height: 400,
    legend: { position: 'bottom' }
  });
}

function buscarPromedio(x, rangos) {
  for (let i = 0; i < rangos.xCentro.length; i++) {
    const centro = rangos.xCentro[i];
    if (Math.abs(x - centro) <= 0.05) {
      return rangos.yPromedio[i];
    }
  }
  return null;
}
