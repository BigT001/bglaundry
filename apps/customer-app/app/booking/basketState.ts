export type BasketItem = {
  itemName: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  quantity: number;
};

// Global basket object state
let basket: Record<string, BasketItem> = {};
const listeners = new Set<() => void>();

export const getBasket = () => basket;

export const subscribeBasket = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => {
  listeners.forEach(l => l());
};

export const addToBasket = (itemName: string, serviceCode: string, serviceName: string, price: number) => {
  const key = `${itemName} (${serviceName})`;
  if (basket[key]) {
    basket[key].quantity += 1;
  } else {
    basket[key] = { itemName, serviceCode, serviceName, price, quantity: 1 };
  }
  notify();
};

export const removeFromBasket = (itemName: string, serviceName: string) => {
  const key = `${itemName} (${serviceName})`;
  if (basket[key]) {
    basket[key].quantity -= 1;
    if (basket[key].quantity <= 0) {
      delete basket[key];
    }
  }
  notify();
};

export const deleteFromBasket = (itemName: string, serviceName: string) => {
  const key = `${itemName} (${serviceName})`;
  if (basket[key]) {
    delete basket[key];
  }
  notify();
};

export const clearBasket = () => {
  basket = {};
  notify();
};

export const getBasketItemsCount = () => {
  return Object.values(basket).reduce((sum, item) => sum + item.quantity, 0);
};

export const getBasketTotal = () => {
  return Object.values(basket).reduce((sum, item) => sum + item.quantity * item.price, 0);
};
