const axios = require("axios");
const {
  getAdDataFromId,
  getAdVisitsFromId,
  getSellerNicknameFromSellerId,
  checkForAdUpdates,
} = require("./callToML");
const { readSellsOnAd } = require("./acqDataOnPages");
const asyncHandler = require("../middleware/async");
const Ad = require("../models/Ad");
const { query } = require("express");

exports.updateSellsOnAllUsers2 = async () => {
  let query = Ad.find({});
  const ads = await query;

  if (ads.length === 0) {
    return;
  }

  let mlIdList = [];

  ads.forEach(async (ad) => {
    adId = ad.mlId;
    // checking for potencial updates in ads from catalogue
    if (ad.isBuybox) {
      updatedAdInfo = await checkForAdUpdates(ad.catalogueId);

      // if current ad isn't buybox winner
      if (updatedAdInfo.buy_box_winner.item_id !== ad.mlId) {
        const { status } = updatedAdInfo;
        const { item_id, seller_id, price } = updatedAdInfo.buy_box_winner;

        seller = await getSellerNicknameFromSellerId(seller_id);
        const adData = { mlId: item_id, seller, price, status };
        id = ad._id;

        // updating ad
        await Ad.findByIdAndUpdate(id, adData, {
          new: true,
          runValidators: true,
        });

        adId = item_id;
      }
    }

    // generating id's lists
    mlIdList.push(adId);
  });

  adsVisits = await getAdVisitsFromId(mlIdList);

  mlIdList = [];

  ads.forEach((ad, index) => {
    outerIndex = Math.floor(index / 20);

    if (mlIdList[outerIndex] == null) {
      mlIdList[outerIndex] = [];
    }

    mlIdList[outerIndex].push(ad.mlId);
  });

  adsBasicInfo = [];
  for (let idList of mlIdList) {
    info = await getAdDataFromId(idList);
    adsBasicInfo = adsBasicInfo.concat(info);
  }

  for (let mlAdInfo of adsBasicInfo) {
    currentTotalVisits = adsVisits[mlAdInfo.id];

    //console.log(mlAdInfo.title, mlAdInfo.permalink);

    currentTotalSells = await readSellsOnAd(mlAdInfo.permalink);

    ad = ads.filter((ad) => {
      return ad.mlId === mlAdInfo.id;
    });

    ad = ad[0];

    id = ad._id;
    pastTotalSells = ad.totalSells;
    pastTotalVisits = ad.totalVisits;

    lastSellRecord = ad.acumulatedSells[ad.acumulatedSells.length - 1].sells;
    lastVisitRecord =
      ad.acumulatedVisits[ad.acumulatedVisits.length - 1].visits;

    dailySell = currentTotalSells - pastTotalSells;
    dailyVisit = currentTotalVisits - pastTotalVisits;

    acumulatedSell = lastSellRecord + dailySell;
    acumulatedVisit = lastVisitRecord + dailyVisit;

    //price = mlAdInfo.price;

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
    };

    // updating ad
    await Ad.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
  }
};

exports.updateSellsOnAllUsers = async () => {
  let query = Ad.find({});
  const ads = await query;

  if (ads.length === 0) {
    return;
  }

  let allIDs = [],
    catalogueIDs = [],
    urlList = {};

  ads.forEach((ad) => {
    // generating catalogue's id list
    if (ad.isBuybox) {
      catalogueIDs.push(ad.catalogueId);
    }

    // generating id's lists
    allIDs.push(ad.mlId);

    // generating an object mapping all the ad's id with its url
    urlList[ad.mlId] = ad.url;
  });

  // generating normal ad's id list
  const adsIDs = generateAdsIDsStructure(ads);
  // generating an object which correlates ids with ad's seller, status and price
  const adsInfo = generateAdsStructure(ads);

  // checking for updates
  await checkForAdsUpdates(adsInfo, catalogueIDs, adsIDs);

  // gathering visit and sells data
  const currentTotalVisitsList = await getAdVisitsFromId(allIDs);
  const currentTotalSellsList = await readSellsOnEveryPage(urlList);

  for (let ad of ads) {
    if (ad.isBuybox) {
      // buyBox ads' visits do not work with the API call
      currentTotalVisits = 0;
    } else {
      currentTotalVisits = currentTotalVisitsList[ad.mlId];
    }

    console.log(ad.name);
    currentTotalSells = currentTotalSellsList[ad.mlId];

    id = ad._id;
    pastTotalSells = ad.totalSells;
    pastTotalVisits = ad.totalVisits;

    lastSellRecord = ad.acumulatedSells[ad.acumulatedSells.length - 1].sells;
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
    };

    // updating ad
    await Ad.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });
  }
};

async function readSellsOnEveryPage(urlList) {
  let currentTotalSells = {};

  const callsList = Object.entries(urlList).map(([id, url]) => {
    return readSellsOnAd(id, url);
  });
  const results = await Promise.all(callsList);

  results.forEach((result) => {
    currentTotalSells[result.id] = result.val;
  });

  return currentTotalSells;
}

async function checkForAdsUpdates(adsStructure, catalogueIDs, adsIDs) {
  // creating lists of async calls
  const callsToAds = adsIDs.map((idList) => {
    return getAdDataFromId(idList);
  });

  const callsToCatalogue = catalogueIDs.map((id) => {
    return checkForAdUpdates(id);
  });

  // calling multiple async calls in parallel
  const adsInfoAux = await Promise.all(callsToAds);
  const catalogueInfo = await Promise.all(callsToCatalogue);

  // concating ads info that comes in blocks of 20 ads
  adsInfo = [];
  adsInfoAux.forEach((ads) => {
    adsInfo = adsInfo.concat(ads);
  });

  // verifying if ads were updated, and changuing it in db
  for (let ad of adsInfo) {
    // checking if status or price has changed
    if (
      adsStructure[ad.id].status !== ad.status ||
      adsStructure[ad.id].price !== ad.price
    ) {
      // updating ad in db
      updatedData = {
        status: adsStructure[ad.id].status,
        price: adsStructure[ad.id].price,
      };

      await Ad.findByIdAndUpdate(adsStructure[ad.id].dbID, updatedData, {
        new: true,
        runValidators: true,
      });
    }
  }

  // verifying if catalogue items were updated
  for (let item of catalogueInfo) {
    const { status } = item;
    const { item_id, seller_id, price } = item.buy_box_winner;

    if (
      item_id !== adsStructure[item_id].mlID ||
      status !== adsStructure[item_id].status ||
      price !== adsStructure[item_id].price
    ) {
      seller = await getSellerNicknameFromSellerId(seller_id);
      const adData = { mlId: item_id, seller, price, status };

      // updating ad
      await Ad.findByIdAndUpdate(adsStructure[item_id].dbID, adData, {
        new: true,
        runValidators: true,
      });
    }
  }
}

function generateAdsStructure(ads) {
  const adsStructure = {};

  ads.forEach((ad) => {
    adsStructure[ad.mlId] = {
      status: ad.status,
      price: ad.price,
      dbID: ad._id,
      mlID: ad.mlId,
    };
  });

  return adsStructure;
}

function generateAdsIDsStructure(ads) {
  adsIDs = [];

  ads.forEach((ad, index) => {
    outerIndex = Math.floor(index / 20);

    if (adsIDs[outerIndex] == null) {
      adsIDs[outerIndex] = [];
    }

    if (!ad.isBuybox) {
      adsIDs[outerIndex].push(ad.mlId);
    }
  });

  return adsIDs;
}
