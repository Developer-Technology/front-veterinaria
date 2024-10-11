import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeciesRoutingModule } from './species-routing.module';
import { SpeciesComponent } from './species.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    SpeciesComponent
  ],
  imports: [
    CommonModule,
    SpeciesRoutingModule,
    FormsModule,
    NgbModule
  ]
})
export class SpeciesModule { }
