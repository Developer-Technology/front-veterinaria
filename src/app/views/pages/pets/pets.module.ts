import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetsRoutingModule } from './pets-routing.module';
import { PetsComponent } from './pets.component';
import { FormsModule } from '@angular/forms';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { ViewComponent } from './view/view.component';


@NgModule({
  declarations: [
    PetsComponent,
    AddComponent,
    EditComponent,
    ViewComponent
  ],
  imports: [
    CommonModule,
    PetsRoutingModule,
    FormsModule
  ]
})
export class PetsModule { }
