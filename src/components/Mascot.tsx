import { PublicArt } from "@/components/PublicArt";
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

function mascotSvgSrc(pose: MascotPose): string {
  switch (pose) {
    case "idle":
      return "/mascot/idle.svg";
    case "celebrate":
      return "/mascot/celebrate.svg";
    case "think":
      return "/mascot/think.svg";
    case "oops":
      return "/mascot/oops.svg";
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
  return <PublicArt src={mascotSrc(pose)} fallbackSrc={mascotSvgSrc(pose)} alt={alt} className={classes} />;
}
