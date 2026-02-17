FROM node:20

# Create and set working directory for the action code
WORKDIR /action

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Add all action code
COPY . .

# Default command (explicit absolute path)
CMD ["node", "/action/src/index.js"]