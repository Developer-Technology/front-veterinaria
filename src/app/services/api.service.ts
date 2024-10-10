import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de apuntar al entorno

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = environment.URL_BACKEND; // Base URL desde el archivo de entorno

  constructor(private http: HttpClient) { }

  // Método GET genérico
  get(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`);
  }

  // Método POST genérico
  post(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${endpoint}`, data);
  }

  // Método PUT genérico
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${endpoint}`, data);
  }

  // Método DELETE genérico
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`);
  }

}