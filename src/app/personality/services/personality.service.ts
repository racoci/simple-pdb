import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PersonalityResponse } from '../models/personality-response.model';
import { PdbCategory } from '../profile/models/pdb-category.enum';

@Injectable({
  providedIn: 'root'
})
export class PersonalityService {

  // Define the MBTI list and build the mapping (MBTI -> id)
  private readonly MBTI: string[] = [
    'ISTJ', 'ESTJ', 'ISFJ', 'ESFJ', 'ESFP', 'ISFP', 'ESTP', 'ISTP',
    'INFJ', 'ENFJ', 'INFP', 'ENFP', 'INTP', 'ENTP', 'INTJ', 'ENTJ'
  ];
  private readonly MBTI_MAP: { [key: string]: number } = {};

  // Base URL for the API
  private readonly baseUrl: string = '/api/v2/personalities';

  constructor(private http: HttpClient) {
    // Create a mapping similar to the Python MBTI_MAP:
    this.MBTI.forEach((type, index) => {
      this.MBTI_MAP[type] = index + 1;
    });
  }

  /**
   * Fetches the MBTI character profiles from the API.
   *
   * @param mbti - The MBTI type (e.g. 'ISTJ').
   * @param category - (Optional) Category to filter results.
   * @param nextCursor - (Optional) Cursor for pagination.
   * @param limit - (Optional) Limit for the number of results.
   * @returns An Observable of PersonalityResponse.
   */
  getMbtiCharacters(
    mbti: string,
    category: PdbCategory = PdbCategory.None,
    nextCursor?: string,
    limit?: number
  ): Observable<PersonalityResponse> {
    // Validate the provided MBTI type:
    if (!this.MBTI_MAP[mbti]) {
      // Return an empty response object if the MBTI type is invalid.
      const emptyResponse: PersonalityResponse = {
        count: 0,
        more: false,
        profiles: [],
        sort: '',
        type_topic: {
          description: '',
          follow_count: 0,
          post_count: 0,
          topic_id: 0,
          topic_name: ''
        },
        out_links: {
          anime: '',
          celebrity: '',
          actors: '',
          books: '',
          songs: '',
          kpop: ''
        },
        cursor: {
          limit: 0,
          nextCursor: ''
        }
      };
      return of(emptyResponse);
    }

    const mbtiId = this.MBTI_MAP[mbti];
    const url = `${this.baseUrl}/${mbtiId}/profiles`;

    // Build query parameters if provided.
    let params = new HttpParams();
    if (category !== PdbCategory.None) {
      params = params.set('category', String(category));
    }
    if (nextCursor) {
      params = params.set('nextCursor', nextCursor);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    // Make the GET request and return the observable.
    return this.http.get<PersonalityResponse>(url, { params });
  }
}
