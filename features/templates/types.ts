export type TaskTemplate = {
  id: string;
  title: string;
  keyword: string;
  activeDays: number[];
  isActive: boolean;
  createdAt: string;
};

export type NewTaskTemplate = {
  title: string;
  keyword: string;
  active_days: number[];
  is_active?: boolean;
};

export type TaskTemplateUpdate = {
  title?: string;
  keyword?: string;
  active_days?: number[];
  is_active?: boolean;
};
