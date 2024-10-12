import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: any[] = [];  // Lista completa de usuarios
  filteredUsers: any[] = [];  // Lista filtrada de usuarios
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
    this.loadUsers();
  }

  // Cargar usuarios desde el API
  loadUsers(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('users', true).subscribe(
      (response) => {
        if (response.success) {
          // Ordenar las mascotas de manera descendente por el campo 'id'
          this.users = response.data.sort((a: any, b: any) => b.id - a.id);
          //this.users = response.data;
          this.filteredUsers = this.users;  // Iniciar el filtrado con todos los usuarios
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los usuarios');
      }
    );
  }

  // Ordenar los datos
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';  // Cambiar dirección si es la misma columna
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';  // Si es una nueva columna, orden ascendente
    }

    this.filteredUsers.sort((a, b) => {
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

  // Paginación: Obtener usuarios de la página actual
  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);  // Obtener el subconjunto de mascotas para la página actual
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);

    // Validar que la página esté dentro del rango permitido
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > totalPages) {
      this.currentPage = totalPages;
    } else {
      this.currentPage = page;
    }
  }

  // Filtro de búsqueda: buscar en documento, nombre, apellido, email y teléfono
  onSearch(): void {
    this.filteredUsers = this.users.filter(user =>
      user.doc.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.sex.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredUsers.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);
    return `Mostrando ${start} - ${end} de ${this.filteredUsers.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.users.length}`;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado y convertirlo a número
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1); // Actualiza la vista para respetar la cantidad seleccionada
  }

  // Función para redirigir al formulario de edición
  editUser(id: string): void {
    const encodedId = btoa(id);
    this.router.navigate(['/users/edit', encodedId]);  // Redirige a la ruta de edición
  }

}