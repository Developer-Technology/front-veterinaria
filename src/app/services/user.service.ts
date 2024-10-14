import { Injectable } from '@angular/core';
import { ApiService } from './api.service';  // Asegúrate de que ApiService está bien configurado para hacer solicitudes HTTP
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // BehaviorSubject para almacenar y emitir los datos del usuario
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserData(); // Cargar los datos del usuario al inicializar el servicio
  }

  // Método para cargar los datos del usuario desde el API y almacenarlos en el BehaviorSubject
  private loadUserData(): void {
    this.apiService.post('auth/me', true).subscribe(
      (response) => {
        if (response.success) {
          this.userDataSubject.next(response.data); // Emitir los datos del usuario a través del BehaviorSubject
        }
      },
      (error) => {
        console.error('Error al obtener los datos del usuario', error);
      }
    );
  }

  // Método para obtener los datos del usuario como un observable
  public getUserData(): Observable<any> {
    return this.userDataSubject.asObservable();
  }

  // Método para actualizar los datos del usuario
  public updateUserData(newUserData: any): void {
    this.userDataSubject.next(newUserData);
  }

  // Método para forzar la recarga de los datos del usuario
  public refreshUserData(): void {
    this.loadUserData();
  }

}