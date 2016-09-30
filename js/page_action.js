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

                        div.innerHTML = '<div><button name="hash_' + i + '" class="location-btn btn button-' + i + '" tabindex="' + (i + 1) + '">' + fullpath + '</button> <button name="reload_' + i + '" class="reload-btn btn btn-default" data-hash-key="' + hashNodes[0] + '" style="color: #FFF" tabindex="' + ((hash.length * 2) + 2 - i) +'">&#x21ba;</button></div>';
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
                        reloadButtons[i].addEventListener('click', function(e){

                            var updateUrl;

                            var url = tabs[0].url;
                            var hash = url.substr(url.indexOf('#'));
                            hash = hash.replace('#', '');
                            hash = hash.replace('!', '');
                            var hashPieces = hash.split('||');

                            for (var k = 0; k < hashPieces.length; k++) {
                                var keys = hashPieces[k].split('::');
                                if (keys[0] == e.target.dataset.hashKey) {

                                    if (hashPieces[k].search(/(\|rnd:)+\d/) >= 0) {
                                        newHash = hashPieces[k].replace(/(\|rnd:)+\d/, '|rnd:' + Math.floor(Math.random() * 9999));
                                        updateUrl = url.replace(hashPieces[k], newHash);
                                    } else {
                                        updateUrl = url.replace(hashPieces[k], hashPieces[k] + '|rnd:' + Math.floor(Math.random() * 9999));
                                    }

                                }

                            }

                            if (updateUrl) {
                                chrome.tabs.update(tabs[0].id, {url: updateUrl});
                            }

                        })
                    }

                } else {

                    // When no hash is found we direct the user to the pages folder in the front-end
                    div.innerHTML = '<button name="hash_0" class="btn button-0" style="width: 100%">Pages</button>';
                    main.appendChild(div.firstChild);

                    var config = {
                        appSide: 'front',
                        fullPath: 'pages',
                        appId: parseInt(config.appId),
                    };

                    addListener("button[name='hash_0']", JSON.stringify(config, null, 4));

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

// This function is mostly to scope the copy strings correctly
function addListener(selector, copyString) {
    document.querySelector(selector).addEventListener('click', () => {sendToClipboard(copyString)});
}

function sendToClipboard(stringToClipboard) {

    var sandbox = document.getElementById('sandbox');
    sandbox.style.display = "block";
    sandbox.value = stringToClipboard;
    sandbox.select();

    document.execCommand('copy')

    sandbox.value = '';
    sandbox.style.display = "none";

    window.close();

}

setTimeout(function(){
    document.getElementById('collapse').addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"collapse_sidebar"}, function(config){

            });
        });
    })
    document.getElementById('expand').addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"expand_sidebar"}, function(config){

            });
        });
    })
    document.getElementById('zoom').addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"zoom_sidebar"}, function(config){

            });
        });
    })
    document.getElementById('zoom_out').addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"zoom_out_sidebar"}, function(config){

            });
        });
    })
    document.getElementById('autofill').addEventListener('click', function(){
        chrome.tabs.query({active:true,currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{message:"autofill_form"}, function(config){

            });
        });
    })
}, 200)