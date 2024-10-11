import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsComponent } from './breeds.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    BreedsComponent
  ],
  imports: [
    CommonModule,
    BreedsRoutingModule,
    FormsModule,
    NgbModule
  ]
})
export class BreedsModule { }
