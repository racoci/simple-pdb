import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProfileResponse } from '../models/profile-response.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SearchResponse } from '../models/search-response.model';
import { PdbCategory } from '../models/pdb-category.enum';

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

  /**
   * Search profiles by name.
   * Returns an array of matching profiles from the API.
   */
  searchProfiles(query: string): Observable<ProfileResponse[]> {
    const apiUrl = `/api/v1/profiles/search`;
    const params = new HttpParams().set('query', query);
    return this.http.get<{ profiles: ProfileResponse[] }>(apiUrl, { params })
      .pipe(map(res => res.profiles || []));
  }

  /**
   * Search characters using the v2 search endpoint.
   * All parameters except the query are optional.
   */
  searchCharacters(
    query: string,
    limit = 1000,
    nextCursor: number | string = 0,
    catID: PdbCategory = PdbCategory.None
  ): Observable<SearchResponse> {
    const apiUrl = `/api/v2/search/profiles`;
    let params = new HttpParams()
      .set('query', query)
      .set('limit', String(limit))
      .set('nextCursor', String(nextCursor))
      .set('pid', '0')
      .set('catID', String(catID));

    return this.http.get<SearchResponse>(apiUrl, { params });
  }
}
