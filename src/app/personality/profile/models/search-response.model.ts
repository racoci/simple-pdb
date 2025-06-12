export interface SearchResponse {
  data: {
    count: number;
    cursor: SearchResponseCursor;
    results: SearchResponseProfile[];
  };
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
}

export interface SearchResponseCursor {
  limit: number;
  nextCursor: string;
}

export interface SearchResponseProfile {
  id: string;
  name: string;
  image: {
    picURL: string;
  };
  catIcon: {
    picURL: string;
  };
  categoryID: string;
  subcategory: string;
  subcatID: string;
  subcategories: SearchResponseSubcategory[];
  personalities: SearchResponsePersonality[];
  allowVoting: boolean;
  voteCount: number;
  savedCount: number;
  commentCount: number;
  isCharacter: boolean;
  isCelebrity: boolean;
  isMeme: boolean;
  chemistryLink: string;
  topAnalysis?: {
    type: string;
    id: string;
    content: string;
    functionList: any;
  };
}

export interface SearchResponseSubcategory {
  id: string;
  name: string;
  image: string | null;
  i18n?: {
    detectedLanguage: string;
    en: string;
  };
}

export interface SearchResponsePersonality {
  system: string;
  personality: string;
}

