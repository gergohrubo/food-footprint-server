FROM node:8
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 4000
CMD [ "npm", "run", "dev" ]