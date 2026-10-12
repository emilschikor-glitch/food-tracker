import { FoodSearchResult } from "../types";

const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;

export async function findProductByBarcode(barcode: string): Promise<FoodSearchResult | null> {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,code,nutriments`);
  if (!response.ok) throw new Error("Produktdatenbank nicht erreichbar");
  const data = await response.json(); const product = data.product;
  if (!product?.product_name) return null;
  const n = product.nutriments ?? {};
  return { name: product.product_name, brand: product.brands || undefined, barcode: product.code || barcode, source: "Open Food Facts", nutritionPer100g: { calories: number(n["energy-kcal_100g"]), protein: number(n.proteins_100g), carbs: number(n.carbohydrates_100g), fat: number(n.fat_100g), fiber: number(n.fiber_100g) } };
}

export async function searchProducts(query: string): Promise<FoodSearchResult[]> {
  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,code,nutriments`);
  if (!response.ok) throw new Error("Produktsuche nicht erreichbar");
  const data = await response.json();
  return (data.products ?? []).filter((p: any) => p.product_name).map((p: any) => ({ name: p.product_name, brand: p.brands || undefined, barcode: p.code, source: "Open Food Facts", nutritionPer100g: { calories: number(p.nutriments?.["energy-kcal_100g"]), protein: number(p.nutriments?.proteins_100g), carbs: number(p.nutriments?.carbohydrates_100g), fat: number(p.nutriments?.fat_100g), fiber: number(p.nutriments?.fiber_100g) } }));
}

