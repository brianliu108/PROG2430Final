import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseServiceService } from '../services/database-service.service';
import { Category } from 'src/models/Category';
import { Transaction } from 'src/models/Transaction';
import { RecurringTransaction } from 'src/models/RecurringTransaction';
import { now } from 'jquery';

@Component({
  selector: 'app-transactions-add',
  templateUrl: './transactions-add.component.html',
  styleUrls: ['./transactions-add.component.css']
})
export class TransactionsAddComponent implements OnInit {
  isExpense: boolean = null;
  showRecurring: boolean = false;
  type: number = null;
  categories: Category[] = [];
  firstCategory: number = null;
  backLink: string;
  forwardLink: string;
  transactionForm = this.builder.group({
    _transactionType: ['', []],
    _transactionCategory: ['', []],
    _transactionDate: ['', []],
    _transactionAmount: ['', []],
    _transactionNote: ['', []],
    _recurring: ['', []],
    _endDate: ['', []],
  });

  constructor(private builder: FormBuilder,
    private database: DatabaseServiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {    
    this.isExpense = null;
    this.refreshForm();
  }

  refreshForm() {
    let type: string = this.activatedRoute.snapshot.paramMap.get("type");
    if (type.toLowerCase() == "expense") {
      this.isExpense = true;
      this.transactionForm.get("_transactionType").setValue(2);
      $("#transcationExpense").click();
      console.log(this.transactionForm.get("_transactionType").value)
      this.changeType(2);
    } else if (type.toLowerCase() == "income") {
      this.isExpense = false;
      this.transactionForm.get("_transactionType").setValue(1);
      $("#transactionIncome").click();
      console.log(this.transactionForm.get("_transactionType").value)
      this.changeType(1);
    }  
  }

  changeRecurring() {
    this.showRecurring = !this.showRecurring;
    // console.log(this.transactionForm.get("_transactionType").value);
  }

  changeType(type: number) {    
    if (type == 2) this.isExpense = true;
    else this.isExpense = false;

    if (this.type == type)
      return;
    this.type = type;
    
    this.categories = [];
    this.database.selectAllCategories([this.type]).subscribe((data: Category[]) => {
      for (let i = 0; i < data.length; i++) {
        const category: Category = data[i];
        if (i == 0)
          this.firstCategory = category.categoryId;
        this.categories.push(category);
      }

      if(data.length > 0) {
        console.log(data[0].categoryId)
        // $("#category" + data[0].categoryId).attr("selected", "selected");
        this.transactionForm.get("_transactionCategory").setValue(data[0].categoryId);
      }
    })
  }

  btnSubmit_click() {
    let typeId: number;
    if (this.isExpense == true) typeId = 2;
    else if (this.isExpense === false) typeId = 1;
    else typeId = null;

    if (!this.transactionForm.get("_recurring").value) {
      let transaction: Transaction = new Transaction(this.transactionForm.get("_transactionCategory").value,
        typeId, this.transactionForm.get("_transactionDate").value,
        this.transactionForm.get("_transactionAmount").value, this.transactionForm.get("_transactionNote").value)

      this.validateTransaction(transaction);
    } else {
      let recurringTransaction = new RecurringTransaction(this.transactionForm.get("_transactionCategory").value,
      typeId, this.transactionForm.get("_transactionDate").value,
      this.transactionForm.get("_transactionAmount").value,this.transactionForm.get("_transactionNote").value,
      this.transactionForm.get("_endDate").value);

      this.validateRecurringTransaction(recurringTransaction);
    }
  }

  validateTransaction(transaction) {
    let errors: number = 0
    console.log(transaction);
    if (transaction.typeId == null) {
      document.getElementById("_transactionTypeError").innerText = "Type is required";
      errors++;
    } 
    else document.getElementById("_transactionTypeError").innerText = ""

    this.database.selectCategory(transaction.categoryId).subscribe((data: Category) => {
      if (data.categoryId == undefined) {
        document.getElementById("_transactionCategoryError").innerText = "Category is required"
        errors++;
      } else {
        document.getElementById("_transactionCategoryError").innerText = ""        
      }

      if (isNaN(new Date(transaction.transactionDate).getTime())) {
        document.getElementById("_transactionDateError").innerText = "Date is required";
        errors++;
      } else {
        document.getElementById("_transactionDateError").innerText = "";
      }
      
      if (transaction.transactionAmount < 0) {
        document.getElementById("_transactionAmountError").innerText = "Amount should be greater than or equal to 0";
        errors++
      } else if(transaction.transactionAmount == "") transaction.transactionAmount = 0;
      else if(isNaN(transaction.transactionAmount)) document.getElementById("_transactionAmountError").innerText = "Amount should be a number";
      else document.getElementById("_transactionAmountError").innerText = "";

      if(errors == 0) {
        this.database.insertTransaction(transaction, () => {
          alert("Successfully inserted transaction");
        })
      }      
    })
  }

  validateRecurringTransaction(recurringTransaction) {
    let errors: number = 0
    console.log(recurringTransaction);
    
    if (recurringTransaction.typeId == null) {
      document.getElementById("_transactionTypeError").innerText = "Type is required";
      errors++;
    } 
    else document.getElementById("_transactionTypeError").innerText = ""

    this.database.selectCategory(recurringTransaction.categoryId).subscribe((data: Category) => {
      if (data.categoryId == undefined) {
        document.getElementById("_transactionCategoryError").innerText = "Category is required"
        errors++;
      } else {
        document.getElementById("_transactionCategoryError").innerText = ""        
      }

      if (isNaN(new Date(recurringTransaction.recurringTransactionDate).getTime())) {
        document.getElementById("_transactionDateError").innerText = "Date is required";
        errors++;
      } else {
        document.getElementById("_transactionDateError").innerText = "";
      }
      
      if (recurringTransaction.recurringTransactionAmount < 0) {
        document.getElementById("_transactionAmountError").innerText = "Amount should be greater than or equal to 0";
        errors++
      } else if(recurringTransaction.recurringTransactionAmount == "") {
        recurringTransaction.recurringTransactionAmount = 0;
        errors++;
      } 
      else if(isNaN(recurringTransaction.recurringTransactionAmount)) {
        document.getElementById("_transactionAmountError").innerText = "Amount should be a number";
        errors++;
      } 
      else document.getElementById("_transactionAmountError").innerText = "";

      if(errors == 0) {
        this.database.insertRecurringTransaction(recurringTransaction, () => {
          alert("Successfully inserted recurringTransaction");
        })
      }      
    })
  }
}
