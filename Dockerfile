# ---- Stage 1: build ----
FROM public.ecr.aws/docker/library/node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Next.js bakes NEXT_PUBLIC_* values into the client bundle at BUILD time,
# not read at runtime — so this has to be a build arg, not a plain
# environment variable on the "frontend" service in docker-compose.yml.
# It must be the URL the BROWSER on your host machine can reach (published
# port on localhost), not the Docker-internal service name — the browser
# runs outside the Docker network entirely.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- Stage 2: runtime ----
FROM public.ecr.aws/docker/library/node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.ts ./

EXPOSE 3000
CMD ["npm", "start"]
