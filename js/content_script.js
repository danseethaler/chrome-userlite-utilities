chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if (message.message == 'getAppId') {

        var config = {
            location: location,
            appId: false,
        };

        if (document.getElementById("mainframe")) {
            var uslIframe = document.getElementById("mainframe").contentDocument;
            var metas = uslIframe.getElementsByTagName('meta')

            var domHashfrags = uslIframe.getElementsByClassName('hashFrag');

            config.hashNodes = [];
            for (var i = 0; i < domHashfrags.length; i++) {
                config.hashNodes.push(domHashfrags[i].dataset.hashfragName);
            }
            config.hashNodes.reverse();

        } else {
            var metas = document.getElementsByTagName('meta');

            var domHashfrags = document.getElementsByClassName('hashFrag');

            config.hashNodes = [];
            for (var i = 0; i < domHashfrags.length; i++) {
                config.hashNodes.push(domHashfrags[i].dataset.hashfragName);
            }
            config.hashNodes.reverse();

        }

        for (var i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute('name') == 'usl-app-id') {
                config.appId = metas[i].getAttribute('content');
                break;
            }
        }

        sendResponse(config);

    }

    if (message.message == 'reload_hfrag') {
        reloadHfragNode(message.node);
    }

    if (message.message == 'reload_hfrag_interval') {

        chrome.storage.sync.get({
            refreshInterval: 5000
        }, function(items) {

            var intervalRate = parseInt(items.refreshInterval);
            if (intervalRate < 1000) {
                intervalRate = 1000;
            }

            var reloadId = setInterval(function(){
                reloadHfragNode(message.node);
            }.bind(this), intervalRate);

            var frame = window.frames[1];
            if (!frame) frame = window;
            frame.document.addEventListener("click", function(){
                clearTimeout(reloadId);
            }.bind(this));

        });

    }


    if (message.message == 'collapse_sidebar') {
        document.querySelector('#liteframe').style.width = '70px';
        document.querySelector('#liteframe').contentWindow.document.body.style.overflow = 'hidden';
        document.querySelector('#mainframe_out').style.left = '70px';
    }

    if (message.message == 'expand_sidebar') {
        document.querySelector('#liteframe').style.width = '250px';
        document.querySelector('#liteframe').contentWindow.document.body.style.overflow = 'hidden';
        document.querySelector('#mainframe_out').style.left = '250px';
    }

    if (message.message == 'zoom_sidebar') {
        document.querySelector('#liteframe').contentDocument.body.style.zoom = .87;
    }

    if (message.message == 'zoom_out_sidebar') {
        document.querySelector('#liteframe').contentDocument.body.style.zoom = 1;
    }

    if (message.message == 'autofill_form') {
        var util = {

            formFields: function(formID) {

                if (!formID) {
                    return 'Please add an ID to the form before auto-completing.';
                }

                var fields = [];

                $('#' + formID).find('input, textarea, select').each(function() {
                    fields.push({
                        label: util.getLabel(this),
                        name: this.name,
                        id: this.id,
                        placeholder: this.placeholder,
                        tagName: this.tagName
                    });
                });

                util.autofill(fields);

            },

            getLabel: function(node) {

                if (node.id && $('label[for="' + node.id + '"]').html()) {
                    return $('label[for="' + node.id + '"]').html();
                }

                if ($(node).siblings('label').html()) {
                    return $(node).siblings('label').html();
                }

                if ($(node).parent().siblings('label').html()) {
                    return $(node).parent().siblings('label').html();
                }

                if ($(node).parent().parent().siblings('label').html()) {
                    return $(node).parent().siblings('label').html();
                }

            },

            autofill: function(fields) {

                var gender;

                if (!gender) {
                    gender = 'female';
                }

                $.ajax({
                    url: 'https://randomuser.me/api/?nat=us&gender=' + gender,
                    dataType: 'json',
                    success: function(data) {

                        // Extract the user data
                        util.data = data.results[0];

                        // Format the email to cnxmsg format
                        util.data.email = util.data.email.substr(0, util.data.email.indexOf('@') + 1);
                        util.data.email = util.data.email.replace('.', '');
                        util.data.email = util.data.email + 'cnxmsg.com';

                        for (var field in fields) {
                            if (fields.hasOwnProperty(field)) {

                                var selector = '';

                                if (fields[field].id) {
                                    selector = '#' + fields[field].id;
                                } else if (fields[field].name) {
                                    selector = '[name="' + fields[field].name + '"]';
                                }

                                if (selector && !$(selector).val()) {

                                    if (fields[field].tagName == 'SELECT') {

                                        var options = [];

                                        $(selector + ' option').each(function() {
                                            options.push($(this).val());
                                        });

                                        var randOpt = '';

                                        while (randOpt === '' || randOpt === 0) {
                                            randOpt = options[Math.floor(Math.random() * options.length)];
                                        }


                                        $(selector + ' option').filter(function() {
                                            //may want to use $.trim in here
                                            return $(this).val() == randOpt;
                                        }).prop('selected', true);

                                    } else {

                                        var value = '';
                                        value = util.getFieldValue(fields[field]);

                                        if (value) {
                                            $(selector).val(value);
                                            $(selector).keyup();
                                        }

                                    }

                                }

                            }
                        }
                    }
                });
            },

            randomDate: function() {
                var today = new Date();
                var randDate = new Date(today);
                randDate.setDate(today.getDate() + Math.floor(Math.random() * 100));

                var day = randDate.getDate();
                var month = randDate.getMonth() + 1;
                var year = randDate.getFullYear();

                formattedDate = month + '/' + day + '/' + year;

                return formattedDate;

            },

            getFieldValue: function(field) {

                var check = [{
                    'title': 'first',
                    value: util.capFirst(util.data.name.first)
                }, {
                    'title': 'last',
                    value: util.capFirst(util.data.name.last)
                }, {
                    'title': 'name',
                    value: util.capFirst(util.data.name.first) + ' ' + util.capFirst(util.data.name.last)
                }, {
                    'title': 'email',
                    value: util.data.email
                }, {
                    'title': 'phone',
                    value: util.data.phone.replace(')', '').replace('(', '')
                }, {
                    'title': 'mobile',
                    value: util.data.phone.replace(')', '').replace('(', '')
                }, {
                    'title': 'address',
                    value: util.data.location.street
                }, {
                    'title': 'city',
                    value: util.data.location.city
                }, {
                    'title': 'state',
                    value: util.data.location.state
                }, {
                    'title': 'zip',
                    value: util.data.location.postcode
                }, {
                    'title': 'password',
                    value: util.capFirst(util.data.name.first) + new Date().getFullYear()
                }, {
                    'title': 'credit card',
                    value: 4111111111111111
                }, {
                    'title': 'cv2',
                    value: this.between(100, 999)
                }, {
                    'title': 'org',
                    value: util.capFirst(util.data.location.city)
                }, {
                    'title': 'company',
                    value: util.capFirst(util.data.location.city)
                }, {
                    'title': 'date',
                    value: util.randomDate()
                }, {
                    'title': 'comment',
                    value: 'Dev - Testing out the comments.'
                }];

                for (var attr in check) {
                    if (check.hasOwnProperty(attr)) {

                        var value = '';

                        if (field.id.toLowerCase().indexOf(check[attr].title) >= 0) {
                            value = check[attr].value;
                        } else if (field.name.toLowerCase().indexOf(check[attr].title) >= 0) {
                            value = check[attr].value;
                        } else if (field.placeholder && field.placeholder.toLowerCase().indexOf(check[attr].title) >= 0) {
                            value = check[attr].value;
                        } else if (field.label && field.label.toLowerCase().indexOf(check[attr].title) >= 0) {
                            value = check[attr].value;
                        }

                        if (value) {
                            return value;
                        }

                    }
                }

            },

            getInitials: function(name) {

                if (name) {
                    var initials = {
                        name: name.substr(0, 1)
                    };

                    initials.name += name.substr(name.indexOf(' ') + 1, 1);

                    initials.hex = $scope.hexEncode(initials.name);

                    return initials;
                }
            },

            capFirst: function(field) {
                return field.charAt(0).toUpperCase() + field.slice(1);
            },

            between: function(low, high) {
                return Math.floor(Math.random() * ((high - low) + 1) + low);
            }

        };


        if (document.getElementById("mainframe")) {
            var forms = document.getElementById("mainframe").contentDocument.getElementsByTagName('form');
        } else {
            var forms = document.getElementsByTagName('form');
        }


        for (var i = 0; i < forms.length; i++) {

            var formId = forms[i].getAttribute('id');

            util.formFields(formId);

        }
    }
});

function reloadHfragNode(node) {

    var frame = top.frames[1];
    if (!frame) frame = window;

    var updateHash;
    var hash = frame.location.hash;
    hash = hash.replace('#!', '');

    // Do a cache reload on the page if no hash is found
    if (!hash && node == 0) {
        return window.location = window.location;
    }

    var domHashfrags = frame.document.getElementsByClassName('hashFrag');

    var hashNodes = [];

    for (var i = 0; i < domHashfrags.length; i++) {
        hashNodes.push(domHashfrags[i].dataset.hashfragName);
    }

    hashNodes.reverse();

    var hashPieces = hash.split('||');
    if (hashNodes[node]) {
        for (var i = 0; i < hashPieces.length; i++) {
            if (hashPieces[i].indexOf(hashNodes[node]) === 0) {

                if (hashPieces[i].search(/\|rnd:\d+/) >= 0) {
                    newHash = hashPieces[i].replace(/\|rnd:\d+/, '|rnd:' + Math.floor(Math.random() * 9999));
                    updateHash = hash.replace(hashPieces[i], newHash);
                } else {
                    updateHash = hash.replace(hashPieces[i], hashPieces[i] + '|rnd:' + Math.floor(Math.random() * 9999));
                }
            }
        }
    }

    if (updateHash) {
        frame.location.hash = '#!' + updateHash;
    }

}
