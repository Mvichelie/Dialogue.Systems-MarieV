var firstNumber = prompt("Enter first number: ");
var secondNumber = prompt("Enter second number: ");
var sum = parseInt(firstNumber) + parseInt(secondNumber);

function findNumberFifty(firstNumber,secondNumber) {
    if (firstNumber == 50 || secondNumber == 50 || sum == 50) {
        return true;
    } else {
        return false;
    }
}

findNumberFifty(firstNumber, secondNumber);