export const Container = {
    SubscriberOrg: 'subscriberOrgContainer',
    Packages: 'packagesContainer',
    Triggers: 'triggersContainer',
    Callbacks: 'CallbacksContainer'
}

export class CaseDetails {
    constructor(object) {
        this.CaseNumber = object.CaseNumber,
        this.ContactEmail = object.ContactEmail;
        this.ExternalContactEmail1 = object.External_Contact_Email_1__c;
        this.ExternalContactEmail2 = object.External_Contact_Email_2__c;
        this.ExternalContactEmail3 = object.External_Contact_Email_3__c;
        this.ExternalContactEmail4 = object.External_Contact_Email_4__c;
        this.OrgID = object.Org_ID__c;
        this.Product = object.Product__c;
        this.Subject = object.Subject;
    }
}

export const TriggersTableColumnObjects = {
    Account: "Account",
    Opportunity: "Opportunity",
    Apttus_Proposal__Proposal__c: "Proposal",
    Apttus_Config2__ProductConfiguration__c: "Product Configuration",
    Apttus_Config2__LineItem__c: "Line Item",
    Apttus_Proposal__Proposal_Line_Item__c: "Proposal Line Item",
    Apttus_Config2__Order__c: "Order",
    Apttus_Config2__OrderLineItem__c: "Order Line Item",
    Apttus_Config2__SummaryGroup__c: "Summary Group",
    Apttus__APTS_Agreement__c: "Agreement",
    Apttus__AgreementLineItem__c: "Agreement Line Item",
    Apttus__DocumentVersion__c: "Document Version",
    Apttus__DocumentVersionDetail__c: "Document Version Detail",
    Apttus__APTS_Template__c: "Template",
    Apttus__CycleTimeGroupData__c: "Cycle Time Group Data",
    Apttus_Approval__Approval_Request__c: "Approval Request"
  };

export const SubscriberOrgOpenLink = "https://apttus2.my.salesforce.com/partnerbt/lmo/subOrgLogin.apexp?directLoginOrgId=";