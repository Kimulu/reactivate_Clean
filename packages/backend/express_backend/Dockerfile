# 🐳 Use a lightweight Node.js image
FROM node:18-alpine

# 📁 Set the working directory inside the container
WORKDIR /app

# ⚙️ Copy package files first (to leverage Docker’s layer caching)
COPY package*.json ./

# 📦 Install ALL dependencies (both runtime + dev)
#   - This ensures Jest and jsdom are available during test runs.
RUN npm install --include=dev

# 🚚 Copy the rest of your backend's source code into the container
COPY . .

# ✅ Copy Jest + Babel configs into the image (so the runner can use them)
COPY babel.config.js jest.config.js setupTests.js ./
COPY __mocks__/ ./__mocks__/

# 🌐 Expose the backend port (use your actual server port)
EXPOSE 10000

# 🚀 Start the server
CMD ["node", "server.js"]
