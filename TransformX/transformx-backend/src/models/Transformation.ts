export interface Transformation {
  id: string;
  userId: string;
  type: 'before_after' | 'progress_photo';
  photoUrl: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  weightKg: number;
  caption?: string;
  createdAt: Date;
}

export interface CreateTransformationDTO {
  type: 'before_after' | 'progress_photo';
  photoUrl: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  weightKg: number;
  caption?: string;
}

export interface TransformationTimeline {
  id: string;
  type: string;
  photoUrl: string;
  weightKg: number;
  caption?: string;
  createdAt: Date;
}
