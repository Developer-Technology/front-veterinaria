import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './suppliers.component';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

@NgModule({
  declarations: [
    SuppliersComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    SuppliersRoutingModule,
    FormsModule
  ]
})
export class SuppliersModule { }
