using {hmel_project as hm} from '../db/data-model';


service MyService {

    entity HC_PA0167    as projection on hm.HC_PA0167;
    entity HC_PA0171    as projection on hm.HC_PA0171;
    entity ClaimReports as projection on hm.ClaimReports;
    entity ManageClaims as projection on hm.Managecalims;


    entity ZHRMED_POLICY {
        MANDT     : String(3);
        STARTDATE : Timestamp;
        ENDDATE   : Timestamp;
        AGENCY    : String(40);
        POLICYNO  : String(40);
        ISACTIVE  : Boolean
    }

    entity T77WWW_CLREIM {
        MANDT : String(3);
        MOLGA : String(2);
        RETYP : String(4);
        ENDDA : Timestamp;
        BEGDA : Timestamp;
        ALADV : String(1);
        ALAPL : String(1);
        ALENC : String(1);
        ISLTC : String(1);
        ALADR : String(1);
        APCAN : String(1);
        ALCLM : String(1);
        ADM01 : String(12);
        ADM02 : String(12);
        ADM03 : String(12);
        CUADS : String(1);
        ALADC : String(1);
    }

    entity ZHR_MED_CAT {
        MANDT       : String(3);
        CATAGORY    : Integer;
        BEGDA       : Timestamp;
        ENDDA       : Timestamp;
        DESCRIPTION : String(80);
    }

    entity T77WWW_CLHLDCOT {
        MANDT : String(3);
        SPRSL : String(1);
        MOLGA : String(2);
        RETYP : String(4);
        RQTYP : String(2);
        SCMCD : String(4);
        CSFLD : String(30);
        SOVAL : String(40);
        SOTXT : String(50);
    }

    entity T77WWW_CLMLDCOT {
        MANDT : String(3);
        SPRSL : String(1);
        MOLGA : String(2);
        RETYP : String(4);
        RQTYP : String(2);
        SCMCD : String(4);
        CSFLD : String(30);
        SOVAL : String(40);
        SOTXT : String(50);
    }

    entity T799L2X {
        MANDT : String(3);
        MOLGA : String(2);
        RETYP : String(4);
    }

    entity CLAIM_DETAILS {
        key ID                      : UUID;
            CLAIM_ID                : Integer;
            PERSON_NUMBER           : Integer;
            CLAIM_TYPE              : String(40);
            CLAIM_START_DATE        : Timestamp;
            CLAIM_END_DATE          : Timestamp;
            TREATMENT_FOR           : String(40);
            TREATMENT_FOR_IF_OTHERS : String(40);
            SELECT_DEPENDENTS       : String(40);
            SUBMITTED_DATE          : Date;
            REQUESTED_AMOUNT        : Integer;
            CONSULTANCY_CATEGORY    : String(40);
            MEDICAL_STORE           : String(40);
            BILL_DATE               : Timestamp;
            BILL_NO                 : String;
            BILL_AMOUNT             : Integer;
            DISCOUNT                : Integer;
            // STATUS                  : String;
            APPROVED_AMOUNT         : Decimal(15, 2);
            ATTACHMENTS             : LargeBinary;

    }

    entity ZHRMEDICLAIM {

        key REFNR           : Integer;
            SETTLEMENT_DATE : Timestamp;
            HR_REMARKS      : String(40);
            NIA_DATE        : Timestamp;
            CHECK_NO        : String(20);
            BATCH_NO        : String(20);
            BANK_NAME       : String(20);
            STATUS          : String(40);
            APPROVED_AMOUNT : Integer;
    }

    entity POLICY_DETAILS {
        POLICY_STARTDATE : Timestamp;
        POLICYNO         : String(40);
        PRE_ILLNESS      : Boolean;
        ILLNESS_NAME     : String(40)
    }

    entity CONSULTANCY_CAP_LIMIT {
        key CONSULTANCY_CATEGORY : String(40);
            CAP_AMOUNT           : Integer;
    }

    // function validations() returns String;
    function validations(endDate : Date, startDate : Date, requestedAmount : Integer, category : String)                                                                           returns Integer;
    function policyValidations(policyNumber : String, startDate : Date, illnessName : String)                                                                                      returns String;
    // function statusUpdate(REFNR : Integer, Status : String, )                                                                                                                     returns Integer;
    function statusUpdate(REFNR : Integer, Status : String, Batch : String, Nia : String, Remark : String, Check : String, Bank : String, Approved : Integer, Settlement : String) returns Integer;

    function submitData(claim_id : Integer,
                        person_number : Integer,
                        claim_type : String,
                        claim_start_date : Date,
                        claim_end_date : Date,
                        treatment_for : String,
                        treatment_for_if_others : String,
                        select_dependents : String,
                        requested_amount : Integer,
                        consultancy_category : String,
                        medical_store : String,
                        bill_date : Date,
                        bill_no : String,
                        bill_amount : Integer,
                        discount : Integer,
                        approved_amount : Decimal(15, 2))                                                                                                                                 returns Integer;


}
