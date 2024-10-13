import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './suppliers.component';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    SuppliersComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    SuppliersRoutingModule,
    FormsModule,
    NgbModule,
    SharedModule
  ]
})
export class SuppliersModule { }
