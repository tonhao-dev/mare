export type ControlType = "INCREASE" | "DECREASE";

export interface Control {
  id: string;
  name: string;
  baseValueCents: number;
  type: ControlType;
  dailyStepCents: number;
  createdAt: Date;
  updatedAt: Date;
}
