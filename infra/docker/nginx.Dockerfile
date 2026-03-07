FROM nginx:1.25-alpine

# Copy custom nginx configuration
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/conf.d/ /etc/nginx/conf.d/

EXPOSE 80 443
