import { z } from "zod";

import { shopSchema } from "@/validation/shop-schema";

export type Shop = {
  id: string;
  title: string;
  imageUrl: string;
  //storageでの削除に便利
  imagePath: string;
  description?: string;
  prefecture: z.infer<typeof shopSchema.shape.prefecture>;
  city: string;
  streetAddress: string;
  building?: string;
  isVisible: boolean;
  isOrderAccepting: boolean;
  created: Date;
  updated: Date;
};

export type ShopData = {
  title: string;
  imageUrl: string;
  //storageでの削除に便利
  imagePath: string;
  description?: string;
  prefecture: z.infer<typeof shopSchema.shape.prefecture>;
  city: string;
  streetAddress: string;
  building?: string;
  isVisible: boolean;
  isOrderAccepting: boolean;
};

export type ShopFormValues = z.infer<typeof shopSchema>;

export type ShopResult = {
  error?: boolean;
  message?: string;
};
