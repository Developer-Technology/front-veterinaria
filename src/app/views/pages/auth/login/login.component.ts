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
  emailTouched: boolean = false;  // Para verificar si el usuario interactuó con el campo
  passwordTouched: boolean = false;  // Para verificar si el usuario interactuó con el campo

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Este método se llama cuando el usuario interactúa con el campo de correo
  onEmailInput() {
    this.emailTouched = true;
  }

  // Este método se llama cuando el usuario interactúa con el campo de contraseña
  onPasswordInput() {
    this.passwordTouched = true;
  }

  // Valida si el formulario es válido (ambos campos con algún valor)
  isFormValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '';
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    this.isLoading = true;
    this.apiService.post('api/auth/login', { email: this.email, password: this.password }).subscribe(
      (response) => {
        localStorage.setItem('isLoggedin', 'true');
        localStorage.setItem('token', response.access_token);
        this.router.navigate([this.returnUrl]);
        //this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.showErrorAlert();
      }
    );
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailPattern.test(email);
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
