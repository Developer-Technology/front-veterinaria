import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

  suppliers: any[] = [];  // Lista completa de proveedores
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Lista de acciones

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
    this.setupActions();
  }

  // Cargar proveedores desde el API
  loadSuppliers(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('suppliers', true).subscribe(
      (response) => {
        if (response.success) {
          this.suppliers = response.data.sort((a: any, b: any) => b.id - a.id);
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los proveedores');
      }
    );
  }

  // Definir las acciones para cada proveedor
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: this.editSupplier.bind(this),  // Pasamos la referencia de la función
        condition: (supplier: any) => true  // Condición para habilitar la acción
      },
      {
        label: 'Eliminar',
        onClick: this.deleteSupplier.bind(this),  // Pasamos la referencia de la función
        condition: (supplier: any) => true  // Condición para habilitar la acción
      }
    ];
  }

  // Función para redirigir al formulario de edición
  editSupplier(supplier: any): void {
    const encodedId = btoa(supplier.id);
    this.router.navigate(['/suppliers/edit', encodedId]);  // Redirige a la ruta de edición
  }

  // Función para eliminar un proveedor
  deleteSupplier(supplier: any): void {
    this.utilitiesService
      .showConfirmationDelet(
        '¿Estás seguro?',
        '¡Esta acción no se puede deshacer!'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`suppliers/${supplier.id}`, true).subscribe(
            (response) => {
              this.utilitiesService.showAlert('success', 'Proveedor eliminado correctamente');
              this.loadSuppliers();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar el proveedor.';
              this.utilitiesService.showAlert('error', errorMessage)
            }
          );
        }
      });
  }

}