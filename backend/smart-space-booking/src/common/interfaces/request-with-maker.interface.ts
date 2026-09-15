import { Request } from 'express';
import { MakerContext } from '../../maker/interfaces/maker-context.interface';

/**
 * Bentuk request setelah MakerContextGuard menempelkan tenant pemilik data.
 * `maker` bersifat opsional karena endpoint yang ditandai @SkipMakerContext()
 * tidak pernah melewati guard tersebut.
 */
export interface RequestWithMaker extends Request {
  maker?: MakerContext;
}
