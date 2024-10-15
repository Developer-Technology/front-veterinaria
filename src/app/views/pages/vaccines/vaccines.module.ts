import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VaccinesRoutingModule } from './vaccines-routing.module';
import { VaccinesComponent } from './vaccines.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    VaccinesComponent
  ],
  imports: [
    CommonModule,
    VaccinesRoutingModule,
    FormsModule,
    NgbModule,
    SharedModule,
    NgSelectModule
  ]
})
export class VaccinesModule { }
