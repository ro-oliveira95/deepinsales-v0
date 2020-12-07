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
            /*time: {
              unit: "day",
              displayFormats: {
                day: "DD/MM h a",
              },
            },*/
          },
        ],
      },
    },
  });
}

function createEventListeners() {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // if (e.target.parentElement.classList.contains("card")) {
      e.target.parentElement.classList.toggle("is-flipped");
      // }
      // document.querySelector(".card").classList.toggle("is-flipped");
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.classList.contains("btn-delete")) {
        const itemName =
          e.target.parentElement.parentElement.parentElement.parentElement
            .firstElementChild.firstElementChild.nextElementSibling
            .firstElementChild.firstElementChild.nextElementSibling.innerHTML;

        axios
          .get(`/api/v1/ads?name=${itemName}`)
          .then((res) => {
            params = { itemID: res.data.data[0]._id };

            const options = { proxy: { host: "127.0.0.1", port: 5000 } };

            axios
              .delete(`/api/v1/ads/${params.itemID}`, options)
              .then((res) => {
                console.log("sucess");
                loadAds();
              })
              .catch((err) => console.log(err.message));
          })
          .catch((err) => console.log(err.message));
      }
    });
  });

  document.querySelectorAll(".btn-card-menu").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-icon")) {
        content1 =
          e.target.parentElement.parentElement.parentElement.firstElementChild
            .nextElementSibling.nextElementSibling.firstElementChild;
        content2 = content1.nextElementSibling;

        if (
          e.target.classList.contains("fa-chart-line") &&
          content1.classList.contains("translateY")
        ) {
          content1.classList.toggle("translateY");
          content2.classList.toggle("translateY");

          btnIconSettings =
            e.target.parentElement.parentElement.firstElementChild
              .nextElementSibling.firstElementChild;
          btnIconSettings.parentElement.classList.toggle("btn-icon-activate");
          e.target.parentElement.classList.toggle("btn-icon-activate");

          content2.classList.toggle("btn-icon-activate");
        } else if (
          e.target.classList.contains("fa-cogs") &&
          !content1.classList.contains("translateY")
        ) {
          content1.classList.toggle("translateY");
          content2.classList.toggle("translateY");

          btnIconSettings =
            e.target.parentElement.parentElement.firstElementChild
              .firstElementChild;
          btnIconSettings.parentElement.classList.toggle("btn-icon-activate");
          e.target.parentElement.classList.toggle("btn-icon-activate");
        }
      }
    });
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
        adsListHTML += `<div class="scene">
          <div class="card">
            <div class="card__face card__face--front">
              <img src="${ad.imageUrl}" alt="Indisponível">
              <div class="card-content">
                <div class="card-content-header-container">
                  <a href="${ad.url}" target="_blank" class="redirect-link">
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                  <h3>${ad.name}</h3>
                </div>
                <div class="card-front-item">
                  <i class="fas fa-eye card-front-item-icon"></i>
                  <p>${
                    typeof ad.acumulatedVisits[ad.visits.length - 1] ==
                    "undefined"
                      ? "Sem registros"
                      : ad.visits[ad.visits.length - 1]
                  }</p>
                </div>
                <div class="card-front-item">
                  <i class="fas fa-shopping-cart card-front-item-icon"></i>
                  <p>${
                    typeof ad.sells[ad.sells.length - 1] == "undefined"
                      ? "Sem registros"
                      : ad.sells[ad.sells.length - 1].sells
                  }</p>
                </div>
                <div class="card-front-item">
                  <i class="fas fa-sync-alt card-front-item-icon"></i>
                  <p>Sem registros</p>
                </div>
              
              </div>
            </div>
            <div class="card__face card__face--back">
              <div class="card-back-menu">
                <a class="btn-card-menu btn-icon-activate">
                  <i class="fas fa-chart-line menu-icon"></i>
                  Gráfico                  
                </a>
                <a class="btn-card-menu">
                  <i class="fas fa-cogs menu-icon"></i>
                  Ajustes
                </a>
              </div>
              <div class="horizontal-divider"></div>
              <div class="card-back-content">
                <div class="content-1">
                  <div class="switch-container">
                    <label class="switch">
                      <input type="checkbox" checked="true">
                      <span class="slider round"></span>
                    </label>
                    <p>Acumulado</p>
                    </div>
                  <div class="switch-container">
                    <label class="switch">
                      <input type="checkbox" checked="true">
                      <span class="slider round"></span>
                    </label>
                    <p>Diário</p>
                    </div>  
                </div>
                <div class="content-2">
                  <button class="btn btn-delete">
                    <i class="fas fa-trash delete-icon"></i>
                    Deletar
                  </button>
                </div>
              </div>
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
      createEventListeners();
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
