import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Category } from 'src/models/Category';
import { DatabaseServiceService } from '../services/database-service.service';
import { Type } from 'src/models/Type';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories-add',
  templateUrl: './categories-add.component.html',
  styleUrls: ['./categories-add.component.css']
})
export class CategoriesAddComponent implements OnInit {
  types: Type[] = [];
  categoryForm = this.builder.group({
    _categoryNameEdit: ['', [Validators.required]],
    _categoryType: ['', [Validators.required]]
  });

  constructor(private builder: FormBuilder, private database: DatabaseServiceService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    let type: string = this.activatedRoute.snapshot.paramMap.get("type");
    if(type == "2" || type == "1")
      this.categoryForm.get("_categoryType").setValue(type);

    this.refreshForm();
  }


  conestogaEmailValidator(control: AbstractControl): any {
    let email: string = control.value;
    // the following is to make sure it does not show with required message
    if (email == "") {
      return null;
    }

    let domain: string = email.substring(email.lastIndexOf('@') + 1);
    if (domain.toLowerCase() == 'conestogac.on.ca') {
      return null;
    }
    else {
      return { 'conestogaEmailError': true }
    }
  }

  refreshForm() {
    this.database.selectAllTypes().subscribe((data) => {     
      this.types = data;
    }, (error) => {
      console.error(error);
    });
  }

  btnSubmit_click() {
    let category: Category = new Category(this.categoryForm.get("_categoryNameEdit").value, this.categoryForm.get("_categoryType").value);
    
    this.database.insertCategory(category, () => {
      alert("Successfully inserted category");
    })
  }
}
