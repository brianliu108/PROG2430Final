export class RecurringTransaction {
    recurringTransactionId: number;
    categoryId: number;
    typeId: number;
    recurringTransactionDate: Date;
    recurringTransactionAmount: number;
    recurringTransactionNote: string;
    endDate: Date;

    constructor(categoryId?: number, typeId?: number, recurringTransactionDate?: Date,
        recurringTransactionAmount?: number, recurringTransactionNote?: string,
        endDate?: Date) {
        this.categoryId = categoryId;
        this.typeId = typeId;
        this.recurringTransactionDate = recurringTransactionDate;
        this.recurringTransactionAmount = recurringTransactionAmount;
        this.recurringTransactionNote = recurringTransactionNote;
        this.endDate = endDate;
    }
}