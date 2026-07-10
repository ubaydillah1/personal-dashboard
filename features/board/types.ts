export type Task = {
  id: string;
  title: string;
  keyword: string;
  date: string;
  isDone: boolean;
  position: number;
  note: string | null;
  templateId: string | null;
  comboId: string | null;
  comboTaskId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewTask = {
  title: string;
  keyword: string;
  date: string;
  is_done?: boolean;
  position?: number;
  note?: string | null;
  template_id?: string | null;
  combo_id?: string | null;
  combo_task_id?: string | null;
};

export type TaskUpdate = {
  title?: string;
  keyword?: string;
  is_done?: boolean;
  position?: number;
  note?: string | null;
};

export type DayBoard = {
  date: string;
  tasks: Task[];
};
