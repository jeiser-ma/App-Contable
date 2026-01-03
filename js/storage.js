function getData(k) {
  return JSON.parse(localStorage.getItem(k) || "[]");
}

function setData(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}
