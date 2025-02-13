FROM node:22-alpine

ARG P_USER_NAME=app
ARG P_UID=21001
ENV NODE_ENV=production HOME=/app

RUN addgroup --gid ${P_UID} ${P_USER_NAME} && \
    adduser --disabled-password --uid ${P_UID} ${P_USER_NAME} -G ${P_USER_NAME} && \
    mkdir -p ${HOME} && \
    chown -R ${P_UID}:${P_UID} ${HOME}

WORKDIR ${HOME}
USER ${P_UID}

ADD --chown="21001:21001" package*.json ./

RUN npm ci --omit=dev && \
    rm -rf package-lock.json .npmrc .npm

ADD --chown="21001:21001" public ./public
ADD --chown="21001:21001" .next ./.next
ADD --chown="21001:21001" next.config.mjs ./

RUN rm -rf ./.next/cache || true

CMD npm start
