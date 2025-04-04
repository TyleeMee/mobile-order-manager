export type Product = {
  id: string;
  categoryId: string;
  title: string;
  imageUrl: string;
  //storageでの削除に便利
  imagePath: string;
  description?: string;
  price: number;
  isVisible: boolean;
  isOrderAccepting: boolean;
  created: Date;
  updated: Date;
};

export type ProductData = {
  title: string;
  imageUrl: string;
  imagePath: string;
  description?: string;
  price: number;
  isVisible: boolean;
  isOrderAccepting: boolean;
};

export type ProductFormValues = {
  title: string;
  imageUrl: string;
  imagePath: string;
  description?: string;
  price: number | undefined; // フォーム入力用に undefined を許容
  isVisible: boolean;
  isOrderAccepting: boolean;
};

export type ProductResult = {
  id?: string;
  error?: boolean;
  message?: string;
};
