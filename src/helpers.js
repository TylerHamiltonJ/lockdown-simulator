function ranArr(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function ranInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function removeItemFromArray(array, index) {
  array.splice(index, 1);
}

module.exports = { ranArr, ranInt, removeItemFromArray };
