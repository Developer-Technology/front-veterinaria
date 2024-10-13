import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsComponent } from './breeds.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module'; 

@NgModule({
  declarations: [
    BreedsComponent
  ],
  imports: [
    CommonModule,
    BreedsRoutingModule,
    FormsModule,
    NgbModule,
    SharedModule
  ]
})
export class BreedsModule { }
