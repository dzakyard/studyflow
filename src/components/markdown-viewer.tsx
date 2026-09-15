"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-4 text-sm sm:text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold tracking-tight mt-6 mb-3 border-b pb-2 text-foreground" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-semibold tracking-tight mt-5 mb-2 text-foreground" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-medium mt-4 mb-2 text-foreground" {...props} />
          ),
          p: ({ ...props }) => <p className="my-2 leading-relaxed text-foreground/90" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="my-0.5" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary/50 bg-muted/40 pl-4 py-2 italic my-3 rounded-r"
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs font-semibold text-primary"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-xs my-3 border">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4 border rounded-lg">
              <table className="w-full text-sm border-collapse text-left" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="border-b bg-muted/60 px-4 py-2 font-semibold" {...props} />
          ),
          td: ({ ...props }) => <td className="border-b px-4 py-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
