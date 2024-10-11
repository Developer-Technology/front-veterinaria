import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
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

  species: any[] = [];
  breeds: any[] = [];
  clients: any[] = [];
  errors: any = {};
  imageUrl: string = 'assets/images/default/image-placeholder.png';
  croppedImage: string | ArrayBuffer | null = '';
  petId: string;

  config = {
    aspectRatio: 1,
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 1,
  };

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const encodedPettId = this.route.snapshot.paramMap.get('id') || '';
    const petId = atob(encodedPettId);
    this.loadPetData(petId);  // Cargar los datos de la mascota a editar
    this.loadSpecies();
    this.loadClients();
  }

  // Cargar los datos de la mascota desde el backend
  loadPetData(id: string): void {
    this.apiService.get(`pets/${id}`, true).subscribe(
      (response) => {
        if (response.success) {
          this.editPet = response.data;

          // Construir la URL completa de la imagen de la mascota si existe
          this.imageUrl = this.editPet.petPhoto
            ? `${this.apiService.userlServer}${this.editPet.petPhoto}`
            : 'assets/images/default/image-placeholder.png';  // Imagen por defecto si no tiene

          console.log(this.imageUrl);  
          this.loadBreedsBySpecies();  // Cargar las razas correspondientes a la especie seleccionada
        }
      },
      (error) => {
        Swal.fire('Error', 'No se pudo cargar la información de la mascota', 'error');
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
        alert('Por favor, selecciona un archivo de imagen válido (jpg, jpeg o png).');
      }
    }
  }

  // Función para recortar la imagen
  cropImage(): void {
    this.croppedImage = this.cropper.cropper.getCroppedCanvas().toDataURL();
    this.editPet.petPhoto = this.croppedImage;
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

  // Actualizar los datos de la mascota
  onUpdate(): void {
    const formattedBirthDate = this.convertDateToString(this.editPet.petBirthDate);

    const formData = new FormData();

    formData.append('petName', this.editPet.petName);
    formData.append('petBirthDate', formattedBirthDate);
    formData.append('petWeight', this.editPet.petWeight);
    formData.append('petColor', this.editPet.petColor);
    formData.append('species_id', this.editPet.species_id);
    formData.append('breeds_id', this.editPet.breeds_id);
    formData.append('petGender', this.editPet.petGender);
    formData.append('petAdditional', this.editPet.petAdditional);
    formData.append('clients_id', this.editPet.clients_id);

    if (this.croppedImage) {
      const imageFile = this.base64ToFile(this.croppedImage as string, `${this.editPet.petName}.png`);
      formData.append('petPhoto', imageFile);
    }

    this.apiService.post(`pets/${this.petId}`, formData, true).subscribe(
      (response) => {
        if (response.success) {
          this.showAlert('success', response.message);
          this.router.navigate(['/pets']);
        }
      },
      (error) => {
        if (error.status === 422) {  // Validación de errores
          this.errors = error.error.errors;
        } else {
          this.showAlert('error', 'No se pudo actualizar la mascota');
        }
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
        Swal.fire('Error', 'No se pudieron cargar las especies', 'error');
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
          Swal.fire('Error', 'No se pudieron cargar las razas', 'error');
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
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    );
  }

  // Método para regresar a "/pets"
  goBack(): void {
    this.router.navigate(['/pets']);
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