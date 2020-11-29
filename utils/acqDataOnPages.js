const axios = require("axios");

exports.readSellsOnAd = async (url) => {
  let val = -1;

  await axios
    .get(url)
    .then((res) => {
      let data = res.data;
      //const index = data.search("ui-pdp-subtitle");
      //val = data.substring(index + 26, index + 31);

      let startIndex = data.indexOf('<span class="ui-pdp-subtitle">');
      startIndex = data.indexOf("|", startIndex);
      const endIndex = data.indexOf("vendido", startIndex);

      console.log(data.substring(startIndex + 1, endIndex));

      val = Number(data.substring(startIndex + 1, endIndex));

      // return val;
    })
    .catch((err) => {
      console.log("erro ao extrair vendas no anuncio");
    });
  return val;
};

exports.getImageURL = async (url) => {
  let imageURL = "none";

  await axios
    .get(url)
    .then((res) => {
      let data = res.data;
      let startIndex = data.indexOf('<figure class="ui-pdp-gallery__figure">');
      startIndex = data.indexOf("src", startIndex);
      const endIndex = data.indexOf("2x", startIndex);

      imageURL = data.substring(startIndex + 5, endIndex);
    })
    .catch((err) => {
      console.log("erro ao extrair url da imagem");
    });
  // console.log("getImageCall");
  return imageURL;
};
