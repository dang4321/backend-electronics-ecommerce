import { Sequelize, DataTypes } from 'sequelize';
import mysql from 'mysql2';
import 'dotenv/config';

let sequelize;

// Nếu trên Render có cài DB_URL thì dùng cái này (Dành cho Aiven MySQL)
if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Bắt buộc để kết nối qua cloud không bị lỗi chứng chỉ
      }
    }
  });
} else {
  // Nếu không có DB_URL thì dùng Local (Dành cho Docker dưới máy bạn)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'doan4',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
      host: process.env.DB_HOST || 'mysql',
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    }
  );
}

export { sequelize, DataTypes };