import type { Components } from "react-markdown";

export const readmeMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 border-b border-white/10 pb-2 text-2xl font-semibold text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 border-b border-white/10 pb-1.5 text-xl font-semibold text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold text-white">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-zinc-600 pl-4 text-zinc-400">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="mb-4 overflow-x-auto rounded-md border border-white/10 bg-[#0d1117] p-4">
          <code className="font-mono text-[13px] text-zinc-200">{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-zinc-200">
        {children}
      </code>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-hi underline decoration-hi/40 underline-offset-2 transition-colors hover:decoration-hi/70"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-2 max-w-full rounded-sm border border-white/10"
    />
  ),
  hr: () => <hr className="my-6 border-white/10" />,
};
