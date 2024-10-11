import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetsRoutingModule } from './pets-routing.module';
import { PetsComponent } from './pets.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularCropperjsModule } from 'angular-cropperjs';
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
    FormsModule,
    NgSelectModule,
    NgbModule,
    AngularCropperjsModule
  ]
})
export class PetsModule { }
