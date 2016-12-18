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

    init: false,

    setupReloadOb: function(){

        // Add the main reload object to the native environment
        var extScriptText = `if (typeof chromeExtDevReload !== 'object') {

            var chromeExtDevReload = {
                section: '',
                type: '',
                ready: true,
                reload: function(){

                    if (!this.ready) return;
                    // If there's no section and it's not a modal then return
                    if (!this.section && ['modal', 'legModal'].indexOf(this.type) < 0) return;

                    switch (this.type) {
                        // Reload the hashFrag
                        case 'hFrag':

                        var reloadHfragOb = {};
                        reloadHfragOb[this.section] = {rnd:Math.floor(Math.random() * 9999)};
                        hFrag.click(reloadHfragOb, {'replace':true});

                        break;

                        // Reload open modal (React)
                        case 'modal':
                        // Reset the modal options after loading the scripts
                        // The modal options may be reset in the script loading
                        ui_modal_last_options = chromeExtDevReload.modalOptions;

                        ui_modal_reload();
                        break;

                        // Reload open legacy modal
                        case 'legModal':
                        appLb.reload();

                        break;
                        default:
                    }

                    // Reset the section
                    this.section = '';
                    this.type = '';

                }
            }
        }`;

        var frame = top.frames[1];
        if (!frame) frame = window;

        // Adding inline script to get access to native environment
        var script = document.createElement("script");
        script.textContent = extScriptText;

        script.id = 'extScriptText';

        frame.document.body.appendChild(script);
        script.parentNode.removeChild(script);

        methods.init = true;

    },

    reloadDevScripts: function(){

        if (!methods.init) methods.setupReloadOb();

        var scriptText = `// Check for any dev scripts to load
        if (typeof usl_dev_lib_scripts === 'object') {

            // Remove the non dev scripts
            var loadUrls = usl_dev_lib_scripts.filter(function(item){
                return item.dev;
                // Return promises for all the ajax requests
            }).map(function(item){
                if (item.dev) return $.getScript(item.url);
                return false;
            });

            // Check if we're waiting for promises to be fulfilled
            if (loadUrls.length) {
                if (typeof ui_modal_last_options === 'object') {
                    chromeExtDevReload.modalOptions = ui_modal_last_options;
                    chromeExtDevReload.type = 'modal';
                }
                chromeExtDevReload.ready = false;
                Promise.all(loadUrls).then(function(){
                    chromeExtDevReload.ready = true;
                    chromeExtDevReload.reload();
                });

                // Otherwise run the reload immediately
            } else {
                chromeExtDevReload.reload();
            }

        } else {
            // Otherwise run the reload immediately
            chromeExtDevReload.reload();
        }`;

        var frame = top.frames[1];
        if (!frame) frame = window;

        // Adding inline script to get access to native environment
        var script = document.createElement("script");
        script.textContent = scriptText;

        script.id = 'reloadDevScripts';

        frame.document.body.appendChild(script);
        return script.parentNode.removeChild(script);

    },

    reloadHfragNode: function(node) {

        if (!methods.init) methods.setupReloadOb();

        var frame = top.frames[1];
        if (!frame) frame = window;

        // Do a cached reload on the page if no hash is found
        // The window.location = window.location loads from cache
        if (!frame.location.hash && node == 0) {

            // Adding inline script to get access to native environment
            var script = document.createElement("script");
            script.id = 'reloadHfragNode';

            // appLb is used to control the legacy modal state and is not
            // available in the new `Isolated` apps using react
            script.textContent = "if(typeof appLb === 'object' && appLb.is_open) { appLb.reload(); } else { window.location = window.location }";
            frame.document.body.appendChild(script);
            return script.parentNode.removeChild(script);

        }

        // Get the base keys from the hashFrag object
        var hashNodes = Array.from(frame.document.getElementsByClassName('hashFrag')).map(function(item){
            return item.dataset.hashfragName;
        });

        // Reverse the nodes to match the node key because the Alt+1 targets
        // the top level node - so we need that to be the first in the array
        hashNodes.reverse();

        if (hashNodes[node]) {

            var scriptText = `
                // Setup the state before we load scripts which may change the state
                chromeExtDevReload.type = 'hFrag';
                if (typeof ui_modal_last_options === 'object') {
                    chromeExtDevReload.type = 'modal';
                } else if (typeof appLb === 'object' && appLb.is_open) {
                    chromeExtDevReload.type = 'legModal';
                }

                console.log('chromeExtDevReload.type', chromeExtDevReload.type);

                chromeExtDevReload.section = '` + hashNodes[node] + `';
                chromeExtDevReload.reload();`;

            // Adding inline script to get access to native environment
            var script = document.createElement("script");
            script.textContent = scriptText;

            script.id = 'reloadHfragNode';

            frame.document.body.appendChild(script);
            return script.parentNode.removeChild(script);

        }

    },
    reloadHfragInterval: function(message, sender, sendReponse){

        console.log('reloading hFrag in 5, 4, 3, 2, 1...');

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
