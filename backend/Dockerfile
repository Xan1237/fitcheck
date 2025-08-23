FROM node:18-alpine

WORKDIR /app

# Add build arguments for environment variables
ARG PORT=3000
ENV PORT=$PORT

COPY package*.json ./

RUN npm install

COPY . .

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r => process.exit(r.ok ? 0 : 1))"

EXPOSE ${PORT}

# Use production environment
ENV NODE_ENV=production

CMD ["npm", "start"]
