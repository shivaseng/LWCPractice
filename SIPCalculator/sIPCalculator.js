import { LightningElement } from 'lwc';

export default class SIPCalculator extends LightningElement {
    monthlyInvestment = '';
    annualIntrestRate= '';
    years = '' ;
    result = '' ;
    haldleInput(event){
        const {name , value} =event.target;
        this[name] = value;
    }
    handleCalculation(event){
        const action =event.target.label;
        if(action === 'Calculate SIP'){
            if(this.isValidInput()){
                this.CalculateSIP();
                        }
                        else {
                            this.result = 'Invalid Input . Please check your values.';

                        }
        }
        else if (action === 'Reset'){
            this.resetFields();
        }
        console.log(this.result);
    }
    CalculateSIP(){
        const P = parseFloat(this.monthlyInvestment);
        const annualRate = parseFloat(this.annualIntrestRate) / 100;
        const n = parseFloat(this.years) * 12;
        const r = annualRate / 12;
        const futureValue = P * (((Math.pow(1 + r, n)-1) / r) * (1 + r));
        this. result = futureValue.toFixed(2);
    } 
    isValidInput(){
        return this.monthlyInvestment > 0 && this.annualIntrestRate > 0 && this.years > 0;
    }
    resetFields(){
        this.monthlyInvestment = '';
        this.annualIntrestRate = '';
        this.years = '';
        this.result = '';
        this.template.querySelector('form').reset();
    }
}