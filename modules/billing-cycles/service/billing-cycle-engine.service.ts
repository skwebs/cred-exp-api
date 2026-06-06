import { addDays, addMonths, setDate, subMonths, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export interface BillingCycle {
  startDate: Date;
  endDate: Date;
  billDate: Date;
  dueDate: Date;
}

export class BillingCycleEngine {
  static calculateCycle(referenceDate: Date, billingDay: number, gracePeriodDays: number): BillingCycle {
    const ref = startOfDay(referenceDate);
    const refDay = ref.getDate();

    let startDate: Date;
    let endDate: Date;
    let billDate: Date;

    if (refDay > billingDay) {
      // We are in a cycle that ends next month
      startDate = setDate(ref, billingDay + 1);
      endDate = setDate(addMonths(ref, 1), billingDay);
    } else {
      // We are in a cycle that ends this month
      startDate = setDate(subMonths(ref, 1), billingDay + 1);
      endDate = setDate(ref, billingDay);
    }

    billDate = endOfDay(endDate);
    const dueDate = startOfDay(addDays(billDate, gracePeriodDays));

    return {
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate),
      billDate,
      dueDate,
    };
  }

  static getCycles(referenceDate: Date, billingDay: number, gracePeriodDays: number) {
    const current = this.calculateCycle(referenceDate, billingDay, gracePeriodDays);
    const previous = this.calculateCycle(subMonths(current.startDate, 1), billingDay, gracePeriodDays);
    const next = this.calculateCycle(addMonths(current.endDate, 1), billingDay, gracePeriodDays);

    return {
      current,
      previous,
      next,
    };
  }
}
