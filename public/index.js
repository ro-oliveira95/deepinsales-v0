document.querySelector(".add-ad").addEventListener("submit", addNewAdToDB);
document.addEventListener("DOMContentLoaded", createChart);
document.addEventListener("DOMContentLoaded", loadAds);

// init global variables
let chart;

function updateChart(data) {
  chart.data.datasets = [];
  data.forEach((dataset) => {
    chart.data.datasets.push(dataset);
  });
  chart.update();
}

function createChart() {
  var ctx = document.getElementById("chart");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            type: "time",
          },
        ],
      },
    },
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
                : ad.sells[ad.sells.length - 1].sells
            }</p>
            <p>Taxa de conversão: 1</p>
            <div class="btn-container">
              <button class="btn btn-details">+ detalhes</button>
              <label class="switch">
                <input type="checkbox" checked="true">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          
        </div>`;
      });

      adDisplay.innerHTML = adsListHTML;

      let data = [];

      ads.forEach((ad) => {
        const sellsData = ad.sells.map((sell) => {
          date = moment(sell.timestamp);

          return { x: date, y: sell.sells };
        });

        series = {
          label: ad.name,
          fill: false,
          borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)})`,
          data: sellsData,
        };

        data.push(series);
      });

      updateChart(data);
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
