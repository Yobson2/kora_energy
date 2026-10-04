import Image from "next/image";
import { photoAlt, type Photo } from "@/app/content/media";
import type { Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";

/**
 * A photograph from the media registry. The frame sets the shape (`ratio`)
 * and the image covers it, so photos of different proportions sit in a grid
 * without shifting layout. The credit is part of the figure, not a footnote.
 */
export function PhotoFigure({
  photo,
  ratio = "3/2",
  sizes = "100vw",
  priority = false,
  caption,
  className,
  rounded = true,
  focus,
  locale,
}: {
  locale: Locale;
  photo: Photo;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  /** Shown before the credit. "Illustrative photograph." is the usual case. */
  caption?: string;
  className?: string;
  rounded?: boolean;
  /** Focal point for tight crops, as CSS object-position (e.g. "80% 40%"). */
  focus?: string;
}) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "bg-plaster-deep relative overflow-hidden",
          rounded && "rounded-[var(--radius-md)]"
        )}
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={photo.image}
          alt={photoAlt(photo, locale)}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className="object-cover"
          style={focus ? { objectPosition: focus } : undefined}
        />
      </div>
      <figcaption className="type-small text-muted">
        {caption ? `${caption} ` : ""}
        {locale === "fr" ? "Photo :" : "Photo:"}{" "}
        <a
          href={photo.credit.url}
          className="underline-offset-2 hover:underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          {photo.credit.author}
          <span className="sr-only">
            {locale === "fr"
              ? ` sur ${photo.credit.source} (nouvel onglet)`
              : ` on ${photo.credit.source} (opens in a new tab)`}
          </span>
        </a>
        <span aria-hidden>, {photo.credit.source}</span>
      </figcaption>
    </figure>
  );
}
