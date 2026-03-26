FROM node:20-alpine 

WORKDIR /app

COPY package*.json ./

# Sửa dòng này: Cài đặt tất cả thư viện (bao gồm cả babel và nodemon)
RUN npm install

COPY . .

ENV NODE_ENV=production

EXPOSE 10000

# Giữ nguyên lệnh chạy script start của bạn
CMD ["npm", "start"]