import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CropperComponent } from 'angular-cropperjs';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  @ViewChild('cropper', { static: false }) cropper: CropperComponent;

  newPet: any = {
    petName: '',
    petWeight: '',
    petColor: '',
    species_id: null, // Se seleccionará una especie
    breeds_id: null,  // Se seleccionará una raza dependiendo de la especie
    petGender: '',
    petPhoto: '',
    petAdditional: '',
    clients_id: null // Cliente (dueño)
  };

  species: any[] = []; // Lista de especies
  breeds: any[] = []; // Lista de razas filtrada según la especie seleccionada
  clients: any[] = []; // Lista de clientes (dueños)
  errors: any = {}; // Para manejar errores del backend
  imageUrl: string = 'assets/images/default/image-placeholder.png';  // Vista previa de la imagen antes del recorte
  croppedImage: string | ArrayBuffer | null = '';  // Imagen recortada

  config = {
    aspectRatio: 1, // Recorte cuadrado
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 1,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.loadSpecies();
    this.loadClients(); // Cargar la lista de clientes al iniciar
  }

  handleFileInput(event: any) {
    if (event.target.files.length) {
      const fileTypes = ['jpg', 'jpeg', 'png'];  // Tipos de archivos aceptados
      const extension = event.target.files[0].name.split('.').pop().toLowerCase();  // Obtener la extensión del archivo
      const isSuccess = fileTypes.indexOf(extension) > -1;  // Verificar si es una extensión válida

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
    this.croppedImage = this.cropper.cropper.getCroppedCanvas().toDataURL();  // Obtener la imagen recortada en base64
    this.newPet.petPhoto = this.croppedImage;  // Almacenar la imagen recortada
  }

  // Convertir base64 a archivo
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

  // Enviar el formulario con la imagen
  onSubmit(): void {
    const formattedBirthDate = this.convertDateToString(this.newPet.petBirthDate);
    const registrationDate = new Date();
    const generatedCode = this.generatePetCode(
      this.newPet.petName,
      this.newPet.species_id,
      this.newPet.breeds_id,
      this.newPet.clients_id,
      registrationDate
    );

    this.newPet.petCode = generatedCode;
    this.newPet.petBirthDate = formattedBirthDate;

    const formData = new FormData();

    // Añadir datos del formulario
    formData.append('petCode', this.newPet.petCode);
    formData.append('petName', this.newPet.petName);
    formData.append('petBirthDate', this.newPet.petBirthDate);
    formData.append('petWeight', this.newPet.petWeight);
    formData.append('petColor', this.newPet.petColor);
    formData.append('species_id', this.newPet.species_id);
    formData.append('breeds_id', this.newPet.breeds_id);
    formData.append('petGender', this.newPet.petGender);
    formData.append('petAdditional', this.newPet.petAdditional);
    formData.append('clients_id', this.newPet.clients_id);

    // Convertir la imagen recortada a archivo y agregarla al formulario
    if (this.croppedImage) {
      const imageFile = this.base64ToFile(this.croppedImage as string, `${this.newPet.petName}.png`);
      formData.append('petPhoto', imageFile);
    }

    // Enviar el formulario junto con la imagen
    this.apiService.post('pets', formData, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
          this.router.navigate(['/pets']);
        }
      },
      (error) => {
        if (error.status === 422) { // Errores de validación desde el backend
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo agregar la mascota');
        }
      }
    );
  }

  convertDateToString(date: NgbDateStruct): string {
    if (!date) {
      return '';
    }
    const month = date.month < 10 ? `0${date.month}` : date.month;
    const day = date.day < 10 ? `0${date.day}` : date.day;
    return `${date.year}-${month}-${day}`;
  }

  generatePetCode(petName: string, speciesId: number, breedId: number, clientId: number, registrationDate: Date): string {
    const petNameCode = petName.substring(0, 2).toUpperCase();
    const speciesCode = ('0' + speciesId).slice(-2);
    const breedCode = ('0' + breedId).slice(-2);
    const clientCode = ('0' + clientId).slice(-2);

    // Incluir minutos y segundos para mayor unicidad
    const minuteCode = ('0' + registrationDate.getMinutes()).slice(-1);
    const secondCode = ('0' + registrationDate.getSeconds()).slice(-1);

    // Generar el código único con hora y minutos
    const uniqueCode = `${petNameCode}${speciesCode}${breedCode}-${clientCode}${minuteCode}${secondCode}`;
    return uniqueCode;
  }

  // Método para resetear el formulario
  resetForm(petForm: any): void {
    petForm.resetForm();
    this.newPet = {
      petCode: '',
      petName: '',
      petBirthDate: '',
      petWeight: '',
      petColor: '',
      species_id: null,
      breeds_id: null,
      petGender: '',
      petPhoto: '',
      petAdditional: '',
      clients_id: null
    };
    this.errors = {};
  }

  // Método para regresar a "/pets"
  goBack(): void {
    this.router.navigate(['/pets']);
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
    if (this.newPet.species_id) {
      this.apiService.get(`breeds?species_id=${this.newPet.species_id}`, true).subscribe(
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
  
}