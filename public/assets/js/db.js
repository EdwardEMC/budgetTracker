let db; //initialize indexedDb variable

const request = indexedDB.open("budget", 1); //'open'/create a database

request.onupgradeneeded = function(evt) {
    const db = event.target.result;
    const pendingStore = db.createObjectStore("pending", {autoIncrement: true});
};

request.onsuccess = function(evt) {
    db = request.result;

    if(navigator.online) {
        checkDatabase();
    }
};

request.onerror = function(evt) {
    console.log(evt);
};

function saveRecord(record) {
    console.log(record);
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    const getAll = pendingStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const pendingStore = transaction.objectStore("pending");
                pendingStore.clear();
            })
        }
    }
}

window.addEventListener("online", checkDatabase);