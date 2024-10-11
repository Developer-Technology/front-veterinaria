import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeciesRoutingModule } from './species-routing.module';
import { SpeciesComponent } from './species.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SpeciesComponent
  ],
  imports: [
    CommonModule,
    SpeciesRoutingModule,
    FormsModule
  ]
})
export class SpeciesModule { }
