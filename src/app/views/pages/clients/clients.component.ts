import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  clients: any[] = [];  // Lista completa de clientes
  isLoading: boolean = true;  // Variable de estado de carga
  actions: any[] = [];  // Lista de acciones

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadClients();
    this.setupActions();
  }

  // Cargar clientes desde el API
  loadClients(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('clients', true).subscribe(
      (response) => {
        if (response.success) {
          this.clients = response.data.sort((a: any, b: any) => b.id - a.id);
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los clientes');
      }
    );
  }

  // Definir las acciones para cada cliente
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: this.editClient.bind(this),  // Pasamos la referencia de la función
        condition: (client: any) => true  // Condición para habilitar la acción
      },
      {
        label: 'Eliminar',
        onClick: this.deleteClient.bind(this),  // Pasamos la referencia de la función
        condition: (client: any) => true  // Condición para habilitar la acción
      }
    ];
  }

  // Función para redirigir al formulario de edición
  editClient(client: any): void {
    const encodedId = btoa(client.id);
    this.router.navigate(['/clients/edit', encodedId]);  // Redirige a la ruta de edición
  }

  // Función para eliminar un cliente
  deleteClient(client: any): void {
    this.utilitiesService
      .showConfirmationDelet(
        '¿Estás seguro?',
        '¡Esta acción no se puede deshacer!'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`clients/${client.id}`, true).subscribe(
            (response) => {
              this.utilitiesService.showAlert('success', 'Cliente eliminado correctamente');
              this.loadClients();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar el cliente.';
              this.utilitiesService.showAlert('error', errorMessage)
            }
          );
        }
      });
  }

}