export type Category = {
  id: string;
  title: string;
  created: Date;
  updated: Date;
};

export type CategoryData = {
  title: string;
};

export type CategoryResult = {
  id?: string;
  error?: boolean;
  message?: string;
};
