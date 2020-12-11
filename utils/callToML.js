const axios = require("axios");

exports.getAdDataFromId = async (mlIdList) => {
  // adList = String(mlIdList);
  // console.log(adList);

  const url = `https://api.mercadolibre.com/items?ids=${String(mlIdList)}`;

  let adData;

  await axios
    .get(url)
    .then((res) => {
      // console.log(res);
      adData = res.data.map((data) => {
        return data.body;
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
  return adData;
};

exports.getAdVisitsFromId = async (mlIdList) => {
  console.log(
    `https://api.mercadolibre.com/visits/items?ids=${String(mlIdList)}`
  );

  const url = `https://api.mercadolibre.com/visits/items?ids=${String(
    mlIdList
  )}`;
  let adData;

  await axios
    .get(url)
    .then((res) => {
      // console.log(res);
      adData = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
  return adData;
};

exports.getMlAdIDFromURL = async (adURL) => {
  url = new URL(adURL);
  details = url.pathname.substring(1);
  splitedDetails = details.split("-");
  let adID;

  // Primeiro caso: id do produto explícito
  if (splitedDetails[0] === "MLB") {
    adID = splitedDetails[0] + splitedDetails[1];
  } else {
    // Segundo caso: id implícito
    permalink = url.protocol + "//" + url.host + url.pathname;
    adName = url.pathname.substring(1).split("/")[0];
    queryName = adName.replace(/-/g, "+");

    adID = await getMlAdIDFromSearch(queryName, permalink);
  }
  // console.log(adID);
  return adID;
};

async function getMlAdIDFromSearch(query, permalink) {
  let adID;
  // console.log(`query: ${query}`);
  await axios
    .get(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
    .then((res) => {
      results = res.data.results;
      //console.log(results);
      for (index in results) {
        if (results[index].permalink === permalink) {
          adID = results[index].id;
          break;
        }
      }
    })
    .catch((err) => {
      console.log("erro na procura no ML");
      console.log(err.message);
    });
  return adID;
}

exports.getSellerNicknameFromSellerId = async (sellerId) => {
  let sellerNickname;
  // console.log(`query: ${query}`);
  await axios
    .get(`https://api.mercadolibre.com/users/${sellerId}`)
    .then((res) => {
      results = res.data;
      sellerNickname = results.nickname;
    })
    .catch((err) => {
      console.log("erro na procura no ML");
      console.log(err.message);
    });
  return sellerNickname;
};
