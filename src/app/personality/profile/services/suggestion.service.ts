import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileSuggestionResponse } from '../models/search-suggestion.model';

export enum PdbCategory {
  PopCulture = 1,
  Television = 2,
  Movies = 3,
  Sports = 5,
  Cartoons = 7,
  AnimeManga = 8,
  Comics = 9,
  Noteworthy = 10,
  Gaming = 11,
  Literature = 12,
  Theatre = 13,
  Musician = 14,
  Internet = 15,
  TheArts = 16,
  Business = 17,
  Religion = 18,
  Science = 21,
  Historical = 22,
  WebComics = 26,
  Superheroes = 27,
  Philosophy = 28,
  Kpop = 29,
  Traits = 30,
  PlotsArchetypes = 31,
  Concepts = 32,
  Music = 33,
  Franchises = 34,
  Culture = 35,
  Theories = 36,
  PollsIfYou = 37,
  YourExperience = 38,
  TypeComboYourType = 39,
  AskPdb = 40,
  PdbCommunity = 41,
  Nature = 42,
  Technology = 43
}

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
      .set('catID', String(options.category ?? 0));

    return this.http.get<ProfileSuggestionResponse>(this.baseUrl, { params });
  }
}
