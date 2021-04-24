import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from 'src/models/Category';
import { RecurringTransaction } from 'src/models/RecurringTransaction';
import { Transaction } from 'src/models/Transaction';
import { Type } from 'src/models/Type';

declare const openDatabase;

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {
  private db: any = null;

  constructor() { }

  getDatabase(): any {
    this.initDB();

    return this.db;
  }

  initDB() {
    if (this.db == null) {
      try {
        this.createDatabase();
        this.createTables();
      } catch (error) {
        console.error(error);
      }
    }
  }

  private createTables() {
    let createType = "CREATE TABLE type (" +
      "typeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
      "typeName VARCHAR(30) NOT NULL);";
    let createCategory = "CREATE IF NOT EXISTS TABLE category (" +
      "categoryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
      "typeId INTEGER NOT NULL, " +
      "categoryName VARCHAR(30) NOT NULL, " +
      "FOREIGN KEY(typeId) REFERENCES type(typeId) " +
      ");";
    let createTransaction = "CREATE TABLE IF NOT EXISTS transactions (" +
      "transactionId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
      "categoryId INTEGER NOT NULL," +
      "typeId INTEGER NOT NULL," +
      "transactionDate DATE NOT NULL," +
      "transactionAmount DECIMAL NOT NULL," +
      "transactionNote VARCHAR(255)," +
      "FOREIGN KEY(categoryId) REFERENCES category(categoryId)," +
      "FOREIGN KEY(typeId) REFERENCES type(typeId));";
    let createRecurringTransaction = "CREATE TABLE IF NOT EXISTS recurringTransaction (" +
      "recurringTransactionId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
      "categoryId INTEGER NOT NULL," +
      "typeId INTEGER NOT NULL," +
      "recurringTransactionDate DATE NOT NULL," +
      "recurringTransactionAmount DECIMAL NOT NULL," +
      "recurringTransactionNote VARCHAR(255)," +
      "endDate DATE," +
      "FOREIGN KEY(categoryId) REFERENCES category(categoryId)," +
      "FOREIGN KEY(typeId) REFERENCES type(typeId));";

    this.getDatabase().transaction((tx) => {
      tx.executeSql("DROP TABLE IF EXISTS type;", [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
      tx.executeSql(createType, [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
      tx.executeSql("INSERT INTO type (typeName) VALUES ('Income'), ('Expense');", [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
      tx.executeSql(createTransaction, [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
      tx.executeSql(createRecurringTransaction, [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
      tx.executeSql(createCategory, [], () => {
        console.log("success");
      }, DatabaseServiceService.errorHandler);
    }, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully created tables");
    });
  }

  private createDatabase(): any {
    let shortName = "spending";
    let version = "1.0";
    let displayName = "DB for PROG2430 Final Project"
    let dbSize = 2 * 1024 * 1024;
    let dbCreateSuccess = () => {
      console.log("DB Created");
    }

    this.db = openDatabase(shortName, version, displayName, dbSize, dbCreateSuccess);
  }

  public insertCategory(category: Category, callback) {
    this.getDatabase().transaction((tx) => {
      let sql = "INSERT INTO category (categoryName, typeId) VALUES (?, ?);";
      let options = [category.categoryName, category.typeId];
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully inserted category");
    })
  }

  public selectAllCategories(options: Array<any>): Observable<any> {
    // let options: Array<any> = []
    let categories: Category[] = [];

    function txFunction(tx) {
      let sql = "SELECT * FROM category c " +
        "INNER JOIN type t " +
        "ON c.typeId = t.typeId " +
        "WHERE c.typeId = ?;"
      tx.executeSql(sql, options, (tx, results) => {
        for (let i = 0; i < results.rows.length; i++) {
          const row: Category = results.rows[i];
          let c = new Category();
          c.categoryId = row.categoryId;
          c.categoryName = row.categoryName;
          c.typeId = row.typeId

          categories.push(c);
        }
      }, DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.log("Successfully selected all categories");
    });

    return new Observable<any>((observer) => {
      setTimeout(() => {
        if (categories.length != 0) {
          observer.next(categories);
        } else {
          observer.error("Select all categories returned 0 records");
        }
      }, 100)
    });
  }

  public selectCategory(categoryId: number): Observable<any> {
    let options = [categoryId];
    let category: Category = null;

    function txFunction(tx) {
      let sql = "SELECT * FROM category WHERE categoryId = ?";
      tx.executeSql(sql, options, (tx, results) => {
        let row: Category = results.rows[0];
        category = new Category();
        category.categoryId = row.categoryId;
        category.categoryName = row.categoryName;
        category.typeId = row.typeId;
      },
        DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully selected category");
    })

    return new Observable(observer => {
      setTimeout(() => {
        if (category) {
          observer.next(category);
        } else {
          observer.error("Error selecting category");
        }
      }, 100)
    });
  }

  public updateCategory(category: Category, callback): void {
    function txFunction(tx) {
      let sql = "UPDATE category SET categoryName=? WHERE categoryId=?;";
      let options = [category.categoryName, category.categoryId];
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }
    function successTransaction() {
      console.info('Success: update transaction successful');
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, successTransaction);
  }

  public deleteCategory(category: Category, callback): void {
    function txFunction(tx) {
      let sql = "DELETE FROM category WHERE categoryId = ?;";
      let options = [category.categoryId];

      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler,
      () => {
        console.info("Deleted category " + category.categoryId + "-" + category.categoryName);
      })
  }

  public selectAllTypes(): Observable<any> {
    let options: Array<any> = []
    let types: Type[] = [];

    function txFunction(tx) {
      let sql = "SELECT * FROM type;";
      tx.executeSql(sql, options, (tx, results) => {
        for (let i = 0; i < results.rows.length; i++) {
          const row: Type = results.rows[i];
          let t = new Type();
          t.typeId = row.typeId;
          t.typeName = row.typeName;

          types.push(t);
        }
      }, DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.log("Successfully selected all types");
    });

    return new Observable<any>((observer) => {
      setTimeout(() => {
        if (types.length != 0) {
          observer.next(types);
        } else {
          observer.error("Select all types returned 0 records");
        }
      }, 100)
    });
  }

  public insertTransaction(transaction: Transaction, callback) {
    this.getDatabase().transaction((tx) => {
      let sql = "INSERT INTO transactions (categoryId, typeId, transactionDate, " +
        "transactionAmount, transactionNote) VALUES (?, ?, ?, ? , ?);";
      let options = [transaction.categoryId, transaction.typeId,
      transaction.transactionDate, transaction.transactionAmount, transaction.transactionNote];
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully inserted transaction");
    })
  }

  insertRecurringTransaction(recurringTransaction: RecurringTransaction, callback) {
    this.getDatabase().transaction((tx) => {
      let sql = "INSERT INTO recurringTransaction (categoryId, typeId, recurringTransactionDate, " +
        "recurringTransactionAmount, recurringTransactionNote,endDate) " +
        "VALUES (?, ?, ?, ?, ?, ?);";
      let options = [recurringTransaction.categoryId, recurringTransaction.typeId,
      recurringTransaction.recurringTransactionDate, recurringTransaction.recurringTransactionAmount,
      recurringTransaction.recurringTransactionNote,
      recurringTransaction.endDate];
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully inserted recurring transaction");
    })
  }

  public selectAllRecurringAndNonTransactions(startDate: string, endDate: string): Observable<any> {
    let options: Array<any> = [startDate, endDate, endDate, endDate]
    console.log(options);
    let transactions: Transaction[] = [];

    function txFunction(tx) {
      let sql = "SELECT t.transactionId AS 'id', c.categoryName AS 'category', t.transactionAmount AS 'amount', " +
        "ty.typeName AS 'type', t.transactionDate AS 'date', t.transactionNote AS 'note', false AS 'recurring' " +
        "FROM transactions t " +
        "INNER JOIN category c ON t.categoryId = c.categoryId " +
        "INNER JOIN type ty ON t.typeId = ty.typeId " +
        "WHERE t.transactionDate >= ? AND t.transactionDate <= ? " +
        "UNION " +
        "SELECT rt.recurringTransactionId AS 'id', c.categoryName AS 'category', rt.recurringTransactionAmount AS 'amount', " +
        "ty.typeName AS 'type', rt.recurringTransactionDate AS 'date', rt.recurringTransactionNote AS 'note', true AS 'recurring' " +
        "FROM recurringTransaction rt " +
        "INNER JOIN category c ON rt.categoryId = c.categoryId " +
        "INNER JOIN type ty ON rt.typeId = ty.typeId " +
        "WHERE " +
        "((rt.endDate >= ? OR (rt.endDate IS NULL or rt.endDate = '')) AND rt.recurringTransactionDate <= ?) " +
        "ORDER BY type DESC, amount DESC;"
      tx.executeSql(sql, options, (tx, results) => {
        for (let i = 0; i < results.rows.length; i++) {
          const row: Transaction = results.rows[i];
          transactions.push(row);
        }
      }, DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.log("Successfully selected all transactions");
    });

    return new Observable<any>((observer) => {
      setTimeout(() => {
        if (transactions.length != 0) {
          observer.next(transactions);
        } else {
          observer.error("Select all transactions returned 0 records");
        }
      }, 100)
    });
  }

  public deleteRecurringTransaction(id: Number, callback): void {
    function txFunction(tx) {
      let sql = "DELETE FROM recurringTransaction WHERE recurringTransactionId = ?;";
      let options = [id];

      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler,
      () => {
        console.info("Successfully deleted recurring transaction");
      })
  }

  public deleteTransaction(id: Number, callback): void {
    function txFunction(tx) {
      let sql = "DELETE FROM transactions WHERE transactionId = ?;";
      let options = [id];

      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler,
      () => {
        console.info("Successfully deleted transaction");
      })
  }

  public selectRecurringTransaction(recurringTransactionId: number): Observable<any> {
    let options = [recurringTransactionId];
    let recurringTransaction: RecurringTransaction = null;

    function txFunction(tx) {
      let sql = "SELECT * FROM recurringTransaction WHERE recurringTransactionId = ?";
      tx.executeSql(sql, options, (tx, results) => {
        let row: RecurringTransaction = results.rows[0];
        if (row == undefined) recurringTransaction = new RecurringTransaction();
        else
          recurringTransaction = new RecurringTransaction(row.categoryId, row.typeId,
            row.recurringTransactionDate, row.recurringTransactionAmount, row.recurringTransactionNote, row.endDate)
      },
        DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully selected recurringTransaction");
    })

    return new Observable(observer => {
      setTimeout(() => {
        if (recurringTransaction) {
          observer.next(recurringTransaction);
        } else {
          observer.error("Error selecting recurrinngTrans");
        }
      }, 100)
    });
  }

  public selectTransaction(transactionId: number): Observable<any> {
    let options = [transactionId];
    let transaction: Transaction = null;

    function txFunction(tx) {
      let sql = "SELECT * FROM transactions WHERE transactionId = ?";
      tx.executeSql(sql, options, (tx, results) => {
        let row: Transaction = results.rows[0];
        if (row == undefined) transaction = new Transaction();
        else
          transaction = new Transaction(row.categoryId, row.typeId,
            row.transactionDate, row.transactionAmount, row.transactionNote)
      },
        DatabaseServiceService.errorHandler);
    }

    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, () => {
      console.info("Successfully selected transaction");
    })

    return new Observable(observer => {
      setTimeout(() => {
        if (transaction) {
          observer.next(transaction);
        } else {
          observer.error("Error selecting trans");
        }
      }, 100)
    });
  }

  public updateRecurringTransaction(a: RecurringTransaction, callback): void {
    function txFunction(tx) {
      let sql = "UPDATE recurringTransaction " +
      "SET categoryId = ?, typeId = ?, recurringTransactionDate = ?, recurringTransactionAmount = ?, " +
      "recurringTransactionNote = ?, endDate = ? " +
      "WHERE recurringTransactionId = ?;";
      let options = [a.categoryId, a.typeId,
        a.recurringTransactionDate, a.recurringTransactionAmount,
        a.recurringTransactionNote, a.endDate,
        a.recurringTransactionId];
      console.log(options);
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
      console.log("dagae")
    }
    function successTransaction() {
      console.info('Success: update recurringTransaction successful');
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, successTransaction);
  }

  public updateTransaction(a: Transaction, callback): void {
    function txFunction(tx) {
      let sql = "UPDATE transactions " +
      "SET categoryId = ?, typeId = ?, transactionDate = ?, transactionAmount = ?, " +
      "transactionNote = ? " +
      "WHERE transactionId = ?;";
      let options = [a.categoryId, a.typeId,
        a.transactionDate, a.transactionAmount,
        a.transactionNote,
        a.transactionId];
      console.log(options);
      tx.executeSql(sql, options, callback, DatabaseServiceService.errorHandler);
      console.log("dagae")
    }
    function successTransaction() {
      console.info('Success: update transaction successful');
    }
    this.getDatabase().transaction(txFunction, DatabaseServiceService.errorHandler, successTransaction);
  }

  public static errorHandler(): any {
    console.error("Error def");
  }
}
