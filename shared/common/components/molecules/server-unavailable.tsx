"use client"

type ServerUnavailableProps = {
  className?: string
}

export default function ServerUnavailable({ className = "" }: ServerUnavailableProps) {
  return (
    <div className={`flex min-h-[50vh] w-full items-center justify-center px-4 ${className}`}>
      <div className="max-w-xl text-center">
        <h2 className="text-xl font-semibold md:text-2xl">Server vaqtincha ishlamayapti</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Hozir bu muammoni hal qilyapmiz. Iltimos, birozdan keyin qayta urinib ko'ring.
        </p>
      </div>
    </div>
  )
}
