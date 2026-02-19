import bcrypt from 'bcryptjs';
import { HashProtocolService } from './hash.service';

export class BcryptHashService extends HashProtocolService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    const passworfHash = await bcrypt.hash(password, salt);

    return passworfHash;
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    const confirmadPassword = await bcrypt.compare(password, passwordHash);

    return confirmadPassword;
  }
}
