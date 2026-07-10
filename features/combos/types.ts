export type ComboTask = {
  id: string;
  comboId: string;
  title: string;
  keyword: string;
  note: string | null;
  position: number;
  createdAt: string;
};

export type Combo = {
  id: string;
  name: string;
  activeDays: number[];
  isActive: boolean;
  createdAt: string;
  tasks: ComboTask[];
};

export type NewComboTask = {
  title: string;
  keyword: string;
  note?: string | null;
  position: number;
};

export type NewCombo = {
  name: string;
  active_days: number[];
  is_active?: boolean;
  tasks: NewComboTask[];
};
