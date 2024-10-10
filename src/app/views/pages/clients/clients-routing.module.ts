import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '', component: ClientsComponent },  // Ruta principal para listar clientes
  { path: 'add', component: AddComponent },  // Ruta para agregar cliente
  { path: 'edit/:id', component: EditComponent },  // Ruta para editar cliente
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
