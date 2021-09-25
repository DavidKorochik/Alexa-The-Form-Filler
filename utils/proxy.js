const util = require('util');
const fs = require('fs');

// Get random proxy from the proxy array
const getRandomProxy = (proxyArr) => {
  return proxyArr[Math.floor(Math.random() * proxyArr.length)];
};

// Get the proxy details from the random proxy that got selected
const readProxyFilePromise = util.promisify(fs.readFile);

const proxyDetails = async (fileName) => {
  const proxyFileData = await readProxyFilePromise(fileName);
  const proxyArr = proxyFileData.toString().split('\n');

  // Picking a random proxy and splitting it by :
  let randomProxy = getRandomProxy(proxyArr);
  proxyArr.filter((proxy) => proxy !== randomProxy);
  randomProxy = randomProxy.split(':');

  // Getting all the data that we need for one proxy into one object
  const proxyDetails = {
    host: randomProxy[0],
    port: randomProxy[1],
    username: randomProxy[2],
    password: randomProxy[3],
  };

  return proxyDetails;
};

module.exports = proxyDetails;
