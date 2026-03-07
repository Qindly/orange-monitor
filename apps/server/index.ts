import path from 'path';
import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/report', (req, res) => {
  console.log('收到错误上报:');
  console.log(req.body);
  res.json({
    success: true,
    message: '收到上报',
  });
});

const webDistPath = path.resolve(__dirname, '../../react-demo/dist');
const webIndexPath = path.join(webDistPath, 'index.html');

if (existsSync(webIndexPath)) {
  app.use(express.static(webDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(webIndexPath);
  });
}

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
