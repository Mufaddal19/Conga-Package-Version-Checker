import { CaseDetails, Container, TriggersTableColumnObjects, SubscriberOrgOpenLink } from "./constants.js";

var conn = null;
var sessionId = null;
var instanceUrl = null;
let text =
  "<table> <tr> <th>Package Name</th> <th>NameSpace Prefix</th>   <th>Version Number</th> </tr>";
var activeContainer = null;
var caseId = null;
let caseDetails = null;

try {
  console.log("Inside Popup JS");
  getcookie();
} catch (error) { }

let excluderegex =
  /(login|help|developer|success|appexchange|partners|test).salesforce.com/;
function getcookie() {
  if (window.location.pathname == '/popup.html' && window.location.search.includes('host')) {
    let host = new URLSearchParams(window.location.search).get('host');
    instanceUrl = host;
  }
  chrome.tabs.query({ currentWindow: true, active: true }, (resp) => {
    let tab = resp[0];

    if (tab.url && tab.url.includes(".vf.force.com")) {
      let div = document.getElementById("txt");
      div.innerText = "Please move to a Record page or Home page";
    }

    if (
      tab.url &&
      (tab.url.includes(".lightning.force.com") ||
        tab.url.includes(".salesforce.com")) ||
      instanceUrl
    ) {
      if (!instanceUrl) {
        let url = tab.url.replace("https://", "").split("/")[0];
        url = url.replace(".lightning.force.com", ".my.salesforce.com");
        instanceUrl = "https://" + url;
      }
      console.log(instanceUrl);
      let port = chrome.runtime.connect({ name: "Get Session" });
      port.postMessage(instanceUrl.replace("https://", ""));
      port.onMessage.addListener(function (sessionId) {
        console.log(sessionId);
        conn = new jsforce.Connection({
          serverUrl: instanceUrl,
          instanceUrl: instanceUrl,
          sessionId: sessionId,
          version: "50.0",
        }); //jsforce

        console.log("successfully connected to JSForce" + conn);
        //window.close();

        console.log("Removing content inside 'txt' id element");
        let div = document.getElementById("txt");
        if (div) {
          div.parentNode.removeChild(div);
        }

        RenderUI();
        fetchOrgId();
        fetchPackageFromOrg();
        fetchTriggersOnObjectFromOrg();
        fetchCallbackClasses();
        fetchCaseDetails();
      })
    }
  });
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

function RenderUI() {
  let SubscriberOrgBtn = document.getElementById("SubscriberOrgBtn");
  SubscriberOrgBtn.style.visibility = "visible";
  SubscriberOrgBtn.addEventListener("click", () => ToggleActiveContainer(Container.SubscriberOrg));

  let PackagesBtn = document.getElementById("PackagesBtn");
  PackagesBtn.style.visibility = "visible";
  PackagesBtn.addEventListener("click", () => ToggleActiveContainer(Container.Packages));

  let TriggersButton = document.getElementById("TriggersBtn");
  TriggersButton.style.visibility = "visible";
  TriggersButton.addEventListener("click", ToggleTriggerContainer);

  let CallbacksButton = document.getElementById("CallbacksBtn");
  CallbacksButton.style.visibility = "visible";
  CallbacksButton.addEventListener("click", () => ToggleActiveContainer(Container.Callbacks));

  let OrgIdText = document.getElementById("OrgId");
  OrgIdText.style.visibility = "visible";

  let creditText = document.getElementById("Credits");
  creditText.style.visibility = "visible";
}

function fetchOrgId() {
  console.log("Inside Fetch Org ID Funtion");
  conn.query(
    "select Id, PrimaryContact,TrialExpirationDate, OrganizationType, InstanceName, IsSandbox from Organization",
    function (err, result) {
      if (err) {
        return console.error(err);
      }
      console.log(result);
      console.log("Got Org Details");
      let orgId = result.records[0].Id.slice(0, 15);
      document.getElementById("OrgIdValue").innerText = orgId;
    })
}


function fetchPackageFromOrg() {
  console.log("Inside Fetch Package Funtion");
  conn.tooling.query(
    "select id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, SubscriberPackageVersion.PatchVersion from InstalledSubscriberPackage",
    function (err, result) {
      if (err) {
        return console.error(err);
      }
      console.log(result);
      for (var i = 0; i < result.records.length; i++) {
        let subscriberPackage = result.records[i].SubscriberPackage;
        let record = result.records[i];
        var PackageRow =
          subscriberPackage.Name + "\t" +
          subscriberPackage.NamespacePrefix + "\t" +
          record.SubscriberPackageVersion.Name;
        console.log(PackageRow);

        let packageVersion = result.records[i].SubscriberPackageVersion;
        if (packageVersion.PatchVersion != "0") {
          var versionnumber =
            packageVersion.MajorVersion + "." +
            packageVersion.MinorVersion + "." +
            packageVersion.PatchVersion;
        } else {
          var versionnumber =
            packageVersion.MajorVersion + "." +
            packageVersion.MinorVersion;
        }

        let check = subscriberPackage.NamespacePrefix;
        if (check != null) {
          // var check1 = check.includes('Apttus');
          // var check2 = check.includes("Conga");
          //  var check3 = check.includes("APTX")

          if (
            check.includes("Apttus") ||
            check.includes("cnga") ||
            check.includes("Conga") ||
            check.includes("APTX") ||
            check.includes("CRMC_PP") ||
            check.includes("APXT") ||
            check.includes("FSTR")
          ) {
            //console.log(toolingAPIResponse.records[i].SubscriberPackage.Name);
            text +=
              "<tr><td>" +
              subscriberPackage.Name +
              "</td><td>" +
              subscriberPackage.NamespacePrefix +
              "</td><td>" +
              versionnumber +
              "</td></tr>";
          }
        }
      }
      text += "</table>";
      console.log(text);
      // sendTableToBackground();
      var tableContainer = document.getElementById("message1");
      console.log(tableContainer);
      if (tableContainer) {
        tableContainer.innerHTML = text;
      }
    }
  );
}

function fetchTriggersOnObjectFromOrg() {
  // console.log("Ayush Edit starts");
  conn.tooling.query(
    `SELECT Id, Name, TableEnumOrId, ApiVersion, Status
    FROM ApexTrigger
    WHERE TableEnumOrId IN (
      'Account',
      'Opportunity',
      'Apttus_Proposal__Proposal__c',
      'Apttus_Config2__ProductConfiguration__c',
      'Apttus_Config2__LineItem__c',
      'Apttus_Proposal__Proposal_Line_Item__c',
      'Apttus_Config2__Order__c',
      'Apttus_Config2__OrderLineItem__c',
      'Apttus_Config2__SummaryGroup__c',
      'Apttus__APTS_Agreement__c',
      'Apttus__AgreementLineItem__c',
      'Apttus__DocumentVersion__c',
      'Apttus__DocumentVersionDetail__c',
      'Apttus__APTS_Template__c',
      'Apttus__CycleTimeGroupData__c',
      'Apttus_Approval__Approval_Request__c'
    )
    AND NamespacePrefix = null`,
    function (err, result) {
      if (err) console.log("error in Ayush Edit: " + err);
      // console.log("Success in Ayush Edit: " + result);
      console.log(result);
      renderTriggersTable(result.records);
    }
  );
}

function renderTriggersTable(data) {
  console.log('Inside Render Triggers Table function');
  const keys = ['Name', 'TableEnumOrId', 'ApiVersion', 'Status']; // Selected keys
  let table = document.getElementById('triggersTable');
  let header = table.createTHead().insertRow();
  header.insertCell().outerHTML = '<th>Name</th>';
  header.insertCell().outerHTML = '<th>Object</th>';
  header.insertCell().outerHTML = '<th>API Version</th>';
  header.insertCell().outerHTML = '<th>Status</th>';
  let body = table.createTBody();
  data.forEach(function (obj) {
    let row = body.insertRow();
    keys.forEach(function (key) {
      let cell = row.insertCell();
      if (key == 'Name') {
        let triggerLinkElement = document.createElement('a');
        triggerLinkElement.href = instanceUrl + '/lightning/setup/ApexTriggers/page?address=%2F' + obj['Id'];
        triggerLinkElement.target = 'blank';
        triggerLinkElement.text = obj[key];
        cell.appendChild(triggerLinkElement);
      } else if (key == 'TableEnumOrId') {
        cell.innerHTML = TriggersTableColumnObjects[obj[key]];
      } else if (key == 'Status') {
        cell.id = 'T' + obj['Id'];
        cell.innerHTML = `<div class="status-cell">
            <label class="switch">
              <input type="checkbox" ${obj[key] === 'Active' ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <div class="loader" title="Changing trigger status...">
              <div class="loadersmall"></div>
            </div>
          </div>`;
        let checkbox = cell.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('click', function () {
          handleCheckboxClick(obj['Id'], obj['Name'], checkbox.checked);
        });
      } else {
        cell.innerHTML = obj[key];
      }
    });
  });
}
async function handleCheckboxClick(id, triggerName, isActive) {
  try {
    document.querySelector(`#T${id} .loader`).setAttribute('title', `Changing trigger status to ${isActive ? 'Active' : 'Inactive'}`)
    document.querySelector(`#T${id} .loader`).style.visibility = 'visible';

    const toolingUrl = `${instanceUrl}/services/data/v50.0/tooling/sobjects/`;

    // #region 1) Create MetadataContainer
    let payload = {
      Name: `${triggerName.length > 17 ? triggerName.slice(0, 17) : triggerName}${new Date().toISOString().slice(10)}`,
    };

    const metadataContainer = await conn.requestPost(toolingUrl + 'MetadataContainer' + '/', payload);

    // #endregion
    console.log('MD Container:', metadataContainer);


    //#region 2) Create ApexTriggerMember object, returns apextriggermember object id
    const triggerData = await conn.tooling.sobject('ApexTrigger').find({ Name: triggerName });
    triggerData[0].Metadata.status = isActive ? 'Active' : 'Inactive';
    payload = {
      MetadataContainerId: metadataContainer.id,
      ContentEntityId: id,
      Body: triggerData[0].Body,
      Metadata: triggerData[0].Metadata
    };
    const aTMObject = await conn.requestPost(toolingUrl + 'ApexTriggerMember/', payload);
    //#endregion
    console.log('ATM object: ', aTMObject);


    // #region 3) Create Container Async Request
    payload = {
      MetadataContainerId: metadataContainer.id,
      isCheckOnly: false
    };
    const containerAsyncRequest = await conn.requestPost(toolingUrl + 'ContainerAsyncRequest/', payload);
    //#endregion
    console.log('Container Async Request', containerAsyncRequest);

    // #region 4) Container Async Request status
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let state = 'Queued';
    let res = '';

    while (state === 'Queued') {
      res = await conn.tooling.sobject('ContainerAsyncRequest').find({ id: containerAsyncRequest.id });
      state = res[0].State;
      console.log(`Current state: ${state}`);

      if (state === 'Queued') {
        await delay(1000);
      }
    }

    if (state === 'Completed') {
      document.querySelector(`#T${id} .loader`).style.visibility = 'hidden';
      console.log('Trigger updated successfully.');
    } else {
      document.querySelector(`#T${id} input[type="checkbox"]`).checked = false;
      console.error(`Trigger status failed with state: ${state} and response: `, res);
    }
    //#endregion

  } catch (error) {
    console.log(error);
  }

}

function fetchCallbackClasses() {
  console.log("fetch Callback Function");
  conn.query(
    `select Apttus_Config2__AdjustmentLineItemCallbackClass__c, 
    Apttus_Config2__AssetLineItemCallbackClass__c, 
    Apttus_Config2__PricingCallbackClass__c, 
    Apttus_Config2__ProductAttributeCallbackClass__c, 
    Apttus_Config2__RelatedPricingCallbackClass__c, 
    Apttus_Config2__ValidationCallbackClass__c, 
    Apttus_Config2__DisplayActionCallbackCalss__c, 
    Apttus_Config2__ProductFilterCallbackClass__c, 
    Apttus_Config2__AssetRenewalCustomCallbackClass__c, 
    Apttus_Config2__ActionCallbackClass__c,  
    Apttus_Config2__OptionFilterCallbackClass__c, 
    Apttus_Config2__AdjustmentSpreadCallback__c, 
    Apttus_Config2__PricingExtensionCallbackClass__c, 
    Apttus_Config2__RevalidationCallbackClass__c from Apttus_Config2__ConfigCustomClasses__c`,
    function (err, result) {
      if (err) console.log("Callback Function Errror " + err);
      // console.log("Success in Ayush Edit: " + result);
      console.log(result);

      const CallbackClasses = {
        Apttus_Config2__AdjustmentLineItemCallbackClass__c: result.records[0].Apttus_Config2__AdjustmentLineItemCallbackClass__c,
        Apttus_Config2__AssetLineItemCallbackClass__c: result.records[0].Apttus_Config2__AssetLineItemCallbackClass__c,
        Apttus_Config2__PricingCallbackClass__c: result.records[0].Apttus_Config2__PricingCallbackClass__c,
        Apttus_Config2__ProductAttributeCallbackClass__c: result.records[0].Apttus_Config2__ProductAttributeCallbackClass__c,
        Apttus_Config2__RelatedPricingCallbackClass__c: result.records[0].Apttus_Config2__RelatedPricingCallbackClass__c,
        Apttus_Config2__ValidationCallbackClass__c: result.records[0].Apttus_Config2__ValidationCallbackClass__c,
        Apttus_Config2__DisplayActionCallbackCalss__c: result.records[0].Apttus_Config2__DisplayActionCallbackCalss__c,
        Apttus_Config2__ProductFilterCallbackClass__c: result.records[0].Apttus_Config2__ProductFilterCallbackClass__c,
        Apttus_Config2__AssetRenewalCustomCallbackClass__c: result.records[0].Apttus_Config2__AssetRenewalCustomCallbackClass__c,
        Apttus_Config2__ActionCallbackClass__c: result.records[0].Apttus_Config2__ActionCallbackClass__c,
        Apttus_Config2__OptionFilterCallbackClass__c: result.records[0].Apttus_Config2__OptionFilterCallbackClass__c,
        Apttus_Config2__AdjustmentSpreadCallback__c: result.records[0].Apttus_Config2__AdjustmentSpreadCallback__c,
        Apttus_Config2__PricingExtensionCallbackClass__c: result.records[0].Apttus_Config2__PricingExtensionCallbackClass__c,
        Apttus_Config2__RevalidationCallbackClass__c: result.records[0].Apttus_Config2__RevalidationCallbackClass__c,
      };
      var validCallbackClasses = {};
      var queryApexClass = "SELECT Id, Name from ApexClass WHERE Name in (";
      var hasCallbacks = false;

      for (const key in CallbackClasses) {
        // Check if the value is not null or undefined
        const value = CallbackClasses[key];
        if (value !== null && value !== undefined) {
          // Append the value to queryApexClass with comma separation
          queryApexClass += `'${value}',`;
          validCallbackClasses[key] = value;
          hasCallbacks = true;
        }
      }

      // Remove the trailing comma (if any)
      queryApexClass = queryApexClass.slice(0, -1);

      // Close the parentheses for the IN clause
      queryApexClass += ")";
      console.log(hasCallbacks);
      console.log(queryApexClass);

      if (hasCallbacks) fetchCallbackClasses2(queryApexClass, validCallbackClasses);
    });
  // renderCallbackTable(result.records);
}

async function fetchCaseDetails() {
  // Get Current tab URL
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  // Example URL https://host/lightning/r/Case/500Ub00000CKVsfIAH/view
  // console.log(tab.url);

  // Extract Case Id from the URL
  const caseIdPattern = /\/Case\/([a-zA-Z0-9]+)\/view/;
  const match = tab.url.match(caseIdPattern);
  if (tab.url.includes('apttus2') && match && match[1]) {
    console.log('Case ID: ' + match[1]);
    caseId = match[1];
  } else {
    // Hide View Subscriber Org button when host doesn't contain "apttus2" meaning not Apttus C2 case page
    document.getElementById("SubscriberOrgBtn").style.display = "none";
    return;
  }

  // Fetch Subscriber Org Id and other case details from case id
  conn.query(
    `SELECT Id, CaseNumber, Org_ID__c, Subject, ContactEmail, External_Contact_Email_1__c, External_Contact_Email_2__c, External_Contact_Email_3__c, External_Contact_Email_4__c, Product__c FROM Case WHERE Id ='${caseId}'`,
    function (err, result) {
      if (err) {
        console.log('Error in Fetching Case Details.');
        console.log(err);
      } else {
        console.log(result.records[0]);
        caseDetails = new CaseDetails(result.records[0]);
        // console.log('casedetails');
        console.log(caseDetails);
        // Show Create Meeting Button
        document.getElementById('CreateMeetingBtn').onclick = CreateMeeting;
        document.getElementById('CreateMeetingBtn').style.visibility = "visible";

        document.getElementById('subscriberOrgId').value = caseDetails.OrgID;
        // If length is not equal to 15, it means OrgID field has more/less data other than id
        if(caseDetails.OrgID.length != 15)
          return;     

        // Fetch & Display Release Name for installed packages of the subscriber org
        FetchSubscriberOrgInstalledPackages();        
      }
    }
  );
  document.getElementById("OpenSubscriberOrgButton").onclick = OpenSubscriberOrg;
}

function CreateMeeting() {
  if(caseDetails) {
    let { CaseNumber, Subject, ContactEmail, ExternalContactEmail1, ExternalContactEmail2, ExternalContactEmail3, ExternalContactEmail4 } = caseDetails;
    let meetingSubject = [CaseNumber, Subject].join(" ");
    let attendees = [ContactEmail, ExternalContactEmail1, ExternalContactEmail2, ExternalContactEmail3, ExternalContactEmail4].join(",");
    const CreateMeetingDeepLink = `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(meetingSubject)}&attendees=${encodeURIComponent(attendees)}`; 
    window.open(CreateMeetingDeepLink);
  }
  else 
    console.log('Error in Create Meeting as Case Details are empty.');
}

function OpenSubscriberOrg() {
  let orgid = document.getElementById('subscriberOrgId').value;
  if (orgid && orgid.length == 15) {
    window.open(SubscriberOrgOpenLink + orgid);
  } else {
    console.log('Subscriber Org Id input is empty or incorrect');
    return;
  }
}

function FetchSubscriberOrgInstalledPackages() {
  conn.query(
    `SELECT Package_Name__c, sfLma__Version_Number__c, Release_Name__c FROM sfLma__License__c WHERE sfLma__Subscriber_Org_ID__c = '${caseDetails.OrgID}'`,
    function (err, result) {
      if (err) console.log('Error while Fetching Subscriber Org Installed Packages. ' + err);
      else {
        console.log('subs org details: ');
        console.log(result);
        // Render Subscriber Org Installed Packages Table
        const keys = ['Package_Name__c', 'sfLma__Version_Number__c', 'Release_Name__c']; // Selected keys
        let table = document.getElementById('subscriberOrgPackagesTable');
        let header = table.createTHead().insertRow();
        header.insertCell().outerHTML = '<th>Subscriber Installed Package Name</th>';
        header.insertCell().outerHTML = '<th>Version Number</th>';
        header.insertCell().outerHTML = '<th>Release Name</th>';
        let body = table.createTBody();
        result.records.forEach(function (packageDetails) {
          let row = body.insertRow();
          keys.forEach(function (key) {
            let cell = row.insertCell();
            cell.innerHTML = packageDetails[key];
          })
        });

        // Update Search Subscriber Org Packages input with Case's Product value and search the packages
        document.getElementById('searchSubscriberOrgPackage').value = caseDetails.Product;
        searchSubscriberOrgPackages();

        // Open Subscriber Org Container
        ToggleActiveContainer(Container.SubscriberOrg);
        document.getElementById('searchSubscriberOrgPackage').focus();
      }
    }
  );
}

function fetchCallbackClasses2(query, validClasses) {
  conn.query(query,
    function (err, result1) {
      if (err) console.log("Class Function Errror " + err);
      // console.log("Success in Ayush Edit: " + result);

      renderCallbackTable(result1.records, validClasses);
    });
}

function renderCallbackTable(classData, validClasses) {
  console.log('Inside Render Callback Table function');

  console.log(classData);
  console.log(validClasses);

  let table = document.getElementById('CallbackTable');
  let header = table.createTHead().insertRow();
  header.insertCell().outerHTML = '<th>Name</th>';
  header.insertCell().outerHTML = '<th>Apex Class</th>';
  let body = table.createTBody();

  const keys = ['Name', 'ApexClass']; // Selected keys

  classData.forEach(function (obj) {
    console.debug(obj);
    let row = body.insertRow();
    keys.forEach(function (key) {
      let cell = row.insertCell();
      if (key == 'Name') {
        for (const key1 in validClasses) {
          if (key1 == "Apttus_Config2__ValidationCallbackClass__c") console.log(validClasses[key1] + " The Obj " + obj.Name);
          if (validClasses[key1] === obj.Name) {
            cell.innerHTML = key1;
            console.log("Value of Key " + key1 + " Value of Class Name " + obj.Name);
          }
        }
      }
      else if (key == 'ApexClass') {
        let classLinkElement = document.createElement('a');
        classLinkElement.href = instanceUrl + '/lightning/setup/ApexClasses/page?address=%2F' + obj.Id;
        classLinkElement.target = 'blank';
        classLinkElement.text = obj.Name;
        cell.appendChild(classLinkElement);
      }
    });
  });
}

// function sendTableToBackground() {
//   document.getElementById("btn").addEventListener("click", function () {
//     let packagesContainer = document.getElementById("packagesContainer");
//     if(packagesContainer.style.display !== "none") {
//       packagesContainer.style.display = "none";
//     } else {
//       packagesContainer.style.display = "block";
//     }
//     document.getElementById("triggersContainer").style.display = "none";
//     document.getElementById("CallbacksContainer").style.display = "none";
//     // let searchBar = document.getElementById("myInput");
//     // searchBar.setAttribute("style", "visibility: visible");

//     // var tableContainer = document.getElementById("message1");
//     // console.log(tableContainer);
//     // if (tableContainer) {
//     //   tableContainer.innerHTML = text;
//     // }

//     /*
//     window.open(
//       "packages.html", "_blank");
//     chrome.runtime.sendMessage({ tableData: text });

//     chrome.tabs.create({ url: chrome.runtime.getURL("package.html") });

//     var port = chrome.runtime.connect({ name: "popupToGetPackages" });
//     var dataToSend = {
//         variable1: text,
//       };
//       console.log(dataToSend);
//       port.postMessage(dataToSend); 
//     });
//     */
//   });

// }

function ToggleTriggerContainer() {
  if (window.location.search == "") {
    let urlString = chrome.runtime.getURL('popup.html') + '?host=' + encodeURIComponent(instanceUrl);
    chrome.tabs.create({ url: urlString });
  }
  // console.log('inside toggle trigger table function');
  ToggleActiveContainer(Container.Triggers);
}

function ToggleActiveContainer(containerName) {
  let container = document.getElementById(containerName);
  if (activeContainer === containerName) {
    container.style.display = container.style.display === "none" ? "block" : "none";
  } else {
    if (activeContainer) {
      document.getElementById(activeContainer).style.display = "none";
    }
    container.style.display = "block";
    activeContainer = containerName;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("myInput");
  var searchTriggerInput = document.getElementById("searchTrigger");
  var triggerFilterObject = document.getElementById("Object");
  var searchSubscriberOrgPackageInput = document.getElementById("searchSubscriberOrgPackage");

  if (searchInput) {
    searchInput.addEventListener("keyup", myFunction);
  }

  if (searchTriggerInput) {
    searchTriggerInput.addEventListener("keyup", searchTriggers);
  }

  if (triggerFilterObject) {
    triggerFilterObject.addEventListener("input", filterTriggers);
  }

  if (searchSubscriberOrgPackageInput) {
    searchSubscriberOrgPackageInput.addEventListener("keyup", searchSubscriberOrgPackages);
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
        if (
          txtValue1.toUpperCase().indexOf(filter) > -1 ||
          txtValue2.toUpperCase().indexOf(filter) > -1
        ) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
});

function searchTriggers() {
  let input, table, tr, td, td2, td3, i, txtValue1, txtValue2, txtValue3;
  input = document.getElementById("searchTrigger");
  searchString = input.value.toUpperCase();
  table = document.getElementById("triggersTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0]; // Trigger Name 
    td2 = tr[i].getElementsByTagName("td")[2]; // Trigger API Version
    td3 = tr[i].getElementsByTagName("td")[3]; // Trigger Status
    if (td || td2 || td3) {
      txtValue1 = td.textContent || td.innerText;
      txtValue2 = td2.textContent || td2.innerText;
      txtValue3 = td3.textContent || td3.innerText;
      if (
        txtValue1.toUpperCase().indexOf(searchString) > -1 ||
        txtValue2.toUpperCase().indexOf(searchString) > -1 ||
        txtValue3.toUpperCase().indexOf(searchString) > -1
      ) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function filterTriggers() {
  let input, searchString, table, tr, td, txtValue1;
  input = document.getElementById("Object");
  searchString = input.value.toUpperCase();
  table = document.getElementById("triggersTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (let i = 0; i < tr.length; i++) {
    console.log("Started");
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue1 = td.textContent || td.innerText;
      if (searchString == "" || txtValue1.toUpperCase() === searchString) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function searchSubscriberOrgPackages() {
  var input, filter, table, tr, td, td1, td2, i, txtValue1, txtValue2, txtValue3;
  input = document.getElementById("searchSubscriberOrgPackage");
  filter = input.value.toUpperCase();
  table = document.getElementById("subscriberOrgPackagesTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    td1 = tr[i].getElementsByTagName("td")[1];
    td2 = tr[i].getElementsByTagName("td")[2];
    if (td || td1 || td2) {
      txtValue1 = td.textContent || td.innerText;
      txtValue2 = td1.textContent || td1.innerText;
      txtValue3 = td2.textContent || td2.innerText;
      if (
        txtValue1.toUpperCase().indexOf(filter) > -1 ||
        txtValue2.toUpperCase().indexOf(filter) > -1 ||
        txtValue3.toUpperCase().indexOf(filter) > -1
      ) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}


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

  const CallbackClasses = {
    Apttus_Config2__AdjustmentLineItemCallbackClass__c: "Adjustment Line Item Callback Class",
    Apttus_Config2__AssetLineItemCallbackClass__c: "Asset Line Item Callback Class",
    Apttus_Config2__PricingCallbackClass__c: "Pricing Callback Class",
    Apttus_Config2__ProductAttributeCallbackClass__c: "Product Attribute Callback Class",
    Apttus_Config2__RelatedPricingCallbackClass__c: "Related Pricing Callback Class",
    Apttus_Config2__ValidationCallbackClass__c: "Validation Callback Class",
    Apttus_Config2__DisplayActionCallbackCalss__c: "Display Action Callback Class",
    Apttus_Config2__ProductFilterCallbackClass__c: "Product Filter Callback Class",
    Apttus_Config2__AssetRenewalCustomCallbackClass__c: "Asset Renewal Custom Callback Class",
    Apttus_Config2__ActionCallbackClass__c: "Action Callback Class",
    Apttus_Config2__OptionFilterCallbackClass__c: "Option Filter Callback Class",
    Apttus_Config2__AdjustmentSpreadCallback__c: "Adjustment Spread Callback",
    Apttus_Config2__PricingExtensionCallbackClass__c: "Pricing Extension Callback Class",
    Apttus_Config2__RevalidationCallbackClass__c: "Revalidation Callback Class",
  };
  const ClassList = [
  'Apttus_Config2__AdjustmentLineItemCallbackClass__c', 
  'Apttus_Config2__AssetLineItemCallbackClass__c',
  'Apttus_Config2__PricingCallbackClass__c',
  'Apttus_Config2__ProductAttributeCallbackClass__c',
  'Apttus_Config2__RelatedPricingCallbackClass__c', 
  'Apttus_Config2__ValidationCallbackClass__c',
  'Apttus_Config2__DisplayActionCallbackCalss__c',
  'Apttus_Config2__ProductFilterCallbackClass__c',
  'Apttus_Config2__AssetRenewalCustomCallbackClass__c',
  'Apttus_Config2__ActionCallbackClass__c',
  'Apttus_Config2__OptionFilterCallbackClass__c', 
  'Apttus_Config2__AdjustmentSpreadCallback__c',
  'Apttus_Config2__PricingExtensionCallbackClass__c',
  'Apttus_Config2__RevalidationCallbackClass__c']; // Selected keys
*/