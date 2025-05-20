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

COPY --chown="21001:21001" package.json ./
COPY --chown="21001:21001" package-lock.json ./

RUN npm ci --ignore-scripts --omit=dev && \
    rm -rf package-lock.json .npmrc .npm

COPY --chown="21001:21001" public ./public
COPY --chown="21001:21001" .next ./.next
COPY --chown="21001:21001" next.config.js ./

RUN rm -rf ./.next/cache || true

CMD ["npm", "start"]
