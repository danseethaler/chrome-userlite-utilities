function save_options() {
    var refreshInterval = document.getElementById('refresh-interval').value;
    var userId = document.getElementById('user-id').value;
    var passphrase = document.getElementById('passphrase').value;
    var connectTo = document.getElementById('connectTo').value;
    chrome.storage.sync.set({
        refreshInterval,
        userId,
        passphrase,
        connectTo
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value refreshInterval: 100
    chrome.storage.sync.get(null, function(items) {
        document.getElementById('refresh-interval').value = items.refreshInterval||5000;
        document.getElementById('user-id').value = items.userId||'';
        document.getElementById('passphrase').value = items.passphrase||'';
        document.getElementById('connectTo').value = items.connectTo||'';
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
save_options);
