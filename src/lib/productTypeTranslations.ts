/**
 * Translate product types from English to Arabic
 */
export const productTypeTranslations: Record<string, string> = {
  'bars': 'سبائك',
  'bar': 'سبائك',
  'rings': 'خواتم',
  'ring': 'خاتم',
  'necklaces': 'قلادات',
  'necklace': 'قلادة',
  'bracelets': 'أساور',
  'bracelet': 'سوار',
  'earrings': 'حلقان',
  'earring': 'حلق',
  'pendants': 'أقراط',
  'pendant': 'قرط',
  'jewelry': 'مجوهرات',
  'gold': 'ذهب',
  'golden': 'ذهبي',
};

export function translateProductType(type: string | null | undefined): string {
  if (!type) return '';
  const lowerType = String(type).toLowerCase().trim();
  // Return translation or original value if not found
  return productTypeTranslations[lowerType] || type;
}
