import { RequestWithMaker } from '../../common/interfaces/request-with-maker.interface';
import { MakerAccount } from './maker-account.interface';

/** Request yang sudah melewati MakerAuthGuard dan membawa akun maker terautentikasi. */
export interface RequestWithMakerAccount extends RequestWithMaker {
  makerAccount?: MakerAccount;
}
