var guess = prompt("Enter a number between 1 to 10: ");
var randomNumber = Math.floor(Math.random() * 11);

if (guess != randomNumber){
    alert("Not matched! Random number is: " + randomNumber);
} else {
    alert("Good work!");
} 