import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetsComponent implements OnInit {

  pets: any[] = [];  // Lista completa de mascotas
  filteredPets: any[] = [];  // Lista filtrada de mascotas
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 10;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga
  // Variables de ordenación
  sortColumn: string = '';  // Columna que se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc';  // Dirección de ordenación

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadPets();
  }

  // Cargar mascotas desde el API
  loadPets(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('pets', true).subscribe(
      (response) => {
        if (response.success) {
          this.pets = response.data;
          this.filteredPets = this.pets;  // Iniciar el filtrado con todas las mascotas
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        Swal.fire('Error', 'No se pudieron cargar las mascotas', 'error');
      }
    );
  }

  deletePet(id: string): void {
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
        this.apiService.delete(`pets/${id}`, true).subscribe(
          (response) => {
            // Eliminar la mascota de la lista local sin recargar
            this.pets = this.pets.filter(pet => pet.id !== id);
            this.filteredPets = this.filteredPets.filter(pet => pet.id !== id);

            // Verificar si no quedan mascotas
            if (this.pets.length === 0) {
              this.currentPage = 1; // Reiniciar la paginación
            }
            this.showAlert('success', 'La mascota ha sido eliminada.');
          },
          (error) => {
            // Mostrar el mensaje de error retornado por la API
            const errorMessage = error?.error?.message || 'No se pudo eliminar la mascota.';
            this.showAlert('error', errorMessage);
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

    this.filteredPets.sort((a, b) => {
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

  // Paginación: Obtener mascotas de la página actual
  get paginatedPets(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPets.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages.length) {
      return; // Evitar que se salga de los límites
    }
    this.currentPage = page;
  }

  // Filtro de búsqueda: buscar por código, nombre de mascota, raza, especie y cliente
  onSearch(): void {
    this.filteredPets = this.pets.filter(pet =>
      pet.petCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      pet.petName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      pet.breedName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      pet.specieName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      pet.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1;  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredPets.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredPets.length);
    return `Mostrando ${start} - ${end} de ${this.filteredPets.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.pets.length}`;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(): void {
    this.currentPage = 1;  // Reinicia la página a la primera
  }

  // Función para redirigir al formulario de edición
  editPet(id: string): void {
    const encodedId = btoa(id);
    this.router.navigate(['/pets/edit', encodedId]);  // Redirige a la ruta de edición
  }

  // Mostrar alertas con SweetAlert2
  showAlert(type: 'success' | 'error' | 'warning' | 'info' | 'question', message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      text: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Función para truncar texto
  truncateText(text: string, limit: number): string {
    if (text.length > limit) {
      return text.substring(0, limit) + '...';
    }
    return text;
  }

}