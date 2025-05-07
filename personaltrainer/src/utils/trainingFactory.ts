import { TTrainingsData } from "../TrainingList";

export function createTrainingData(
  id: number,
  date: string,
  duration: string,
  activity: string,
  customerHref: string
): TTrainingsData {
  return {
    id,
    date,
    duration,
    activity,
    _links: {
      self:     { href: customerHref },        // tai oma self-linkki
      training: { href: customerHref },        // korvaa haluamillasi
      customer: { href: customerHref },
    },
  };
}
