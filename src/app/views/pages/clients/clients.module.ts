import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ClientsComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    FormsModule,
    NgbModule
  ]
})
export class ClientsModule { }
