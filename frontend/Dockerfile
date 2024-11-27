# Use Node base image
FROM node:14

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose port 3000 and start the React app
EXPOSE 3000
CMD ["npm", "start"]
