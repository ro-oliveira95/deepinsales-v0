const axios = require("axios");

exports.getAdDataFromId = async (mlIdList) => {
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
  let mlId;

  // Primeiro caso: id do produto explícito -> produto comum
  if (splitedDetails[0] === "MLB") {
    mlId = splitedDetails[0] + splitedDetails[1];
    isBuybox = false;
    catalogueId = "";
  } else {
    // Segundo caso: id implícito -> produto catalogado ('buybox')
    index = details.indexOf("/p/");
    catalogueId = details.substring(index + 3);
    console.log("catalogueId", catalogueId);
    mlId = await getMlAdIDFromCatalogue(catalogueId);
    isBuybox = true;
  }
  // console.log(adID);
  return { mlId, catalogueId, isBuybox };
};

async function getMlAdIDFromCatalogue(productID) {
  const url = `https://api.mercadolibre.com/products/${productID}`;
  let adID;

  await axios
    .get(url)
    .then((res) => {
      adID = res.data.buy_box_winner.item_id;
    })
    .catch((err) => {
      console.log(err.message);
    });
  return adID;
}

exports.checkForAdUpdates = async (productID) => {
  const url = `https://api.mercadolibre.com/products/${productID}`;
  let adData;

  await axios
    .get(url)
    .then((res) => {
      adData = res.data;
    })
    .catch((err) => {
      console.log(err.message);
    });
  return adData;
};

// async function getMlAdIDFromSearch(query, permalink) {
//   let adID;
//   // console.log(`query: ${query}`);
//   await axios
//     .get(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
//     .then((res) => {
//       results = res.data.results;
//       //console.log(results);
//       for (index in results) {
//         if (results[index].permalink === permalink) {
//           adID = results[index].id;
//           break;
//         }
//       }
//     })
//     .catch((err) => {
//       console.log("erro na procura no ML");
//       console.log(err.message);
//     });
//   return adID;
// }

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
