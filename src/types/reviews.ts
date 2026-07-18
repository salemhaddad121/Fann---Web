export interface Review {
  id: string;
  overall_score: number;
  score_communication: number;
  score_professionalism: number;
  score_punctuality: number;
  score_quality: number;
  body: string | null;
  submitted_at: string;
  reviewer_display_name: string | null;
  reviewer_thumbnail_url: string | null;
}
