sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/upload/UploadSetwithTable",
    "sap/m/upload/UploadSetwithTableItem",

],

    function (Controller, Device, JSONModel, MessageBox, DateFormat, ODataModel, UploadSetwithTable, UploadSetwithTableItem) {
        "use strict";

        // let validations = (endDate, startDate) => {

        //     // Calculate the number of days
        //     const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        //     const numberOfDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;



        //     // Fixed hospital room charge per day
        //     const roomChargePerDay = 1000;

        //     // Calculate total room charges
        //     const totalRoomCharges = numberOfDays * roomChargePerDay;

        //     // Return the result
        //     return totalRoomCharges;
        // };

        return Controller.extend("hmel.claims.hmelclaim.controller.ess", {
            onInit: function () {
                Device.orientation.attachHandler(this.onOrientationChange, this);
                this._oModel = this.getView().getModel("MainModel");

                this.getView().setModel(new JSONModel({
                    isNextButtonVisible: true,
                    isSubmitButtonVisible: false
                }), "footerModel");

                var oIconTabBar = this.byId("myIconTabBar");
                oIconTabBar.attachSelect(this.onTabSelect, this);

                // Set initial visibility of buttons
                this.updateButtonVisibility();

                var oClaimModel = new JSONModel();
                this.getView().setModel(oClaimModel, "claimModel");

                this.updateTotalRequestedAmount();

                var oModel = new ODataModel("/odata/v4/my/");
                this.getView().setModel(oModel);

                var oComboBox = this.byId("Hospitallocation");
                oComboBox.attachChange(this.onHospitalLocationChange, this);

                var oComboBox = this.byId("TF");
                oComboBox.attachChange(this.onTreatmentChange, this);

            },
            formatDate: function (date) {
                if (!date) {
                    return "";
                }
                var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-dd" });
                return oDateFormat.format(date);
            },
            onListItemPress: function (oEvent) {
                var listItem = oEvent.getParameter("listItem");

                if (listItem) {
                    var sToPageId = listItem.data("to");

                    if (sToPageId) {
                        this.getSplitAppObj().toDetail(this.createId(sToPageId));
                    } else {
                        console.error("Invalid destination for list item.");
                    }
                }
            },

            getSplitAppObj: function () {
                var view = this.getView();

                if (view) {
                    var splitContainer = view.byId("SplitContDemo");
                    return splitContainer;
                }

                return null;
            },

            onOrientationChange: function () {
                // Handle orientation change here if needed.
            },

            handleNext: function () {
                var oIconTabBar = this.byId("myIconTabBar");
                var aItems = oIconTabBar.getItems();
                var sSelectedKey = oIconTabBar.getSelectedKey();

                var iCurrentIndex = aItems.findIndex(function (oItem) {
                    return oItem.getKey() === sSelectedKey;
                });

                // Save data from the current tab to the claimModel
                this.saveDataToClaimModel();

                // Check if all required fields are filled in the current tab
                var aMissingFields = this.validateRequiredFields(sSelectedKey);

                if (aMissingFields.length === 0) {


                    // Check if the CheckBox "Accept" is checked
                    if (sSelectedKey === "Create") {
                        var oCheckBoxAccept = this.byId("Accept");
                        var bIsCheckBoxChecked = oCheckBoxAccept.getSelected();


                        if (bIsCheckBoxChecked) {
                            // Proceed with the next logic
                            if (iCurrentIndex < aItems.length - 1) {
                                // Select the next tab
                                oIconTabBar.setSelectedKey(aItems[iCurrentIndex + 1].getKey());


                                // Update button visibility
                                this.updateButtonVisibility();
                            }
                        } else {
                            // CheckBox is not checked, show an error message

                            MessageBox.error("Please acknowledge and accept the terms and conditions.");
                        }
                    } else {
                        // Proceed with the next logic for other tabs
                        if (iCurrentIndex < aItems.length - 1) {
                            // Select the next tab
                            oIconTabBar.setSelectedKey(aItems[iCurrentIndex + 1].getKey());

                            // Update button visibility
                            this.updateButtonVisibility();
                        }
                    }
                } else {
                    // Show an error message with missing required fields

                    var sErrorMessage = "Please fill in all required fields: " + aMissingFields.join(", ");
                    MessageBox.error(sErrorMessage);
                }
            },


            validateRequiredFields: function (sSelectedKey) {
                var aMissingFields = [];

                if (sSelectedKey === "claimDetails") {
                    var oCT = this.byId("CT");
                    var oTT = this.byId("TT");
                    var oStartDatePicker1 = this.byId("startDatePicker1");
                    var oEndDatePicker1 = this.byId("endDatePicker1");
                    var oTF = this.byId("TF");
                    var oSD = this.byId("SD");

                    // Add more required fields as needed
                    if (!oCT.getValue()) {
                        aMissingFields.push("Claim Type");
                        oCT.setValueState("Error");
                    }
                    if (!oTT.getValue()) {
                        aMissingFields.push("Treatment Type");
                        oTT.setValueState("Error");
                    }
                    if (!oStartDatePicker1.getDateValue()) {
                        aMissingFields.push("Claim Start Date");
                        oStartDatePicker1.setValueState("Error");
                    }
                    if (!oEndDatePicker1.getDateValue()) {
                        aMissingFields.push("Claim End Date");
                        oEndDatePicker1.setValueState("Error");
                    }
                    if (!oTF.getValue()) {
                        aMissingFields.push("Treatment For");
                        oTF.setValueState("Error");
                    }
                    if (!oSD.getValue()) {
                        aMissingFields.push("Select Dependents");
                        oSD.setValueState("Error");
                    }
                }

                return aMissingFields;
            },


            handleBack: function () {
                var oIconTabBar = this.byId("myIconTabBar");
                var aItems = oIconTabBar.getItems();
                var iSelectedIndex = oIconTabBar.getSelectedKey();

                var iCurrentIndex = aItems.findIndex(function (oItem) {
                    return oItem.getKey() === iSelectedIndex;
                });

                if (iCurrentIndex > 0) {
                    oIconTabBar.setSelectedKey(aItems[iCurrentIndex - 1].getKey());
                    this.updateButtonVisibility();
                }
            },

            updateButtonVisibility: function () {
                var oIconTabBar = this.byId("myIconTabBar");
                var oBackButton = this.getView().byId("BackButton");
                var oNextButton = this.getView().byId("nextButton");
                var oSubmitButton = this.getView().byId("submitButton");
                var oSelectedTab = oIconTabBar.getSelectedKey();

                if (oSelectedTab === "review") {
                    oBackButton.setVisible(true);
                    oNextButton.setVisible(false);
                    oSubmitButton.setVisible(true);
                } else {
                    oBackButton.setVisible(true);
                    oNextButton.setVisible(true);
                    oSubmitButton.setVisible(false);
                }
            },


            onTabSelect: function (oEvent) {
                this.updateButtonVisibility();

                var sSelectedKey = oEvent.getParameter("key");

                // Perform validation based on the selected tab
                if (sSelectedKey === "claimDetails") {
                    // Validate claim details tab
                    var aMissingFields = this.validateRequiredFields(
                        this.byId("CT"),
                        this.byId("TT"),
                        this.byId("startDatePicker1"),
                        this.byId("endDatePicker1"),
                        this.byId("TF"),
                        this.byId("SD")
                    );

                    if (aMissingFields.length > 0) {
                        // Show an error message with missing required fields
                        var sErrorMessage = "Please fill in all required fields: " + aMissingFields.join(", ");
                        MessageBox.error(sErrorMessage);
                        // If validation fails, prevent switching to the selected tab
                        this.byId("myIconTabBar").setSelectedKey(this.sLastSelectedTab);
                        return;
                    }
                }

                // Continue with the normal logic for other tabs
                this.sLastSelectedTab = sSelectedKey;

                // Your existing logic for the selected tab
                if (sSelectedKey === "review") {
                    this.updateTotalRequestedAmount();
                }
            },


            saveDataToClaimModel: function () {
                var oClaimModel = this.getView().getModel("claimModel");

                // Set properties for Claim Type
                oClaimModel.setProperty("/claimType", this.byId("CT").getSelectedKey());

                // Set properties for Claim Start and End Dates
                oClaimModel.setProperty("/claimStartDate", this.byId("startDatePicker1").getValue());
                oClaimModel.setProperty("/claimEndDate", this.byId("endDatePicker1").getValue());

                // Set properties for Treatment For
                oClaimModel.setProperty("/treatmentFor", this.byId("TF").getSelectedKey());

                // Set properties for Treatment For (If Other)
                oClaimModel.setProperty("/treatmentForOther", this.byId("TreatmentForOther").getValue());

                // Set properties for Select Dependents
                oClaimModel.setProperty("/selectedDependent", this.byId("SD").getSelectedKey());
            },

            // addPress: function() {
            //     // Get all the form values
            //     var startDate = this.byId("startDatePicker1").getDateValue();
            //     var endDate = this.byId("endDatePicker1").getDateValue();
            //     var category = this.byId("consultancycategorys").getSelectedKey();
            //     var doctor = this.byId("DN").getValue();
            //     var patientId = this.byId("ID").getValue();
            //     var hospitalStore = this.byId("HospitalStore").getSelectedKey();
            //     var hospitalLocation = this.byId("Hospitallocation").getSelectedKey();
            //     var hospitalLocationOther = this.byId("HL").getValue();
            //     var billDate = this.byId("billdate").getDateValue();
            //     var billNo = this.byId("billno").getValue();
            //     var billAmount = this.byId("billamount").getValue();
            //     var discount = this.byId("discount").getValue();
            //     var requestedAmount = this.byId("requestamount").getValue();
            //     var review = this.byId("description").getValue();

            //     // Initialize an array to store the names of missing fields
            //     var missingFields = [];

            //     // Perform validation checks for missing fields
            //     if (!category) missingFields.push("Consultancy Category");
            //     if (!doctor) missingFields.push("Doctor's Name");
            //     if (!patientId) missingFields.push("Patient ID");
            //     if (!hospitalStore) missingFields.push("Hospital/Medical Store");
            //     if (!hospitalLocation) missingFields.push("Hospital Location");
            //     if (!billDate) missingFields.push("Bill Date");
            //     if (!billNo) missingFields.push("Bill No");
            //     if (!billAmount) missingFields.push("Bill Amount(Rs)");
            //     if (!discount) missingFields.push("Discount(Rs)");
            //     if (!requestedAmount) missingFields.push("Requested Amount");

            //     // Check if any fields are missing
            //     if (missingFields.length > 0) {
            //         // Display an error message with the list of missing fields
            //         var errorMessage = "Please fill in the following required fields:\n" + missingFields.join("\n");
            //         MessageBox.error(errorMessage);
            //         return;
            //     }

            //     // Call CAP service for additional validation
            //     var oModel = this.getView().getModel();
            //     oModel.callFunction("/validations", {
            //         method: "POST",
            //         urlParameters: {
            //             startDate: startDate.toISOString(),
            //             endDate: endDate.toISOString(),
            //             requestedAmount: requestedAmount
            //         },
            //         success: function(data) {
            //             // Handle success response
            //             if (!data.success) {
            //                 MessageBox.information(data.message);
            //             } else {
            //                 // If validation is successful, proceed to add details to the model
            //                 var details = {
            //                     category: category,
            //                     doctor: doctor,
            //                     patientId: patientId,
            //                     hospitalStore: hospitalStore,
            //                     hospitalLocation: hospitalLocation,
            //                     hospitalLocationOther: hospitalLocationOther,
            //                     billDate: billDate,
            //                     billNo: billNo,
            //                     billAmount: billAmount,
            //                     discount: discount,
            //                     requestedAmount: requestedAmount,
            //                     review: review,
            //                 };
            //                 var detailsModel = this.getView().getModel("claimModel");
            //                 var allDetails = detailsModel.getProperty("/allDetails") || [];
            //                 allDetails.push(details);
            //                 detailsModel.setProperty("/allDetails", allDetails);
            //                 this.clearForm();
            //                 this.updateTotalRequestedAmount();
            //             }
            //         }.bind(this), // Ensure 'this' refers to the correct context within the success callback
            //         error: function(error) {
            //             // Handle error response
            //             MessageBox.error("Error occurred while fetching data");
            //         }
            //     });
            // },

            addPress: function () {

                var startDate = this.byId("startDatePicker1").getDateValue();
                var endDate = this.byId("endDatePicker1").getDateValue();
                var oRequestedAmountInput = this.byId("requestamount");



                // Get all the form values
                var category = this.byId("consultancycategorys").getSelectedKey();
                var doctor = this.byId("DN").getValue();
                var patientId = this.byId("ID").getValue();
                var hospitalStore = this.byId("HospitalStore").getSelectedKey();
                var hospitalLocation = this.byId("Hospitallocation").getSelectedKey();
                var hospitalLocationOther = this.byId("HL").getValue();
                var billDate = this.byId("billdate").getDateValue();
                var billNo = this.byId("billno").getValue();
                var billAmount = this.byId("billamount").getValue();
                var discount = this.byId("discount").getValue();
                var requestedAmount = this.byId("requestamount").getValue();
                var review = this.byId("description").getValue();



                // Initialize an array to store the names of missing fields
                var missingFields = [];

                // Perform validation checks
                if (!category) missingFields.push("Consultancy Category");
                if (!doctor) missingFields.push("Doctor's Name");
                if (!patientId) missingFields.push("Patient ID");
                if (!hospitalStore) missingFields.push("Hospital/Medical Store");
                if (!hospitalLocation) missingFields.push("Hospital Location");
                if (!billDate) missingFields.push("Bill Date");
                if (!billNo) missingFields.push("Bill No");
                if (!billAmount) missingFields.push("Bill Amount(Rs)");
                if (!discount) missingFields.push("Discount(Rs)");
                if (!requestedAmount) missingFields.push("Requested Amount");

                // Check if any fields are missing
                if (missingFields.length > 0) {
                    // Display an error message with the list of missing fields
                    var errorMessage = "Please fill in the following required fields:\n" + missingFields.join("\n");
                    MessageBox.error(errorMessage);
                    return;
                }

                //switch case
                // var consType = this.byId("consultancycategorys").getValue();

                // switch (consType) {
                //     case "HOSPITAL ROOM CHARGES":
                //         var totalRoomCharges = validations(endDate, startDate);
                //         if (requestedAmount > totalRoomCharges) {
                //             MessageBox.information("Eligible limit exceeds by " + (requestedAmount - totalRoomCharges) + "\nEligible limit is " + totalRoomCharges)
                //             oRequestedAmountInput.setValue(totalRoomCharges);
                //             requestedAmount = totalRoomCharges;
                //         }
                //         break;
                //     default:
                //         console.info(consType)
                // }

                // Create an object to hold the details
                var details = {
                    category: category,
                    doctor: doctor,
                    patientId: patientId,
                    hospitalStore: hospitalStore,
                    hospitalLocation: hospitalLocation,
                    hospitalLocationOther: hospitalLocationOther,
                    billDate: billDate,
                    billNo: billNo,
                    billAmount: billAmount,
                    discount: discount,
                    requestedAmount: requestedAmount,
                    review: review,
                };

                // Add the details to the model 
                var detailsModel = this.getView().getModel("claimModel");

                if (!detailsModel) {
                    // If the model is not found, create it and set it to the view
                    detailsModel = new sap.ui.model.json.JSONModel();
                    this.getView().setModel(detailsModel, "claimModel");
                }

                // Get existing details or initialize an empty array
                var allDetails = detailsModel.getProperty("/allDetails") || [];

                // Add the new details
                allDetails.push(details);

                // Set the updated array back to the model
                detailsModel.setProperty("/allDetails", allDetails);

                // Clear the form
                this.clearForm();

                this.updateTotalRequestedAmount();

            },

            clearForm: function () {
                this.byId("consultancycategorys").setSelectedKey("");
                this.byId("DN").setValue("");
                this.byId("ID").setValue("");
                this.byId("HospitalStore").setSelectedItem(null);
                this.byId("Hospitallocation").setSelectedItem(null);
                this.byId("HL").setValue("");
                this.byId("billdate").setValue(null);
                this.byId("billno").setValue("");
                this.byId("billamount").setValue("");
                this.byId("discount").setValue("");
                this.byId("requestamount").setValue("");
                this.byId("description").setValue("");
            },

            deletePress: function () {
                var list = this.byId("detailsList");
                var selectedItems = list.getSelectedItems();

                // Check if any items are selected
                if (selectedItems.length === 0) {
                    MessageBox.error("Please select an item to delete.");
                    return;
                }

                var confirmationText = "Are you sure you want to delete the selected item?";
                MessageBox.confirm(confirmationText, {
                    title: "Confirmation",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.CANCEL,
                    onClose: function (action) {
                        if (action === MessageBox.Action.OK) {
                            // User clicked OK, proceed with deletion
                            this.deleteSelectedItems(selectedItems);
                        }
                    }.bind(this) // Ensure the proper 'this' context inside the onClose function
                });
            },

            deleteSelectedItems: function (selectedItems) {
                var detailsModel = this.getView().getModel("claimModel");
                var allDetails = detailsModel.getProperty("/allDetails");

                // Remove the selected items from the array
                selectedItems.forEach(function (item) {
                    var context = item.getBindingContext("claimModel");
                    var index = context.getPath().split("/").pop();
                    allDetails.splice(index, 1);
                });

                // Update the model with the modified array
                detailsModel.setProperty("/allDetails", allDetails);

                // Clear the selection in the list
                this.byId("detailsList").removeSelections();

                MessageBox.success("Selected items deleted successfully.");

                this.updateTotalRequestedAmount();
            },

            clonePress: function () {
                var list = this.byId("detailsList");
                var selectedItems = list.getSelectedItems();

                // Check if any items are selected
                if (selectedItems.length !== 1) {
                    MessageBox.error("Please select exactly one item to clone.");
                    return;
                }

                // Get the context of the selected item
                var selectedContext = selectedItems[0].getBindingContext("claimModel");

                // Get the data of the selected item from the model
                var selectedData = selectedContext.getProperty();

                // Clone the data (create a shallow copy)
                var clonedData = Object.assign({}, selectedData);

                // Set the form values directly with the cloned data
                this.setFormValues(clonedData);

                MessageBox.success("Item cloned successfully.");
                // Clear the selection in the list
                this.byId("detailsList").removeSelections();


            },


            setFormValues: function (details) {
                // Set form values directly
                this.byId("consultancycategorys").setSelectedKey(details.category);
                this.byId("DN").setValue(details.doctor);
                this.byId("ID").setValue(details.patientId);
                this.byId("HospitalStore").setSelectedKey(details.hospitalStore);
                this.byId("Hospitallocation").setSelectedKey(details.hospitalLocation);
                this.byId("HL").setValue(details.hospitalLocationOther);
                this.byId("billdate").setValue(new Date(details.billDate));
                this.byId("billno").setValue(details.billNo);
                this.byId("billamount").setValue(details.billAmount);
                this.byId("discount").setValue(details.discount);
                this.byId("requestamount").setValue(details.requestedAmount);
                this.byId("description").setValue(details.review);
            },

            EditPress: function () {
                var list = this.byId("detailsList");
                var selectedItems = list.getSelectedItems();

                if (selectedItems.length !== 1) {
                    MessageBox.error("Please select exactly one item to edit.");
                    return;
                }

                // Get the context of the selected item
                var selectedContext = selectedItems[0].getBindingContext("claimModel");

                // Get the data of the selected item from the model
                var selectedData = selectedContext.getProperty();

                // Set the form values directly with the selected data
                this.setFormValues(selectedData);

                // Show the Update and Cancel buttons, hide the Add, Delete, Edit, Clone buttons
                this.toggleButtonsVisibility(false, true, true, false, false);

                this.updateTotalRequestedAmount();
            },


            UpdatePress: function () {
                var list = this.byId("detailsList");
                var selectedItems = list.getSelectedItems();

                if (selectedItems.length !== 1) {
                    MessageBox.error("Please select exactly one item to update.");
                    return;
                }

                // Get the selected item's binding context
                var selectedContext = selectedItems[0].getBindingContext("claimModel");

                if (!selectedContext) {
                    MessageBox.error("No data to update.");
                    return;
                }

                // Get the data of the selected item from the model
                var selectedData = selectedContext.getProperty();

                // Assuming you have form fields that represent the properties you want to update
                var updatedData = {
                    category: this.byId("consultancycategorys").getSelectedKey(),
                    doctor: this.byId("DN").getValue(),
                    patientId: this.byId("ID").getValue(),
                    hospitalStore: this.byId("HospitalStore").getSelectedKey(),
                    hospitalLocation: this.byId("Hospitallocation").getSelectedKey(),
                    hospitalLocationOther: this.byId("HL").getValue(),
                    billDate: this.byId("billdate").getDateValue(),
                    billNo: this.byId("billno").getValue(),
                    billAmount: this.byId("billamount").getValue(),
                    discount: this.byId("discount").getValue(),
                    requestedAmount: this.byId("requestamount").getValue(),
                    review: this.byId("description").getValue()

                };

                // Update the existing item with the new data
                Object.assign(selectedData, updatedData);

                // Example: Update the existing item in the model
                var detailsModel = this.getView().getModel("claimModel");
                var allDetails = detailsModel.getProperty("/allDetails");
                var selectedIndex = selectedContext.getPath().split("/").pop();
                allDetails[selectedIndex] = selectedData;
                detailsModel.setProperty("/allDetails", allDetails);

                // Enable form fields after updating
                this.enableFormFields(true);

                // Show the Add, Delete, Edit, Clone buttons, hide the Update and Cancel buttons
                this.toggleButtonsVisibility(true, false, false, true, true);

                // Refresh the list binding to reflect the updated data
                this.byId("detailsList").getBinding("items").refresh();

                MessageBox.success("Data updated successfully.");
                this.clearForm();
                this.byId("detailsList").removeSelections();

                this.updateTotalRequestedAmount();
            },

            CancelPress: function () {
                // Disable form fields after canceling
                this.setFormValues(false);

                // Clear the selection in the list
                this.byId("detailsList").removeSelections();

                // Show the Add, Delete, Edit, Clone buttons, hide the Update and Cancel buttons
                this.toggleButtonsVisibility(true, false, false, true, true);

                MessageBox.success("Editing canceled.");
            },

            enableFormFields: function (enable) {
                // Enable or disable form fields based on the 'enable' parameter
                var formFields = [
                    "consultancycategorys", "DN", "ID", "HospitalStore", "Hospitallocation",
                    "HL", "billdate", "billno", "billamount", "discount", "requestamount", "description"
                ];

                formFields.forEach(function (field) {
                    this.byId(field).setEnabled(enable);
                }.bind(this));
            },

            toggleButtonsVisibility: function (add, update, cancel, edit, clone) {
                // Toggle visibility of buttons
                this.byId("button").setVisible(add);
                this.byId("button2").setVisible(!update);
                this.byId("button3").setVisible(edit);
                this.byId("buttonUpdate").setVisible(update);
                this.byId("buttonCancel").setVisible(cancel);
                this.byId("button4").setVisible(clone);
            },



            handleDiscountChange: function (oEvent) {
                var oDiscountInput = oEvent.getSource();
                var oBillAmountInput = this.byId("billamount");
                var oRequestedAmountInput = this.byId("requestamount");
                var startDate = this.byId("startDatePicker1").getDateValue();
                var endDate = this.byId("endDatePicker1").getDateValue();


                var sDiscount = oDiscountInput.getValue();
                var sBillAmount = oBillAmountInput.getValue();

                // Check if both Discount and Bill Amount have values
                if (sDiscount && sBillAmount) {
                    var fDiscount = parseFloat(sDiscount);
                    var fBillAmount = parseFloat(sBillAmount);

                    // Calculate Requested Amount: Bill Amount - Discount
                    var fRequestedAmount = fBillAmount - fDiscount;
                    // Set the calculated value to the Requested Amount field
                    oRequestedAmountInput.setValue(fRequestedAmount.toFixed(2));




                } else {
                    // Clear the Requested Amount field if either Discount or Bill Amount is empty
                    oRequestedAmountInput.setValue("");
                }
            },
            onBillDateChange: function () {
                var oBillDatePicker = this.byId("billdate");
                var oStartDatePicker = this.byId("startDatePicker1");
                var oEndDatePicker = this.byId("endDatePicker1");

                var oBillDate = oBillDatePicker.getDateValue();
                var oStartDate = oStartDatePicker.getDateValue();
                var oEndDate = oEndDatePicker.getDateValue();

                // Check if Bill Date is between Claim Start Date and Claim End Date
                if (oStartDate && oEndDate && oBillDate) {
                    if (oBillDate < oStartDate || oBillDate > oEndDate) {
                        // Show error message
                        MessageBox.error("Please select Bill Date between Claim Start Date and Claim End Date");
                        // You can also set the value of the Bill Date to null or handle it as needed
                        oBillDatePicker.setDateValue(null);
                    }
                }
            },

            updateTotalRequestedAmount: function () {
                var totalRequestedAmount = 0;
                var items = this.byId("detailsList").getItems();
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var requestedAmount = parseInt(item.getBindingContext("claimModel").getProperty("requestedAmount"));
                    totalRequestedAmount += requestedAmount;
                }

                // Update the text of the label with the total requested amount
                this.byId("totalRequestedAmountLabel").setText("Total Requested Amount: " + totalRequestedAmount);
                // this.byId("totalRequestedAmount").setText("Total Requested Amount: " + totalRequestedAmount);
                this.byId("totalRequestedAmountValue").setText(totalRequestedAmount);
            },

            validateOnlyCharacters: function (oEvent) {
                var input = oEvent.getSource();
                var value = input.getValue().trim();
                var pattern = /^[A-Za-z\s]*$/; // Regular expression to match only characters and whitespace
                var isValid = pattern.test(value);
                input.setValueState(isValid ? "None" : "Error");
                input.setValueStateText(isValid ? "" : "Only characters are allowed");
            },

            validateOnlyNumbers: function (oEvent) {
                var input = oEvent.getSource();
                var value = input.getValue().trim();
                var pattern = /^[0-9]+$/; // Regular expression to match only numbers
                var isValid = pattern.test(value);
                input.setValueState(isValid ? "None" : "Error");
                input.setValueStateText(isValid ? "" : "Only numbers are allowed");
            },

            onHospitalLocationChange: function (oEvent) {
                var selectedKey = oEvent.getSource().getSelectedKey();

                if (selectedKey === "OTHER") {
                    sap.m.MessageBox.information("Please enter Hospital Location (If Other)");
                }
            },

            onTreatmentChange: function (oEvent) {
                var selectedKey = oEvent.getSource().getSelectedKey();

                if (selectedKey === "OTHER") {
                    sap.m.MessageBox.information(" Please enter Treatment For (If Other)");
                }
            },


            // handleSubmit: function () {
            //     var that = this;
            //     var AD = this.getView().getModel("claimModel").getData();
            //     let allDetails = AD.allDetails;

            //     // Iterate over each detail item and send the claim individually
            //     allDetails.forEach(function (detail) {
            //         // Construct claim object for each detail
            //         var claimid = parseInt(new Date().getTime() / 1000);
            //         var person = 989898;
            //         var claimType = that.byId("claimt").getText();
            //         var claimStartDate = new Date(that.byId("claimsd").getText()).toISOString();
            //         var claimEndDate = new Date(that.byId("claimed").getText()).toISOString();
            //         var treatmentFor = that.byId("claimtf").getText();
            //         var treatmentForOther = that.byId("claimtfo").getText();
            //         var selectedDependent = that.byId("claimsde").getText();
            //         var requestamount = parseFloat(that.byId("totalRequestedAmountValue").getText());
            //         var consultancyCategory = detail.category;
            //         var hospitalStore = detail.hospitalStore;
            //         var billDate = detail.billDate.toISOString();
            //         var billNo = parseInt(detail.billNo);
            //         var billAmount = parseFloat(detail.billAmount);

            //         // Create a new claim object for each detail
            //         var newClaim = {
            //             CLAIM_ID: claimid,
            //             PERSON_NUMBER: person,
            //             CLAIM_TYPE: claimType,
            //             CLAIM_START_DATE: claimStartDate,
            //             CLAIM_END_DATE: claimEndDate,
            //             TREATMENT_FOR: treatmentFor,
            //             TREATMENT_FOR_IF_OTHERS: treatmentForOther,
            //             SELECT_DEPENDENTS: selectedDependent,
            //             REQUESTED_AMOUNT: requestamount,
            //             CONSULTANCY_CATEGORY: consultancyCategory,
            //             MEDICAL_STORE: hospitalStore,
            //             BILL_DATE: billDate,
            //             BILL_NO: billNo,
            //             BILL_AMOUNT: billAmount
            //         };

            //         // Send the claim data to the server using Fetch API
            //         fetch("/odata/v4/my/CLAIM_DETAILS", {
            //             method: "POST",
            //             headers: {
            //                 "Content-Type": "application/json",
            //             },
            //             body: JSON.stringify(newClaim), // Send the individual claim
            //         })
            //             .then(result => {
            //                 sap.m.MessageBox.success(
            //                     "Claim data saved successfully!",
            //                     {
            //                         onClose: function () {
            //                             // Navigate to "Login" after the success message is closed
            //                             var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            //                             oRouter.navTo("Login");
            //                             window.location.reload();
            //                         },
            //                     }
            //                 );
            //             })
            //             .catch(error => {
            //                 sap.m.MessageBox.error("Error while saving claim data");
            //             });
            //     });
            // }
            handleSubmit: function () {
                var that = this;
                var AD = this.getView().getModel("claimModel").getData();
                var allDetails = AD.allDetails;
                var batchModel = this.getView().getModel("MainModel");
                batchModel.setUseBatch(true);

                // Create the boundary for the multipart request
                // var boundary = "batch_01869434-0004";
                // var changesetBoundary = "changeset_01869434-0004-0001";

                // Create an array to hold all batch operations
                var batchOperations = [], 
                mParameters = {"groupId": "mybatch1","changeSetId": "mybatch1"};

                // Add individual POST request for CLAIM_DETAILS to batch operations
                for (var i = 0; i < allDetails.length; i++) {
                    var detail = allDetails[i];
                    var newClaim = {
                        "CLAIM_ID": parseInt(new Date().getTime() / 1000), // No need to parse as integer
                        "PERSON_NUMBER": 898989,
                        "CLAIM_TYPE": that.byId("claimt").getText(),
                        "CLAIM_START_DATE": new Date(that.byId("claimsd").getText()).toISOString(),
                        "CLAIM_END_DATE": new Date(that.byId("claimed").getText()).toISOString(),
                        "TREATMENT_FOR": that.byId("claimtf").getText(),
                        "TREATMENT_FOR_IF_OTHERS": that.byId("claimtfo").getText(),
                        "SELECT_DEPENDENTS": that.byId("claimsde").getText(),
                        "REQUESTED_AMOUNT": parseFloat(that.byId("totalRequestedAmountValue").getText()),
                        "CONSULTANCY_CATEGORY": detail.category,
                        "MEDICAL_STORE": detail.hospitalStore,
                        "BILL_DATE": new Date(detail.billDate).toISOString(),
                        "BILL_NO": parseInt(detail.billNo),
                        "BILL_AMOUNT": parseFloat(detail.billAmount)
                    };
                    batchOperations.push(newClaim);

                    //     // Add individual POST request to the batch operations array
                    //     var individualPostRequest = [
                    //         "--" + changesetBoundary,
                    //         "Content-Type: application/http",
                    //         "Content-Transfer-Encoding: binary",
                    //         "", // Two newline characters to separate headers from JSON data
                    //         "POST CLAIM_DETAILS HTTP/1.1", // Start of individual request headers
                    //         "Content-Type: application/json;odata.metadata=minimal",
                    //         "Content-Length: " + JSON.stringify(newClaim).length,
                    //         "", // Extra newline character to separate headers from JSON data
                    //         JSON.stringify(newClaim)
                    //     ].join("\r\n");

                    //     batchOperations.push(individualPostRequest);
                    // }
                    // Calculate Content-Length dynamically for each request
                    //var payload = JSON.stringify(newClaim);
                    //var contentLength = payload.length;

                    // Add individual POST request to the batch operations array
                    // var individualPostRequest = [
                    //     "--" + changesetBoundary,
                    //     "Content-Type: application/http",
                    //     "Content-Transfer-Encoding: binary",
                    //     "", // Two newline characters to separate headers from JSON data
                    //     "POST CLAIM_DETAILS HTTP/1.1", // Start of individual request headers
                    //     "Content-Type: application/json;odata.metadata=minimal",
                    //     "Content-Length: " + contentLength, // Update Content-Length dynamically
                    //     "", // Extra newline character to separate headers from JSON data
                    //     payload
                    // ].join("\r\n");

                    //batchOperations.push(individualPostRequest);

                    // var batchRequest = [
                    //     "--" + boundary,
                    //     "Content-Type: multipart/mixed; boundary=" + changesetBoundary,
                    //     ""
                    // ].concat(batchOperations, "--" + changesetBoundary + "--", "--" + boundary + "--").join("\r\n");

                    //added by Vignesh
                    batchModel.create("CLAIM_DETAILS",newClaim,mParameters);

                }
                batchModel.submitChanges({
                    groupId:"mybatch1",
                    success: function(oData){console.log(oData),alert("SUccess")},
                    error: function(oErr, sResp){console.error(oErr)}
                })
                
                    //added by Vignesh

                    // Send the batch request
                    // fetch("./odata/v4/my/CLAIM_DETAILS", {
                    //     method: "POST",
                    //     headers: {
                    //         "Content-Type": "multipart/mixed; boundary=" + boundary
                    //     },
                    //     body: batchRequest
                    // })
                    //     .then(response => {
                    //         if (!response.ok) {
                    //             throw new Error("Server responded with error status " + response.status);
                    //         }
                    //         return response.text();
                    //     })
                    //     .then(responseText => {
                    //         // Process responseText as needed
                    //         console.log("Response from server:", responseText);
                    //         sap.m.MessageBox.success(
                    //             "Claim data saved successfully!", {
                    //             onClose: function () {
                    //                 // Navigate to "Login" after the success message is closed
                    //                 var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    //                 oRouter.navTo("Login");
                    //                 window.location.reload();
                    //             },
                    //         });
                    //     })
                    //     .catch(error => {
                    //         console.error("Error while saving claim data:", error);
                    //         sap.m.MessageBox.error("Error while saving claim data: " + error.message);
                    //     });
                
            },

                //Upload start from here//
                onBeforeInitiatingItemUpload: function(oEvent) {
                    var oUploadSetTableInstance = this.byId("UploadSetTable");
                    var oItem = oEvent.getParameter("item");

                    /** Demonstration of Updating the Document without file with actual file.
                     * Note:- This is just demonstration of idea how the feature can be acheived by setting the hederfield data of empty documentId on the UploadSetwithTableItem instance.
                     * Please check mockserver.js for the logic to simulate how the empty document is updated with file selected for upload using the existing document id.
                     */
                    var oSelectedItems = oUploadSetTableInstance.getSelectedItems();
                    var oSelectedItemForUpdate = oSelectedItems.length === 1 ? oSelectedItems[0] : null;
                    if (oSelectedItemForUpdate && oSelectedItemForUpdate.getFileName() === "-") {
                        if (oSelectedItemForUpdate) {
                            var oContext = oSelectedItemForUpdate.getBindingContext();
                            var data = oContext && oContext.getObject ? oContext.getObject() : {};
                            oItem.addHeaderField(new CoreItem(
                                {
                                    key: "existingDocumentID",
                                    text: data ? data.id : ""
                                }
                            ));
                        }
                    }
                },
                // UploadCompleted event handler
                onUploadCompleted: function(oEvent) {
                    var oModel = this.getView().getModel();
                    var iResponseStatus = oEvent.getParameter("status");

                    // check for upload is sucess
                    if (iResponseStatus === 201) {
                        oModel.refresh(true);
                        setTimeout(function () {
                            MessageToast.show("Document Added");
                        }, 1000);
                    }
                    // This code block is only for demonstration purpose to simulate XHR requests, hence restoring the server to not fake the xhr requests.
                    // this.oMockServer.restore();
                },




            });
    });
