import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/models/Category';
import { DatabaseServiceService } from '../services/database-service.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  incomeActive: boolean = false;
  constructor(private database: DatabaseServiceService, private router: Router) { }

  ngOnInit(): void {
    this.refreshTable();
  }

  btnEditCategory_click(category: Category) {
    this.router.navigate(["categories/edit/" + category.categoryId])
  }

  btnDeleteCategory_click(category: Category) {
    this.database.deleteCategory(category, () => {
      console.info("deleted successfully");
    });

    let index = this.categories.indexOf(category);
    this.categories.splice(index, 1);
  }

  refreshTable() {
    this.categories = [];

    let options: Array<any> = [];
    if (this.incomeActive)
      options = [1];
    else options = [2];

    this.database.selectAllCategories(options).subscribe((data) => {
      console.log(data);
      this.categories = data;

    }, (error) => {
      console.error(error);
    });

  }

  goToAdd() {
    return this.router.navigate(["categories/add"])
  }


  swapActive() {
    this.incomeActive = !this.incomeActive;
    this.refreshTable();
  }
}
