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

COPY --chown=root:node --chmod=755 package.json ./
COPY --chown=root:node --chmod=755 package-lock.json ./

RUN npm ci --ignore-scripts --omit=dev && \
    rm -rf package-lock.json .npmrc .npm

COPY --chown=root:node --chmod=755 public ./public
COPY --chown=root:node --chmod=755 .next ./.next
COPY --chown=root:node --chmod=755 next.config.js ./

RUN rm -rf ./.next/cache || true

CMD ["npm", "start"]
