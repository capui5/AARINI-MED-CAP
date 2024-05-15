namespace AARINI_MED_CLAIM;

@cds.persistence.calcview
@cds.persistence.exists
entity ClaimReports {
    CLAIM_ID          : Integer;
    PERSON_NUMBER     : Integer;
    CLAIM_TYPE        : String(40);
    TREATMENT_FOR     : String(40);
    SELECT_DEPENDENTS : String(40);
    STATUS            : String;
    REQUESTED_AMOUNT  : Integer;
    APPROVED_AMOUNT   : Integer;
}

@cds.persistence.calcview
@cds.persistence.exists
entity Managecalims {
    CLAIM_ID          : Integer;
    SUBMITTED_DATE    : Timestamp;
    PERSON_NUMBER     : Integer;
    CLAIM_TYPE        : String(40);
    TREATMENT_FOR     : String(40);
    SELECT_DEPENDENTS : String(40);
    CURRENT_STATUS    : String(20);
    REQUESTED_AMOUNT  : Integer;
}

@cds.persistence.calcview
@cds.persistence.exists
entity ClaimDetails {
    ID:UUID;
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
    APPROVED_AMOUNT         : Decimal(15, 2);
    STATUS                  : String;
    TREATMENT_TYPE          : String(40);
    DOCTOR_NAME             : String(40);
    PATIENT_ID              : String;
    HOSPITAL_LOCATION       : String(40);
    REVIEW                  : String(100);
}
