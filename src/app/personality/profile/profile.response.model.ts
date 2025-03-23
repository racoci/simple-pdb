

export interface ProfileResponse {
  id: number
  property_id: number
  mbti_profile: string
  profile_name_searchable: string
  allow_commenting: boolean
  allow_voting: boolean
  user_id: number
  contributor: string
  contributor_create_date: string
  contributor_pic_path: string
  display_order: number
  edit_lock: number
  edit_lock_picture: number
  is_active: boolean
  is_approved: boolean
  mbti_enneagram_type: string
  mbti_type: string
  pdb_comment_access: boolean
  pdb_page_owner: number
  pdb_public_access: boolean
  wiki_description: string
  wiki_description_html: string
  watch_count: number
  comment_count: number
  vote_count: number
  vote_count_enneagram: number
  vote_count_mbti: number
  total_vote_counts: number
  personality_type: string
  type_updated_date: string
  enneagram_vote: string
  enneagram_vote_id: number
  mbti_vote: string
  mbti_vote_id: number
  is_watching: boolean
  image_exists: boolean
  profile_image_url: string
  profile_image_credit: string
  profile_image_credit_id: number
  profile_image_credit_type: string
  profile_image_credit_url: string
  alt_subcategory: string
  related_subcategories: string
  cat_id: number
  category: string
  category_is_fictional: boolean
  sub_cat_id: number
  subcategory: string
  subcat_link_info: SubcatLinkInfo
  related_subcat_link_info: RelatedSubcatLinkInfo[]
  related_profiles: RelatedProfile[]
  functions: string[]
  systems: System[]
  breakdown_systems: BreakdownSystems
  breakdown_config: BreakdownConfig
  mbti_letter_stats: MbtiLetterStat[]
  topic_info: TopicInfo
  self_reported_mbti: any
}

export interface SubcatLinkInfo {
  sub_cat_id: number
  cat_id: number
  property_id: number
  subcategory: string
}

export interface RelatedSubcatLinkInfo {
  sub_cat_id: number
  cat_id: number
  property_id: number
  subcategory: string
}

export interface RelatedProfile {
  id: number
  mbti_profile: string
  subcategory: string
  profile_image_url: string
  profile_name: string
  profile_subcat: string
  sub_cat_id: number
  cat_id: number
  property_id: number
  mbti: string
  enneatype: string
}

export interface System {
  hex_color: string
  id: number
  personality_type: string
  personality_type_id: number
  system_name: string
  system_vote_count: number
  user_vote_type_id: number
  vote_id: number
}

export interface BreakdownSystems {
  "1": N1[]
  "10": N10[]
  "11": N11[]
  "12": N12[]
  "13": N13[]
  "14": N14[]
  "15": N15[]
  "16": N16[]
  "17": N17[]
  "18": N18[]
  "19": N19[]
  "2": N2[]
  "3": N3[]
  "4": N4[]
  "5": N5[]
  "6": N6[]
  "7": N7[]
  "8": N8[]
  "9": N9[]
}

export interface N1 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N10 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N11 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N12 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N13 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N14 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N15 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N16 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N17 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N18 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N19 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N2 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N3 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N4 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N5 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N6 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N7 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N8 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface N9 {
  myValue: string
  personality_system_id: number
  personality_type: string
  theCount: number
}

export interface BreakdownConfig {
  expand: Expand
  fire: Fire
}

export interface Expand {
  "1": number
  "10": number
  "11": number
  "12": number
  "13": number
  "14": number
  "15": number
  "16": number
  "17": number
  "18": number
  "19": number
  "2": number
  "3": number
  "4": number
  "5": number
  "6": number
  "7": number
  "8": number
  "9": number
}

export interface Fire {
  "1": number
  "10": number
  "11": number
  "12": number
  "13": number
  "14": number
  "15": number
  "16": number
  "17": number
  "18": number
  "19": number
  "2": number
  "3": number
  "4": number
  "5": number
  "6": number
  "7": number
  "8": number
  "9": number
}

export interface MbtiLetterStat {
  type: string
  percentage: string
  PercentageFloat: number
}

export interface TopicInfo {
  can_generate: boolean
  topic: Topic
}

export interface Topic {
  description: string
  follow_count: number
  id: number
  is_following: boolean
  is_join_pending: boolean
  is_banned: boolean
  is_moderated: boolean
  name_readable: string
  post_count: number
  source_profile_id: number
  source_type: string
  join_to_post: boolean
  can_pin: boolean
  related_topics: RelatedTopic[]
  subcategory: string
  topic_image_url: string
  source_location: SourceLocation
  can_post_image: boolean
  can_post_audio: boolean
  posts: Posts
}

export interface RelatedTopic {
  description: string
  follow_count: number
  id: number
  is_following: boolean
  is_join_pending: boolean
  is_banned: boolean
  is_moderated: boolean
  name_readable: string
  post_count: number
  source_profile_id: number
  source_type: string
  image: Image
  join_to_post: boolean
  can_pin: boolean
}

export interface Image {
  picURL: string
}

export interface SourceLocation {
  cid: number
  pid: number
  sub_cat_id: number
}

export interface Posts {
  posts: Post[]
}

export interface Post {
  username: string
  user_pic_path: string
  user_personality_type: string
  is_mod: boolean
  comment_count: number
  reply_count: number
  vote_type: number
  topics_list: TopicsList[]
  id: number
  post_id: number
  user_id: number
  title: string
  content: string
  create_date: number
  unix_timestamp: number
  update_date: number
  vote_count: number
  vote_count_down: number
  is_reported: number
  is_hidden: boolean
  is_pinned: boolean
  is_watching: boolean
  is_pro_user: boolean
  images: any
  audios: any
  function_list: any[]
  type: string
}

export interface TopicsList {
  id: number
  name_readable: string
}
