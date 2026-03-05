import Image from "next/image";

export default async function AuthLayout({ children }: any) {
  return (
    <div className="min-h-screen flex flex-col justify-center max-w-7xl mx-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col justify-center rounded-lg bg-background ring-1 ring-zinc-200 shadow-md p-6">
        <div className="flex justify-center w-full">
          <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
        </div>
        {children}
      </div>
    </div>
  );
}
