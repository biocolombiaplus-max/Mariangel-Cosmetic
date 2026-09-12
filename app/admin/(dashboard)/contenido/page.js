import { readStore } from "@/lib/store";
import ContentEditor from "@/components/admin/content-editor";

export default async function AdminContentPage() {
  const data = await readStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Contenido de la tienda</h1>
      <p className="mt-1 mb-6 text-sm text-brand-deep-900/60">
        Edita las imágenes y textos de cada sección de tu landing page.
      </p>
      <ContentEditor settings={data.settings} sections={data.sections} />
    </div>
  );
}
