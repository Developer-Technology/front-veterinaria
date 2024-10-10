import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const isLoggedin = localStorage.getItem('isLoggedin');

    if (isLoggedin === 'true') {
      this.router.navigate(['/']); // Redirigir al dashboard si ya está logueado
      return false; // Bloquear el acceso al login
    } else {
      return true; // Permitir acceso al login
    }
  }

}