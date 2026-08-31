import { assertNever } from "@/engine/geometry";

export type MascotPose = "idle" | "celebrate" | "think" | "oops";
export type MascotSize = "sm" | "md" | "lg" | "hero";

function mascotSrc(pose: MascotPose): string {
  switch (pose) {
    case "idle":
      return "/mascot/idle.png";
    case "celebrate":
      return "/mascot/celebrate.png";
    case "think":
      return "/mascot/think.png";
    case "oops":
      return "/mascot/oops.png";
    default:
      return assertNever(pose);
  }
}

export function Mascot({
  pose,
  size = "md",
  alt,
  className,
}: {
  pose: MascotPose;
  size?: MascotSize;
  alt: string;
  className?: string;
}) {
  const classes = ["mascot", `mascot-${size}`, pose === "celebrate" ? "mascot-bob" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    // Generated original traffic-light bird; next/image not required for static public mascots.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mascotSrc(pose)} alt={alt} className={classes} draggable={false} />
  );
}
