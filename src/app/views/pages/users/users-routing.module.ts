import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
    { path: '', component: UsersComponent },  // Ruta principal para listar usuarios
    { path: 'add', component: AddComponent },  // Ruta para agregar usuario
    { path: 'edit/:id', component: EditComponent },  // Ruta para editar usuario
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }