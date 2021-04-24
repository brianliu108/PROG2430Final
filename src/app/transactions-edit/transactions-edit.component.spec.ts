import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsEditComponent } from './transactions-edit.component';

describe('TransactionsEditComponent', () => {
  let component: TransactionsEditComponent;
  let fixture: ComponentFixture<TransactionsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionsEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
