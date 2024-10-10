import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  returnUrl: any;

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    this.isLoading = true;
    this.apiService.post('api/auth/login', { email: this.email, password: this.password }).subscribe(
      (response) => {
        localStorage.setItem('isLoggedin', 'true');
        this.router.navigate([this.returnUrl]);
        localStorage.setItem('token', response.access_token); // Guardar el token
        this.router.navigate(['/dashboard']); // Redirigir al dashboard
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.showErrorAlert();
      }
    );
  }

  showErrorAlert() {
    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      title: 'Correo o contraseña incorrectos',
      icon: 'error',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

}
