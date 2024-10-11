import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VaccinesRoutingModule } from './vaccines-routing.module';
import { VaccinesComponent } from './vaccines.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    VaccinesComponent
  ],
  imports: [
    CommonModule,
    VaccinesRoutingModule,
    FormsModule
  ]
})
export class VaccinesModule { }
