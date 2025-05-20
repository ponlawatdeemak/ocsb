# Stage1: Build App
FROM node:22-alpine AS builder

ENV HOME_DIR=/app
WORKDIR ${HOME_DIR}
#COPY . ${HOME_DIR}
COPY ./src ${HOME_DIR}/src
COPY ./public ${HOME_DIR}/public
COPY ./pages ${HOME_DIR}/pages
COPY ./ocsb-interface ${HOME_DIR}/ocsb-interface
COPY next.config.js ${HOME_DIR}/
COPY package-lock.json ${HOME_DIR}/
COPY package.json ${HOME_DIR}/
COPY postcss.config.js ${HOME_DIR}/
COPY tailwind.config.ts ${HOME_DIR}/
COPY tsconfig.json ${HOME_DIR}/
COPY next-i18next.config.js ${HOME_DIR}/
COPY webapp.config.ts ${HOME_DIR}/
COPY .gitmodules ${HOME_DIR}/
COPY ./.git ${HOME_DIR}/.git


RUN apk update && \
    apk add git && \
    git submodule update --init
    
WORKDIR ${HOME_DIR}/ocsb-interface
RUN npm ci --ignore-scripts

WORKDIR ${HOME_DIR}
RUN npm ci --ignore-scripts --omit=dev && \
    npm run build  && \
    rm -rf ./.next/cache
    
# Stage2: Build Image
FROM node:22-alpine AS runner 

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production HOME=/app
    
WORKDIR ${HOME}

COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/package.json ./
COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/package-lock.json ./
COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/public ./public
COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/.next ./.next
COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/next.config.js ./
COPY --chown=appuser:appgroup --chmod=755 --from=builder /app/next-i18next.config.js ./

RUN npm ci --ignore-scripts --omit=dev && \
    rm -rf package-lock.json

USER appuser

EXPOSE 3000
    
CMD ["npm", "start"]