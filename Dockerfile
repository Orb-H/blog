# Stage 1: Build the Jekyll site
FROM ruby:3.1.3 as builder

WORKDIR /usr/src/app

# Install Jekyll and dependencies
COPY Gemfile minima.gemspec ./
RUN bundle install

# Copy source code and build the static site
COPY . .
RUN JEKYLL_ENV=production bundle exec jekyll build --destination /usr/share/nginx/html

# Stage 2: Serve the static site with Nginx
FROM nginx:alpine

# Copy the built site from the builder stage to the Nginx web root
COPY --from=builder /usr/share/nginx/html /usr/share/nginx/html

# Expose port 8080 (Cloud Run default port)
EXPOSE 8080

# Update Nginx configuration to listen on port 8080
RUN sed -i 's/listen\s*80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]