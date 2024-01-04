var conn = null;
var sessionId = null;
var instanceUrl = null;
let text = "<table> <tr> <th>Package Name</th> <th>NameSpace Prefix</th>   <th>Version Number</th> </tr>"

try {
    console.log("Inside Popup JS");
    getcookie();
  } catch (error) {}

  let excluderegex =
    /(login|help|developer|success|appexchange|partners|test).salesforce.com/;
  function getcookie() {

    chrome.tabs.query({ currentWindow: true, active: true }, (resp) => {
      let tab = resp[0];
      
      if(tab.url && tab.url.includes('.vf.force.com')){
        let div = document.getElementById('txt');
        div.innerText = 'Please move to a Record page or Home page';
      }

      if(tab.url && (tab.url.includes('.lightning.force.com') || tab.url.includes('.salesforce.com'))){
         
        let url = tab.url.replace('https://','').split('/')[0]
        url = url.replace('.lightning.force.com','.my.salesforce.com')
        instanceUrl = 'https://' + url
        console.log(instanceUrl);
        let port = chrome.runtime.connect({ name: "Get Session" });
        port.postMessage( instanceUrl.replace('https://','') );
        port.onMessage.addListener(function(sessionId) {
        console.log(sessionId);
        conn = new jsforce.Connection({
              serverUrl: instanceUrl,
              instanceUrl: instanceUrl,
              sessionId: sessionId,
              version: '50.0',
          });//jsforce

          console.log(conn);
          //window.close();
          
          console.log("Removing content inside 'txt' id element");
              let div = document.getElementById('txt');
              if (div) {
                div.parentNode.removeChild(div);
              }
              // Unhide the View Packages Button on Popup HTML
              let btn = document.getElementById('btn');
              btn.setAttribute("style", "visibility: visible");

          fetchPackageFromOrg();
        })
      }
    })
  }
/*
      if(tab.url.includes(".sandbox.")){

        if(tab.url.includes(".force.com")){
          instanceUrl = tab.url.split('.')[0] + "." + tab.url.split('.')[1] + '.lightning.force.com';
        }
        else{
          instanceUrl = tab.url.split('.')[0] + "." + tab.url.split('.')[1] + '.my.salesforce.com';
        }
      }
      else if (tab.url.includes(".force.com")){
        instanceUrl = tab.url.split('.')[0] + '.lightning.force.com';
      }
      else{
        instanceUrl = tab.url.split('.')[0] + '.my.salesforce.com';
      }

      console.log(instanceUrl);
      if (
        (tab.url.includes(".force.com") ||
        tab.url.includes(".salesforce.com") && !tab.url.match(excluderegex))
      )
      
        chrome.cookies.get({ url: tab.url, name: "sid" }, (resp) => {
          if (resp) {
            console.log(resp);

            // Lightning - "00D8c000005Jno9!ARQAQOB5_2kBITWmKZukjbaI1USFQylUjb429Bgt8gkf2dURS7QcDLYvgPop.8PEK0lxeIXrtYmPqB2a5jdcLCFpC4jfGJh3"
            // Classic - "00D8c000005Jno9!ARQAQGlWTaHsR9ROjwlMUQ9PpDorGAqJSU4i5YAtGly1E_13N8t40tbNsQKsEvoubCNxVvp.Kz83r3.gQfEWMU60A10SiHjI"
            //"00D530000004df5!AR4AQNGFxRls15VTsjD5GBf9tRmIfy7AVw9HWz3qv5_u.GCaU3Umivt5FSYazeaNYSmUnrrY6soAWdqm1oO1H_558BriOX23"
            chrome.runtime.sendMessage({ cookie: resp }, () => {
              sessionId = resp.value;
              // Remove the text from Popup HTML which asks to be in a logged in SFDC Tab
              //sessionId = "00D8c000005Jno9!ARQAQGlWTaHsR9ROjwlMUQ9PpDorGAqJSU4i5YAtGly1E_13N8t40tbNsQKsEvoubCNxVvp.Kz83r3.gQfEWMU60A10SiHjI";
              console.log("Removing content inside 'txt' id element");
              let div = document.getElementById('txt');
              if (div) {
                div.parentNode.removeChild(div);
              }
              // Unhide the View Packages Button on Popup HTML
              let btn = document.getElementById('btn');
              btn.setAttribute("style", "visibility: visible");

              conn = new jsforce.Connection({
                serverUrl: instanceUrl,
                instanceUrl: instanceUrl,
                sessionId: sessionId,
                version: '50.0',

            });
            console.log(conn);
              //window.close();
            fetchPackageFromOrg();
            });
          }
        });
    });
  }
*/
function fetchPackageFromOrg(){
  console.log("Inside Fetch Package Funtion")
  conn.tooling.query("select id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, SubscriberPackageVersion.PatchVersion from InstalledSubscriberPackage", function(err, result) {
    if (err) { return console.error(err); }
    console.log(result);
    for (var i=0; i < result.records.length; i++) {
    var PackageRow = result.records[i].SubscriberPackage.Name + "\t"+ result.records[i].SubscriberPackage.NamespacePrefix + "\t" + result.records[i].SubscriberPackageVersion.Name
    console.log(PackageRow);

    if(result.records[i].SubscriberPackageVersion.PatchVersion != '0'){
    var versionnumber = result.records[i].SubscriberPackageVersion.MajorVersion + "." + result.records[i].SubscriberPackageVersion.MinorVersion + "." + result.records[i].SubscriberPackageVersion.PatchVersion;
    }
    else{
    var versionnumber = result.records[i].SubscriberPackageVersion.MajorVersion + "." + result.records[i].SubscriberPackageVersion.MinorVersion;
    }

    let check = result.records[i].SubscriberPackage.NamespacePrefix;
    if(check != null)
        {
           // var check1 = check.includes('Apttus');
            // var check2 = check.includes("Conga");
            //  var check3 = check.includes("APTX")

            if( check.includes('Apttus') || check.includes("cnga") || check.includes("Conga") || check.includes("APTX") || check.includes("CRMC_PP") || check.includes("APXT") || check.includes("FSTR")){
              //console.log(toolingAPIResponse.records[i].SubscriberPackage.Name);
              text += "<tr><td>" + result.records[i].SubscriberPackage.Name + "</td><td>" + result.records[i].SubscriberPackage.NamespacePrefix + "</td><td>" + versionnumber + "</td></tr>";
            }
          }    
        }
        text += "</table>";
        console.log(text);
        sendTableToBackground(text);
      });
    
  }

function sendTableToBackground(text){

  document.getElementById("btn").addEventListener("click", function() {
    
    let searchBar = document.getElementById('myInput');
    searchBar.setAttribute("style", "visibility: visible");

    var tableContainer = document.getElementById("message1");
    console.log(tableContainer)
          if (tableContainer) {
              tableContainer.innerHTML = text;
          }

    /*
    window.open(
      "packages.html", "_blank");
    chrome.runtime.sendMessage({ tableData: text });

    chrome.tabs.create({ url: chrome.runtime.getURL("package.html") });
    
    var port = chrome.runtime.connect({ name: "popupToGetPackages" });
    var dataToSend = {
        variable1: text,
      };
      console.log(dataToSend);
      port.postMessage(dataToSend); 
    });
    */
})
}

document.addEventListener("DOMContentLoaded", function () {

  var searchInput = document.getElementById("myInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", myFunction);
  }

  function myFunction() {
    // Declare variables
    console.log("in search function");
    var input, filter, table, tr, td, td1, i, txtValue1, txtValue2;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("message1");
    tr = table.getElementsByTagName("tr");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
      console.log("Started");
      td = tr[i].getElementsByTagName("td")[0];
      td1 = tr[i].getElementsByTagName("td")[1];
      if (td || td1) {
      txtValue1 = td.textContent || td.innerText;
      txtValue2 = td1.textContent || td1.innerText;
      if (txtValue1.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
})

/*
document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("btn").addEventListener("click", function() {
    window.open(
      "packages.html", "_blank");
    });

  openNewTabButton.addEventListener("click", function () {
      // Define your table data
      var table = "<table><tr><td>Row 1, Column 1</td><td>Row 1, Column 2</td></tr></table>";

      // Send the table data to the background.js
      chrome.runtime.sendMessage({ tableData: table });

      // Open a new tab with package.html
      chrome.tabs.create({ url: chrome.runtime.getURL("package.html") });
  });
});

*/