let zooAnimals = {
    "giraffe": { "weight": 910, "origin": "Tanzania" },
    "lion": { "weight": 200, "origin": "Tanzania" },
    "elephant": { "weight": 5000, "origin": "India" },
    "penguin": { "weight": 30, "origin": "Argentina" },
    "koala": { "weight": 10, "origin": "Australia" },
  };
  
console.log(zooAnimals.hasOwnProperty("giraffe"));   
let hasAnimalWithWeight = Object.values(zooAnimals).some(animal => animal.weight === 910);
console.log(hasAnimalWithWeight);  
let hasAnimalWithOrigin = Object.values(zooAnimals).some(animal => animal.origin === "India");
console.log(hasAnimalWithOrigin);  
zooAnimals["tiger"] = { "weight": 250, "origin": "India" };
console.log(zooAnimals);   