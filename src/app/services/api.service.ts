import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de apuntar al entorno

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = environment.URL_SERVICIOS; // Base URL desde el archivo de entorno
  private readonly serverUrl: string = environment.URL_BACKEND;
  //public urlServer: string = environment.URL_BACKEND;

  constructor(private http: HttpClient) { }

  getServerUrl(): string {
    return this.serverUrl;
  }

  // Obtener el token almacenado en localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método GET genérico con cabeceras (token opcional)
  get(endpoint: string, authenticated: boolean = true): Observable<any> {
    let headers = new HttpHeaders();
    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return this.http.get(`${this.baseUrl}/${endpoint}`, { headers });
  }

  // Método POST genérico con cabeceras (token opcional)
  post(endpoint: string, data: any, authenticated: boolean = true): Observable<any> {
    let headers = new HttpHeaders();
    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return this.http.post(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Método PUT genérico con cabeceras (token opcional)
  put(endpoint: string, data: any, authenticated: boolean = true): Observable<any> {
    let headers = new HttpHeaders();
    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return this.http.put(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Método DELETE genérico con cabeceras (token opcional)
  delete(endpoint: string, authenticated: boolean = true): Observable<any> {
    let headers = new HttpHeaders();
    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return this.http.delete(`${this.baseUrl}/${endpoint}`, { headers });
  }

  // Método POST para cargar archivos
  uploadFile(endpoint: string, file: File, authenticated: boolean = true): Observable<any> {
    let headers = new HttpHeaders();
    const formData: FormData = new FormData();
    formData.append('file', file);  // Agregar el archivo al FormData

    if (authenticated) {
      const token = this.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return this.http.post(`${this.baseUrl}/${endpoint}`, formData, { headers });
  }

}