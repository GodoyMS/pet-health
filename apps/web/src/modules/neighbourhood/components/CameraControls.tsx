import { Icon } from "@repo/ui";

interface CameraControlsProps {
  onRecenter: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onToggleTilt: () => void;
  onResetNorth: () => void;
}

/** Floating camera cluster: orbit, tilt, north, and snap-back-to-pet. */
export function CameraControls({
  onRecenter,
  onRotateLeft,
  onRotateRight,
  onToggleTilt,
  onResetNorth
}: CameraControlsProps) {
  return (
    <div className="m-3 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/95 p-1 shadow-lg backdrop-blur">
        <ControlButton icon="rotate_left" label="Rotate left" onClick={onRotateLeft} />
        <ControlButton icon="explore" label="Reset to north" onClick={onResetNorth} />
        <ControlButton icon="rotate_right" label="Rotate right" onClick={onRotateRight} />
      </div>

      <ControlButton
        icon="deployed_code"
        label="Toggle 3D tilt"
        onClick={onToggleTilt}
        className="size-10 rounded-full border border-border/60 bg-card/95 shadow-lg backdrop-blur"
      />

      <ControlButton
        icon="my_location"
        label="Recenter on my pet"
        onClick={onRecenter}
        className="size-11 rounded-full border border-border/60 bg-card text-primary shadow-lg"
      />
    </div>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  className = ""
}: {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted ${className}`}
    >
      <Icon name={icon} className="text-lg" />
    </button>
  );
}
