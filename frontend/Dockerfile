FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]