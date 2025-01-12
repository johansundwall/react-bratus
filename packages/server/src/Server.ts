import ASTParser from '@react-bratus/parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';

class Server {
  private app = express();

  public listen(): void {
    this.app.use(cors());
    this.app.use(express.static(path.join(__dirname, '../../app/build')));

    this.app.get('/ping', (_req: express.Request, res: express.Response) => {
      const result = {
        dir: process.cwd(),
      };
      res.status(200).send(result);
    });
    this.app.get('/', (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(__dirname, '../../app/build', 'index.html'));
    });
    this.app.get(
      '/parsedData',
      (_req: express.Request, res: express.Response) => {
        res
          .status(200)
          .send(fs.readFileSync(`${process.cwd()}/.react-bratus/data.json`));
      }
    );
    this.app.post(
      '/compile',
      (_req: express.Request, res: express.Response) => {
        const parser = new ASTParser(`${process.cwd()}/src`, true);
        parser.compile();
        res.status(200).send();
      }
    );
    this.app.listen(4444);
    console.log('Listening on port 4444');
  }
}

export default Server;
