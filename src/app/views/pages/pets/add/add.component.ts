import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  newPet: any = {
    petName: '',
    //petBirthDate: '',
    //petBirthDate: <NgbDateStruct | null> null,
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

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadSpecies();
    this.loadClients(); // Cargar la lista de clientes al iniciar
  }

  // Cargar especies desde el API
  loadSpecies(): void {
    this.apiService.get('species', true).subscribe(
      (response) => {
        if (response.success) {
          this.species = response.data; // Almacenar las especies
        }
      },
      (error) => {
        Swal.fire('Error', 'No se pudieron cargar las especies', 'error');
      }
    );
  }

  // Cargar razas según la especie seleccionada
  loadBreedsBySpecies(): void {
    if (this.newPet.species_id) {
      this.apiService.get(`breeds?species_id=${this.newPet.species_id}`, true).subscribe(
        (response) => {
          if (response.success) {
            this.breeds = response.data; // Almacenar las razas filtradas
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
          this.clients = response.data; // Almacenar los clientes
        }
      },
      (error) => {
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    );
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

  convertDateToString(date: NgbDateStruct): string {
    if (!date) {
      return '';
    }
    const month = date.month < 10 ? `0${date.month}` : date.month;
    const day = date.day < 10 ? `0${date.day}` : date.day;
    return `${date.year}-${month}-${day}`;
  }

  // Enviar formulario para agregar mascota
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

    this.apiService.post('pets', this.newPet, true).subscribe(
      (response) => {
        if (response.success) {
          this.showAlert('success', response.message);
          this.router.navigate(['/pets']);
        }
      },
      (error) => {
        if (error.status === 422) { // Errores de validación desde el backend
          this.errors = error.error.errors;
        } else {
          this.showAlert('error', 'No se pudo agregar la mascota');
        }
      }
    );
  }

  // Método para resetear el formulario
  resetForm(petForm: any): void {
    petForm.resetForm();  // Resetear los campos del formulario
    this.newPet = {       // Restablecer el estado inicial del objeto
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