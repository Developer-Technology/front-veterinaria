import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VaccinesComponent } from './vaccines.component';

const routes: Routes = [{ path: '', component: VaccinesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VaccinesRoutingModule { }
