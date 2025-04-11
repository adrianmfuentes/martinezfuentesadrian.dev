import { getDictionary } from "../dictionaries"

export default async function AssetsPage({
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
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 font-poppins">Assets Directory</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">3D Models</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <a href="/assets/3d/duck.glb" className="text-primary hover:underline">
                duck.glb
              </a>
              <p className="text-sm text-muted-foreground">3D model used in the hero section</p>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Textures</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <a href="/assets/3d/texture_earth.jpg" className="text-primary hover:underline">
                texture_earth.jpg
              </a>
              <p className="text-sm text-muted-foreground">Earth texture for 3D elements</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">CV Documents</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <a href="/assets/cv/cv_en.pdf" className="text-primary hover:underline">
              cv_en.pdf
            </a>
            <p className="text-sm text-muted-foreground">English version of the CV</p>
          </li>
          <li>
            <a href="/assets/cv/cv_es.pdf" className="text-primary hover:underline">
              cv_es.pdf
            </a>
            <p className="text-sm text-muted-foreground">Spanish version of the CV</p>
          </li>
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Project Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">project_{num}.jpg</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
