import { useI18n } from "../../i18n";
import { translateMeasurementText } from "./measurementText";

export function useMeasurementI18n() {
  const context = useI18n();
  return { ...context, t: (source: string) => translateMeasurementText(source, context.language) };
}
