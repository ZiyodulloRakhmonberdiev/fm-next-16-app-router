import { AuthorsChoice, LatestNews, TopNews } from "../molecules";

export default function TopBanner() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 px-4 md:px-6">
      <div className="flex flex-col gap-4 lg:max-w-[70%]">
        <TopNews />
        <AuthorsChoice />
      </div>
      <LatestNews />
    </div>
  )
}