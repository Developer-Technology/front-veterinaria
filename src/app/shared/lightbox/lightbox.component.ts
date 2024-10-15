import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss']
})
export class LightboxComponent {
  @Input() imageSrc: string = '';  // Imagen que se mostrará en el lightbox
  isOpen: boolean= false;  // Estado de apertura del lightbox
  currentImage: string | null = null;

  openLightbox(imageUrl: string): void {
    this.currentImage = imageUrl;
    this.isOpen = true;
  }

  closeLightbox(): void {
    this.isOpen = false;
    setTimeout(() => {
      this.currentImage = null;
    }, 300); // Tiempo de espera para permitir la transición de cierre
  }

}