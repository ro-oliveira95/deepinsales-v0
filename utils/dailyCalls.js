const axios = require("axios");
const { readSellsOnAd } = require("./acqDataOnPages");

exports.updateSellsOnAllUsers = () => {
  console.log("reading sells data...");

  data = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const options = { proxy: { host: "127.0.0.1", port: 5000 } };

  axios
    .post("/api/v1/auth/login", data, options)
    .then((res) => {
      const token = `Bearer ${res.data.token}`;

      const options = {
        proxy: { host: "127.0.0.1", port: 5000 },
        withCredentials: true,
        headers: { Cookie: `token=${token}` },
      };

      axios
        .get("/api/v1/ads", options)
        .then((res) => {
          allAds = res.data.data;
          ads = allAds.map((ad) => {
            return {
              id: ad._id,
              name: ad.name,
              url: ad.url,
              sells: ad.sells,
              totalSells: ad.totalSells,
            };
          });

          ads.forEach(async (ad) => {
            const currentTotalSells = await readSellsOnAd(ad.url);

            const dailySell = currentTotalSells - ad.totalSells;

            let acumulatedDailySells = dailySell;

            if (ad.sells.length !== 0) {
              acumulatedDailySells += ad.sells[ad.sells.length - 1].sells;
            }

            const sellsData = {
              timestamp: new Date(),
              sells: acumulatedDailySells,
            };

            const sells = { sells: [...ad.sells, sellsData] };
            const totalSells = { totalSells: currentTotalSells };

            axios
              .all([
                axios.put(`/api/v1/ads/${ad.id}`, sells, options),
                axios.put(`/api/v1/ads/${ad.id}`, totalSells, options),
              ])
              .then((res1, res2) => {
                // console.log(res1, res2);
              })
              .catch((err1, err2) => {
                if (err1) {
                  console.log(err1.message);
                }
                if (err2) {
                  console.log(err2.message);
                }
              });
          });
        })
        .catch((err) => {
          console.log("erro no get de todos os ads");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("erro ao logar como admin para get de todos os anuncios");
      console.log(err);
    });
};
