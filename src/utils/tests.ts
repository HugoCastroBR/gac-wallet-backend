import { Response } from 'supertest';

export const parseResText = (res: Response) => {
  return JSON.parse(res.text);
};
