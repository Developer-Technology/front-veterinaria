import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-pet',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  @ViewChild('editModal') editModal!: TemplateRef<any>;
  @ViewChild('editVaccineModal') editVaccineModal!: TemplateRef<any>;

  defaultNavActiveId = 1;
  notes: any[] = [];
  histories: any[] = [];
  vaccines: any[] = [];
  allVaccines: any[] = [];
  visibleNotes: any[] = [];
  pet: any = {};  // Información de la mascota
  isLoading: boolean = true;
  vaccinesLoading: boolean = false;  // Nueva bandera para el estado de carga de vacunas
  vaccinesLoaded: boolean = false;   // Nueva bandera para saber si ya se han cargado las vacunas
  selectedNote: any = null;
  serverUrl: string;
  errors: any = {};
  newNote: any = {
    pet_id: '',
    noteDescription: '',
    noteDate: ''
  };
  newVaccine: any = {
    pet_id: '',
    vaccine_id: '',
    observation: '',
    product: '',
    vaccine_date: ''
  };
  selectedVaccine: any = {
    id: '',
    vaccine_id: '',
    observation: '',
    product: '',
    vaccine_date: ''
  };
  maxCharacters = 140;  // Máximo número de caracteres permitidos
  remainingCharacters = this.maxCharacters;  // Caracteres restantes
  notesPerPage: number = 5; // Número de notas por página
  currentPage: number = 1;  // Página actual
  allNotesLoaded: boolean = false;
  actions: any[] = [];
  historiesLoading: boolean = false;
  pdfToDisplay: SafeResourceUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private utilitiesService: UtilitiesService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (encodedId) {
      const decodedId = atob(encodedId);  // Decodificar el ID
      this.loadPet(decodedId);
      this.loadNotes(decodedId);
      this.loadHistories(decodedId);
      this.setupActions();
    }
  }

  // Función para cargar la información de la mascota desde la API
  loadPet(id: string): void {
    this.isLoading = true;
    this.apiService.get(`pets/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.pet = response.data;
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudo cargar la información de la mascota');
      }
    );
  }

  // Función para cargar las notas con paginación
  loadNotes(petId: string): void {
    this.apiService.get(`pets/${petId}`, true).subscribe(
      (response) => {
        if (response.success) {
          const loadedNotes = response.data.notes;

          // Ordena las notas por 'id' en orden descendente
          this.notes = loadedNotes.sort((a: any, b: any) => b.id - a.id);

          // Resetear la paginación cuando se recargan las notas
          this.currentPage = 1;
          this.visibleNotes = []; // Limpiar las notas visibles
          this.allNotesLoaded = false; // Habilitar la carga de más notas
          this.paginateNotes(); // Cargar las primeras notas
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las notas');
      }
    );
  }

  // Función para cargar las notas con paginación
  loadVaccines(petId: string): void {
    // Evitar recargar vacunas si ya se han cargado antes
    //if (this.vaccinesLoaded) return;

    // Marcar que estamos cargando las vacunas
    this.vaccinesLoading = true;

    this.apiService.get(`pets/${petId}/vaccine-history`, true).subscribe(
      (response) => {
        if (response.success) {
          this.vaccines = response.data.sort((a: any, b: any) => b.id - a.id);
          this.loadAllVaccines();
          this.vaccinesLoading = false;
          this.vaccinesLoaded = true;  // Marcar que ya se han cargado las vacunas
        }
      },
      (error) => {
        this.vaccinesLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las vacunas');
      }
    );
  }

  // Función para cargar las notas con paginación
  loadHistories(petId: string): void {
    this.historiesLoading = true;
    this.apiService.get(`pet-histories/${petId}`, true).subscribe(
      (response) => {
        if (response.success) {
          const loadedHistories = response.data;
          this.histories = loadedHistories.sort((a: any, b: any) => b.id - a.id);
          this.historiesLoading = false;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las historias');
      }
    );
  }

  // Función para calcular la edad en base a la fecha de nacimiento
  calculateAge(birthDate: string): string {
    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    // Ajuste si los días son negativos
    if (days < 0) {
      months--;
      // Obtener el número de días en el mes anterior
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    // Ajuste si los meses son negativos
    if (months < 0) {
      years--;
      months += 12;
    }

    // Devolver la edad en formato "X año(s), Y mes(es) y Z día(s)"
    return `${years} año(s), ${months} mes(es) y ${days} día(s)`;
  }

  // Método para regresar a "/pets"
  goBack(): void {
    this.router.navigate(['/pets']);
  }

  openAddModal(content: TemplateRef<any>): void {
    this.newNote = {
      pet_id: this.pet.id,  // Mantener el pet_id
      noteDescription: '',
      noteDate: new Date().toISOString().slice(0, 10)  // Establecer la fecha actual en formato YYYY-MM-DD
    };
    this.errors = {};
    this.updateCharacterCount();  // Restablecer el contador de caracteres
    this.modalService.open(content);
  }

  // Función para actualizar el contador de caracteres
  updateCharacterCount(): void {
    this.remainingCharacters = this.maxCharacters - (this.newNote.noteDescription?.length || 0);
  }

  onSubmit(modal: any): void {
    // Asignar la fecha actual antes de enviar el formulario
    this.newNote.noteDate = new Date().toISOString().slice(0, 10);  // Fecha actual en formato YYYY-MM-DD

    // Hacer la petición para crear la nota
    this.apiService.post('petnotes', this.newNote, true).subscribe(
      (response) => {
        if (response.success) {
          // Agregar la nueva nota al principio de la lista de notas y actualizar la vista
          this.notes.unshift(response.data);
          this.visibleNotes = []; // Limpiar las notas visibles
          this.currentPage = 1; // Reiniciar la página actual para la paginación
          this.allNotesLoaded = false; // Permitir la carga de más notas
          this.paginateNotes(); // Recargar las notas paginadas desde el inicio

          this.newNote = { pet_id: this.pet.id, noteDescription: '', noteDate: '' };  // Restablecer los datos de la nota
          this.errors = {};
          modal.close();
          this.utilitiesService.showAlert('success', 'Nota agregada correctamente.');
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la nota.');
        }
      }
    );
  }

  openEditModal(note: any): void {
    this.selectedNote = { ...note };  // Clonar el objeto de la nota completa
    this.errors = {};
    this.updateCharacterCountEdit();  // Actualizar el contador de caracteres basado en la nota
    this.modalService.open(this.editModal);  // Abrir modal de edición
  }

  // Método para actualizar el contador de caracteres al editar
  updateCharacterCountEdit(): void {
    this.remainingCharacters = this.maxCharacters - (this.selectedNote.noteDescription?.length || 0);
  }

  // Enviar formulario para editar una nota existente
  onEditSubmit(modal: any): void {
    // Asegúrate de que pet_id esté en selectedNote
    if (!this.selectedNote.pet_id) {
      this.selectedNote.pet_id = this.pet.id;  // Asignar el pet_id correcto
    }

    this.apiService.put(`petnotes/${this.selectedNote.id}`, this.selectedNote, true).subscribe(
      (response) => {
        if (response.success) {
          const index = this.notes.findIndex(s => s.id === this.selectedNote.id);
          if (index !== -1) {
            this.notes[index] = response.data;
          }
          modal.close();
          this.utilitiesService.showAlert('success', 'Nota actualizada correctamente.');

          // Asegúrate de que pet_id esté definido en el response.data
          const petId = response.data.pet_id || this.selectedNote.pet_id;

          this.loadNotes(petId);  // Llamar a loadNotes con el pet_id correcto
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la especie.');
        }
      }
    );
  }

  // Eliminar una nota y actualizar la tabla
  deleteNote(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`petnotes/${id}`, true).subscribe(
            (result) => {
              this.utilitiesService.showAlert('success', 'La nota ha sido eliminada.');
              // Usar el pet_id que ya tienes en el componente para recargar las notas
              this.loadNotes(this.pet.id);
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la nota.';
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );
        }
      });
  }

  // Función para paginar las notas en el frontend
  paginateNotes(): void {
    if (this.allNotesLoaded) return; // Si ya se cargaron todas las notas, no continuar

    const start = (this.currentPage - 1) * this.notesPerPage;
    const end = this.currentPage * this.notesPerPage;

    // Obtener las nuevas notas paginadas
    const newNotes = this.notes.slice(start, end);

    if (newNotes.length < this.notesPerPage) {
      this.allNotesLoaded = true; // Marcar que todas las notas han sido cargadas si no hay suficientes notas
    }

    // Añadir las nuevas notas a las notas visibles
    this.visibleNotes = [...this.visibleNotes, ...newNotes];

    // Incrementar la página para la próxima carga
    this.currentPage++;
  }

  // Función para detectar cuando se llega al final del scroll
  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      // Si se llega al final, cargar más notas
      this.paginateNotes();
    }
  }

  // Método para mostrar las acciones al pasar el mouse
  showActions(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const actions = target.querySelector('.action-buttons');
    if (actions) {
      actions.setAttribute('style', 'display: inline-flex;');
    }
  }

  // Método para ocultar las acciones al quitar el mouse
  hideActions(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const actions = target.querySelector('.action-buttons');
    if (actions) {
      actions.setAttribute('style', 'display: none;');
    }
  }

  // Definir las acciones para cada vacuna
  setupActions(): void {
    this.actions = [
      {
        label: 'Editar',
        onClick: (vaccine: any) => this.openEditModalVaccine(vaccine),  // Pasamos la referencia de la función
        condition: (vaccine: any) => true  // Condición para habilitar la acción
      },
      {
        label: 'Eliminar',
        onClick: (vaccine: any) => this.deleteVaccine(vaccine.id),  // Pasamos la referencia de la función
        condition: (vaccine: any) => true  // Condición para habilitar la acción
      }
    ];
  }

  // Carga todas las vacunas registradas
  loadAllVaccines(): void {
    this.apiService.get('vaccines', true).subscribe(
      (response) => {
        if (response.success) {
          this.allVaccines = response.data;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las vacunas');
      }
    );
  }

  // Abre la ventana modal para agregar la vacuna
  openAddModalVaccine(content: TemplateRef<any>): void {
    this.newVaccine = {
      pet_id: this.pet.id,  // Mantener el pet_id correcto
      vaccine_id: '',
      observation: '',
      product: '',
      vaccine_date: ''
    };
    this.errors = {};
    this.modalService.open(content);
  }

  // Guarda el registro de la vacuna aplicada
  onSubmitVaccine(modal: any): void {
    // Asignar el pet_id si no está presente por alguna razón
    if (!this.newVaccine.pet_id) {
      this.newVaccine.pet_id = this.pet.id;
    }
    // Asignar la fecha actual antes de enviar el formulario
    const formattedVaccineDate = this.utilitiesService.convertDateToString(this.newVaccine.vaccine_date);
    this.newVaccine.vaccine_date = formattedVaccineDate;

    // Hacer la petición para crear la nota
    this.apiService.post('vaccineshistory', this.newVaccine, true).subscribe(
      (response) => {
        if (response.success) {
          // Agregar la nueva nota al principio de la lista de notas y actualizar la vista
          this.loadVaccines(this.pet.id); // Recargar las notas paginadas desde el inicio
          this.newVaccine = { pet_id: this.pet.id, vaccine_id: '', product: '', observation: '' };  // Restablecer los datos de la nota
          this.errors = {};
          modal.close();
          this.utilitiesService.showAlert('success', 'Vacuna agregada correctamente.');
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

  // Eliminar una vacuna y actualizar la tabla
  deleteVaccine(id: string): void {
    this.utilitiesService.showConfirmationDelet('¿Estás seguro?', '¡Esta acción no se puede deshacer!')
      .then((result) => {
        if (result.isConfirmed) {
          this.apiService.delete(`vaccineshistory/${id}`, true).subscribe(
            (result) => {
              this.utilitiesService.showAlert('success', 'La vacuna ha sido eliminada.');
              // Usar el pet_id que ya tienes en el componente para recargar las vacunas
              this.loadVaccines(this.pet.id);
            },
            (error) => {
              const errorMessage = error?.error?.message || 'No se pudo eliminar la vacuna.';
              this.utilitiesService.showAlert('error', errorMessage);
            }
          );
        }
      });
  }

  openEditModalVaccine(vaccine: any): void {
    this.selectedVaccine = { ...vaccine };  // Clonar el objeto de la vacuna
    // Convertir la fecha de nacimiento para usarla en ngbDatepicker
    this.selectedVaccine.vaccineDate = this.utilitiesService.convertStringToDateStruct(this.selectedVaccine.vaccineDate);
    this.errors = {};  // Limpiar los errores previos si los hubiera
    console.log(this.selectedVaccine);
    this.modalService.open(this.editVaccineModal);  // Abrir el modal de edición
  }

  // Método para guardar los cambios de la vacuna editada
  onEditSubmitVaccine(modal: any): void {

    // Asignar la fecha en el formato adecuado antes de enviar el formulario
    const formattedVaccineDate = this.utilitiesService.convertDateToString(this.selectedVaccine.vaccineDate);
    this.selectedVaccine.vaccineDate = formattedVaccineDate;

    const payload = {
      vaccine_id: this.selectedVaccine.vaccineId,
      vaccine_date: this.selectedVaccine.vaccineDate,
      product: this.selectedVaccine.productUsed,
      observation: this.selectedVaccine.observations
    };

    // Hacer la petición para actualizar la vacuna
    this.apiService.put(`vaccineshistory/${this.selectedVaccine.id}`, payload, true).subscribe(
      (response) => {
        if (response.success) {
          // Recargar las vacunas de la mascota
          this.loadVaccines(this.pet.id);
          modal.close();
          this.utilitiesService.showAlert('success', 'Vacuna actualizada correctamente.');
        }
      },
      (error) => {
        if (error.status === 422) {
          this.selectedVaccine.vaccineDate = this.utilitiesService.convertStringToDateStruct(this.selectedVaccine.vaccineDate);
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la vacuna.');
        }
      }
    );
  }

  // Función para redirigir al formulario de edición
  addHistoy(pet: any): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/histories/add', encodedId]);  // Redirige a la ruta de para agregar historia
  }

  // Añade esto a tu componente .ts
  isImage(fileType: string): boolean {
    return ['jpg', 'jpeg', 'png', 'gif'].includes(fileType.toLowerCase());
  }

  // Método para abrir el PDF en una ventana modal
  openPdfModal(content: TemplateRef<any>, filePath: string): void {
    const fullPath = this.serverUrl + filePath;
    this.pdfToDisplay = this.sanitizer.bypassSecurityTrustResourceUrl(fullPath);  // Evitar problemas de seguridad
    this.modalService.open(content, { size: 'lg', scrollable: true });
  }

}