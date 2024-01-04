console.log("Inside Background JS File");

// Listening to messages page
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(domainUrl) {
      console.log(domainUrl);
      if(domainUrl !== "getSession"){
          chrome.cookies.getAll({ 'domain' : domainUrl }, function(cookie){ 
              cookie.forEach(obj => {
                  if(obj.name == "sid"){
                      console.log(obj.value);
                      port.postMessage(obj.value);
                  }
              });
          });
      }
  });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.message === "getSession") {
  chrome.cookies.get({url: request.sfHost, name: "sid", storeId: sender.tab.cookieStoreId}, sessionCookie => {
    if (!sessionCookie) {
      sendResponse(null);
      return;
    }
    let session = {key: sessionCookie.value, hostname: sessionCookie.domain};
    sendResponse(session);
  });
  return true; // Tell Chrome that we want to call sendResponse asynchronously.
}
return false;
});

/*
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.tableData) {
      console.log(message.tableData)
      // Pass the table data to package.js
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var activeTabId = tabs[0].id;
          chrome.scripting.executeScript({
              target: { tabId: activeTabId },
              function: injectTable,
              args: [message.tableData],
          });
      });
  }
});

function injectTable(tableData) {
  var tableContainer = document.getElementById("message1");
  console.log(tableContainer);
  if (tableContainer) {
      tableContainer.innerHTML = tableData;
  }
}



chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
        console.log(response);
    });
  }); 

let variable1;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "popupToGetPackages") {
    // This port is connected from popup.js to getPackages.js
    port.onMessage.addListener(function(message) {
      // Handle the data received from popup.js
      variable1 = message.variable1;
      console.log("Received data in getCongaPackages.js:", message);

      setTable(variable1);
    });
  }
});

function setTable(variable1){
  console.log(variable1);

  var tableContainer = document.getElementById("tableclass");
  console.log(tableContainer);
  if (tableContainer) {
  tableContainer.innerHTML = variable1;
  }
}

*/
