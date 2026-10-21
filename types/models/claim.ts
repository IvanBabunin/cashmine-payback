export type ClaimStatus = 'pending' | 'completed' | 'failed';

export type Claim = {
  id: string;
  asset: string;
  amount: string;
  fee: string;
  receiveAmount: string;
  destinationId: string;
  status: ClaimStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClaimDestination = { id: string; label: string };

export type ClaimOptions = {
  asset: string;
  minAmount: string;
  fee: string;
  destinations: ClaimDestination[];
};

export type CreateClaimBody = {
  asset: string;
  amount: string;
  destinationId: string;
};
