const fs = require('fs');
const axios = require('axios');

const GetRandomProxy = (proxyArr) => {
  return proxyArr[Math.floor(Math.random() * proxyArr.length)];
};

const GetProxyDetails = (fileName, cb) => {
  fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    const proxyArr = data.toString().split('\n');

    let randomProxy = GetRandomProxy(proxyArr);
    proxyArr.filter((proxy) => proxy !== randomProxy);
    randomProxy = randomProxy.split(':');

    const proxyDetails = {
      host: randomProxy[0],
      port: randomProxy[1],
      username: randomProxy[2],
      password: randomProxy[3],
    };
    return cb(proxyDetails);
  });
};

const makeHttpRequestProxied = async (url, { host, username, password }) => {
  const proxyOptions = {
    proxy: {
      protocol: 'http',
      host,
      port: 2255,
      auth: {
        username,
        password,
      },
    },
  };

  await axios.get(url, proxyOptions);
};

const proxyDetails = GetProxyDetails('vips-residential.txt', (proxyDetails) => {
  console.log(proxyDetails);
  makeHttpRequestProxied('http://checkip.dyndns.org/', proxyDetails)
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
});

console.log(proxyDetails);
