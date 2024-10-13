import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Este es el módulo correcto para usar en SharedModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Para usar [(ngModel)]
import { DatatableComponent } from './datatable/datatable.component'; // Importa el DatatableComponent
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFieldComponent } from './custom-field/custom-field.component';

@NgModule({
    declarations: [
        DatatableComponent,
        CustomFieldComponent // Declara el componente Datatable
    ],
    imports: [
        CommonModule, // Importa CommonModule para directivas comunes como *ngIf y *ngFor
        FormsModule, // Importa FormsModule para [(ngModel)]
        ReactiveFormsModule, // Si usas formularios reactivos
        NgbModule
    ],
    exports: [
        DatatableComponent // Exporta DatatableComponent para usarlo en otros módulos
    ]
})
export class SharedModule { }