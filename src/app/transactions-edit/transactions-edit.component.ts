import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/models/Category';
import { RecurringTransaction } from 'src/models/RecurringTransaction';
import { Transaction } from 'src/models/Transaction';
import { DatabaseServiceService } from '../services/database-service.service';
import * as datefns from 'date-fns';

@Component({
  selector: 'app-transactions-edit',
  templateUrl: './transactions-edit.component.html',
  styleUrls: ['./transactions-edit.component.css']
})
export class TransactionsEditComponent implements OnInit {
  private isRecurring: boolean = false;
  isExpense: boolean = null;
  showRecurring: boolean = false;
  type: number = null;
  categories: Category[] = [];
  firstCategory: number = null;
  transactionName: string = "";
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
    private router: Router,
    private zone: NgZone) { }

  ngOnInit(): void {
    this.isRecurring = false;
    if (this.router.url.includes("recurring")) {
      this.loadRecurring();
      this.isRecurring = true;
    }
    else this.load();
  }

  loadRecurring() {
    this.isExpense = null;
    let id = Number(this.activatedRoute.snapshot.paramMap.get("recurringTransactionId"));
    this.database.selectRecurringTransaction(id).subscribe(async (data: RecurringTransaction) => {
      if (data.categoryId == undefined)
        return this.router.navigate(["transactions"]);
      if (data.recurringTransactionNote != "") this.transactionName = data.recurringTransactionNote;
      this.type = data.typeId;
      this.transactionForm.get("_transactionType").setValue(this.type);
      if (this.type == 2) {
        $("#transcationExpense").click();
        this.isExpense = true;
      } else {
        $("#transactionIncome").click();
        this.isExpense = false;
      }
      this.transactionForm.get("_transactionDate").setValue(data.recurringTransactionDate);
      this.transactionForm.get("_transactionAmount").setValue(data.recurringTransactionAmount);
      this.transactionForm.get("_transactionNote").setValue(data.recurringTransactionNote);
      $("#btnRecurring").click();
      this.transactionForm.get("_endDate").setValue(data.endDate);

      this.categories = [];
      this.database.selectAllCategories([this.type]).subscribe((secondary: Category[]) => {
        for (let i = 0; i < secondary.length; i++) {
          const category: Category = secondary[i];
          if (i == 0)
            this.firstCategory = category.categoryId;
          this.categories.push(category);
        }
        if (secondary.length > 0) {
          this.transactionForm.get("_transactionCategory").setValue(data.categoryId);
        }
      })
    })
  }

  load() {
    this.isExpense = null;
    let id = Number(this.activatedRoute.snapshot.paramMap.get("transactionId"));
    this.database.selectTransaction(id).subscribe(async (data: Transaction) => {
      console.log(data);
      if (data.categoryId == undefined)
        return this.router.navigate(["transactions"]);
      // type stuff
      this.type = data.typeId;
      this.transactionForm.get("_transactionType").setValue(this.type);
      if (this.type == 2) {
        $("#transcationExpense").click();
        this.isExpense = true;
      } else {
        $("#transactionIncome").click();
        this.isExpense = false;
      }

      this.transactionForm.get("_transactionDate").setValue(data.transactionDate);
      this.transactionForm.get("_transactionAmount").setValue(data.transactionAmount);
      this.transactionForm.get("_transactionNote").setValue(data.transactionNote);

      this.categories = [];
      this.database.selectAllCategories([this.type]).subscribe((secondary: Category[]) => {
        for (let i = 0; i < secondary.length; i++) {
          const category: Category = secondary[i];
          if (i == 0)
            this.firstCategory = category.categoryId;
          this.categories.push(category);
        }
        if (secondary.length > 0) {
          this.transactionForm.get("_transactionCategory").setValue(data.categoryId);
        }
      })
    })
  }

  async changeRecurring() {
    this.showRecurring = !this.showRecurring;
  }

  async changeType(type: number) {
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
      if (data.length > 0) {
        this.transactionForm.get("_transactionCategory").setValue(data[0].categoryId);
      }
    })
  }

  btnSubmit_click() {
    let typeId: number;
    if (this.isExpense === true) typeId = 2;
    else typeId = 1;

    if (this.isRecurring) {
      let recurringTransaction: RecurringTransaction = new RecurringTransaction(this.transactionForm.get("_transactionCategory").value,
        typeId, this.transactionForm.get("_transactionDate").value,
        this.transactionForm.get("_transactionAmount").value, this.transactionForm.get("_transactionNote").value,
        this.transactionForm.get("_endDate").value)
      recurringTransaction.recurringTransactionId = Number(this.activatedRoute.snapshot.paramMap.get("recurringTransactionId"));
      if (!this.transactionForm.get("_recurring").value) {
        this.validateRecurring(recurringTransaction, true);
      } else {
        this.validateRecurring(recurringTransaction, false);
      }
    } else {
      let transaction: Transaction = new Transaction(this.transactionForm.get("_transactionCategory").value,
        typeId, this.transactionForm.get("_transactionDate").value,
        this.transactionForm.get("_transactionAmount").value, this.transactionForm.get("_transactionNote").value)
      this.validateNormal(transaction, this.transactionForm.get("_recurring").value)
    }

  }

  validateNormal(transaction, changeToRecurring: boolean) {
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
      } else if (transaction.transactionAmount == "") transaction.transactionAmount = 0;
      else if (isNaN(transaction.transactionAmount)) document.getElementById("_transactionAmountError").innerText = "Amount should be a number";
      else document.getElementById("_transactionAmountError").innerText = "";

      transaction.transactionId = Number(this.activatedRoute.snapshot.paramMap.get("transactionId"))
      if (errors == 0 && !changeToRecurring) {
        this.database.updateTransaction(transaction, () => {
          alert("successfully updated transaction!")
        })
      } else if (changeToRecurring) {
        if (this.transactionForm.get("_endDate").value != "") {

          if (datefns.parseISO(this.transactionForm.get("_endDate").value) < datefns.parseISO(this.transactionForm.get("_transactionDate").value)) {
            document.getElementById("_endDateError").innerText = "End date cannot be before start date";
            errors++;
          } else document.getElementById("_endDateError").innerText = ""
        }

        if (errors == 0) {
          this.database.deleteTransaction(Number(this.activatedRoute.snapshot.paramMap.get("transactionId")),
            () => {
              console.log("successfully deleted transactionn")
            });
          let recurringTransaction = new RecurringTransaction(this.transactionForm.get("_transactionCategory").value,
          this.type, this.transactionForm.get("_transactionDate").value,
          this.transactionForm.get("_transactionAmount").value, this.transactionForm.get("_transactionNote").value,
          this.transactionForm.get("_endDate").value);

          this.database.insertRecurringTransaction(recurringTransaction, () => {
            alert("successfully changed regular transaction to recurring");
            this.zone.run(() => {
              this.router.navigate(["transactions"]);
            });
          });
        }
      }
    })
  }

  validateRecurring(recurringTransaction, changeToNormal: boolean) {
    let errors: number = 0

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
      } else if (recurringTransaction.recurringTransactionAmount == "") {
        recurringTransaction.recurringTransactionAmount = 0;
        errors++;
      }
      else if (isNaN(recurringTransaction.recurringTransactionAmount)) {
        document.getElementById("_transactionAmountError").innerText = "Amount should be a number";
        errors++;
      }
      else document.getElementById("_transactionAmountError").innerText = "";

      if (errors == 0 && changeToNormal) {
        console.log("should've deleted and reinserted. (comment out)");
        let id = Number(this.activatedRoute.snapshot.paramMap.get("recurringTransactionId"));

        this.database.deleteRecurringTransaction(id, () => {
          console.info("recurring deleted successfully")
        })

        this.database.insertTransaction(new Transaction(this.transactionForm.get("_transactionCategory").value,
          this.type, this.transactionForm.get("_transactionDate").value,
          this.transactionForm.get("_transactionAmount").value, this.transactionForm.get("_transactionNote").value),
          () => {
            alert("successfully replaced recurring with a regular one")
            this.zone.run(() => {
              this.router.navigate(["transactions"]);
            });
          });
      } else if (!changeToNormal) {
        if (this.transactionForm.get("_endDate").value != "") {

          if (datefns.parseISO(this.transactionForm.get("_endDate").value) < datefns.parseISO(this.transactionForm.get("_transactionDate").value)) {
            document.getElementById("_endDateError").innerText = "End date cannot be before start date";
            errors++;
          } else document.getElementById("_endDateError").innerText = ""
        }

        if (errors == 0) {

          this.database.updateRecurringTransaction(recurringTransaction,
            () => {
              alert("successfully updated recurring transaction!")
            })
        }
      }
    })
  }


}
