import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoriesComponent } from './histories.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '', component: HistoriesComponent },
  { path: 'add/:id', component: AddComponent },
  { path: 'edit/:id', component: EditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoriesRoutingModule { }
