import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { UserService } from '../../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DropzoneDirective, DropzoneConfigInterface, DropzoneComponent } from 'ngx-dropzone-wrapper';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  newHistory: any = {
    history_date: '',
    history_time: '',
    history_reason: '',
    history_symptoms: '',
    history_diagnosis: '',
    history_treatment: '',
    user_id: '',
    pet_id: ''
  };
  userId: string = '';
  isLoading: boolean = true;
  dataPet: any = {};
  petId: string;
  errors: any = {};
  time = { hour: 13, minute: 30 };
  serverUrl: string;
  attachedFiles: any[] = []; // Para almacenar los archivos adjuntos
  uploading: boolean = false;

  public config: DropzoneConfigInterface = {
    clickable: true,
    autoProcessQueue: false,  // No subas los archivos automáticamente
    addRemoveLinks: true,
    acceptedFiles: 'image/*,application/pdf',
    dictDefaultMessage: 'Arrastra los archivos aquí para subirlos',
  };

  @ViewChild(DropzoneDirective, { static: false }) directiveRef?: DropzoneDirective;
  @ViewChild(DropzoneComponent, { static: false }) dropzoneComponent?: DropzoneComponent;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private utilitiesService: UtilitiesService,
    private userService: UserService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    // Recuperar el ID del usuario logueado desde el UserService
    this.userService.userData$.subscribe((userData) => {
      if (userData) {
        this.userId = userData.id;  // Guardar el ID del usuario logueado
        this.newHistory.user_id = this.userId;  // Asignar el ID del usuario a la historia
      }
    });
    const encodedPetId = this.route.snapshot.paramMap.get('id') || '';
    this.petId = atob(encodedPetId);
    this.newHistory.pet_id = this.petId;
    this.loadPetData(this.petId);
  }

  // Cargar los datos de la mascota desde el backend
  loadPetData(id: string): void {
    this.isLoading = true;
    this.apiService.get(`pets/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.dataPet = response.data;
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudo cargar la información de la mascota');
        const encodedPetId = this.route.snapshot.paramMap.get('id') || '';
        this.router.navigate(['/pets/']);  // Redirigir si no se puede cargar la mascota
      }
    );
  }

  // Enviar formulario para agregar historia
  onSubmit(): void {
    const formData = new FormData();
    const formattedDateHistory = this.utilitiesService.convertDateToString(this.newHistory.history_date);
    this.newHistory.history_date = formattedDateHistory;

    formData.append('history_date', this.newHistory.history_date);
    formData.append('history_time', this.newHistory.history_time);
    formData.append('history_reason', this.newHistory.history_reason);
    formData.append('history_symptoms', this.newHistory.history_symptoms);
    formData.append('history_diagnosis', this.newHistory.history_diagnosis);
    formData.append('history_treatment', this.newHistory.history_treatment);
    formData.append('user_id', this.newHistory.user_id);
    formData.append('pet_id', this.newHistory.pet_id);

    // Agregar los archivos al FormData
    console.log("Archivos adjuntos antes de enviar:", this.attachedFiles);  // Para verificar los archivos adjuntos
    this.attachedFiles.forEach((file: any) => {
      formData.append('files[]', file, file.name);  // Usa 'files[]' como clave para múltiples archivos
    });

    this.apiService.post(`pet-history`, formData).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', 'Historia clínica registrada con éxito');
          const encodedPetId = this.route.snapshot.paramMap.get('id') || '';
          this.router.navigate([`/pets/view/${encodedPetId}`]);
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'Error al registrar la historia clínica');
        }
      }
    );
  }

  // Función para regresar al listado de mascotas
  goBack(): void {
    this.router.navigate(['/pets']);
  }

  // Función para manejar cuando se elimina un archivo
  onRemovedFile(file: any): void {
    this.attachedFiles = this.attachedFiles.filter((f: any) => f !== file);
  }

  // Función para manejar cuando se añade un archivo
  onAddedFile(file: any): void {
    this.attachedFiles.push(file);
  }

  // Función para manejar cuando se elimina un archivo de la vista
  removeFileFromList(fileIndex: number): void {
    this.attachedFiles.splice(fileIndex, 1); // Eliminar el archivo de la lista almacenada
  }

  resetDropzoneUploads(): void {
    if (this.directiveRef) {
      this.directiveRef.reset();
    }
    this.attachedFiles = []; // Vaciar la lista de archivos adjuntos
  }

  // Configurar Dropzone cuando se monta el componente
  onDropzoneInit(dropzone: any): void {
    dropzone.on("addedfile", (file: any) => {
      console.log("File added:", file);
      this.onAddedFile(file);
    });

    dropzone.on("removedfile", (file: any) => {
      console.log("File removed:", file);
      this.onRemovedFile(file);
    });
  }

  // Perfil de la mascota
  goProfile(): void {
    const encodedPetId = this.route.snapshot.paramMap.get('id') || '';
    this.router.navigate([`/pets/view/${encodedPetId}`]); // Interpolación correcta
  }

}