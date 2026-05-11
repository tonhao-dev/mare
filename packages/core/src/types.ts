export type ControlType = "INCREASE" | "DECREASE";

/** Whether the billing cycle starts N days after the 1st or N days before the last day of the month */
export type CycleAnchor = "START" | "END";

export interface Control {
  id: string;
  name: string;
  baseValueCents: number;
  type: ControlType;
  dailyStepCents: number;
  cycleAnchor: CycleAnchor;
  cycleOffsetDays: number;
  countWorkingDaysOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}
