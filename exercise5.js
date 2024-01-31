const names = ["Anna", "Johannes", "Paula", "Daisy"]
var namesWithNumbers = []

function calculateNameLength(names) {
    names.forEach(name => {
        namesWithNumbers.push(name + " " + name.length*2)
    });
    console.log(namesWithNumbers)
}

calculateNameLength(names)