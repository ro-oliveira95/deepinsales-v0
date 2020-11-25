document.querySelector(".add-ad").addEventListener("submit", addNewAdToDB);
document.addEventListener("DOMContentLoaded", loadAds);
document.addEventListener("DOMContentLoaded", renderPlot);
// document.addEventListener("DOMContentLoaded", connectEvents);


// init global variables
let chart;

function renderPlot () {
  chart = createNewChart("gráfico 1");
  chart.render();
}

function connectEvents() {
  document.querySelector(".btn-details").addEventListener("click", (e) => {
    document.querySelector(".faded-background").style.display = "flex";
  });
  document.querySelector(".faded-background").addEventListener("click", (e) => {
    if (e.target.className == "faded-background") {
      document.querySelector(".faded-background").style.display = "none";
    }
  });
}

function createNewChart(title) {
  return new CanvasJS.Chart("chartContainer", {
    animationEnabled: false,
    title: {
      text: title,
    },
    axisX: {
      valueFormatString: "DD MMM,YY",
    },
    axisY: {
      title: "Temperature (in °C)",
      suffix: " °C",
    },
    legend: {
      cursor: "pointer",
      fontSize: 16,
      itemclick: toggleDataSeries,
    },
    toolTip: {
      shared: true,
    },
    data: [
      {
        name: "Myrtle Beach",
        type: "spline",
        yValueFormatString: "#0.## °C",
        showInLegend: true,
        dataPoints: [
          { x: new Date(2017, 6, 24), y: 31 },
          { x: new Date(2017, 6, 25), y: 31 },
          { x: new Date(2017, 6, 26), y: 29 },
          { x: new Date(2017, 6, 27), y: 29 },
          { x: new Date(2017, 6, 28), y: 31 },
          { x: new Date(2017, 6, 29), y: 30 },
          { x: new Date(2017, 6, 30), y: 29 },
        ],
      },
      {
        name: "Martha Vineyard",
        type: "spline",
        yValueFormatString: "#0.## °C",
        showInLegend: true,
        dataPoints: [
          { x: new Date(2017, 6, 24), y: 20 },
          { x: new Date(2017, 6, 25), y: 20 },
          { x: new Date(2017, 6, 26), y: 25 },
          { x: new Date(2017, 6, 27), y: 25 },
          { x: new Date(2017, 6, 28), y: 25 },
          { x: new Date(2017, 6, 29), y: 25 },
          { x: new Date(2017, 6, 30), y: 25 },
        ],
      },
      {
        name: "Nantucket",
        type: "spline",
        yValueFormatString: "#0.## °C",
        showInLegend: true,
        dataPoints: [
          { x: new Date(2017, 6, 24), y: 22 },
          { x: new Date(2017, 6, 25), y: 19 },
          { x: new Date(2017, 6, 26), y: 23 },
          { x: new Date(2017, 6, 27), y: 24 },
          { x: new Date(2017, 6, 28), y: 24 },
          { x: new Date(2017, 6, 29), y: 23 },
          { x: new Date(2017, 6, 30), y: 23 },
        ],
      },
    ],
  });
}

function loadAds() {
  const adDisplay = document.querySelector(".data-list");

  let adsListHTML = "";

  axios
    .get("/api/v1/ads")
    .then((res) => {
      const ads = res.data.data;
      ads.forEach((ad) => {
        adsListHTML += `<div class="card">
          <img src="${ad.imageURL}">
          <div class="card-content">
            <h3>${ad.name}</h3>
            <p>Acessos: ${
              typeof ad.visits[ad.visits.length - 1] == "undefined"
                ? "Sem registros"
                : ad.visits[ad.visits.length - 1]
            }</p>
            <p>Vendas: ${
              typeof ad.sells[ad.sells.length - 1] == "undefined"
                ? "Sem registros"
                : ad.sells[ad.sells.length - 1]
            }</p>
            <p>Taxa de conversão: 1</p>
          </div>
          <div class="btn-container">
            <button class="btn btn-details">+ detalhes</button>
            <label class="switch">
              <input type="checkbox">
              <span class="slider round"></span>
            </label>
          </div>
          
        </div>`;
      });

      adDisplay.innerHTML = adsListHTML;
      connectEvents();
    })
    .catch((err) => console.log(err));
}

function addNewAdToDB(e) {
  e.preventDefault();

  const adURL = document.querySelector("#url");
  const adName = document.querySelector("#name");

  const urlData = {
    name: adName.value,
    url: adURL.value,
  };

  axios
    .post("/api/v1/ads", urlData)
    .then((res) => {
      adName.value = "";
      adURL.value = "";
      loadAds();
    })
    .catch((err) => console.log(err.message));
}

function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  chart.render();
}
