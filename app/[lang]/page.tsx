import { HeroSection } from "@components/hero-section"
import { getDictionary } from "./dictionaries"

export default async function Home({
  params,
}: {
  readonly params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  if (!dict) {
    throw new Error("Dictionary not found");
  }

  return (
    <div>
      <HeroSection 
        dictionary={dict.home} 
        stats={dict.about.stats}
        lang={lang}
        contactLabel={dict.navigation.contact}
        cvLabel={dict.navigation.cv}
      />
    </div>
  );
}

