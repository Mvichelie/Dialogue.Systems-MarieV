var word = prompt("Enter a word: ");

function addThree(word){
    var lastThreeLetters = word.slice(-3);
    console.log(lastThreeLetters+word+lastThreeLetters);
}

addThree(word);