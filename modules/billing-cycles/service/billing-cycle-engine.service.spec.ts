import { BillingCycleEngine } from './billing-cycle-engine.service';
import { format } from 'date-fns';

describe('BillingCycleEngine', () => {
  it('should calculate current cycle correctly when after billing day', () => {
    const referenceDate = new Date(2026, 5, 5); // 05-Jun-2026
    const billingDay = 4;
    const gracePeriodDays = 18;

    const { current } = BillingCycleEngine.getCycles(referenceDate, billingDay, gracePeriodDays);

    expect(format(current.startDate, 'yyyy-MM-dd')).toBe('2026-06-05');
    expect(format(current.endDate, 'yyyy-MM-dd')).toBe('2026-07-04');
    expect(format(current.dueDate, 'yyyy-MM-dd')).toBe('2026-07-22');
  });

  it('should calculate current cycle correctly when on billing day', () => {
    const referenceDate = new Date(2026, 5, 4); // 04-Jun-2026
    const billingDay = 4;
    const gracePeriodDays = 18;

    const { current } = BillingCycleEngine.getCycles(referenceDate, billingDay, gracePeriodDays);

    expect(format(current.startDate, 'yyyy-MM-dd')).toBe('2026-05-05');
    expect(format(current.endDate, 'yyyy-MM-dd')).toBe('2026-06-04');
    expect(format(current.dueDate, 'yyyy-MM-dd')).toBe('2026-06-22');
  });
});
