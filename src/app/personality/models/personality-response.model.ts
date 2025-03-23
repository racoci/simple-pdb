export interface PersonalityResponse {
  count: number
  more: boolean
  profiles: Profile[]
  sort: string
  type_topic: TypeTopic
  out_links: OutLinks
  cursor: Cursor
}

export interface Profile {
  cat_id: number
  comment_count: number
  id: number
  mbti_profile: string
  personality_type: string
  profile_id: number
  profile_image_url: string
  sub_cat_id: number
  subcategory: string
  vote_count: number
  has_voted: boolean
  top_analysis: TopAnalysis
}

export interface TopAnalysis {
  type: string
  id: string
  content: string
  functionList: any
}

export interface TypeTopic {
  description: string
  follow_count: number
  post_count: number
  topic_id: number
  topic_name: string
}

export interface OutLinks {
  anime: string
  celebrity: string
  actors: string
  books: string
  songs: string
  kpop: string
}

export interface Cursor {
  limit: number
  nextCursor: string
}
