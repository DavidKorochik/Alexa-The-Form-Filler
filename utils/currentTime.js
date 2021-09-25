const date = new Date();
const hours = date.getHours();
const minutes =
  date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
const seconds =
  date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

const current = `${hours}:${minutes}:${seconds}`;

module.exports = current;
