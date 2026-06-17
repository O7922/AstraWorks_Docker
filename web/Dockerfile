FROM node:22-alpine
WORKDIR /app
COPY src/package*.json ./
RUN npm install
COPY src/ ./
EXPOSE 5173
CMD ["npm", "run", "dev"]
