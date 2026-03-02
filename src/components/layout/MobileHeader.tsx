import Image from "next/image";

export function MobileHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center border-b px-4 md:hidden">
      <Image
        src="/BW_DEVS_AI_TEAM_LOGO.png"
        alt="BW Devs Team"
        width={1042}
        height={253}
        className="h-7 w-auto"
      />
    </header>
  );
}
