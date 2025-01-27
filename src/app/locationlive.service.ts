import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private watchId: number | null = null;

  constructor() { }

  watchLocation(): Observable<any> {
    return new Observable((observer: Observer<any>) => {

      if (!navigator || !navigator.geolocation) {
        observer.error('Geolocalizzazione non supportata');
        return;
      } 
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          observer.next({
            latitudine: position.coords.latitude,
            longitudine: position.coords.longitude,
            accuratezza: position.coords.accuracy
          });
        },
        (error) => {
          observer.error('Errore durante la geolocalizzazione: ' + error.message);
        },
        {
          enableHighAccuracy: true, // Usa il GPS per maggiore precisione
          timeout: 10000,          // Tempo massimo di attesa per ogni aggiornamento
          maximumAge: 0            // Non usa dati in cache
        }
      );

      // Pulizia quando l'observable si completa o si annulla
      return () => {
        if (this.watchId !== null) {
          navigator.geolocation.clearWatch(this.watchId);
          this.watchId = null;
        }
      };
    });
  }
}
