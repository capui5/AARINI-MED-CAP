var hana = require('@sap/hana-client');
var client = hana.createConnection();
client.connect("serverNode=7fff69cc-2a36-4481-b320-7ee780c5f6de.hana.prod-ap11.hanacloud.ondemand.com:443;uid=DBADMIN;pwd=Hc@dm!n123");
stmt = client.prepare("INSERT INTO CLAIM_DETAILS(  CLAIM_ID,PERSON_NUMBER,CLAIM_TYPE,CLAIM_START_DATE,CLAIM_END_DATE,TREATMENT_FOR, TREATMENT_FOR_IF_OTHERS
    ,SELECT_DEPENDENTS,
    REQUESTED_AMOUNT,
    CONSULTANCY_CATEGORY,
    MEDICAL_STORE,
    BILL_DATE,
    BILL_NO,
    BILL_AMOUNT) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
result = stmt.execBatch([[1, 'Company 1'], [2, 'Company 2']]);
stmt.drop();
console.log(result);
client.disconnect();
