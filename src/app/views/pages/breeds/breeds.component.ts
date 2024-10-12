import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
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
  itemsPerPage: number = 5;  // Cantidad de registros por página
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
    private modalService: NgbModal,
    private utilitiesService: UtilitiesService
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
          this.breeds = response.data
            .filter((breed: any) => breed.breedName)  // Filtrar razas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'

          this.filteredBreeds = [...this.breeds];  // Clonar array de razas
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las razas');
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
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies');
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
          this.utilitiesService.showAlert('success', 'Raza agregada correctamente.');
          this.loadBreeds();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la raza.');
        }
      }
    );
  }

  deleteBreed(id: string): void {
    this.utilitiesService
      .showConfirmationDelet(
        '¿Estás seguro?',
        '¡Esta acción no se puede deshacer!'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`breeds/${id}`, true).subscribe(
            (response) => {
              // Eliminar la raza de la lista local sin recargar
              this.breeds = this.breeds.filter(breed => breed.id !== id);
              this.filteredBreeds = this.filteredBreeds.filter(breed => breed.id !== id);

              // Verificar cuántos registros quedan en la página actual
              const totalPages = Math.ceil(this.filteredBreeds.length / this.itemsPerPage);

              // Si ya no quedan registros en la página actual y no estamos en la primera página
              if (this.currentPage > totalPages && this.currentPage > 1) {
                this.currentPage--; // Retroceder una página
              }

              this.utilitiesService.showAlert('success', 'La raza ha sido eliminada.');
            },
            (error) => {
              // Mostrar el mensaje de error retornado por la API
              const errorMessage = error?.error?.message || 'No se pudo eliminar la raza.';
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
    return this.utilitiesService.getPaginatedData(this.filteredBreeds, this.currentPage, this.itemsPerPage);
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = this.totalPages.length;
    this.currentPage = this.utilitiesService.validatePageNumber(page, totalPages);
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
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return this.utilitiesService.getTotalPages(this.filteredBreeds, this.itemsPerPage);
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

  // Obtener el total de páginas en un formato compacto para paginación
  get compactTotalPages(): number[] {
    const totalPages = this.totalPages.length;
    const pagesToShow = 5;  // Número fijo de páginas a mostrar
    const visiblePages = [];

    // Si hay menos páginas de las que queremos mostrar, mostrar todas
    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Calcular los límites de la "ventana" de páginas alrededor de la página actual
      const halfWindow = Math.floor(pagesToShow / 2);
      let startPage = Math.max(1, this.currentPage - halfWindow);
      let endPage = Math.min(totalPages, this.currentPage + halfWindow);

      // Ajustar para mantener la ventana de páginas completa si estamos al principio o al final
      if (this.currentPage <= halfWindow) {
        endPage = pagesToShow;
      } else if (this.currentPage + halfWindow >= totalPages) {
        startPage = totalPages - pagesToShow + 1;
      }

      // Siempre mostrar la primera página
      if (startPage > 1) {
        visiblePages.push(1);
        if (startPage > 2) {
          visiblePages.push(-1); // Puntos suspensivos si hay espacio entre 1 y startPage
        }
      }

      // Agregar las páginas dentro de la ventana
      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }

      // Siempre mostrar la última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          visiblePages.push(-1); // Puntos suspensivos si hay espacio entre endPage y la última página
        }
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado y convertirlo a número
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1); // Actualiza la vista para respetar la cantidad seleccionada
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
          this.utilitiesService.showAlert('success', 'Raza actualizada correctamente.');
          this.loadBreeds();  // Recargar las razas
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la raza.');
        }
      }
    );
  }

}