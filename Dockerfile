FROM node:12
WORKDIR /app
RUN apt -y update
RUN apt -y upgrade
RUN apt -y install ffmpeg
RUN mkdir tmp && mkdir frames
COPY package*.json yarn.lock ./
RUN yarn install 
COPY . .
CMD ["yarn", "start"]