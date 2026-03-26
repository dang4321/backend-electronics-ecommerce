import express from 'express';
import 'dotenv/config';
import viewEngine from './configs/viewEngine.js';
import initWebRouter from './router/WebRouter.js';
import initAPIRoute from './router/apiRouter.js';
import path from 'path';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './configs/cleanup.js';

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production'; // Kiểm tra xem có phải đang chạy trên Render không

// Bắt buộc thêm dòng này để Session hoạt động trên môi trường HTTPS của Render
if (isProd) {
  app.set('trust proxy', 1);
}

/* ===================== MIDDLEWARE ===================== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/static', express.static(path.join(process.cwd(), 'public')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));

viewEngine(app);

/* ===================== REDIS ===================== */
// Hỗ trợ cả REDIS_URL (trên Render) HOẶC host/port (trên Local)
const redisClient = createClient(
  process.env.REDIS_URL 
    ? { url: process.env.REDIS_URL } 
    : {
        socket: {
          host: process.env.REDIS_HOST || 'redis',
          port: process.env.REDIS_PORT || 6379,
        },
      }
);

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

await redisClient.connect();
console.log('✅ Redis connected');

/* ===================== SESSION ===================== */
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:',
});

app.use(
  session({
    store: redisStore,
    secret: process.env.Ad_Session_Secret || 'secret-tam-thoi',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd, // Tự động bật bảo mật cookie nếu trên Render (HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 giờ
      sameSite: isProd ? 'none' : 'lax' // Giúp frontend/backend khác domain vẫn giữ được session
    },
  })
);

/* ===================== CORS ===================== */
const hardcodedOrigins = ['http://localhost:3001', 'http://localhost:8080'];
const envOrigin = process.env.FRONTEND_URL;
const finalOrigins = envOrigin ? [...hardcodedOrigins, envOrigin] : hardcodedOrigins;

app.use(
  cors({
    origin: finalOrigins,
    credentials: true,
  })
);

app.use(cookieParser());

/* ===================== ROUTER ===================== */
initAPIRoute(app);
initWebRouter(app);

/* ===================== START ===================== */
app.listen(port, () => {
  console.log(`🚀 Backend đang chạy trên cổng ${port}`);
});