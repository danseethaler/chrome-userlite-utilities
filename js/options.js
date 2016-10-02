function save_options() {
    var refreshInterval = document.getElementById('refresh-interval').value;
    chrome.storage.sync.set({
        refreshInterval
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
    chrome.storage.sync.get({
        refreshInterval: 5000
    }, function(items) {
        document.getElementById('refresh-interval').value = items.refreshInterval;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
save_options);
