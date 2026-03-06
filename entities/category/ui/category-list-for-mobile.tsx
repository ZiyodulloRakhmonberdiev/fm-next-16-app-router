import { Link } from "@/i18n/navigation";
import { seed } from '@/scripts/seed';

export default function CategoryListForMobile() {
  const categories = seed.categories;
  return (
    <div className="flex md:hidden items-center gap-4 flex-nowrap overflow-x-auto p-2 md:p-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((category) => (
        <Link key={category.href} href={category.href} className="text-sm">
          <span>{category.name}</span>
        </Link>
      ))}
    </div>
  )
}