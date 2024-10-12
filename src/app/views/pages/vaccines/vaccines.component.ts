import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrls: ['./vaccines.component.scss']
})
export class VaccinesComponent implements OnInit {

  vaccines: any[] = [];  // Lista completa de vacunas
  filteredVaccines: any[] = [];  // Lista filtrada de vacunas
  species: any[] = [];  // Lista de especies para el select
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 5;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga
  sortColumn: string = '';  // Columna que se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc';  // Dirección de ordenación
  newVaccine: any = { vaccineName: '', species_id: null };  // Objeto para la nueva vacuna
  selectedVaccine: any = null;
  errors: any = {};  // Objeto para errores de validación

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadVaccines();
    this.loadSpecies();  // Cargar las especies para el select
  }

  // Método para abrir el modal
  openAddModal(content: TemplateRef<any>) {
    this.newVaccine = { vaccineName: '', species_id: null };  // Reiniciar el formulario de nueva vacuna
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Cargar vacunas desde el API
  loadVaccines(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('vaccines', true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines = response.data
            .filter((vaccine: any) => vaccine.vaccineName)  // Filtrar razas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Filtrar vacunas válidas
          this.filteredVaccines = [...this.vaccines];  // Clonar array de vacunas
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las vacunas');
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

  // Agregar una nueva vacuna
  onSubmit(modal: any): void {
    this.apiService.post('vaccines', this.newVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines.push(response.data);  // Añadir la nueva vacuna a la lista
          this.filteredVaccines.push(response.data);
          this.newVaccine = { vaccineName: '', species_id: null };  // Reiniciar el formulario
          this.errors = {};  // Limpiar errores
          modal.close();  // Cerrar el modal
          this.utilitiesService.showAlert('success', 'Vacuna agregada correctamente.');
          this.loadVaccines();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la vacuna.');
        }
      }
    );
  }

  deleteVaccine(id: string): void {
    this.utilitiesService
      .showConfirmationDelet(
        '¿Estás seguro?',
        '¡Esta acción no se puede deshacer!'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`vaccines/${id}`, true).subscribe(
            (response) => {
              // Eliminar la vacuna de la lista local sin recargar
              this.vaccines = this.vaccines.filter(vaccine => vaccine.id !== id);
              this.filteredVaccines = this.filteredVaccines.filter(vaccine => vaccine.id !== id);

              const totalPages = Math.ceil(this.filteredVaccines.length / this.itemsPerPage);
              if (this.currentPage > totalPages && this.currentPage > 1) {
                this.currentPage--; // Retroceder una página si no hay más registros
              }

              this.utilitiesService.showAlert('success', 'La vacuna ha sido eliminada.');
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la vacuna.';
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

    this.filteredVaccines.sort((a, b) => {
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

  // Paginación: Obtener vacunas de la página actual
  get paginatedVaccines(): any[] {
    return this.utilitiesService.getPaginatedData(this.filteredVaccines, this.currentPage, this.itemsPerPage);
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = this.totalPages.length;
    this.currentPage = this.utilitiesService.validatePageNumber(page, totalPages);
  }

  // Filtro de búsqueda: buscar en nombre de la vacuna o la especie
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredVaccines = [...this.vaccines];  // Mostrar todas las vacunas si la búsqueda está vacía
    } else {
      this.filteredVaccines = this.vaccines.filter(vaccine =>
        vaccine.vaccineName.toLowerCase().includes(this.searchQuery.toLowerCase()) || vaccine.specieName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return this.utilitiesService.getTotalPages(this.filteredVaccines, this.itemsPerPage);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredVaccines.length);
    return `Mostrando ${start} - ${end} de ${this.filteredVaccines.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.vaccines.length}`;
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

  // Método para abrir el modal de edición con los datos de la vacuna seleccionada
  openEditModal(content: TemplateRef<any>, vaccine: any): void {
    this.selectedVaccine = { ...vaccine };  // Clonar la vacuna seleccionada
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Método para editar la vacuna seleccionada
  onEditSubmit(modal: any): void {
    this.apiService.put(`vaccines/${this.selectedVaccine.id}`, this.selectedVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.vaccines.findIndex(v => v.id === this.selectedVaccine.id);
          if (index !== -1) {
            this.vaccines[index] = response.data;  // Actualizar la vacuna en la lista local
            this.filteredVaccines[index] = response.data;  // Actualizar la lista filtrada
          }
          modal.close();  // Cerrar el modal
          this.selectedVaccine = null;  // Limpiar el objeto seleccionado
          this.utilitiesService.showAlert('success', 'Vacuna actualizada correctamente.');
          this.loadVaccines();  // Recargar las vacunas
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la vacuna.');
        }
      }
    );
  }

}