var stripString = function(string){ 
    return (string||'').replace( /^\s+|\s+$/g,''); 
};
var isValidSearch = function(string){
    return !/[~`!#$%\^&*+=[\]\\;,/{}|\\":<>\?]/g.test(string);
}

var initSearchonym = function(tab){
    popupState.searchWord = stripString(document.getElementById("search-bar").value);
    if(popupState.searchWord.length > 1 && isValidSearch(popupState.searchWord)){
        updateDom(popupState.searchWord);
    }
}

var updateDom = function(searchWord){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var sendingData = {
            sender: 'popup',
            command: 'updateWord',
            searchWord: searchWord
        }
        chrome.tabs.sendMessage(tabs[0].id, sendingData, function(response) {
            if(response.err){
                console.log(reponse.errMessage);
            }else{
                // On pressing enter , change focus will be called after dom has been updated
                document.getElementById("list-container").innerHTML = response.synonyms.length;
                popupState.enterFunction = changeFocus;
            }
        });  
    });
};

var changeFocus = function(direction){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        var sendingData = {
            sender: 'popup',
            command: 'shiftFocus',
            direction: direction
        };
        chrome.tabs.sendMessage(tabs[0].id, sendingData, function(response) {
            if(response && response.err){
                console.log(reponse.errMessage);
            }
        });  
    });
}


// Initially when dom has not been initialized for new search, initSearchonym will be called
var popupState = {
    enterFunction: initSearchonym,
    searchWord : '',
}

window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("search-bar").focus();
    document.getElementById("search-button").addEventListener("click", initSearchonym);
    document.getElementById("up").addEventListener("click", changeFocus('up'));
    document.getElementById("down").addEventListener("click", changeFocus('down'));
    document.getElementById("search-bar").addEventListener("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            if(popupState.enterFunction === initSearchonym){
                popupState.enterFunction();
            }else{
                popupState.enterFunction('down');
            }
        }else if (event.keyCode == 38) {
            changeFocus('up');
        }else if (event.keyCode == 40) {
            changeFocus('down');
        }

        if(document.getElementById("search-bar").value !== popupState.searchWord) {
            //If search data is changed then enterFunction is set back to initSearchonym to initialize new search
            popupState.enterFunction = initSearchonym;
        }
    });
});
