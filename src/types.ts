export type ExtrapolationPrompt = {
  id: number;
  extrapolation_text: string;
  user_id: string;
};

export type ExtrapolationValue = {
  id: number;
  extrapolation_prompt_id: number;
  year: number;
  value: number;
};

export type UserExtrapolation = {
  id: number;
  user_id: string;
  extrapolation_prompt_id: number;
  is_active: boolean;
};

export type PointGroup = {
  // id: string;
  points: [number, number][];
  color: string;
};
