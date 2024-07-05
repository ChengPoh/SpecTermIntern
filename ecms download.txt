var elements = document.getElementsByTagName('a');
var counter = 0;
var interval = setInterval(function () {
    elements[counter].click();
    counter++;
    if (counter > elements.length) {
        clearInterval(interval);
    }
}, 200);
