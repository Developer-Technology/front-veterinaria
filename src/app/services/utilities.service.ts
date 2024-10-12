import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class UtilitiesService {

    constructor() { }

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

    // Función para truncar texto
    truncateText(text: string, limit: number): string {
        if (text.length > limit) {
            return text.substring(0, limit) + '...';
        }
        return text;
    }

}