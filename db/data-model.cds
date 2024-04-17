namespace hmel_project;


@cds.persistence.exists
entity HC_PA0167 {
    MANDT  : String(3) NOT null;
    PERNR  : String(8) NOT null;
    SUBTY  : String(4) NOT null;
    OBJPS  : String(2) NOT null;
    SPRPS  : String(1) NOT null;
    ENDDA  : String(8) NOT null;
    BEGDA  : String(8) NOT null;
    SEQNR  : String(3) NOT null;
    AEDTM  : String(8);
    UNAME  : String(12);
    HISTO  : String(1);
    ITXEX  : String(1);
    REFEX  : String(1);
    ORDEX  : String(1);
    ITBLD  : String(2);
    PREAS  : String(2);
    FLAG1  : String(1);
    FLAG2  : String(1);
    FLAG3  : String(1);
    FLAG4  : String(1);
    RESE1  : String(2);
    RESE2  : String(2);
    GRPVL  : String(4);
    BAREA  : String(2);
    PLTYP  : String(4);
    BPLAN  : String(4);
    BENGR  : String(4);
    BSTAT  : String(4);
    ELIDT  : String(8);
    ELDTO  : String(8);
    PARDT  : String(8);
    BOPTI  : String(4);
    DEPCV  : String(4);
    COORD  : String(1);
    PROVI  : String(30);
    POLNR  : String(20);
    ENRTY  : String(1);
    EVENT  : String(4);
    EOGRP  : String(8);
    EOIRQ  : String(1);
    EOIPR  : String(1);
    PRETX  : String(1);
    CSTOV  : Decimal(13, 2);
    BNCST  : Decimal(13, 2);
    PERIO  : String(2);
    CURRE  : String(5);
    DTY01  : String(4);
    DID01  : String(2);
    DTY02  : String(4);
    DID02  : String(2);
    DTY03  : String(4);
    DID03  : String(2);
    DTY04  : String(4);
    DID04  : String(2);
    DTY05  : String(4);
    DID05  : String(2);
    DTY06  : String(4);
    DID06  : String(2);
    DTY07  : String(4);
    DID07  : String(2);
    DTY08  : String(4);
    DID08  : String(2);
    DTY09  : String(4);
    DID09  : String(2);
    DTY10  : String(4);
    DID10  : String(2);
    DTY11  : String(4);
    DID11  : String(2);
    DTY12  : String(4);
    DID12  : String(2);
    DTY13  : String(4);
    DID13  : String(2);
    DTY14  : String(4);
    DID14  : String(2);
    DTY15  : String(4);
    DID15  : String(2);
    DTY16  : String(4);
    DID16  : String(2);
    DTY17  : String(4);
    DID17  : String(2);
    DTY18  : String(4);
    DID18  : String(2);
    DTY19  : String(4);
    DID19  : String(2);
    DTY20  : String(4);
    DID20  : String(2);
    ZCSTOV : Decimal(13, 2)
}


@cds.persistence.exists
entity HC_PA0171 {
    key MANDT  : String(3) NOT null;
    key PERNR  : String(8) NOT null;
    key SUBTY  : String(4) NOT null;
    key OBJPS  : String(2) NOT null;
    key SPRPS  : String(1) NOT null;
    key ENDDA  : String(8) NOT null;
    key BEGDA  : String(8) NOT null;
    key SEQNR  : String(3) NOT null;
        AEDTM  : String(8);
        UNAME  : String(12);
        HISTO  : String(1);
        ITXEX  : String(1);
        REFEX  : String(1);
        ORDEX  : String(1);
        ITBLD  : String(2);
        PREAS  : String(2);
        FLAG1  : String(1);
        FLAG2  : String(1);
        FLAG3  : String(1);
        FLAG4  : String(1);
        RESE1  : String(2);
        RESE2  : String(2);
        GRPVL  : String(4);
        BAREA  : String(2);
        BENGR  : String(4);
        BSTAT  : String(4);
        DOCN1  : String(30);
        DOCI1  : String(20);
        DOCN2  : String(30);
        DOCI2  : String(20);
        SMOKE  : String(1);
        EVINS  : String(1);
        OFFIC  : String(1);
        OWNER  : String(1);
        SEASN  : String(1);
        OTHER  : String(1);
        AFFDT  : String(8);
        HICMP  : String(1);
        DOCN3  : String(30);
        DOCI3  : String(20);
        GENEMP : String(8);
        GENSPO : String(8);
}

@cds.persistence.exists
entity ClaimReports {
    CLAIM_ID                : Integer;
    PERSON_NUMBER           : Integer;
    CLAIM_TYPE              : String(40);
    TREATMENT_FOR           : String(40);
    SELECT_DEPENDENTS       : String(40);
    STATUS                  : String;
    REQUESTED_AMOUNT        : Integer;
    APPROVED_AMOUNT         : Integer;
}
@cds.persistence.exists
entity Managecalims {
    CLAIM_ID                : Integer;
    SUBMITTED_DATE          : Timestamp;
    PERSON_NUMBER           : Integer;
    CLAIM_TYPE              : String(40);
    TREATMENT_FOR           : String(40);
    SELECT_DEPENDENTS       : String(40);
    CURRENT_STATUS          : String(20);
    REQUESTED_AMOUNT        : Integer;
}
