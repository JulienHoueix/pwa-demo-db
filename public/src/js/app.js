if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('[app.js] Service worker registered');
    });
}

var repoIssuesUrl = "https://api.github.com/repos/JulienHoueix/test-repo/issues";

function fetchUrl() {
  fetch(repoIssuesUrl).then(function (res) {
    // Success
    if (res.ok) {
      res.json().then(function (data) {
        clearData();
        storeDataInDatabase(data).then(function () {
          return getDataFromDatabase();
        }).then(function (data) {
          createTableWithData(data);
        });
      });
    } else {
      console.error("HTTP error", res.status);
      clearData();
      getDataFromDatabase().then(function (data) {
        createTableWithData(data);
      });
    }
  }, function (e) {
    // Error
    console.error("Fetch failed");
    clearData();
    getDataFromDatabase().then(function (data) {
      createTableWithData(data);
    });
  });
}

var dbPromise = idb.open('app-db', 1, function (upgradeDB) {
  console.log("[app.js] Database upgrade");
  if (!upgradeDB.objectStoreNames.contains('repo-issues')) {
    upgradeDB.createObjectStore('repo-issues', { keyPath: 'id' });
  }
});

function storeDataInDatabase(data) {
  return dbPromise.then(function (db) {
    var tx = db.transaction('repo-issues', 'readwrite');
    var store = tx.objectStore('repo-issues');
    store.clear();
    data.forEach(function (entry) {
      store.put(entry);
    });
    return tx.complete;
  });
}

function getDataFromDatabase() {
  return dbPromise.then(function (db) {
    var tx = db.transaction('repo-issues', 'readonly');
    var store = tx.objectStore('repo-issues');
    return store.getAll();
  })
}

function clearData() {
  var dataTable = document.getElementById('data-table');
  if (dataTable) {
    dataTable.remove();
  }
}

function createTableWithData(data) {
  var tableDiv = document.getElementById('data');
  var table = document.createElement('table');
  table.id = "data-table";
  table.classList.add('table');
  var tr = table.insertRow();
  tr.insertCell().appendChild(document.createTextNode("Id"));
  tr.insertCell().appendChild(document.createTextNode("Title"));
  tr.insertCell().appendChild(document.createTextNode("Comments"));
  tr.insertCell().appendChild(document.createTextNode("Created at"));
  tr.insertCell().appendChild(document.createTextNode("Updated at"));
  data.forEach(function (entry) {
    var tr = table.insertRow();
    tr.insertCell().appendChild(document.createTextNode(entry.id));
    tr.insertCell().appendChild(document.createTextNode(entry.title));
    tr.insertCell().appendChild(document.createTextNode(entry.comments));
    tr.insertCell().appendChild(document.createTextNode(entry.created_at));
    tr.insertCell().appendChild(document.createTextNode(entry.updated_at));
  });
  tableDiv.appendChild(table);
}
