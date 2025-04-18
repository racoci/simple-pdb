import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileResponse } from '../models/profile-response.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // Cache of downloaded profiles.
  private profiles: ProfileResponse[] = [];

  // BehaviorSubject to expose the profiles to subscribers.
  private profilesSubject = new BehaviorSubject<ProfileResponse[]>([]);
  public profiles$ = this.profilesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch a profile from the API by its profileId.
   * Once retrieved, the profile is cached and emitted via profiles$.
   */
  fetchProfile(profileId: string): Observable<ProfileResponse> {
    const apiUrl = `/api/v1/profile/${profileId}`;
    return this.http.get<ProfileResponse>(apiUrl).pipe(
      tap(profile => {
        // Save the retrieved profile to the local cache.
        console.log(profile)
        this.profiles.push(profile);
        // Emit the new profiles array.
        this.profilesSubject.next(this.profiles);
      })
    );
  }

  /**
   * Get a random profile from the cached profiles.
   * Returns undefined if no profiles have been fetched yet.
   */
  getRandomProfile(): Observable<ProfileResponse> {
    const randomId = Math.floor(Math.random() * 67999)
    return this.fetchProfile(`${randomId}`)
  }
}
