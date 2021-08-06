// 0.005


const covidNumArr = [0, 1, 10, 20, 50, 100];

covidNumArr.forEach(numOfCovids => {
  const multiplier = numOfCovids - 20;
  console.log(multiplier*0.001*-1);
});
