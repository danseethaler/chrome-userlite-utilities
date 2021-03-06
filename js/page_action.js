function reloadHashNode(e) {
    var node = e.target.dataset.hashKey;
    chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{message:"reload_hfrag_interval", node}, function(config){ });
    });
    window.close();
}

function reloadPage(e) {
    chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,{message:"reload_page_interval"}, function(config){ });
    });
    window.close();
}

chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{message:"getAppId"}, function(config){

        if (typeof config == 'object') {
            if (config.appId) {

                var url = tabs[0].url;
                config.hash = '';

                if (url.indexOf('#') >= 0) {
                    config.hash = url.substr(url.indexOf('#'));
                }

                var main = document.getElementById('main');
                var div = document.createElement('div');

                main.innerHTML = null;

                var hash = config.hash.replace('#', '');
                hash = hash.replace('!', '');

                var updateUrl;

                if (hash) { // If we have a hashfrag

                    hash = hash.split('||');

                    hash.reverse();

                    for (var i = 0; i < hash.length; i++) {

                        var hashNodes = hash[i].split(/\||(::)+/g);

                        if (hashNodes[0] && config.hashNodes) {
                            if (config.hashNodes.indexOf(hashNodes[0]) == -1) {
                                continue;
                            }
                        }

                        var path = '';
                        var file = '';

                        for (var n = 0; n < hashNodes.length; n++) {
                            if (hashNodes[n]) {
                                if (hashNodes[n].indexOf('n:') == 0) {
                                    path = hashNodes[n].substr(2);
                                }
                                if (hashNodes[n].indexOf('p:') == 0) {
                                    file = hashNodes[n].substr(2) + '.php';
                                }
                            }
                        }

                        var fullpath = path + '/' + file;

                        div.innerHTML = '<div><button name="hash_' + i + '" class="location-btn btn button-' + i + '" tabindex="' + (i + 1) + '">' + fullpath + '</button> <button name="reload_' + i + '" class="reload-btn btn btn-default" data-hash-key="' + i + '" style="color: #FFF" tabindex="' + ((hash.length * 2) + 2 - i) +'">&#x21ba;</button></div>';
                        // div.innerHTML = '<button name="hash_' + i + '" class="btn button-' + i + '">' + fullpath + '</button>';

                        // main.insertBefore(div.firstChild, main.firstChild);
                        main.appendChild(div.firstChild);

                        var config = {
                            appSide: 'front',
                            fullPath: fullpath,
                            appId: parseInt(config.appId),
                        };

                        addListener("button[name='hash_" + i + "']", JSON.stringify(config, null, 4));

                    }

                    var reloadButtons = document.getElementsByClassName('reload-btn');

                    for (var i = 0; i < reloadButtons.length; i++) {
                        reloadButtons[i].addEventListener('click', reloadHashNode);
                    }

                } else {

                    var i = 1;

                    // When no hash is found we direct the user to the pages folder in the front-end
                    div.innerHTML = '<div><button name="hash_' + i + '" class="btn button-' + i + '" style="width: calc(100% - 44px)" tabindex="' + i + '">Pages</button> <button name="reload_1" class="reload-btn btn btn-default" data-hash-key="1" style="color: #FFF" tabindex="10">&#x21ba;</button></div>';

                    main.appendChild(div.firstChild);

                    var config = {
                        appSide: 'front',
                        fullPath: 'pages',
                        appId: parseInt(config.appId),
                    };

                    document.querySelector('.reload-btn').addEventListener('click', () => {
                        reloadPage();
                    });

                    addListener("button[name='hash_" + i + "']", JSON.stringify(config, null, 4));

                }

                i++;

                // Add backend app link
                div.innerHTML = '<button name="hash_' + i + '" class="btn button-' + i + '" style="width: 100%" tabindex="' + (i + 1) + '">Backend</button>';
                main.appendChild(div.firstChild);

                var config = {
                    appSide: 'back',
                    appId: parseInt(config.appId),
                };

                addListener("button[name='hash_" + i + "']", JSON.stringify(config, null, 4));

                return;

            }
        }

    });
});

function sendToClipboard(stringToClipboard) {

    var sandbox = document.getElementById('sandbox');
    sandbox.style.display = "block";
    sandbox.value = stringToClipboard;
    sandbox.select();

    document.execCommand('copy');

    sandbox.value = '';
    sandbox.style.display = "none";

    window.close();

}

setTimeout(function(){

    var eventNodes = {
        collapse:"collapse_sidebar",
        expand:"expand_sidebar",
        autofill:"autofill_form",
        zoom_out:"zoom_out_sidebar",
        zoom:"zoom_sidebar",
    };

    for (var node in eventNodes) {
        if (eventNodes.hasOwnProperty(node)) {
            setupEvent(eventNodes, node);
        }
    }

}, 200);

// These next two functions are needed to detach the selector
// id from the loop so the information is correct after the callback
function addListener(selector, copyString) {
    document.querySelector(selector).addEventListener('click', () => {
        sendToClipboard(copyString)
    });
}

function setupEvent(eventNodes, node) {
    document.getElementById(node).addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            console.log('{message:eventNodes[node]}', {message:eventNodes[node]});
            chrome.tabs.sendMessage(tabs[0].id,{message:eventNodes[node]}, function(config){ });
        });
    })
}
