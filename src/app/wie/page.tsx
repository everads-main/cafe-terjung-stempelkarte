import Link from "next/link";

export default function HowPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <p className="text-xs tracking-[0.18em] text-caramel uppercase">Café Terjung</p>
      <article className="paper-card space-y-4 rounded-[1.6rem] p-5 leading-7">
        <h1 className="font-display text-3xl">Muss das eine App sein?</h1>
        <p>
          Ja – für die Gäste. Nicht als extra Download aus dem App Store, sondern als diese
          Seite, die man auf den Homescreen legt. Jede der 500 Karten lebt auf dem Handy
          des Gastes. Ohne App (oder ohne diese Web-App) gäbe es keine eigene Karte, die
          man an der Theke vorzeigen kann.
        </p>
        <p>
          Genau so arbeitet stämps mit NFC: der Gast hat die Karte in der App und hält sie
          an den Punkt. Bei uns hält er den QR an die Theken-App. Der Unterschied ist nur
          der Chip.
        </p>
        <h2 className="font-display text-2xl">Warum kein Zettel unter der Theke?</h2>
        <p>
          Ein fester QR an der Wand wäre für alle derselbe. Wer ihn fotografiert, könnte
          Tassen sammeln ohne Kaffee. Eine Tagesgrenze stoppt das nicht und würde Leute
          ausbremsen, die vier Tassen auf einmal holen.
        </p>
        <p>
          Deshalb gehört der Code dem Gast. Nur die Theke darf stempeln. Vier Kaffees =
          vier Tassen in einem Rutsch. Höchstens acht am Tag, falls irgendwo etwas
          schiefgeht.
        </p>
        <Link href="/" className="inline-block text-caramel underline-offset-4 hover:underline">
          Zur App
        </Link>
      </article>
    </main>
  );
}
