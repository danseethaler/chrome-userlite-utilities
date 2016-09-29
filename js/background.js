chrome.commands.onCommand.addListener(function(command) {
    if (command.indexOf('reload-hfrag-level-') === 0) {
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){

            var node = parseInt(command.substr(19,1)) - 1;
            chrome.tabs.sendMessage(tabs[0].id,{message:"reload_hfrag", node}, function(config){

            })
        })
    }
});
