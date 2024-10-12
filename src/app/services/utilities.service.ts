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

    // Calcular el rango de elementos a mostrar en la página actual
    getPaginatedData(data: any[], currentPage: number, itemsPerPage: number): any[] {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return data.slice(start, end);  // Retornar el subconjunto de datos para la página actual
    }

    // Calcular el número total de páginas
    getTotalPages(data: any[], itemsPerPage: number): number[] {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        return Array(totalPages).fill(0).map((_, i) => i + 1);
    }

    // Verificar que la página esté dentro del rango permitido
    validatePageNumber(page: number, totalPages: number): number {
        if (page < 1) {
            return 1;
        } else if (page > totalPages) {
            return totalPages;
        }
        return page;
    }

}