chrome.commands.onCommand.addListener(function(command) {
    if (command.indexOf('reload-hfrag-level-') === 0) {
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){

            var node = parseInt(command.substr(19,1)) - 1;
            chrome.tabs.sendMessage(tabs[0].id,{message:"reload_hfrag", node}, function(config){

            })
        })
    }
    if (command === 'reload-dev-scripts') {
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"reload_dev_scripts"}, function(config){ })
        })
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
    if (request.action == 'error_trace') {
        chrome.storage.sync.get(null, function(items) {
            if (items.userId && items.passphrase) {
                $.ajax({
                    type: 'POST',
                    url: new URL('http://' + items.connectTo),
                    dataType: 'json',
                    data: JSON.stringify({
                        error: request,
                        user: items.userId,
                        passphrase: items.passphrase,
                    }, null, 4),
                    success: function(data){
                        console.log('data', data);
                    },
                    error: function(err){
                        console.log(err);
                    }
                });
            }
        });
    }
});
