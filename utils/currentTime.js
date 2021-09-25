const date = new Date();

// Getting the current hour
const hours = date.getHours();

// Getting the current minutes, and if the minutes are less then 10 we add zero before the number
const minutes =
  date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

// Getting the current seconds, and if the seconds are less then 10 we add zero before the number
const seconds =
  date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

// Getting the current time into one variable
const current = `${hours}:${minutes}:${seconds}`;

module.exports = current;
