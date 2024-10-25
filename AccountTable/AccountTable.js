import { LightningElement, track, wire } from 'lwc';
import getAccountAndContactDetails from '@salesforce/apex/AccountContactController.getAccountAndContactDetails';
import updateRecords from '@salesforce/apex/AccountContactController.updateRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomAccountContactTable extends LightningElement {
    @track data = []; // Data fetched from Apex
    @track editedData = {}; // To track changes made by the user

    // Fetch data from Apex
    @wire(getAccountAndContactDetails)
    wiredData({ error, data }) {
        if (data) {
            this.data = this.processData(data);
        } else if (error) {
            console.error('Error fetching data', error);
        }
    }

    // Process the data for the table
    processData(data) {
        let tableData = [];
        data.forEach(wrapper => {
            wrapper.contacts.forEach(contact => {
                tableData.push({
                    accountId: wrapper.account.Id,
                    accountName: wrapper.account.Name,
                    accountPhone: wrapper.account.Phone,
                    contactId: contact.Id,
                    contactName: contact.Name,
                    contactEmail: contact.Email,
                    contactPhone: contact.Phone
                });
            });
        });
        return tableData;
    }

    // Handle input change in the table
    handleInputChange(event) {
        const field = event.target.name;
        const recordId = event.target.dataset.id;
        if (!this.editedData[recordId]) {
            this.editedData[recordId] = {};
        }
        this.editedData[recordId][field] = event.target.value;
    }

    // Handle Save and send updates to Apex
    handleSave() {
        const updatedData = this.prepareDataForUpdate();
        console.log(JSON.stringify(updatedData));

        // Call Apex to update records
        updateRecords({ wrapperData: updatedData })
            .then(() => {
                this.showToast('Success', 'Records updated successfully!', 'success');
                this.editedData = {}; // Clear edited data
            })
            .catch(error => {
                console.error('Error updating records', error);
                this.showToast('Error', 'Failed to update records', 'error');
            });
    }

    // Prepare data for Apex call based on edits made
    prepareDataForUpdate() {
        const updatedWrapperData = [];
        this.data.forEach(record => {
            const account = {
                Id: record.accountId,
                Name: this.editedData[record.accountId]?.accountName || record.accountName,
                Phone: this.editedData[record.accountId]?.accountPhone || record.accountPhone
            };
            const contact = {
                Id: record.contactId,
                Name: this.editedData[record.contactId]?.contactName || record.contactName,
                Email: this.editedData[record.contactId]?.contactEmail || record.contactEmail,
                Phone: this.editedData[record.contactId]?.contactPhone || record.contactPhone
            };
            let existingWrapper =updatedWrapperData.find(wrapper => wrapper.account.Id === record.accountId);
            if(existingWrapper){
                existingWrapper.contacts.push(contact);
            }else{
            updatedWrapperData.push({ account: account, contacts: [contact] });
        }
    });
        return updatedWrapperData;
    }

    // Show toast notifications
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}