import {prepare} from './wipe-signer.js';
import type {SignedWipeCommand} from './wipe-signer.js';

export function tokenKind(value: string): 'signed' | 'legacy' | 'invalid' {
  const token = value.trim();
  if (token.startsWith('spw2.')) return 'signed';
  if (!token || /^spw\d+\./i.test(token) || token.length > 512) return 'invalid';
  return 'legacy';
}

interface WipeDependencies {
  checkLegacy(token: string): Promise<any>;
  wipeLegacy(token: string): Promise<any>;
  sendSigned(command: SignedWipeCommand): Promise<{accepted?: boolean}>;
  readCommand(token: string): Promise<SignedWipeCommand | undefined>;
  saveCommand(token: string, command: SignedWipeCommand): Promise<void>;
}

export class WipeActions {
  private readonly inFlight = new Map<string, Promise<any>>();
  private readonly dependencies: WipeDependencies;

  constructor(dependencies: WipeDependencies) {
    this.dependencies = dependencies;
  }

  async check(token: string): Promise<any> {
    switch (tokenKind(token)) {
      case 'signed':
        // Validate locally. Adding a contact never creates or sends a wipe order.
        await prepare(token.trim());
        return {response_code: 200};
      case 'legacy':
        return this.dependencies.checkLegacy(token);
      default:
        throw new Error('Invalid wipe token');
    }
  }

  // Only the user's confirmed Wipe action calls this method. No startup retries.
  wipe(token: string): Promise<any> {
    const key = tokenKind(token) === 'signed' ? token.trim() : token;
    const existing = this.inFlight.get(key);
    if (existing) return existing;
    const request = this.submit(key).finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, request);
    return request;
  }

  private async submit(token: string): Promise<any> {
    const kind = tokenKind(token);
    if (kind === 'invalid') throw new Error('Invalid wipe token');
    if (kind === 'legacy') {
      const response = await this.dependencies.wipeLegacy(token);
      if (!response || (response.response_code !== undefined && response.response_code !== 200)) {
        throw new Error('Wipe request not accepted');
      }
      return response;
    }

    const signer = await prepare(token);
    let command = await this.dependencies.readCommand(token);
    if (command) {
      if (!await signer.verify(command)) throw new Error('Invalid saved wipe request');
    } else {
      command = await signer.sign();
      // Persist BEFORE sending. After a timeout/restart, reuse the exact same order.
      await this.dependencies.saveCommand(token, command);
    }
    const response = await this.dependencies.sendSigned(command);
    if (response?.accepted !== true) throw new Error('Wipe request not accepted');
    return {response_code: 200};
  }
}
