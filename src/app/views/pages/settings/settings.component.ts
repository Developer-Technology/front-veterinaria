import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { CropperComponent } from 'angular-cropperjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild('cropper', { static: false }) cropper: CropperComponent;

  editCompany: any = {
    companyDoc: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyPhoto: '',
    companyCurrency: '',
    companyTax: '',
  };

  //company: any = null;
  errors: any = {};
  imageUrl: string = 'assets/images/default/40084.png';
  croppedImage: string | ArrayBuffer | null = '';
  serverUrl: string;
  isLoading: boolean = true;

  config = {
    aspectRatio: 400 / 84,  // Relación de aspecto 4.76 para un recorte de 400x84
    movable: true,
    zoomable: true,
    scalable: true,
    autoCropArea: 1,  // Asegura que el área de recorte ocupe el espacio completo al cargar
    viewMode: 1,  // Asegura que el recorte permanezca dentro de los límites de la imagen
    cropBoxResizable: true,  // Permitir ajustar el tamaño del cuadro de recorte
    cropBoxMovable: true  // Permitir mover el cuadro de recorte
  };

  constructor(
    private apiService: ApiService,
    private utilitiesService: UtilitiesService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    this.loadCompany();
  }

  // Función para subir la imagen
  uploadPhoto(imageFile: File): void {
    const imageData = new FormData();
    imageData.append('companyPhoto', imageFile);

    this.apiService.post(`companies/1/upload`, imageData, true).subscribe(
      (response) => {
        if (response.success) {
          this.utilitiesService.showAlert('success', response.message);
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudo subir la imagen');
      }
    );
  }

  // Cargar datos de la empresa
  loadCompany(): void {
    this.isLoading = true;
    this.apiService.get('companies/1', true).subscribe(
      (response) => {
        if (response.success) {
          this.editCompany = response.data;
          // Construir la URL completa de la imagen de la mascota si existe
          this.imageUrl = this.editCompany.companyPhoto
            ? `${this.serverUrl}${this.editCompany.companyPhoto}`
            : 'assets/images/default/40084.png';  // Imagen por defecto si no tiene
          this.isLoading = false;
        }
      },
      (error) => {
        this.utilitiesService.showAlert('error', 'No se pudieron cargar los datos de la empresa.');
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
    this.editCompany.petPhoto = this.croppedImage;

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

  // Enviar el formulario de edición
  onUpdate(): void {

    this.apiService.put('companies/1', this.editCompany, true).subscribe(
      (response) => {
        this.utilitiesService.showAlert('success', 'Empresa actualizada correctamente.');
        // Si la imagen fue modificada, hacemos la segunda solicitud
        if (this.croppedImage) {
          const imageFile = this.base64ToFile(this.croppedImage as string, `${this.editCompany.companyName}.png`);
          this.uploadPhoto(imageFile);  // Subir la imagen
        }
      },
      (error) => {
        if (error.status === 422) {
          this.errors = error.error.errors;
        } else {
          this.utilitiesService.showAlert('error', 'No se pudo actualizar la empresa.');
        }
      }
    );
  }

  // Función para resetear el formulario
  resetForm(form: any): void {
    form.reset();
    this.ngOnInit(); // Volver a cargar los datos originales
  }

}