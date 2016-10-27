
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

    var messageMethod = util.snakeToCamel(message.message);
    if (typeof methods[messageMethod] === "function") {
        return methods[messageMethod](message, sender, sendResponse);
    }

});

// Reload the page if the localStorage is set
if (localStorage.getItem('usl_auto_reload')) methods.reloadPageInterval();
