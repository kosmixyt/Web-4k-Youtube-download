FROM node:20

RUN apt update && apt install -y curl ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm run start