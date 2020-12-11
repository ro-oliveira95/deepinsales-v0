const axios = require("axios");

exports.readSellsOnAd = async (url) => {
  let val;
  await axios
    .get(url)
    .then((res) => {
      let data = res.data;

      let startIndex = data.indexOf('<span class="ui-pdp-subtitle">');
      startIndex = data.indexOf("|", startIndex);
      const endIndex = data.indexOf("vendido", startIndex);

      val = Number(data.substring(startIndex + 1, endIndex));
    })
    .catch((err) => {
      console.log(`erro ao extrair vendas em anuncio com URL ${url}`);
    });

  if (val == null || Number.isNaN(val)) {
    val = 0;
  }
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
      console.log(`erro ao extrair url da imagem em anuncio com URL ${url}`);
    });
  return imageURL;
};
