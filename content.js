console.log("Inside Content JS File");

//Global Variables
formatDebugSummaryLog();
function formatDebugSummaryLog(){
    console.log('### Entering');
    
    if(window.location.pathname =='/setup/ui/listApexTraces.apexp' || window.location.pathname=='/one/one.app'){
    //var firstHref = $("#Apex_Trace_List.traceForm.traceTable.thetracetable.tb");

    //https://robots.thoughtbot.com/how-to-make-a-chrome-extension  background-color: rgb(223, 255, 235);
    
    console.log("User is on Debug Log screen")
    
    //var logTraceSection = document.getElementById('Apex_Trace_List:monitoredUsersForm').childNodes[3].childNodes[1].childNodes[1];
    
    //console.log('### : '+logTraceSection.innerText);
    
    var myElement = document.getElementById("Apex_Trace_List:traceForm:traceTable:thetracetable:tb");
    
    if(myElement!=null)

    console.debug("Debug Log Rows are not empty")
    /*
    for(var i = 0; i < myElement.rows.length; i++){    
        
        var rowActions = document.getElementById('Apex_Trace_List:traceForm:traceTable:thetracetable:'+i+':rowActions');	
        
        rowActions.children[0].setAttribute("target", "_blank");
        rowActions.children[0].innerHTML = '<img width= "21px" title="View" src='+chrome.runtime.getURL('/images/view2.png')+'>';
        console.debug(rowActions.children[1].innerHTML);
        
        rowActions.children[1].innerHTML = '<img width= "19px" title="Download" src='+chrome.runtime.getURL('/images/download.png')+'>';
        rowActions.children[2].innerHTML = '<img width= "19px" title="Delete" src='+chrome.runtime.getURL('/images/delete.png')+'>';
        
        
    var statusColumn = document.getElementById('Apex_Trace_List:traceForm:traceTable:thetracetable:'+i+':status');
        if(statusColumn.innerHTML == 'Success'){
         
         statusColumn.parentElement.style.backgroundColor = "rgb(223, 255, 235)";
         statusColumn.innerHTML = '<img title="'+statusColumn.innerHTML+'" src="'+chrome.runtime.getURL('/images/success.png')+'" width="30px">';
         
         }else{
         statusColumn.parentElement.style.backgroundColor = "rgb(255, 223, 223)";
         statusColumn.innerHTML = '<img title="'+statusColumn.innerHTML+'" src="'+chrome.runtime.getURL('/images/error.png')+'" width="30px">';
         }
    }
    */
    }
}
function findlink(){

var viewLink = document.querySelector('a.actionLink[href*="apex_log_id="]');

//<a href="/p/setup/layout/ApexDebugLogDetailEdit/d?retURL=%2Fsetup%2Fui%2FlistApexTraces.apexp%3FretURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DLogs%26setupid%3DApexDebugLogs&amp;setupid=ApexDebugLogs&amp;apex_log_id=07L8c00004SAkcyEAD" class="actionLink">View</a>
// Download link - https://mufaddallaxmidhar06842.my.salesforce.com/servlet/servlet.FileDownload?file=07L8c00004SAkcyEAD
console.log(viewLink)
// Check if the viewLink is found
if (viewLink) {
  // Extract the file ID from the href attribute
  var url = new URL(viewLink.href);
  var apexLogId = url.searchParams.get('apex_log_id');
  var downloadurl = null;


  // Check if the fileId is found
  if (apexLogId) {
    console.log('File ID:', apexLogId);
    var currentUrl = window.location.href;
    console.log(currentUrl)
    if(currentUrl.includes('.lightning.force.com') || currentUrl.includes('.salesforce.com')){
        if (currentUrl.includes('.sandbox.')){
            downloadurl = something;
        }
        else{
            var url1 = currentUrl.replace('.documentforce.com','.my.salesforce.com')
            downloadurl = url1 + "servlet/servlet.FileDownload?file=" + apexLogId;
            console.log(downloadurl);
        }
    }
  } else {
    console.error('File ID not found');
  }
} else {
  console.error('View link not found');
}
    

}
findlink();
/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log(request, sender, sendResponse);
    sendResponse('Random Workaround'+JSON.stringify("request"));
});
*/