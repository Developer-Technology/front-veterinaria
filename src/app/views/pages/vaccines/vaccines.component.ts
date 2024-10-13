import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vaccines',
  templateUrl: './vaccines.component.html',
  styleUrls: ['./vaccines.component.scss']
})
export class VaccinesComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;

  vaccines: any[] = [];  // Lista completa de vacunas
  species: any[] = [];  // Lista de especies para el select
  isLoading: boolean = true;  // Estado de carga
  actions: any[] = [];  // Acciones que se pueden realizar en la tabla
  newVaccine: any = { vaccineName: '', species_id: null };  // Objeto para la nueva vacuna
  selectedVaccine: any = null;  // Vacuna seleccionada para editar
  errors: any = {};  // Errores de validación
  currentPage: number = 1;  // Página actual
  itemsPerPage: number = 5;  // Cantidad de registros por página
  isNotData: boolean = false;

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadVaccines();
    this.loadSpecies();
    this.setupActions();
  }

  // Cargar vacunas desde el API
  loadVaccines(): void {
    this.isLoading = true;
    this.apiService.get('vaccines', true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines = response.data
            .filter((vaccine: any) => vaccine.vaccineName)  // Filtrar vacunas válidas
            .sort((a: any, b: any) => b.id - a.id);  // Ordenar descendente por 'id'
          this.isNotData = true;
          this.isLoading = false;
        } else {
          this.isNotData = false;
        }
      },
      () => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las vacunas');
      }
    );
  }

  // Cargar especies desde el API para el dropdown
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data;
        }
      },
      () => this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies')
    );
  }

  // Configurar las acciones para la tabla
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: (vaccine: any) => this.openEditModal(vaccine),
        condition: (vaccine: any) => true  // Todas las filas pueden ser editadas
      },
      {
        label: 'Eliminar',
        onClick: (vaccine: any) => this.deleteVaccine(vaccine.id), // Pasamos solo el ID correctamente
        condition: (vaccine: any) => true  // Todas las filas pueden ser eliminadas
      }
    ];
  }

  openAddModal(content: TemplateRef<any>): void {
    this.newVaccine = { vaccineName: '', species_id: null };
    this.errors = {};
    this.modalService.open(content);
  }

  // Abrir modal para editar vacuna
  openEditModal(vaccine: any): void {
    this.selectedVaccine = { ...vaccine };
    this.errors = {};
    this.modalService.open(this.editModal);  // Abrir modal de edición
  }

  // Enviar formulario para agregar una nueva vacuna
  onSubmit(modal: any): void {
    this.apiService.post('vaccines', this.newVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines.push(response.data);
          this.newVaccine = { vaccineName: '', species_id: null };
          this.errors = {};
          modal.close();
          this.utilitiesService.showAlert('success', 'Vacuna agregada correctamente.');
          this.loadVaccines();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la vacuna.');
        }
      }
    );
  }

  // Enviar formulario para editar una vacuna existente
  onEditSubmit(modal: any): void {
    this.apiService.put(`vaccines/${this.selectedVaccine.id}`, this.selectedVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.vaccines.findIndex(v => v.id === this.selectedVaccine.id);
          if (index !== -1) {
            this.vaccines[index] = response.data;
          }
          modal.close();
          this.utilitiesService.showAlert('success', 'Vacuna actualizada correctamente.');
          this.loadVaccines();
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la vacuna.');
        }
      }
    );
  }

  // Eliminar una vacuna y actualizar la tabla
  deleteVaccine(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`vaccines/${id}`, true).subscribe(
            (result) => {
              this.utilitiesService.showAlert('success', 'La vacuna ha sido eliminada.');
              this.loadVaccines();
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la vacuna.';
              this.utilitiesService.showAlert('error', errorMessage)
            }
          );
        }
      });
  }

}