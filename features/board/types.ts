export type Task = {
  id: string;
  title: string;
  keyword: string;
  date: string;
  isDone: boolean;
  note: string | null;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewTask = {
  title: string;
  keyword: string;
  date: string;
  is_done?: boolean;
  note?: string | null;
  template_id?: string | null;
};

export type TaskUpdate = {
  title?: string;
  keyword?: string;
  is_done?: boolean;
  note?: string | null;
};

export type DayBoard = {
  date: string;
  tasks: Task[];
};
