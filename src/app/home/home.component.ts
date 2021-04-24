import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as $ from "jquery";
import * as datefns from 'date-fns'
import { Transaction } from 'src/models/Transaction';
import { RecurringTransaction } from 'src/models/RecurringTransaction';
import { DatabaseServiceService } from '../services/database-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  offset: number = 0;
  dateMonth: string;
  allTransactions = [];
  startDate: Date;
  endDate: Date;
  workingDate: Date;
  totalIncome: number = 0;
  expenses: Array<any> = [];
  totalExpense: number = 0;
  balance: number = 0;
  sortedExpenses: Map<string, number>;
  sortedExpensesArr;

  constructor(private activatedRoute: ActivatedRoute,
    private database: DatabaseServiceService) { }

  ngOnInit(): void {
    this.initOffset();
    this.getDates();
    this.refreshTable();
  }

  refreshTable() {
    let date = new Date();
    date = datefns.addMonths(date, this.offset);
    this.dateMonth = `${datefns.format(date, 'MMMM')} - ${datefns.format(date, 'yyyy')}`;

    let month = (datefns.getMonth(this.startDate) + 1).toString();
    if (month.length == 1) {
      month = "0" + month;
    }
    let startDay = (datefns.getDate(this.startDate)).toString();
    if(startDay.length == 1) {
      startDay = "0" + startDay;
    }

    let sqlStart = (datefns.getYear(this.startDate) + "-" + month + "-" + startDay).toString();
    let sqlEnd = (datefns.getYear(this.endDate) + "-" + month + "-" + datefns.getDate(this.endDate)).toString();

    this.totalExpense = 0;
    this.totalIncome = 0;
    this.balance = 0;
    this.expenses = [];
    this.sortedExpenses = new Map<string, number>();
    this.sortedExpensesArr = []

    this.database.selectAllRecurringAndNonTransactions(sqlStart, sqlEnd).subscribe((data) => {
      this.allTransactions = data;
      for (const transaction of this.allTransactions) {
        if (transaction.type == "Expense") {
          this.expenses.push(transaction);
          this.totalExpense += transaction.amount;
          if (this.sortedExpenses.get(transaction.category) == null)
            this.sortedExpenses.set(transaction.category, transaction.amount);
          else {
            let prevAmount = this.sortedExpenses.get(transaction.category);
            this.sortedExpenses.set(transaction.category, prevAmount + transaction.amount);
          }
        }
        else this.totalIncome += transaction.amount;
      }

      this.sortedExpenses = new Map([...this.sortedExpenses.entries()].sort((a, b) => b[1] - a[1]));

      this.sortedExpenses.forEach((value, key) => this.sortedExpensesArr.push([key, value]));
      console.log(this.sortedExpensesArr);
      this.balance = this.totalIncome - this.totalExpense;
    })
  }

  getDates() {
    this.workingDate = new Date();
    this.workingDate = datefns.addMonths(this.workingDate, parseInt(localStorage.getItem("offset")));
    console.log(this.workingDate);
    this.startDate = datefns.startOfMonth(this.workingDate);
    this.endDate = datefns.endOfMonth(this.workingDate);
  }

  changeMonth(isReverse: boolean) {
    $("#expensesArea").text("");
    if (isReverse)
      this.offset--;
    else
      this.offset++;
    localStorage.setItem("offset", this.offset.toString());

    this.getDates();
    this.refreshTable();
  }

  initOffset() {
    let storedOffset: string = localStorage.getItem("offset");

    if (storedOffset == null) {
      localStorage.setItem("offset", "0")
      this.offset = 0;
    }
    else this.offset = parseInt(localStorage.getItem("offset"));
  }
}
