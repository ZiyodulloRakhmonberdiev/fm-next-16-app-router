export default function TagsForMobile({ tags }: { tags: string[] }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <div key={tag} className="text-sm py-1 rounded-xs w-content">
          <div className="inline-flex gap-2 bg-foreground/5 py-1 px-1 pr-4 rounded-full uppercase text-xs text-muted-foreground">
            <span className="bg-background rounded-full w-5 h-5 flex items-center justify-center text-md">#</span>{" "}{tag}
          </div>
        </div>
      ))}
    </div>
  )
}