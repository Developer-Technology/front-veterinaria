import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss']
})
export class CustomFieldComponent {
  @Input() imageUrl?: string = '';  // URL de la imagen
  @Input() title: string = '';     // Título (e.g., nombre de la mascota)
  @Input() subtitle: string = '';  // Subtítulo (e.g., especie y raza)
}