FROM node:20-alpine

#Crear y definir el directorio de trabajo dentro del contenedor
WORKDIR /app

#Copiar los archivos de configuración de paquetes
COPY package*.json ./

RUN npm install

#Copiar el resto del código del backend
COPY . .

#Compilar el código TypeScript a JavaScript
RUN npm run build

#Exponer el puerto que usa la API
EXPOSE 3001

#Comando para arrancar el servidor
CMD ["npm", "start"]