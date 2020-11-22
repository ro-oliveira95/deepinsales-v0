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
              url: ad.url,
              sells: ad.sells,
              totalSells: ad.totalSells,
            };
          });

          let id,
            url,
            dailySell,
            sells,
            totalSells,
            currentTotalSells,
            currentTotalVisits;

          ads.forEach(async (ad) => {
            id = ad.id;
            url = ad.url;

            currentTotalSells = await readSellsOnAd(url);
            //currentTotalVisits = await gatherTotalVisits(url);

            // first iteration
            if (ad.totalSells === 0) {
              totalSells = { totalSells: currentTotalSells };
            } else {
              dailySell = currentTotalSells - ad.totalSells;

              sells = { sells: [...ad.sells, sell] };
              totalSells = { totalSells: currentTotalSells };
            }

            for (sell in sells.sells) {
              totalSells += sell;
            }

            axios.all([
              axios.put(`/api/v1/ads/${id}`, sells, options),
              axios.put(`/api/v1/ads/${id}`, totalSells, options),
            ]);
          });
        })
        .catch((err) => {
          console.log("erro no get de todos os ads");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
