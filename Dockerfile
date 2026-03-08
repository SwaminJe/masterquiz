FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./
COPY packages ./packages

RUN yarn install

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

CMD ["sh", "-c", "yarn workspace @masterquiz/${SERVICE_NAME} run start"]
