document.querySelector(".add-ad").addEventListener("submit", addNewAdToDB);
document.addEventListener("DOMContentLoaded", loadAds);
document.addEventListener("DOMContentLoaded", createChart);
// document.addEventListener("DOMContentLoaded", connectEvents);

// init global variables
let chart;

function updateChart(data) {
  data.forEach((dataset, index) => {
    //chart.data.labels = ["i1", "i2", "i3", "i4", "i5"];
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
            display: true,
            time: {
              unit: "seconds",
            },
          },
        ],
      },
    },
  });

  function connectEvents() {
    document.querySelector(".btn-details").addEventListener("click", (e) => {
      document.querySelector(".faded-background").style.display = "flex";
    });
    document
      .querySelector(".faded-background")
      .addEventListener("click", (e) => {
        if (e.target.className == "faded-background") {
          document.querySelector(".faded-background").style.display = "none";
        }
      });
  }
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
        const formatedDate = new Date(ad.createdAt);
        const datetime = formatedDate
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "");

        series = {
          label: ad.name,
          data: [
            {
              x: datetime,
              y: 10,
            },
          ],
        };

        console.log(ad.createdAt);

        data.push(series);
      });

      /*let data = [
        {
          label: "s1",
          borderColor: "blue",
          data: [
            { x: "2017-01-06 18:39:30", y: 100 },
            { x: "2017-01-07 18:39:28", y: 101 },
          ],
        },
        {
          label: "s2",
          borderColor: "red",
          data: [
            { x: "2017-01-07 18:00:00", y: 90 },
            { x: "2017-01-08 18:00:00", y: 105 },
          ],
        },
      ]; */
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

function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  chart.render();
}
