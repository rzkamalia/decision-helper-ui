FROM node:18-slim

# Build-time environment variable
ARG NEXT_PUBLIC_API_URL

# Make it available inside the container at runtime (optional for Node apps)
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY public ./public
COPY styles ./styles
COPY next.config.mjs .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.mjs .
COPY components.json .
COPY next-env.d.ts .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
