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
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('fas')){
        const itemName = e.target.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.innerHTML;
        axios.get(`/api/v1/ads?name=${itemName}`).then(res => {
          // console.log(res.data)
          itemID = res.data.data[0]._id;
          axios.delete(`/api/v1/ads/${itemID}`).then(res => {
            console.log('sucess');
            // loadAds();
          }).catch(err => console.log(err.message))
        }).catch(err => console.log(err.message))
      }
    })
  })
}

function loadAds() {
  const adDisplay = document.querySelector(".data-list");

  let adsListHTML = "";

  axios
    .get("/api/v1/ads")
    .then((res) => {
      const ads = res.data.data;
      ads.forEach((ad) => {
        console.log(ad.url);
        adsListHTML += `<div class="scene">
          <div class="card">
            <div class="card__face card__face--front">
              <img src="${ad.imageURL}" alt="Indisponível">
              <div class="card-content">
                <h3>${ad.name}</h3>
                <div class="card-front-item">
                  <i class="fas fa-eye card-front-item-icon"></i>
                  <p>${
                    typeof ad.visits[ad.visits.length - 1] == "undefined"
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
                <div class="card-menu">
                  <a class="btn-card-menu btn-delete">
                    <i class="fas fa-trash"></i>
                  </a>
                  <a class="btn-card-menu btn-download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
                <div class="card-back-content">
                  <p><span class="card-details-index">URL</span> <a href="${
                    ad.url
                  }">anúncio</a></p>
                  <label class="switch">
                    <input type="checkbox" checked="true">
                    <span class="slider round"></span>
                  </label>
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
