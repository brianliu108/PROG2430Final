import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsDeleteComponent } from './transactions-delete.component';

describe('TransactionsDeleteComponent', () => {
  let component: TransactionsDeleteComponent;
  let fixture: ComponentFixture<TransactionsDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionsDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
