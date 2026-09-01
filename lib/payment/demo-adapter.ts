import "server-only";

import { randomUUID } from "node:crypto";
import type { DemoPaymentRequest, DemoPaymentResult, PaymentAdapter } from "./adapter";

export class DemoPaymentAdapter implements PaymentAdapter {
  async charge(request: DemoPaymentRequest): Promise<DemoPaymentResult> {
    const succeeded = request.outcome === "APPROVE";

    return {
      bookingReference: request.bookingReference,
      providerReference: `DEMO-${randomUUID()}`,
      amount: request.amount,
      currency: request.currency,
      status: succeeded ? "SUCCEEDED" : "FAILED",
      failureCode: succeeded ? null : "DEMO_DECLINED",
      resolvedAt: new Date(),
    };
  }
}
