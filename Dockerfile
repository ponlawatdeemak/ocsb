# Stage1: Build App
FROM node:22-alpine AS builder

ENV HOME_DIR=/app
WORKDIR ${HOME_DIR}
COPY . ${HOME_DIR}

RUN apk update && \
    apk add git && \
    git submodule update --init
    
WORKDIR ${HOME_DIR}/sugar-cane-interface 
RUN npm ci --ignore-scripts
WORKDIR ${HOME_DIR}
RUN npm ci --ignore-scripts  && \
	npm run build  && \
	rm -rf ./.next/cache
	
# Stage2: Build Image
FROM node:22-alpine AS runner

ENV NODE_ENV=production HOME=/app
	
WORKDIR ${HOME}

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder  /app/public ./public
COPY --from=builder  /app/.next ./.next
COPY --from=builder  /app/next.config.js ./
COPY --from=builder  /app/next-i18next.config.js ./


RUN npm ci --ignore-scripts --omit=dev && \
	rm -rf package-lock.json

EXPOSE 3000
	
CMD ["npm", "start"]
