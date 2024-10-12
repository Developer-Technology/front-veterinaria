import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-species',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss']
})
export class SpeciesComponent implements OnInit {

  species: any[] = [];  // Lista completa de especies
  filteredSpecies: any[] = [];  // Lista filtrada de especies
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 5;  // Cantidad de registros por página
  searchQuery: string = '';  // Query de búsqueda
  isDropdownOpen: boolean = false;
  isLoading: boolean = true;  // Variable de carga
  sortColumn: string = '';  // Columna que se está ordenando
  sortDirection: 'asc' | 'desc' = 'asc';  // Dirección de ordenación
  newSpecie: any = { specieName: '' };  // Objeto para la nueva especie
  selectedSpecie: any = null;
  errors: any = {};  // Objeto para errores de validación

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadSpecies();
  }

  // Método para abrir el modal
  openAddModal(content: TemplateRef<any>) {
    this.newSpecie = { specieName: '' };  // Reiniciar el formulario de nueva especie
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Cargar especies desde el API
  loadSpecies(): void {
    this.isLoading = true;  // Iniciar el estado de carga
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data
            .filter((specie: any) => specie.specieName)  // Filtrar razas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Filtrar especies válidas
          this.filteredSpecies = [...this.species];  // Clonar array de especies
          this.isLoading = false;  // Desactivar el estado de carga
        }
      },
      (error) => {
        this.isLoading = false;  // Desactivar el estado de carga en caso de error
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies');
      }
    );
  }

  // Agregar una nueva especie
  onSubmit(modal: any): void {
    this.apiService.post('species', this.newSpecie, true).subscribe(
      (response) => {
        if (response.success) {
          this.species.push(response.data);  // Añadir la nueva especie a la lista
          this.filteredSpecies.push(response.data);
          this.newSpecie = { specieName: '' };  // Reiniciar el formulario
          this.errors = {};  // Limpiar errores
          modal.close();  // Cerrar el modal
          this.utilitiesService.showAlert('success', 'Especie agregada correctamente.');
          this.loadSpecies();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la especie.');
        }
      }
    );
  }

  deleteSpecie(id: string): void {
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
        this.apiService.delete(`species/${id}`, true).subscribe(
          (response) => {
            // Eliminar la mascota de la lista local sin recargar
            this.species = this.species.filter(specie => specie.id !== id);
            this.filteredSpecies = this.filteredSpecies.filter(specie => specie.id !== id);

            // Verificar cuántos registros quedan en la página actual
            const totalPages = Math.ceil(this.filteredSpecies.length / this.itemsPerPage);

            // Si ya no quedan registros en la página actual y no estamos en la primera página
            if (this.currentPage > totalPages && this.currentPage > 1) {
              this.currentPage--; // Retroceder una página
            }

            this.utilitiesService.showAlert('success', 'La especie ha sido eliminada.');
          },
          (error) => {
            // Mostrar el mensaje de error retornado por la API
            const errorMessage = error?.error?.message || 'No se pudo eliminar la especie.';
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

    this.filteredSpecies.sort((a, b) => {
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
  get paginatedSpecies(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredSpecies.slice(start, end);  // Obtener el subconjunto de mascotas para la página actual
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = Math.ceil(this.filteredSpecies.length / this.itemsPerPage);

    // Validar que la página esté dentro del rango permitido
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > totalPages) {
      this.currentPage = totalPages;
    } else {
      this.currentPage = page;
    }
  }

  // Filtro de búsqueda: buscar en nombre de la especie
  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredSpecies = [...this.species];  // Mostrar todas las especies si la búsqueda está vacía
    } else {
      this.filteredSpecies = this.species.filter(specie =>
        specie.specieName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    return Array(Math.ceil(this.filteredSpecies.length / this.itemsPerPage)).fill(0).map((x, i) => i + 1);
  }

  // Mostrar el número de resultados actuales
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredSpecies.length);
    return `Mostrando ${start} - ${end} de ${this.filteredSpecies.length} resultados`;
  }

  // Obtener el total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.species.length}`;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado y convertirlo a número
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1); // Actualiza la vista para respetar la cantidad seleccionada
  }

  // Método para abrir el modal de edición con los datos de la especie seleccionada
  openEditModal(content: TemplateRef<any>, specie: any): void {
    this.selectedSpecie = { ...specie };  // Clonar la especie seleccionada
    this.errors = {};  // Limpiar errores previos
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      () => { }, () => { }
    );
  }

  // Método para editar la especie seleccionada
  onEditSubmit(modal: any): void {
    this.apiService.put(`species/${this.selectedSpecie.id}`, this.selectedSpecie, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.species.findIndex(s => s.id === this.selectedSpecie.id);
          if (index !== -1) {
            this.species[index] = response.data;  // Actualizar la especie en la lista local
            this.filteredSpecies[index] = response.data;  // Actualizar la lista filtrada
          }
          modal.close();  // Cerrar el modal
          this.selectedSpecie = null;  // Limpiar el objeto seleccionado
          this.utilitiesService.showAlert('success', 'Especie actualizada correctamente.');
          this.loadSpecies();  // Recargar las especies
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;  // Mostrar errores de validación
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la especie.');
        }
      }
    );
  }

}