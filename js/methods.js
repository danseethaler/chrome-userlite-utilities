var methods = {
    getAppId: function(message, sender, sendResponse){

        var config = {
            location: location,
            appId: false,
        };

        frame = document;
        if (document.getElementById("mainframe")) {
            frame = document.getElementById("mainframe").contentDocument;
        }

        var metas = frame.getElementsByTagName('meta')

        config.hashNodes = Array.from(frame.getElementsByClassName('hashFrag')).map(function(item){
            return item.dataset.hashfragName
        });
        config.hashNodes.reverse();

        for (var i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute('name') == 'usl-app-id') {
                config.appId = metas[i].getAttribute('content');
                break;
            }
        }

        sendResponse(config);

    },
    reloadHfrag: function(message, sender, sendReponse){
        this.reloadHfragNode(message.node);
    },
    reloadHfragNode: function(node) {

        var frame = top.frames[1];
        if (!frame) frame = window;

        // Do a cached reload on the page if no hash is found
        // The window.location = window.location loads from cache
        if (!frame.location.hash && node == 0) return window.location = window.location;

        // Get the base keys from the hashFrag object
        var hashNodes = Array.from(frame.document.getElementsByClassName('hashFrag')).map(function(item){
            return item.dataset.hashfragName
        });

        // Reverse the nodes to match the node key because the Alt+1 targets
        // the top level node - so we need that to be the first in the array
        hashNodes.reverse();

        if (hashNodes[node]) {

            // Adding inline script to get access to native environment
            // hFrag object
            var script = document.createElement("script");

            script.textContent = "if(appLb.is_open) { appLb.reload(); } else { hFrag.click({'" + hashNodes[node] + "':{'rnd':'" + Math.floor(Math.random() * 9999) + "'}}, {'replace':true}); }";
            
            frame.document.body.appendChild(script);

        }

    },
    reloadHfragInterval: function(message, sender, sendReponse){

        chrome.storage.sync.get({
            refreshInterval: 5000
        }, items => {

            var intervalRate = parseInt(items.refreshInterval);
            if (intervalRate < 1000) {
                intervalRate = 1000;
            }

            var reloadId = setInterval(() => {
                this.reloadHfragNode(message.node);
            }, intervalRate);

            var frame = window.frames[1];
            if (!frame) frame = window;
            frame.document.addEventListener("click", function(){
                clearTimeout(reloadId);
            }.bind(this));

        });

    },
    reloadPageInterval: function(message, sender, sendReponse){
        console.log('reloading page in 5, 4, 3, 2, 1...');
        chrome.storage.sync.get({
            refreshInterval: 5000
        }, function(items) {

            var reloadId;

            var intervalRate = parseInt(items.refreshInterval);
            if (intervalRate < 1000) {
                intervalRate = 1000;
            }

            localStorage.setItem('usl_auto_reload', true);

            reloadId = setTimeout(function(){
                window.location = window.location;
            }.bind(this), intervalRate);

            window.document.addEventListener("click", function(){
                clearTimeout(reloadId);
                localStorage.setItem('usl_auto_reload', '');
            }.bind(this));

        });
    },
    collapseSidebar: function(message, sender, sendReponse){
        document.querySelector('#liteframe').style.width = '70px';
        document.querySelector('#liteframe').contentWindow.document.body.style.overflow = 'hidden';
        document.querySelector('#mainframe_out').style.left = '70px';
    },
    expandSidebar: function(message, sender, sendReponse){
        document.querySelector('#liteframe').style.width = '250px';
        document.querySelector('#liteframe').contentWindow.document.body.style.overflow = 'hidden';
        document.querySelector('#mainframe_out').style.left = '250px';
    },
    zoomSidebar: function(message, sender, sendReponse){
        document.querySelector('#liteframe').contentDocument.body.style.zoom = .87;
    },
    zoomOutSidebar: function(message, sender, sendReponse){
        document.querySelector('#liteframe').contentDocument.body.style.zoom = 1;
    },
    autofillForm: function(message, sender, sendReponse){

        if (document.getElementById("mainframe")) {
            var forms = document.getElementById("mainframe").contentDocument.getElementsByTagName('form');
        } else {
            var forms = document.getElementsByTagName('form');
        }

        for (var i = 0; i < forms.length; i++) {
            var formId = forms[i].getAttribute('id');
            util.formFields(formId);
        }

    },
};
