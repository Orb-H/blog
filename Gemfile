# frozen_string_literal: true

source "https://rubygems.org"
gemspec

gem "jekyll", ENV["JEKYLL_VERSION"] if ENV["JEKYLL_VERSION"]

group :jekyll_plugins do
  gem 'jekyll-sitemap', '1.4.0'
  gem 'tzinfo'
  gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw]
  gem 'wdm', '>= 0.1.0' if Gem.win_platform?
  gem 'kramdown-parser-gfm'
end
