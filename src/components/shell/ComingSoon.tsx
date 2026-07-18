export function ComingSoon({ title, blurb, mockup }: { title: string; blurb: string; mockup?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-20">
      <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mb-4">
        <i className="ti ti-hammer text-xl text-faint" />
      </div>
      <h1 className="text-base font-bold text-ink mb-1.5">{title}</h1>
      <p className="text-sm text-muted max-w-xs">{blurb}</p>
      {mockup && <p className="text-xs text-faint mt-3">Mockup reference: {mockup}</p>}
    </div>
  );
}
