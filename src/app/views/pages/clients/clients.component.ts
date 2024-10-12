import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  clients: any[] = [];  // Lista completa de clientes
  filteredClients: any[] = [];  // Lista filtrada de clientes
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 5;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga
  // Variables de ordenación
  sortColumn: string = '';  // Columna que se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc';  // Dirección de ordenación

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  // Cargar clientes desde el API
  loadClients(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('clients', true).subscribe(
      (response) => {
        if (response.success) {
          // Ordenar las mascotas de manera descendente por el campo 'id'
          this.clients = response.data.sort((a: any, b: any) => b.id - a.id);
          //.clients = response.data;
          this.filteredClients = this.clients;  // Iniciar el filtrado con todos los clientes
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los clientes');
      }
    );
  }

  deleteClient(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.delete(`clients/${id}`, true).subscribe(
          (response) => {
            // Eliminar el cliente de la lista local sin recargar
            this.clients = this.clients.filter(client => client.id !== id);
            this.filteredClients = this.filteredClients.filter(client => client.id !== id);

            // Verificar cuántos registros quedan en la página actual
            const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);

            // Si ya no quedan registros en la página actual y no estamos en la primera página
            if (this.currentPage > totalPages && this.currentPage > 1) {
              this.currentPage--; // Retroceder una página
            }

            this.utilitiesService.showAlert('success', 'El cliente ha sido eliminado.');
            //this.utilitiesService.showAlert('Eliminado', 'El cliente ha sido eliminado.', 'success');
          },
          (error) => {
            // Mostrar el mensaje de error retornado por la API
            const errorMessage = error?.error?.message || 'No se pudo eliminar el cliente.';
            this.utilitiesService.showAlert('error', errorMessage);
          }
        );
      }
    });
  }

  // Ordenar los datos
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';  // Cambiar dirección si es la misma columna
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';  // Si es una nueva columna, orden ascendente
    }

    this.filteredClients.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Obtener el icono de ordenación para la columna actual
  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down';
    }
    return '';
  }

  getRecordNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + (index + 1);
  }

  // Paginación: Obtener clientes de la página actual
  get paginatedClients(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredClients.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = Math.ceil(this.filteredClients.length / this.itemsPerPage);

    // Validar que la página esté dentro del rango permitido
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > totalPages) {
      this.currentPage = totalPages;
    } else {
      this.currentPage = page;
    }
  }

  // Filtro de búsqueda: buscar en documento, nombre, teléfono y correo
  onSearch(): void {
    this.filteredClients = this.clients.filter(client =>
      client.clientDoc.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      client.clientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      client.clientPhone.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      client.clientEmail.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredClients.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredClients.length);
    return `Mostrando ${start} - ${end} de ${this.filteredClients.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.clients.length}`;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado y convertirlo a número
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1); // Actualiza la vista para respetar la cantidad seleccionada
  }

  // Función para redirigir al formulario de edición
  editClient(id: string): void {
    const encodedId = btoa(id);
    this.router.navigate(['/clients/edit', encodedId]);  // Redirige a la ruta de edición
  }

}