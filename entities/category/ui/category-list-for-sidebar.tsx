import { Link } from "@/i18n/navigation";
import { seed } from '@/scripts/seed';

export default function CategoryListForSidebar() {
  const categories = seed.categories;
  return (
    <div className="grid grid-cols-1 gap-2 px-2">
      {categories.map((category) => (
        <Link key={category.href} href={category.href} className="text-sm">
          <span>{category.name}</span>
        </Link>
      ))}
    </div>
  )
}