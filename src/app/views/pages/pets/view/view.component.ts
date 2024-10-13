import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';

@Component({
  selector: 'app-view-pet',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  pet: any = {};  // Información de la mascota
  isLoading: boolean = true;
  serverUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private utilitiesService: UtilitiesService
  ) {
    this.serverUrl = this.apiService.getServerUrl();
  }

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');
    if (encodedId) {
      const decodedId = atob(encodedId);  // Decodificar el ID
      this.loadPet(decodedId);
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

}