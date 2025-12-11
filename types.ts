export type PizzaSize = 'Small' | 'Medium' | 'Large' | 'XL';
export type CrustType = 'Thin' | 'Hand-Tossed' | 'Deep Dish' | 'Gluten-Free' | 'Stuffed' | 'Brooklyn Style';
export type SauceType = 'Tomato' | 'Marinara' | 'BBQ' | 'Alfredo' | 'Garlic Parm' | 'Buffalo';
export type SauceAmount = 'Light' | 'Normal' | 'Extra';
export type CheeseAmount = 'No' | 'Light' | 'Regular' | 'Extra';
export type CrustSeasoning = 'No Seasoning' | 'Garlic Herb';

export interface Topping {
  id: string;
  name: string;
  category: 'meat' | 'veggie' | 'cheese';
  price: number;
}

export interface PizzaTopping extends Topping {
  side: 'whole' | 'left' | 'right';
}

export interface PizzaConfig {
  size: PizzaSize;
  crust: CrustType;
  crustSeasoning: CrustSeasoning;
  sauce: SauceType;
  sauceAmount: SauceAmount;
  cheese: CheeseAmount;
  toppings: PizzaTopping[];
}

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  config?: PizzaConfig;
  specialInstructions?: string;
}

export interface CustomerDetails {
  phone: string;
  store: string;
  organization: string;
  contactName: string;
  email: string;
  date: string;
  time: string;
  orderType: 'Delivery' | 'Pickup' | 'Dine-in';
}

export interface OrderSummaryState {
  items: OrderItem[];
  subtotal: number;
  taxExempt: boolean;
  discountValue: number;
  discountType: '$' | '%';
  tip: number;
}