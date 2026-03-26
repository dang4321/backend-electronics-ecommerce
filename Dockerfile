# Dùng bản node:20-alpine cho siêu nhẹ
FROM node:20-alpine 

WORKDIR /app

# Copy các file thiết lập môi trường
COPY package*.json ./

# Chỉ cài đặt thư viện cần thiết cho production (Bỏ qua nodemon, babel-node...)
RUN npm ci --omit=dev

# Copy toàn bộ code
COPY . .

# Chuyển môi trường sang Production để kích hoạt các tính năng bảo mật bảo mật (như cookie secure)
ENV NODE_ENV=production

# Render sẽ ánh xạ qua cổng 10000
EXPOSE 10000

CMD ["npm", "start"]