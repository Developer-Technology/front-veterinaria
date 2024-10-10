import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  newUser: any = {
    doc: '',
    name: '',
    sex: '',
    email: '',
    phone: '',
    password: '',
    status: 'Activo',
    privilege: 'User'
  };

  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.newUser.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    } else {
      this.apiService.post('auth/register', this.newUser, true).subscribe(
        (response) => {
          if (response.success) {
            //Swal.fire('Éxito', 'Usuario agregado correctamente', 'success');
            this.showAlert('success', 'Usuario agregado correctamente');
            this.router.navigate(['/users']);
          } else {
            Swal.fire('Error', 'Hubo un problema al agregar el usuario', 'error');
          }
        },
        (error) => {
          Swal.fire('Error', 'No se pudo agregar el usuario', 'error');
        }
      );
    }
  }

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