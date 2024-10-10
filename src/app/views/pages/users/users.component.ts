import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
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
  itemsPerPage: number = 10;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga

  constructor(private apiService: ApiService) { }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar usuarios desde el API
  loadUsers(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('users', true).subscribe(
      (response) => {
        if (response.success) {
          this.users = response.data;
          this.filteredUsers = this.users;  // Iniciar el filtrado con todos los usuarios
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    );
  }

  // Paginación: Obtener usuarios de la página actual
  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Filtro de búsqueda: buscar en documento, nombre, apellido, email y teléfono
  onSearch(): void {
    this.filteredUsers = this.users.filter(user =>
      user.doc.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1;  // Reiniciar a la primera página después de filtrar
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

}