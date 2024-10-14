import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';

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
    NgbModule,
    SharedModule
  ]
})
export class ClientsModule { }
