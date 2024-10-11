import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetsComponent } from './pets.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  { path: '', component: PetsComponent },  // Ruta principal para listar clientes
  { path: 'add', component: AddComponent },  // Ruta para agregar cliente
  { path: 'edit/:id', component: EditComponent },  // Ruta para editar cliente
  { path: 'view/:id', component: ViewComponent },  // Ruta para ver cliente
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetsRoutingModule { }
