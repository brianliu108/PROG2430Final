import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/models/Transaction';
import * as datefns from 'date-fns';
import { DatabaseServiceService } from '../services/database-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  workingDate: Date;
  startDate: Date;
  endDate: Date;

  constructor(private database: DatabaseServiceService,
    private activatedRoute: ActivatedRoute, private router: Router) {
      // this.router.routeReuseStrategy.shouldReuseRoute = function() {
      //   return false;
      // }
  }

  ngOnInit(): void {
    this.workingDate = new Date();
    if (localStorage.getItem("offset") == null) {
      localStorage.setItem("offset", "0");
    }

    this.workingDate = datefns.addMonths(this.workingDate, parseInt(localStorage.getItem("offset")));
    console.log(this.workingDate);
    this.startDate = datefns.startOfMonth(this.workingDate);
    this.endDate = datefns.endOfMonth(this.workingDate);

    console.log("happened1")
    this.refreshTable();
  }

  refreshTable() {
    console.log("happened");
    this.transactions = [];
    let month = (datefns.getMonth(this.startDate) + 1).toString();
    if (month.length == 1) {
      month = "0" + month;
    }
    let startDay = (datefns.getDate(this.startDate)).toString();
    if (startDay.length == 1) {
      startDay = "0" + startDay;
    }
    let sqlStart = (datefns.getYear(this.startDate) + "-" + month + "-" + startDay).toString();
    let sqlEnd = (datefns.getYear(this.endDate) + "-" + month + "-" + datefns.getDate(this.endDate)).toString();
    console.log(sqlStart, sqlEnd);

    this.database.selectAllRecurringAndNonTransactions(sqlStart, sqlEnd).subscribe((data) => {
      console.log(data);
      this.transactions = data;
    })

  }

  btnDeleteTransaction_click(id: Number, isRecurring: Boolean) {
    if (isRecurring) {
      this.database.deleteRecurringTransaction(id, () => {
        console.log("successfully deleted recrruing");
      })
    } else {
      this.database.deleteTransaction(id, () => {
        console.log("successfully deleted trans.");
      })
    }

    this.refreshTable();
  }
}
