FROM node:18-slim

# Build-time environment variable
ARG NEXT_PUBLIC_API_URL

# Make it available inside the container at runtime (optional for Node apps)
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
