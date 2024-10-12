import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { RouterModule, Routes } from '@angular/router';
import { AngularCropperjsModule } from 'angular-cropperjs';

// Definir la ruta para el componente SettingsComponent
const routes: Routes = [
    { path: '', component: SettingsComponent }
];

@NgModule({
    declarations: [
        SettingsComponent // Declara el componente
    ],
    imports: [
        CommonModule,      // Módulo común para directivas básicas
        FormsModule,       // Para trabajar con formularios
        RouterModule.forChild(routes), // Configurar rutas para el módulo
        AngularCropperjsModule
    ]
})
export class SettingsModule { }