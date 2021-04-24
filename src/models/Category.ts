export class Category {
    categoryId: number;
    categoryName: string;
    typeId: number;

    constructor(categoryName?: string, typeId?: number) {
        this.categoryName = categoryName;
        this.typeId = typeId;
    } 
}