import {Injectable} from '@angular/core';
import {Circle} from '../models/circle.model';
import {Storage} from '@ionic/storage';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {defer, firstValueFrom, of, timeout} from 'rxjs';
import {environment} from '../../environments/environment';
import {WipeActions} from '../security/wipe-actions';
import {WipeStatusEnum} from '../WipeStatusEnum';

@Injectable({providedIn: 'root'})
export class CircledataService {
  private readonly CIRCLE_LOCAL_STORAGE_KEY = 'CIRCLES_LIST_STORAGE';
  private mutations: Promise<void> = Promise.resolve();
  private readonly actions: WipeActions;

  constructor(private storage: Storage, private http: HttpClient) {
    const options = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    this.actions = new WipeActions({
      checkLegacy: token => firstValueFrom(this.http.post<any>(environment.api_url + '/v1/circlecontroller/add',
        {wipe_token: token}, options).pipe(timeout(20000))),
      wipeLegacy: token => firstValueFrom(this.http.patch<any>(environment.api_url + '/v1/circlecontroller/updateToWiped',
        {wipe_token: token}, options).pipe(timeout(20000))),
      sendSigned: command => firstValueFrom(this.http.post<{accepted?: boolean}>(
        environment.api_url.replace(/\/$/, '') + '/v2/circlecontroller/wipe', command, options).pipe(timeout(20000))),
      readCommand: async token => {
        const contacts = (await this.circles()).filter(circle => circle.wipe_auth_token.trim() === token);
        if (!contacts.length) throw new Error('Contact no longer exists');
        const commands = contacts.map(circle => circle.pending_wipe_command).filter(command => command !== undefined);
        if (commands.some(command => JSON.stringify(command) !== JSON.stringify(commands[0]))) {
          throw new Error('Conflicting saved wipe requests');
        }
        return commands[0];
      },
      saveCommand: (token, command) => this.mutate(circles => {
        const contacts = circles.filter(circle => circle.wipe_auth_token.trim() === token);
        if (!contacts.length) throw new Error('Contact no longer exists');
        contacts.forEach(circle => { circle.pending_wipe_command = command; });
      }),
    });
  }

  public async circleTokenCheck(circle: Circle) {
    return of(await this.actions.check(circle.wipe_auth_token));
  }

  public add(circle: Circle) {
    return this.mutate(circles => { circles.push({...circle}); });
  }

  public remove(index: number) {
    return this.mutate(circles => { circles.splice(index, 1); });
  }

  public markWiping(token: string) {
    return this.mutate(circles => {
      circles.filter(circle => circle.wipe_auth_token === token).forEach(circle => {
        circle.wipe_status = WipeStatusEnum.WIPING;
      });
    });
  }

  public async circles(): Promise<Circle[]> {
    await this.mutations;
    return this.readCircles();
  }

  public wipe(circle: Circle) {
    const token = circle.wipe_auth_token;
    return defer(() => this.actions.wipe(token));
  }

  private async readCircles(): Promise<Circle[]> {
    const value = await this.storage.get(this.CIRCLE_LOCAL_STORAGE_KEY);
    return value === null ? [] : JSON.parse(value);
  }

  private mutate(change: (circles: Circle[]) => void): Promise<void> {
    const operation = this.mutations.then(async () => {
      const circles = await this.readCircles();
      change(circles);
      await this.storage.set(this.CIRCLE_LOCAL_STORAGE_KEY, JSON.stringify(circles));
    });
    // A failed write must not break future operations or permit an unsaved order.
    this.mutations = operation.catch(() => {});
    return operation;
  }
}
