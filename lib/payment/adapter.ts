export type DemoPaymentRequest = {
  bookingReference: string;
  amount: number;
  currency: "IDR";
  outcome: "APPROVE" | "DECLINE";
};

export type DemoPaymentResult = {
  bookingReference: string;
  providerReference: string;
  amount: number;
  currency: "IDR";
  status: "SUCCEEDED" | "FAILED";
  failureCode: string | null;
  resolvedAt: Date;
};

export type DemoRefundRequest = {
  bookingReference: string;
  amount: number;
  currency: "IDR";
};

export type DemoRefundResult = {
  bookingReference: string;
  providerReference: string;
  amount: number;
  currency: "IDR";
  status: "SUCCEEDED";
  resolvedAt: Date;
};

export interface PaymentAdapter {
  charge(request: DemoPaymentRequest): Promise<DemoPaymentResult>;
  refund(request: DemoRefundRequest): Promise<DemoRefundResult>;
}
