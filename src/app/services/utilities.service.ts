import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

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

    // Función reutilizable para la confirmación de eliminación
    showConfirmationDelet(
        title: string,
        text: string,
        confirmButtonText: string = 'Sí, eliminar',
        cancelButtonText: string = 'Cancelar'
    ): Promise<any> {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText
        });
    }

    // Convierte fecha al formato por defecto
    convertDateToString(date: NgbDateStruct): string {
        if (!date) {
            return '';
        }
        const month = date.month < 10 ? `0${date.month}` : date.month;
        const day = date.day < 10 ? `0${date.day}` : date.day;
        return `${date.year}-${month}-${day}`;
    }

    // Convertir la fecha desde el formato 'yyyy-mm-dd' a un objeto NgbDateStruct
    convertStringToDateStruct(dateString: string): NgbDateStruct | null {
        if (!dateString) return null;

        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return null;

        return {
            year: +dateParts[0],
            month: +dateParts[1],
            day: +dateParts[2]
        };
    }

}