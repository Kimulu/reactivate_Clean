# 🐳 Use a lightweight Node.js image
FROM node:18-alpine

# 📁 Set the working directory inside the container
WORKDIR /app

# ⚙️ Copy package files first to leverage Docker's build cache.
COPY package*.json ./

# 📦 Install ALL dependencies (including devDependencies like Jest)
RUN npm install jest @testing-library/react @testing-library/jest-dom @testing-library/dom --save-dev


# 🚚 Copy the rest of your backend's source code into the container
COPY . .

# =======================================================
# === THIS IS THE CRITICAL FIX FROM YOUR OLD DOCKERFILE ===
# =======================================================
# 🧠 Copy Jest + Babel configs so they exist inside the container
#    and can be copied to the temp directory at runtime.
COPY babel.config.js .
COPY jest.config.js .
COPY setupTests.js .
COPY __mocks__ ./__mocks__
# =======================================================

# 🌐 Expose the port that the server will listen on
EXPOSE 8080

# 🚀 The command to start the web server when the container launches
CMD ["node", "server.js"]