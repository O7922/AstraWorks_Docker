FROM node:22-alpine
WORKDIR /app
COPY src/features/home/package*.json ./
RUN npm install
COPY src/features/home/ ./
EXPOSE 5173
CMD ["npm", "run", "dev"]
