
function speakText() {
    let text = document.getElementById('textInput').value;
    if(text.trim() === "") {
        alert("Please enter some text!");
    } else {
        responsiveVoice.speak(text, "US English Male");
    }
}
