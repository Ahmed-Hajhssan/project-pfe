
export interface InvestorModel{
  _id?: string;
  email?: string;
  password?: string;
  name?: string;
  description?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  linkedin_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  image_profile?: string;
  company?: string;
  preferred_area?: string;
  company_stage?: string[];
  more?: string;
  amount?: string;
  sector?: string[];
  score?: number;
  criteria?: string[];
}