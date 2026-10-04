export interface SignedWipeCommand {
  protocol: 3;
  action: 'wipe';
  registration_id: string;
  key_version: 1;
  key_id: string;
  command_id: string;
  issued_at: number;
  signature: string;
}

export function canonical(command: SignedWipeCommand): Uint8Array;
export function prepare(token: string): Promise<{
  registrationId: string;
  keyId: string;
  sign(): Promise<SignedWipeCommand>;
  verify(command: SignedWipeCommand): Promise<boolean>;
}>;
