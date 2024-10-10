import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

@NgModule({
  declarations: [
    ClientsComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    FormsModule
  ]
})
export class ClientsModule { }
