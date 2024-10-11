import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-breeds',
  templateUrl: './breeds.component.html',
  styleUrls: ['./breeds.component.scss']
})
export class BreedsComponent implements OnInit {

  breeds: any[] = [];  // Lista completa de razas
  filteredBreeds: any[] = [];  // Lista filtrada de razas
  species: any[] = [];  // Lista de especies para el select
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 10;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga
  sortColumn: string = '';  // Columna que se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc';  // Dirección de ordenación
  newBreed: any = { breedName: '', species_id: null };  // Objeto para la nueva raza
  selectedBreed: any = null;
  errors: any = {};  // Objeto para errores de validación

  constructor(
    private apiService: ApiService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadBreeds();
    this.loadSpecies();  // Cargar las especies para el select
  }

  // Método para abrir el modal
  openAddModal(content: TemplateRef<any>) {
    this.newBreed = { breedName: '', species_id: null };  // Reiniciar el formulario de nueva raza
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Cargar razas desde el API
  loadBreeds(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('breeds', true).subscribe(
      (response) => {
        if (response.success) {
          this.breeds = response.data.filter((breed: any) => breed.breedName);  // Filtrar razas válidas
          this.filteredBreeds = [...this.breeds];  // Clonar array de razas
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        Swal.fire('Error', 'No se pudieron cargar las razas', 'error');
      }
    );
  }

  // Cargar especies para el dropdown
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data;  // Cargar las especies en el select
        }
      },
      (error) => {
        Swal.fire('Error', 'No se pudieron cargar las especies', 'error');
      }
    );
  }

  // Agregar una nueva raza
  onSubmit(modal: any): void {
    this.apiService.post('breeds', this.newBreed, true).subscribe(
      (response) => {
        if (response.success) {
          this.breeds.push(response.data);  // Añadir la nueva raza a la lista
          this.filteredBreeds.push(response.data);
          this.newBreed = { breedName: '', species_id: null };  // Reiniciar el formulario
          this.errors = {};  // Limpiar errores
          modal.close();  // Cerrar el modal
          this.showAlert('success', 'Raza agregada correctamente.');
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.showAlert('error', 'No se pudo agregar la raza.');
        }
      }
    );
  }

  deleteBreed(id: string): void {
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
        this.apiService.delete(`breeds/${id}`, true).subscribe(
          (response) => {
            // Eliminar la raza de la lista local sin recargar
            this.breeds = this.breeds.filter(breed => breed.id !== id);
            this.filteredBreeds = this.filteredBreeds.filter(breed => breed.id !== id);

            // Verificar si no quedan razas
            if (this.breeds.length === 0) {
              this.currentPage = 1; // Reiniciar la paginación
            }
            this.showAlert('success', 'La raza ha sido eliminada.');
          },
          (error) => {
            this.showAlert('error', 'No se pudo eliminar la raza.');
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

    this.filteredBreeds.sort((a, b) => {
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

  // Paginación: Obtener razas de la página actual
  get paginatedBreeds(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBreeds.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages.length) {
      return; // Evitar que se salga de los límites
    }
    this.currentPage = page;
  }

  // Filtro de búsqueda: buscar en nombre de la raza
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredBreeds = [...this.breeds];  // Mostrar todas las razas si la búsqueda está vacía
    } else {
      this.filteredBreeds = this.breeds.filter(breed =>
        breed.breedName.toLowerCase().includes(this.searchQuery.toLowerCase()) || breed.specieName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.currentPage = 1;  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredBreeds.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredBreeds.length);
    return `Mostrando ${start} - ${end} de ${this.filteredBreeds.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.breeds.length}`;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(): void {
    this.currentPage = 1;  // Reinicia la página a la primera
  }

  // Método para abrir el modal de edición con los datos de la raza seleccionada
  openEditModal(content: TemplateRef<any>, breed: any): void {
    this.selectedBreed = { ...breed };  // Clonar la raza seleccionada
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Método para editar la raza seleccionada
  onEditSubmit(modal: any): void {
    this.apiService.put(`breeds/${this.selectedBreed.id}`, this.selectedBreed, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.breeds.findIndex(b => b.id === this.selectedBreed.id);
          if (index !== -1) {
            this.breeds[index] = response.data;  // Actualizar la raza en la lista local
            this.filteredBreeds[index] = response.data;  // Actualizar la lista filtrada
          }
          modal.close();  // Cerrar el modal
          this.selectedBreed = null;  // Limpiar el objeto seleccionado
          this.showAlert('success', 'Raza actualizada correctamente.');
          this.loadBreeds();  // Recargar las razas
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.showAlert('error', 'No se pudo actualizar la raza.');
        }
      }
    );
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

}