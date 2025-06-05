import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private selectedProfileIdSource = new BehaviorSubject<string | null>(null);
  selectedProfileId$ = this.selectedProfileIdSource.asObservable();

  selectProfile(profileId: string | null): void {
    this.selectedProfileIdSource.next(profileId);
  }
}

