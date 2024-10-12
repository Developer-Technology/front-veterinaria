import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CropperComponent } from 'angular-cropperjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  @ViewChild('cropper', { static: false }) cropper: CropperComponent;

  editPet: any = {
    petName: '',
    petWeight: '',
    petColor: '',
    species_id: null,
    breeds_id: null,
    petGender: '',
    petPhoto: '',
    petAdditional: '',
    clients_id: null
  };

  isLoading: boolean = true;  // Variable para el efecto de carga
  species: any[] = [];
  breeds: any[] = [];
  clients: any[] = [];
  errors: any = {};
  imageUrl: string = 'assets/images/default/blank-pet.png';
  croppedImage: string | ArrayBuffer | null = '';
  petId: string;
  serverUrl: string;

  config = {
    aspectRatio: 1,
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 1,
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    const encodedPetId = this.route.snapshot.paramMap.get('id') || '';
    this.petId = atob(encodedPetId);
    //const petId = atob(encodedPetId);
    this.loadPetData(this.petId);  // Cargar los datos de la mascota a editar
    this.loadSpecies();
    this.loadClients();
  }

  // Convertir la fecha desde el formato 'yyyy-mm-dd' a un objeto NgbDateStruct
  convertStringToDateStruct(dateString: string): NgbDateStruct | null {
    if (!dateString) return null;

    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) return null;

    return {
      year: +dateParts[0],
      month: +dateParts[1],
      day: +dateParts[2]
    };
  }

  // Cargar los datos de la mascota desde el backend
  loadPetData(id: string): void {
    this.isLoading = true;
    this.apiService.get(`pets/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.editPet = response.data;

          // Convertir la fecha de nacimiento para usarla en ngbDatepicker
          this.editPet.petBirthDate = this.convertStringToDateStruct(this.editPet.petBirthDate);

          // Construir la URL completa de la imagen de la mascota si existe
          this.imageUrl = this.editPet.petPhoto
            ? `${this.serverUrl}${this.editPet.petPhoto}`
            : 'assets/images/default/blank-pet.png';  // Imagen por defecto si no tiene
          this.loadBreedsBySpecies();  // Cargar las razas correspondientes a la especie seleccionada
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
        this.utilitiesService.showAlert('error', 'No se pudo cargar la información de la mascota');
        this.router.navigate(['/pets']);  // Redirigir si no se puede cargar la mascota
      }
    );
  }

  handleFileInput(event: any) {
    if (event.target.files.length) {
      const fileTypes = ['jpg', 'jpeg', 'png'];
      const extension = event.target.files[0].name.split('.').pop().toLowerCase();
      const isSuccess = fileTypes.indexOf(extension) > -1;

      if (isSuccess) {
        const reader = new FileReader();
        const angularCropper = this.cropper;
        reader.onload = (event) => {
          if (event.target?.result) {
            angularCropper.imageUrl = event.target.result;
          }
        };
        reader.readAsDataURL(event.target.files[0]);
      } else {
        this.utilitiesService.showAlert('warning', 'Por favor, selecciona un archivo de imagen válido (jpg, jpeg o png).');
        //alert('Por favor, selecciona un archivo de imagen válido (jpg, jpeg o png).');
      }
    }
  }

  // Función para recortar la imagen
  cropImage(): void {
    this.croppedImage = this.cropper.cropper.getCroppedCanvas().toDataURL();
    this.editPet.petPhoto = this.croppedImage;

    // Verifica si la imagen recortada es correcta
    //console.log('Imagen recortada:', this.croppedImage);
  }

  base64ToFile(dataURI: string, filename: string): File {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeString });
  }

  onUpdate(): void {
    const formattedBirthDate = this.convertDateToString(this.editPet.petBirthDate);

    this.editPet.petBirthDate = formattedBirthDate;

    // Realizamos la solicitud de actualización de los datos
    this.apiService.put(`pets/${this.petId}`, this.editPet, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);

          // Si la imagen fue modificada, hacemos la segunda solicitud
          if (this.croppedImage) {
            const imageFile = this.base64ToFile(this.croppedImage as string, `${this.editPet.petName}.png`);
            this.uploadPhoto(imageFile);  // Subir la imagen
          } else {
            this.router.navigate(['/pets']);
          }
        }
      },
      (error) => {
        if (error.status === 422) {  // Validación de errores
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la mascota');
        }
      }
    );
  }

  // Función para subir la imagen
  uploadPhoto(imageFile: File): void {
    const imageData = new FormData();
    imageData.append('petPhoto', imageFile);

    this.apiService.post(`pets/${this.petId}/upload`, imageData, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
          this.router.navigate(['/pets']);
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudo subir la imagen');
      }
    );
  }

  convertDateToString(date: NgbDateStruct): string {
    if (!date) return '';
    const month = date.month < 10 ? `0${date.month}` : date.month;
    const day = date.day < 10 ? `0${date.day}` : date.day;
    return `${date.year}-${month}-${day}`;
  }

  // Cargar especies desde el API
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar las especies');
      }
    );
  }

  // Cargar razas según la especie seleccionada
  loadBreedsBySpecies(): void {
    if (this.editPet.species_id) {
      this.apiService.get(`breeds?species_id=${this.editPet.species_id}`, true).subscribe(
        (response) => {
          if (response.success) {
            this.breeds = response.data;
          }
        },
        (error) => {
          this.utilitiesService.showAlert('error', 'No se pudieron cargar las razas');
        }
      );
    }
  }

  // Cargar clientes desde el API
  loadClients(): void {
    this.apiService.get('clients', true).subscribe(
      (response) => {
        if (response.success) {
          this.clients = response.data;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los clientes');
      }
    );
  }

  // Método para regresar a "/pets"
  goBack(): void {
    this.router.navigate(['/pets']);
  }

  // Función para resetear el formulario
  resetForm(form: any): void {
    form.reset();
    this.ngOnInit(); // Volver a cargar los datos originales
  }

}