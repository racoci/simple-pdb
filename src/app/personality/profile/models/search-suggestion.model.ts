export interface ProfileSuggestion {
  type: string;
  profile?: {
    id: string;
    name: string;
    image?: { picURL: string };
    catIcon?: { picURL: string };
  };
  text?: string;
}

export interface ProfileSuggestionResponse {
  data: {
    count: number;
    cursor: {
      limit: number;
      nextCursor: string;
    };
    results: ProfileSuggestion[];
  };
  error: {
    code: string;
    message: string;
    details: any;
  };
}
