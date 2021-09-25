const date = new Date();
const hours = date.getHours();
const minutes =
  date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
const seconds = date.getSeconds();

const current = `${hours}:${minutes}:${seconds}`;

console.log(current);
