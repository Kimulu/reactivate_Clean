# 🐳 Use a lightweight Node.js image
FROM node:18-alpine

# 📁 Set the working directory inside the container
WORKDIR /app

# ⚙️ Copy package files first to leverage Docker's build cache.
# This copies package.json and package-lock.json from the express_backend folder.
COPY package*.json ./

# 📦 Install production dependencies
RUN npm install --production

# 🚚 Copy the rest of your backend's source code into the container
COPY . .

# 🌐 Expose the port that the server will listen on
EXPOSE 8080

# 🚀 The command to start the web server when the container launches
CMD ["node", "server.js"]