CREATE TABLE type (
    typeId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    typeName VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    categoryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    typeId INTEGER NOT NULL, 
    categoryName VARCHAR(30) NOT NULL, 
    FOREIGN KEY(typeId) REFERENCES type(typeId) 
);

CREATE TABLE IF NOT EXISTS category (
    categoryId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    typeId INTEGER NOT NULL,
    categoryName VARCHAR(30) NOT NULL,
    FOREIGN KEY(typeId) REFERENCES type(typeId)
);

CREATE TABLE IF NOT EXISTS transactions (
    transactionId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    typeId INTEGER NOT NULL,
    transactionDate DATE NOT NULL,
    transactionAmount DECIMAL NOT NULL,
    transactionNote VARCHAR(255),
    FOREIGN KEY(categoryId) REFERENCES category(categoryId),
    FOREIGN KEY(typeId) REFERENCES type(typeId)
);

CREATE TABLE IF NOT EXISTS recurringTransaction (
    recurringTransactionId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    typeId INTEGER NOT NULL,
    recurringTransactionDate DATE NOT NULL,
    recurringTransactionAmount DECIMAL NOT NULL,
    recurringTransactionNote VARCHAR(255),
    endDate DATE,
    FOREIGN KEY(categoryId) REFERENCES category(categoryId),
    FOREIGN KEY(typeId) REFERENCES type(typeId)
);

UPDATE recurringTransaction 
SET categoryId = ?, typeId = ?, recurringTransactionDate = ?, recurringTransactionAmount = ?, 
recurringTransactionNote = ?, endDate = ? 
WHERE recurringTransactionId = ?;


INSERT INTO category (typeId, categoryName)
VALUES (2, 'insurance');

SELECT * FROM category c
INNER JOIN type t
ON c.typeId = t.typeId
WHERE c.typeId = ?;

INSERT INTO transactions (categoryId, typeId, transactionDate, transactionAmount, transactionNote) 
VALUES (2,2, DATE('now'), 10, 'yes');

SELECT c.categoryName AS 'category', t.transactionAmount AS 'amount', 
ty.typeName AS 'type', t.transactionDate AS 'date', t.transactionNote AS 'note' 
FROM transactions t 
INNER JOIN category c ON t.categoryId = c.categoryId 
INNER JOIN type ty ON t.typeId = ty.typeId 
WHERE t.transactionDate BETWEEN "2021-05-1" AND "2021-05-31" 
UNION 
SELECT c.categoryName AS 'category', rt.recurringTransactionAmount AS 'amount', 
ty.typeName AS 'type', rt.recurringTransactionDate AS 'date', rt.recurringTransactionNote AS 'note' 
FROM recurringTransaction rt 
INNER JOIN category c ON rt.categoryId = c.categoryId 
INNER JOIN type ty ON rt.typeId = ty.typeId 
WHERE (rt.recurringTransactionDate <= "2021-05-1" AND (rt.endDate >= "2021-05-31" OR (rt.endDate IS NULL or rt.endDate = ''))) 
OR (rt.recurringTransactionDate >= "2021-05-1" AND (rt.endDate >= "2021-05-31" OR (rt.endDate IS NULL or rt.endDate = '')) AND rt.recurringTransactionDate <= "2021-05-31") 
ORDER BY type DESC, amount DESC;

SELECT t.transactionId AS 'id', c.categoryName AS 'category', t.transactionAmount AS 'amount', 
ty.typeName AS 'type', t.transactionDate AS 'date', t.transactionNote AS 'note', 'false' AS 'recurring' 
FROM transactions t 
INNER JOIN category c ON t.categoryId = c.categoryId 
INNER JOIN type ty ON t.typeId = ty.typeId 
WHERE t.transactionDate BETWEEN '2021-06-01' AND '2021-06-30' 
UNION 
SELECT rt.recurringTransactionId AS 'id', c.categoryName AS 'category', rt.recurringTransactionAmount AS 'amount', 
ty.typeName AS 'type', rt.recurringTransactionDate AS 'date', rt.recurringTransactionNote AS 'note', 'true' AS 'recurring' 
FROM recurringTransaction rt 
INNER JOIN category c ON rt.categoryId = c.categoryId 
INNER JOIN type ty ON rt.typeId = ty.typeId 
WHERE ((rt.endDate >= '2021-06-01' OR (rt.endDate IS NULL or rt.endDate = '')) AND rt.recurringTransactionDate <= '2021-06-30') OR 
((rt.endDate >= '2021-06-30' OR (rt.endDate IS NULL or rt.endDate = '')) AND rt.recurringTransactionDate <= '2021-06-30')
ORDER BY type DESC, amount DESC;