import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service'; // Importa el servicio UserService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  userData$: Observable<any>; // Usamos un Observable para los datos del usuario

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private userService: UserService // Inyectamos el servicio UserService
  ) { }

  ngOnInit(): void {
    // Nos suscribimos al observable de los datos del usuario
    this.userData$ = this.userService.getUserData();
  }

  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  onLogout(e: Event) {
    e.preventDefault();
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('token');
    
    if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/auth/login']);
    }
  }

}