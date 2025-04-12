

export interface ProfileResponse {
  id: number;
  property_id: number;
  mbti_profile: string;
  profile_name_searchable: string;
  allow_commenting: boolean;
  allow_voting: boolean;
  user_id: number;
  contributor: string;
  contributor_create_date: string;
  contributor_pic_path: string;
  display_order: number;
  edit_lock: number;
  edit_lock_picture: number;
  is_active: boolean;
  is_approved: boolean;
  mbti_enneagram_type: string;
  mbti_type: string;
  pdb_comment_access: boolean;
  pdb_page_owner: number;
  pdb_public_access: boolean;
  wiki_description: string;
  wiki_description_html: string;
  watch_count: number;
  comment_count: number;
  vote_count: number;
  vote_count_enneagram: number;
  vote_count_mbti: number;
  total_vote_counts: number;
  personality_type: string;
  type_updated_date: string;
  enneagram_vote: string;
  enneagram_vote_id: number;
  mbti_vote: string;
  mbti_vote_id: number;
  is_watching: boolean;
  image_exists: boolean;
  profile_image_url: string;
  profile_image_credit: string;
  profile_image_credit_id: number;
  profile_image_credit_type: string;
  profile_image_credit_url: string;
  alt_subcategory: string;
  related_subcategories: string;
  cat_id: number;
  category: string;
  category_is_fictional: boolean;
  sub_cat_id: number;
  subcategory: string;
  subcat_link_info: SubcatLinkInfo;
  related_subcat_link_info: RelatedSubcatLinkInfo[];  // Updated to be an array
  related_profiles: RelatedProfile[];
  functions: string[];
  systems: System[];
  breakdown_systems: BreakdownSystems;
  breakdown_config: BreakdownConfig;
  mbti_letter_stats: MbtiLetterStat[];
  topic_info: TopicInfo;
  self_reported_mbti: string | null;
}

export interface SubcatLinkInfo {
  sub_cat_id: number;
  cat_id: number;
  property_id: number;
  subcategory: string;
}

export interface RelatedSubcatLinkInfo {
  sub_cat_id: number;
  cat_id: number;
  property_id: number;
  subcategory: string;
}

export interface RelatedProfile {
  id: number;
  mbti_profile: string;
  subcategory: string;
  profile_image_url: string;
  profile_name: string;
  profile_subcat: string;
  sub_cat_id: number;
  cat_id: number;
  property_id: number;
  mbti: string;
  enneatype: string;
}

export interface System {
  hex_color: string;
  id: number;
  personality_type: string;
  personality_type_id: number;
  system_name: string;
  system_vote_count: number;
  user_vote_type_id: number;
  vote_id: number;
}

export interface BreakdownSystems {
  [key: string]: BreakdownSystemItem[];
}

export interface BreakdownSystemItem {
  myValue: string;
  personality_system_id: number;
  personality_type: string;
  theCount: number;
}

export interface BreakdownConfig {
  expand: { [key: string]: number };
  fire: { [key: string]: number };
}

export interface MbtiLetterStat {
  type: string;
  percentage: string;
  PercentageFloat: number;
}

export interface TopicInfo {
  can_generate: boolean;
  topic: Topic;
  topic_image_url: string;
  source_location: SourceLocation;
  can_post_image: boolean;
  can_post_audio: boolean;
  posts: Posts;
}

export interface Topic {
  description: string;
  follow_count: number;
  id: number;
  is_following: boolean;
  is_join_pending: boolean;
  is_banned: boolean;
  is_moderated: boolean;
  name_readable: string;
  post_count: number;
  source_profile_id: number;
  source_type: string;
  join_to_post: boolean;
  can_pin: boolean;
  related_topics: RelatedTopic[];
}

export interface RelatedTopic extends Topic {
  image?: { picURL: string };
}

export interface SourceLocation {
  cid: number;
  pid: number;
  sub_cat_id: number;
}

export interface Posts {
  posts: any[];
}

export interface MbtiLetterStat {
  type: string;
  percentage: string;
  PercentageFloat: number;
}
