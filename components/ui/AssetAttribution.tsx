import { ATTRIBUTION_MODE } from "@/lib/assets/config";

export type AssetSource = "Unsplash" | "Pexels" | "Pixabay" | "OpenMoji" | "DiceBear" | "unDraw";

export function AssetAttribution({ source, author, url }: { source: AssetSource; author?: string; url?: string }) {
  const shouldRender = (() => {
    if (ATTRIBUTION_MODE === "always") {
      return true;
    }
    return source === "OpenMoji";
  })();

  if (!shouldRender) {
    return null;
  }

  if (source === "OpenMoji") {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Emoji from <a className="underline" href="https://openmoji.org/">OpenMoji</a> • CC BY-SA 4.0
      </p>
    );
  }

  if (source === "DiceBear" && author && url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Avatar style &ldquo;{author}&rdquo; from <a className="underline" href={url}>DiceBear</a>
      </p>
    );
  }

  if (source === "Unsplash" && author && url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Photo by <a className="underline" href={url}>{author}</a> on Unsplash
      </p>
    );
  }

  if (source === "Pexels" && author && url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Photo by <a className="underline" href={url}>{author}</a> on Pexels
      </p>
    );
  }

  if (source === "Pixabay" && author && url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Photo by <a className="underline" href={url}>{author}</a> on Pixabay
      </p>
    );
  }

  if (source === "unDraw" && url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Illustration from <a className="underline" href={url}>unDraw</a>
      </p>
    );
  }

  return null;
}
