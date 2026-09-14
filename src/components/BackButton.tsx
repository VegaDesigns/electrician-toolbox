import { IconButton } from "./IconButton";
type Props = { onPress: () => void; disabled?: boolean; accessibilityLabel?: string };
/** Shared return control; callers retain navigation and save guards. */
export function BackButton({ onPress, disabled, accessibilityLabel = "Return to toolbox home" }: Props) {
  return <IconButton icon="back" label={accessibilityLabel} onPress={onPress} disabled={disabled} />;
}
