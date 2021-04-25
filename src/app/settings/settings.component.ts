import { Component, OnInit } from '@angular/core';
import { DatabaseServiceService } from '../services/database-service.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private database: DatabaseServiceService) { }

  ngOnInit(): void {
  }

  btnCreateDatabase_click() {
    this.database.initDB();
  }

  btnDropDatabase_click() {
    this.database.dropDatabase(() => {
      console.info("dropped a table");
    })
  }
}
