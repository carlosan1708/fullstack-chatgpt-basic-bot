# Use the official Node.js image from Docker Hub
FROM node:20.11.1-bullseye as build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files into the container at /app
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the remaining source code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Use nginx for serving the static files
FROM nginx:alpine

# Copy the built React app from the build stage into the nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
