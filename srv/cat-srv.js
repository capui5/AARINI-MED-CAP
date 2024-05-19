const cds = require('@sap/cds');
const axios = require('axios');
const FormData = require('form-data');
// const cmisService = cds.connect.to("DMS");

module.exports = cds.service.impl(srv => {
    srv.on('validations', async (req) => {
        const { startDate, endDate, requestedAmount, category } = req.data;

        console.log(category);

        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const durationInMilliseconds = end - start;
            const durationInDays = durationInMilliseconds / (1000 * 3600 * 24);

            // Fetch the category from the database
            const capAmountData = await cds.run(SELECT.one('CAP_AMOUNT').
                from('MYSERVICE_CONSULTANCY_CAP_LIMIT').
                where({ CONSULTANCY_CATEGORY: category }));

            // Extract the CAP_AMOUNT value
            const capAmountPerDay = capAmountData.CAP_AMOUNT;

            // Calculate the total amount based on duration and cap amount per day
            const durationAmount = durationInDays * capAmountPerDay;

            // Compare requested amount with the calculated total amount
            const finalAmount = Math.min(requestedAmount, durationAmount);

            return {
                success: true,
                finalAmount: finalAmount,
                eligibleAmount: capAmountPerDay,
                durationInDays: durationInDays
            };
        } catch (error) {
            console.error('Error occurred during database query:', error);
            // Return the error response
            return {
                success: false,
                message: "An error occurred during database query. Please try again later."
            };
        }
    });

    //VALIDATION FOR POLICY DETAILS//

    srv.on('policyValidations', async (req) => {
        console.log(req.data)
        const { policyNumber, startDate, illnessName } = req.data;


        // Function to fetch policy start date from the database
        async function fetchPolicyStartDate(policyNumber) {
            const policyData = await cds.run(
                SELECT.one
                    .from('MYSERVICE_POLICY_DETAILS')
                    .where({ POLICYNO: policyNumber })

            );
            console.log(policyData)
            // return new Date(policyData.POLICY_STARTDATE); 
            return policyData
        }

        try {
            // Fetch the policy start date from the database
            const policyData = await fetchPolicyStartDate(policyNumber);

            if (policyData.ILLNESS_NAME === illnessName && policyData.PRE_ILLNESS === 1) {

                // Calculate difference in months between policy start date and provided start date

                const diffInMonths = calculateMonthDifference(new Date(policyData.POLICY_STARTDATE), new Date(startDate));

                // Check if the difference is greater than or equal to 2 months
                if (diffInMonths >= 2) {
                    // Return success response if the difference is greater than or equal to 2 months
                    return { success: true };
                } else {
                    // Return error response if the difference is less than 2 months
                    return { success: false, message: 'you have a cooling-off period of 2 months\n from the date of policy issuance' };
                }

            }
            else {
                return { success: true }
            }
        } catch (error) {
            // Log error
            console.error('Error occurred during policy validation:', error);
            // Return an error response
            return { success: false, message: 'An error occurred during policy validation. Please try again later.' };
        }
    });

    // Function to calculate difference in months between two dates
    function calculateMonthDifference(date1, date2) {
        return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
    }

    //Validation for STATUS UPDATE//
    srv.on('statusUpdate', async (req) => {
        console.log(req.data);
        const { REFNR, Status, Batch, Nia, Remark, Check, Bank, Approved, Settlement } = req.data;

        try {
            async function updateClaimStatus(REFNR, Status, Batch, Nia, Remark, Check, Bank, Approved, Settlement) {
                await cds.run(UPDATE('MYSERVICE_ZHRMEDICLAIM').set({
                    REFNR, STATUS: Status,
                    BATCH_NO: Batch, NIA_DATE: Nia, HR_REMARKS: Remark, CHECK_NO: Check,
                    BANK_NAME: Bank, APPROVED_AMOUNT: Approved, SETTLEMENT_DATE: Settlement
                }).where({ REFNR: REFNR }));
            }

            await updateClaimStatus(REFNR, Status, Batch, Nia, Remark, Check, Bank, Approved, Settlement);

            return { success: true, message: 'Claim status updated successfully' };
        } catch (error) {
            console.error('Error occurred during status update:', error);
            return { success: false, message: 'An error occurred during status update. Please try again later.' };
        }
    });

    //Submit to HANA DB

    // srv.on('submitData',async(req)=>{
    //     const{claim_id,person_number,claim_type,claim_start_date,claim_end_date,treatment_for,
    //         treatment_for_if_others,select_dependents,requested_amount,consultancy_category,
    //         medical_store,bill_date,bill_no,bill_amount,discount,approved_amount}=req.data

    //         try {
    //             // Define a function to insert data into HANA database
    //             async function submit(claim_id, person_number, claim_type, claim_start_date, claim_end_date, treatment_for,
    //                 treatment_for_if_others, select_dependents, requested_amount, consultancy_category,
    //                 medical_store, bill_date, bill_no, bill_amount, discount, approved_amount) {

    //                 // Use CAP CDS (Core Data Services) to run an INSERT statement
    //                 await srv.tx(req).run(INSERT.into('MYSERVICE_CLAIM_DETAILS').entries({
    //                     CLAIM_ID: claim_id,
    //                     PERSON_NUMBER: person_number,
    //                     CLAIM_TYPE: claim_type,
    //                     CLAIM_START_DATE: claim_start_date,
    //                     CLAIM_END_DATE: claim_end_date,
    //                     TREATMENT_FOR: treatment_for,
    //                     TREATMENT_FOR_IF_OTHERS: treatment_for_if_others,
    //                     SELECT_DEPENDENTS: select_dependents,
    //                     REQUESTED_AMOUNT: requested_amount,
    //                     CONSULTANCY_CATEGORY: consultancy_category,
    //                     MEDICAL_STORE: medical_store,
    //                     BILL_DATE: bill_date,
    //                     BILL_NO: bill_no,
    //                     BILL_AMOUNT: bill_amount,
    //                     DISCOUNT: discount,
    //                     APPROVED_AMOUNT: approved_amount
    //                 }));

    //                 console.log('Data inserted successfully.');
    //             }

    //             // Call the submit function with the provided data
    //             await submit(claim_id, person_number, claim_type, claim_start_date, claim_end_date, treatment_for,
    //                 treatment_for_if_others, select_dependents, requested_amount, consultancy_category,
    //                 medical_store, bill_date, bill_no, bill_amount, discount, approved_amount);
    //         } catch (error) {
    //             console.error('Error inserting data:', error);
    //         }


    // })


    srv.on('submitData', async (req) => {
        const { claim_id, person_number, claim_type, claim_start_date, claim_end_date, treatment_for,
            treatment_for_if_others, select_dependents, requested_amount, consultancy_category,
            medical_store, bill_date, bill_no, bill_amount, discount, approved_amount } = req.data
        try {
            const workflow = await cds.connect.to('WORK_SPA');
            var triggerWorkflow = await workflow.tx(req).post('/workflow-instances', {
                "definitionId": "eu10.aarini-development.mediclaim.mediclaimwf",
                "context": {
                    // "bill_no": bill_no,
                    // "claim_id": claim_id,
                    // "claim_type": claim_type,
                    // "bill_amount": bill_amount,
                    // "bill_date": bill_date,
                    // "claim_start_date": claim_start_date,
                    // "claim_end_date": claim_end_date,
                    // "treatment_for": treatment_for,
                    // "managerapproval": ""
                    "bill_no": "asdsa",
                    "claim_id": 109,
                    "claim_type": "(IPD) IN-PATIENT DEPARTMENT",
                    "bill_amount": 5000,
                    "bill_date": "2024-03-13T23:00:00.000Z",
                    "claim_start_date": "2024-03-05T23:00:00.000Z",
                    "claim_end_date": "2024-03-21T23:00:00.000Z",
                    "treatment_for": "BLOOD PRESSURE",
                    "managerapproval": "true"
                }
            });
        } catch (error) {
            console.log(error);
        }
    })



    // Create Folder using DMS
    // async function createFolder(POLICYNO) {
    //     if (!POLICYNO) {
    //         throw new Error("Policy number is not provided.");
    //     }

    //     try {
    //         const folderNameResult = await cds.run(
    //             SELECT.one
    //                 .from('MYSERVICE_ZHRMED_POLICY')
    //                 .where({ POLICYNO: POLICYNO })
    //         );

    //         if (!folderNameResult) {
    //             throw new Error(`Policy number ${POLICYNO} not found.`);
    //         }

    //         const folder = folderNameResult.POLICYNO;

    //         console.log("Invoked createFolder with folderName:", folder);

    //         const cmisService = await cds.connect.to("DMS");

    //         try {
    //             const getResponse = await cmisService.get(`/MEDICAL CLAIM/TEST REPORT/${folder}`);
    //             console.log("get call");

    //             if (getResponse) {
    //                 console.log("Folder already exists:", folder);
    //                 return { success: true, folderExists: true };
    //             }
    //         } catch (err) {
    //             if (err.statusCode !== 404) {
    //                 throw new Error(`Error checking folder existence: ${err.message}`);
    //             }
    //         }

    //         console.log("Folder does not exist. Creating folder:", folder);

    //         const data =
    //             `cmisaction=createFolder` +
    //             `&objectId=e_r_JZ_Y0kwekUVi-f86GJVZ7XcifhhqmkUHFazZW0s` +
    //             `&propertyId[0]=cmis:name` +
    //             `&propertyValue[0]=${folder}` +
    //             `&propertyId[1]=cmis:objectTypeId` +
    //             `&propertyValue[1]=cmis:folder` +
    //             `&succinct=true`;

    //         const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    //         await cmisService.send({
    //             method: "POST", path: "/MEDICAL CLAIM/TEST REPORT/", data, headers
    //         });

    //         console.log("Folder created successfully:", folder);

    //         return { success: true };
    //     } catch (error) {
    //         console.error("Error in creating folder:", error);
    //         throw new Error(`Error in creating folder: ${error.message}`);
    //     }
    // }

    async function createFolderandValidateT(req, folderName) {
        console.log("createFolderandValidateT invoked");

        const cmisService = await cds.connect.to("DMS");
        try {
            const getResponse = await cmisService.get(`/MEDICAL CLAIM/TEST REPORT/` + folderName);
            console.log("getResponse");
            if (getResponse) {
                return true;
            }
        } catch (error) {
            console.log("Folder " + folderName + " is not available in the DMS");

            const data =
                `cmisaction=createFolder` +
                `&objectId=3eLP4Nl9pNs6PEvGbqc_qD11NdTXcDMLp3tyhNN0Soc` +
                `&propertyId[0]=cmis:name` +
                `&propertyValue[0]=${folderName}` +
                `&propertyId[1]=cmis:objectTypeId` +
                `&propertyValue[1]=cmis:folder` +
                `&succinct=true`;

            const headers = { "Content-Type": "application/x-www-form-urlencoded" };
            try {
                await cmisService.send({ method: "POST", path: "/", data, headers });
                return true;
            }
            catch (error) {
                return error;
            }
        }

    }


    async function createFolder(POLICYNO) {
        if (!POLICYNO) {
            throw new Error("Policy number is not provided.");
        }

        // try {
        console.log("I was here" + POLICYNO)
        // const folderNameResult = await SELECT.one
        //         .from("MYSERVICE_ZHRMED_POLICY")
        //         .where({ POLICYNO: POLICYNO });

        // console.log("Im here too")
        // if (!folderNameResult) {
        //     throw new Error(`Policy number ${POLICYNO} not found.`);
        // }

        // try {
        // const folder = folderNameResult.POLICYNO; 
        // console.log("Invoked createFolder with folderName:", folder);

        const cmisService = await cds.connect.to("DMS");

        // try {
        const getResponse = await cmisService.get(`/MEDICAL CLAIM/TEST REPORT/${POLICYNO}`);
        console.log("get call");

        if (getResponse) {
            console.log("Folder already exists:", folder);
            return { success: true, folderExists: true };
        }
        // } catch (err) {
        // if (err.statusCode !== 404) {
        //     throw new Error(`Error checking folder existence: ${err.message}`);
        // }
        // }

        console.log("Folder does not exist. Creating folder:", folder);

        const data =
            `cmisaction=createFolder` +
            // `&objectId=e_r_JZ_Y0kwekUVi-f86GJVZ7XcifhhqmkUHFazZW0s` +
            `&objectId= 3eLP4Nl9pNs6PEvGbqc_qD11NdTXcDMLp3tyhNN0Soc` +
            `&propertyId[0]=cmis:name` +
            `&propertyValue[0]=${folder}` +
            `&propertyId[1]=cmis:objectTypeId` +
            `&propertyValue[1]=cmis:folder` +
            `&succinct=true`;

        const headers = { "Content-Type": "application/x-www-form-urlencoded" };

        await cmisService.send({
            method: "POST", path: "/MEDICAL CLAIM/TEST REPORT/", data, headers
        });

        console.log("Folder created successfully:", folder);

        return { success: true };
        // } catch (error) {
        //     console.error("Error in creating folder:", error);
        //     throw new Error(`Error in creating folder: ${error.message}`);
        // }
        // } catch (error) {
        //     console.error("Error in fetching folder name:", error);
        //     throw new Error(`Error in fetching folder name: ${error.message}`);
        // }
    }



    async function uploadFile(req, binaryContent, filename) {
        const cmisService = await cds.connect.to("DMS");
        let contentBuffer = Buffer.from(binaryContent, "base64");
        // console.log(req.data.MEDIA_TYPE);
        // console.log(req.data.POLICYNO)
        // console.log(req.data.filename)
        // console.log(form)

        // FormData
        var form = new FormData();
        form.append("cmisaction", "createDocument");
        form.append("propertyId[1]", "cmis:name");
        form.append("propertyValue[0]", "cmis:document");
        form.append("propertyId[0]", "cmis:objectTypeId");


        const CRLF = "\r\n";
        const options = {
            header:
                "--" +
                form.getBoundary() +
                CRLF +
                `Content-Disposition: form-data; name="propertyValue[1]"` +
                CRLF +
                `Content-Type: text/plain;charset=UTF-8` +
                CRLF +
                CRLF,
        };
        form.append("propertyValue[1]", filename, options);
        const fileOptions = {
            header:
                "--" +
                form.getBoundary() +
                CRLF +
                `Content-Disposition: form-data; name="file"; filename*=UTF-8''${filename}` +
                CRLF +
                `Content-Type: ${req.data.MEDIA_TYPE}` +
                CRLF +
                CRLF,
        };
        form.append("dataFile", contentBuffer, fileOptions);
        const data = form.getBuffer();
        const headers = form.getHeaders();

        try {
            const response = await cmisService.send({
                method: "POST",
                path: `/MEDICAL CLAIM/TEST REPORT/${req.data.POLICYNO}`,
                data,
                headers,
            });
            console.log(response);

            req.data.FILE_CONTENT = null;
        } catch (error) {
            req.error("Error occurred during file upload:", error);
        }
    }


    srv.before("CREATE", "DMS_ATT", async (req) => {
        try {
            console.log("Request Data:", req.data);

            if (!req.data.FILE_NAME) {
                return req.error({
                    code: "500",
                    message: "File name is mandatory",
                    status: 418,
                });
            }

            req.data.FILE_NAME_DMS = req.data.FILE_NAME + new Date().toISOString();

            console.log("Before uploading folder")
            // Call createFolder function with POLICYNO
            await createFolderandValidateT(req, req.data.POLICYNO);
            console.log("console check");

            // Upload file in the folder
            await uploadFile(req, req.data.FILE_CONTENT, req.data.FILE_NAME_DMS);

        } catch (error) {
            console.error("Error in DMS_ATT before create handler:", error);
            req.error({
                code: 500,
                message: `Error in DMS_ATT before create handler: ${error.message}`,
                status: 418,
            });
        }
    });


});

