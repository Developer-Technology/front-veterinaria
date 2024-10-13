import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit {

  @Input() columns: any[] = [];  // Columnas que se mostrarán en la tabla
  @Input() data: any[] = [];  // Datos a mostrar
  @Input() itemsPerPage: number = 5;  // Número de elementos por página
  @Input() actions: any[] = [];  // Acciones que se pueden realizar en cada fila (editar, eliminar, etc.)

  currentPage: number = 1;  // Página actual
  searchQuery: string = '';  // Filtro de búsqueda
  filteredData: any[] = [];  // Datos filtrados
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  serverUrl: string;

  constructor(
    private apiService: ApiService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    this.filteredData = this.data;  // Inicializar con todos los datos
  }

  // Función para manejar la búsqueda
  onSearch(): void {
    this.filteredData = this.data.filter(item => {
      return this.columns.some(column => {
        return item[column.key]?.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    });
    this.changePage(1);  // Reiniciar a la primera página después de filtrar
  }

  // Paginación: Obtener datos paginados
  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }

  // Cambiar página
  changePage(page: number): void {
    const totalPages = this.totalPages.length;
    if (page < 1) {
      this.currentPage = 1;
    } else if (page > totalPages) {
      this.currentPage = totalPages;
    } else {
      this.currentPage = page;
    }
  }

  // Obtener el total de páginas
  get totalPages(): number[] {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    return Array(totalPages).fill(0).map((_, i) => i + 1);
  }

  // Función para ordenar los datos por columna
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
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

  // Obtener el icono de ordenación
  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down';
    }
    return 'icon-chevron-up-down';
  }

  // Mostrar total de registros y la cantidad mostrada actualmente
  get showingRecords(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
    return `Mostrando ${start} - ${end} de ${this.filteredData.length} resultados`;
  }

  // Total de registros
  get totalRecords(): string {
    return `Total de registros: ${this.data.length}`;
  }

  // Obtener el número total de páginas en formato compacto
  get compactTotalPages(): number[] {
    const totalPages = this.totalPages.length;
    const pagesToShow = 5;  // Número fijo de páginas a mostrar
    const visiblePages = [];

    if (totalPages <= pagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      const halfWindow = Math.floor(pagesToShow / 2);
      let startPage = Math.max(1, this.currentPage - halfWindow);
      let endPage = Math.min(totalPages, this.currentPage + halfWindow);

      if (this.currentPage <= halfWindow) {
        endPage = pagesToShow;
      } else if (this.currentPage + halfWindow >= totalPages) {
        startPage = totalPages - pagesToShow + 1;
      }

      if (startPage > 1) {
        visiblePages.push(1);
        if (startPage > 2) {
          visiblePages.push(-1);  // Puntos suspensivos
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          visiblePages.push(-1);  // Puntos suspensivos
        }
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  }

  // Método para cambiar la cantidad de ítems por página
  onChangeItemsPerPage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(target.value, 10);  // Obtener el valor seleccionado
    this.currentPage = 1;  // Reinicia la página a la primera
    this.changePage(1);  // Actualiza la vista
  }

  // Verificar si la acción es visible
  isActionVisible(action: any, item: any): boolean {
    return action.condition ? action.condition(item) : true;
  }

}