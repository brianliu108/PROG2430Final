export class Transaction {
    transactionId: number;
    categoryId: number;
    typeId: number;
    transactionDate: Date;
    transactionAmount: number;
    transactionNote: string;

    constructor(categoryId?: number, typeId?: number,
        transactionDate?: Date, transactionAmount?: number,
        transactionNote?: string) {
        this.categoryId = categoryId;
        this.typeId = typeId;
        this.transactionDate = transactionDate;
        this.transactionAmount = transactionAmount;
        this.transactionNote = transactionNote;
    }
}