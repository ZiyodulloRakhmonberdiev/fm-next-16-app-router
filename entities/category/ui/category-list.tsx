import { Link } from "@/i18n/navigation";
import { seed } from '@/scripts/seed';

export default function CategoryList() {
  const categories = seed.categories;
  return (
    <div className="flex items-center gap-4 flex-wrap p-2 md:p-4">
      {categories.map((category) => (
        <Link key={category.href} href={category.href} className="text-sm">
          <span>{category.name}</span>
        </Link>
      ))}
    </div>
  )
}