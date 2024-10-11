import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreedsRoutingModule } from './breeds-routing.module';
import { BreedsComponent } from './breeds.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BreedsComponent
  ],
  imports: [
    CommonModule,
    BreedsRoutingModule,
    FormsModule
  ]
})
export class BreedsModule { }
