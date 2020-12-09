const axios = require("axios");
const { getAdDataFromId, getAdVisitsFromId } = require("./callToML");
const {readSellsOnAd} = require('./acqDataOnPages')

exports.updateSellsOnAllUsers = () => {
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
        .then(async (res) => {
          ads = res.data.data;

          if (ads.length === 0) {
            return;
          }

          let mlIdList = [];

          ads.forEach((ad) => {
            mlIdList.push(ad.mlId);
          });

          adsBasicInfo = await getAdDataFromId(mlIdList);
          adsVisits = await getAdVisitsFromId(mlIdList);

          // ads.forEach((ad, index) => {
          //   console.log(index);
          //   outerIndex = Math.floor(index / 10);

          //   if (mlIdList[outerIndex] == null) {
          //     mlIdList[outerIndex] = [];
          //   }

          //   mlIdList[outerIndex].push(ad.mlId);
          // });

          // adsBasicInfo = [];
          // adsVisits = [];

          // mlIdList.forEach(async (idList) => {
          //   adsBasicInfo = adsBasicInfo.concat(await getAdDataFromId(idList));
          //   adsVisits = adsVisits.concat(await getAdVisitsFromId(idList));
          // });

          // adsBasicInfo.forEach(async (mlAdInfo) => {
          for (let mlAdInfo of adsBasicInfo){
            status = mlAdInfo.status;
            listingType = mlAdInfo.listingType;
            currentTotalVisits = adsVisits[mlAdInfo.id];

            // console.log(mlAdInfo.title, currentTotalVisits)

            // currentTotalSells = mlAdInfo.sold_quantity;
            currentTotalSells = await readSellsOnAd(mlAdInfo.permalink);

            ad = ads.filter((ad) => {
              return ad.mlId === mlAdInfo.id;
            });

            ad = ad[0];

            id = ad._id;
            pastTotalSells = ad.totalSells;
            pastTotalVisits = ad.totalVisits;

            lastSellRecord =
              ad.acumulatedSells[ad.acumulatedSells.length - 1].sells;
            lastVisitRecord =
              ad.acumulatedVisits[ad.acumulatedVisits.length - 1].visits;

            dailySell = currentTotalSells - pastTotalSells;
            dailyVisit = currentTotalVisits - pastTotalVisits;

            acumulatedSell = lastSellRecord + dailySell;
            acumulatedVisit = lastVisitRecord + dailyVisit;

            updatedData = {
              acumulatedSells: [
                ...ad.acumulatedSells,
                { timestamp: Date.now(), sells: acumulatedSell },
              ],
              acumulatedVisits: [
                ...ad.acumulatedVisits,
                { timestamp: Date.now(), visits: acumulatedVisit },
              ],
              dailySells: [
                ...ad.dailySells,
                { timestamp: Date.now(), sells: dailySell },
              ],
              dailyVisits: [
                ...ad.dailyVisits,
                { timestamp: Date.now(), visits: dailyVisit },
              ],
              totalSells: currentTotalSells,
              totalVisits: currentTotalVisits,
              status: status,
              listingType: listingType,
            };

            await axios
              .put(`/api/v1/ads/${id}`, updatedData, options)
              .then((res) => {
                console.log("sucess");
              })
              .catch((err) => {
                console.log("fail");
                console.log(err.message);
              });
          }
        })
        .catch((err) => {
          console.log("erro no get de todos os ads");
          console.log(err.message);
        });
    })
    .catch((err) => {
      console.log("erro ao logar como admin para get de todos os anuncios");
      console.log(err.message);
    });
};
