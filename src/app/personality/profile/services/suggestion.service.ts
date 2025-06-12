import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileSuggestionResponse } from '../models/search-suggestion.model';
import { PdbCategory } from '../models/pdb-category.enum';

export interface SuggestionOptions {
  limit?: number;
  nextCursor?: number;
  pid?: number;
  category?: PdbCategory;
}

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  private readonly baseUrl = '/api/v2/search/suggestion';

  constructor(private http: HttpClient) {}

  /**
   * Fetch profile suggestions from the API.
   * @param query       Required text to search for.
   * @param options     Optional parameters for the API call.
   */
  getSuggestions(query: string, options: SuggestionOptions = {}): Observable<ProfileSuggestionResponse> {
    let params = new HttpParams()
      .set('query', query)
      .set('limit', String(options.limit ?? 20))
      .set('nextCursor', String(options.nextCursor ?? 0))
      .set('pid', String(options.pid ?? 0))
      .set('catID', String(options.category ?? PdbCategory.None));

    return this.http.get<ProfileSuggestionResponse>(this.baseUrl, { params });
  }
}
