export function formatCardPrice(price: number) {
  return `$ ${price.toFixed(2)}`;
}

export function formatDetailPrice(price: number) {
  return Number.isInteger(price) ? `$ ${price}` : `$ ${price.toFixed(2)}`;
}
