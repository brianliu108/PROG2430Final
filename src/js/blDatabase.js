let db;

let DB = {
    blCreateDatabase: () => {
        let shortName = "spending";
        let version = "1.0";
        let displayName = "DB for PROG2430 Final Project"
        let dbSize = 2 * 1024 * 1024;
        let dbCreateSuccess = () => {
            console.log("DB Created");
        }

        db = openDatabase(shortName, version, displayName, dbSize, dbCreateSuccess);
    },
    blCreateTables: () => {
        let createCategory = "CREATE TABLE IF NOT EXISTS category (" +
        "categoryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "categoryName VARCHAR(30) NOT NULL);";
        let createType = "CREATE TABLE type (" +
        "typeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "typeName VARCHAR(30) NOT NULL);";
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
        "weekRecurrenceInterval INTEGER," +
        "FOREIGN KEY(categoryId) REFERENCES category(categoryId)," +
        "FOREIGN KEY(typeId) REFERENCES type(typeId));";
        
        db.transaction((tx) => {            
            tx.executeSql("DROP TABLE IF EXISTS type;");
            tx.executeSql(createCategory);
            tx.executeSql(createType);
            tx.executeSql(createTransaction);
            tx.executeSql(createRecurringTransaction);
            tx.executeSql("INSERT INTO type (typeName) VALUES ('Income'), ('Expense');");
        });
    }
}