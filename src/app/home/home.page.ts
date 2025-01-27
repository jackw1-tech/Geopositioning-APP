import { Component, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationService } from '/Users/giacomobianco/geo/src/app/locationlive.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  latitudineCorrente: number = 0;
  longitudineCorrente: number = 0;
  accuratezza: number = 0;
  distanza: number = 0;
  latitudineInserita_appoggio: number = 0;
  longitudineInserita_appoggio: number = 0;
  latitudineInserita: number = 0;
  longitudineInserita: number = 0;

  bottone_cliccato: boolean = false;
  bottone_disabilitato: boolean = true;

  constructor(
    private androidPermissions: AndroidPermissions,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private locationService: LocationService
  ) {
    this.platform.ready().then(() => {
      this.requestPermissions();
    });
  }

  requestPermissions() {
    this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
      .then(
        (result: { hasPermission: boolean }) => {
          if (!result.hasPermission) {
            alert('The app requires location permissions to work properly.');
            this.androidPermissions
              .requestPermissions([
                this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
                this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
                this.androidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION,
              ])
              .then(
                () => {
                  this.locationService.watchLocation().subscribe(
                    (location) => {
                      this.latitudineCorrente = location.latitudine;
                      this.longitudineCorrente = location.longitudine;
                      this.accuratezza = location.accuratezza;
                      if (this.distanza != 0) {
                        this.distanza = this.calculateDistance(
                          this.latitudineCorrente,
                          this.longitudineCorrente,
                          this.latitudineInserita,
                          this.longitudineInserita
                        );
                      }
                      this.cdr.detectChanges();
                    },
                    (error) => {
                      console.log('Error retrieving location: ' + error);
                    }
                  );
                },
                (err) => {
                  console.error('Permissions denied:', err);
                }
              );
          } else {
            this.locationService.watchLocation().subscribe(
              (location) => {
                this.latitudineCorrente = location.latitudine;
                this.longitudineCorrente = location.longitudine;
                this.accuratezza = location.accuratezza;
                if (this.distanza != 0) {
                  this.distanza = this.calculateDistance(
                    this.latitudineCorrente,
                    this.longitudineCorrente,
                    this.latitudineInserita,
                    this.longitudineInserita
                  );
                }
                this.cdr.detectChanges();
              },
              (error) => {
                console.log('Error retrieving location: ' + error);
              }
            );
          }
        },
        (err) => {
          console.error('Error checking permissions:', err);
        }
      );
  }

  updatePosition() {
    this.latitudineInserita = this.latitudineInserita_appoggio;
    this.longitudineInserita = this.longitudineInserita_appoggio;
    this.bottone_cliccato = true;
    this.bottone_disabilitato = true;
    this.distanza = this.calculateDistance(
      this.latitudineCorrente,
      this.longitudineCorrente,
      this.latitudineInserita,
      this.longitudineInserita
    );
    this.cdr.detectChanges();

    if (this.distanza < 50) {
      alert('You are near the specified location!');
    }
  }

  verifyInput() {
    if (
      this.latitudineInserita_appoggio &&
      this.longitudineInserita_appoggio &&
      (this.latitudineInserita !== this.latitudineInserita_appoggio ||
        this.longitudineInserita !== this.longitudineInserita_appoggio) &&
      Math.abs(this.latitudineInserita_appoggio) <= 90 &&
      Math.abs(this.longitudineInserita_appoggio) <= 180
    ) {
      this.bottone_disabilitato = false;
    } else {
      this.bottone_disabilitato = true;
    }
  }

  // Haversine
  calculateDistance(
    latitudine_corrente: number,
    longitudine_corrente: number,
    latitudine_inserita: number,
    longitudine_inserita: number
  ) {
    const EARTH_RADIUS = 6371000;
    const latitudine_corrente_rad = this.gradi_to_radianti(latitudine_corrente);
    const longitudine_corrente_rad = this.gradi_to_radianti(
      longitudine_corrente
    );
    const latitudine_inserita_rad = this.gradi_to_radianti(latitudine_inserita);
    const longitudine_inserita_rad = this.gradi_to_radianti(
      longitudine_inserita
    );

    const differenza_latitudini =
      latitudine_inserita_rad - latitudine_corrente_rad;
    const differeza_longitudini =
      longitudine_inserita_rad - longitudine_corrente_rad;

    const a =
      Math.sin(differenza_latitudini / 2) * Math.sin(differenza_latitudini / 2) +
      Math.cos(latitudine_corrente_rad) *
        Math.cos(latitudine_inserita_rad) *
        Math.sin(differeza_longitudini / 2) *
        Math.sin(differeza_longitudini / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
  }

  gradi_to_radianti(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
