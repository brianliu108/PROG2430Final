import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DatabaseServiceService } from '../services/database-service.service';
import { Category } from 'src/models/Category';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { Type } from 'src/models/Type';

@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.component.html',
  styleUrls: ['./categories-edit.component.css']
})
export class CategoriesEditComponent implements OnInit {
  category: Category;
  types: Type[] = [];

  categoryForm = this.builder.group({
    _categoryName: ['', [Validators.required]],
    _categoryType: ['', []]
  });

  constructor(private builder: FormBuilder,
    private database: DatabaseServiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.refreshForm();
  }

  refreshForm() {
    let categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get("categoryId"));
    this.database.selectCategory(categoryId).subscribe((data: Category) => {
      if(data.categoryName == undefined)
        return this.router.navigate(['categories']);
      this.database.selectAllTypes().subscribe((data) => {
        this.types = data;
      }, (error) => {
        console.error(error);
      });
      
      if (data.categoryName == undefined)
        return this.router.navigate(["categories"])
      this.category = data;
      this.categoryForm.get("_categoryName").setValue(this.category.categoryName);
      console.log(this.category);
      this.categoryForm.get("_categoryType").setValue(this.category.typeId);
    });

  }

  btnEditCategory_click() {
    if($("#categoryNameEdit").val() == "" || $("#categoryTypeEdit").val() == null)
      return;
    
    this.category.categoryName = this.categoryForm.get("_categoryName").value;
    this.category.typeId = this.categoryForm.get("_categoryType").value;
    
    this.database.updateCategory(this.category, () => {
      alert("Record updated successfully");
    })

    // console.log($("#categoryNameEdit").val())
    // console.log($("#categoryTypeEdit").val())
  }
}
