// "use client"
// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { useTheme } from "next-themes";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { resolvedTheme } = useTheme()
  // const [mounted, setMounted] = useState(false)
  // useEffect(() => setMounted(true), [])
  // const logoSrc =
  // mounted && resolvedTheme === 'light'
  //   ? '/images/fm-logo-dark.svg'
  //   : '/images/fm-logo.svg'

  return (
    <div className="min-h-screen flex flex-col justify-center max-w-7xl mx-auto">
      <div className="w-full max-w-xs mx-auto flex flex-col justify-center rounded-2xl border border-border bg-background shadow-2xl p-5">
        {/* <div className="flex justify-center w-full mb-4">
          <Image
              src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
              alt="Logo"
              width={130}
              height={40}
              className="h-6 w-auto max-h-6 object-contain object-left md:h-8 md:max-h-8"
              sizes="(max-width: 768px) 100px, 130px"
            />        
        </div> */}
        {children}
      </div>
    </div>
  );
}
