import { AuthorsChoice, LatestNews, TopNews } from "../molecules";

export default function TopBanner() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      <div className="flex flex-col gap-4 md:max-w-[66.6%]">
        <TopNews />
        <AuthorsChoice />
      </div>
      <LatestNews />
    </div>
  )
}