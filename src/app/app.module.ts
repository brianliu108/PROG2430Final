import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { CategoriesComponent } from './categories/categories.component';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingsComponent } from './settings/settings.component';
import { CategoriesAddComponent } from './categories-add/categories-add.component';
import { TransactionsAddComponent } from './transactions-add/transactions-add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriesEditComponent } from './categories-edit/categories-edit.component';
import { TransactionsEditComponent } from './transactions-edit/transactions-edit.component';
import { AboutComponent } from './about/about.component';
import { TransactionsDeleteComponent } from './transactions-delete/transactions-delete.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    TransactionsComponent,
    CategoriesComponent,
    PageNotFoundComponent,
    SettingsComponent,
    CategoriesAddComponent,
    CategoriesEditComponent,
    TransactionsAddComponent,
    TransactionsEditComponent,
    AboutComponent,
    TransactionsDeleteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent},
      {path:'transactions', component: TransactionsComponent},
      {path: 'transactions/add', component: TransactionsAddComponent},
      {path: 'transactions/add/:type', component: TransactionsAddComponent},
      {path: 'transactions/edit/:transactionId', component: TransactionsEditComponent},
      {path: 'recurringtransactions/edit/:recurringTransactionId', component: TransactionsEditComponent},
      {path: 'categories', component: CategoriesComponent},
      {path: 'categories/add', component: CategoriesAddComponent},
      {path: 'categories/add/:type', component: CategoriesAddComponent},  
      {path: 'categories/edit/:categoryId', component: CategoriesEditComponent},     
      {path: 'settings', component: SettingsComponent},
      {path: 'about', component: AboutComponent},
      {path: '**', component: PageNotFoundComponent},
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
