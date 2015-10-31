require File.expand_path('../boot', __FILE__)

require 'rails/all'
require 'fog/aws'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FourWalls
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    config.active_record.raise_in_transactional_callbacks = true
    
    #Landing Page
    #Carousel image paths
    config.carousel1s3path = 'https://s3.amazonaws.com/gofourwalls/globalimages/Pinnacle2-livingdining-carousel.jpg'
    config.carousel2s3path = 'https://s3.amazonaws.com/gofourwalls/globalimages/dann-livingroom-carousel.jpg'
    config.carousel3s3path = 'https://s3.amazonaws.com/gofourwalls/globalimages/Pinnacle-livingdining-carousel.jpg'
    config.carousel4s3path = 'https://s3.amazonaws.com/gofourwalls/globalimages/Echo-livingdining-carousel.jpg'
    config.carousel_shop_about_blog = 'assets/shop_about_blog.jpg'
  
    #Global variables for the webapp
    config.twitterpath = 'https://twitter.com/go4walls/'
    config.facebookpath = 'https://www.facebook.com/gofourwalls/'
    config.pinterestpath = 'https://www.pinterest.com/gofourwalls/'
    
    # default state and country
    config.country = 'Canada'
    config.state_code = 'ON'

    unless Rails.env.development?
        if ENV['S3_Access_Key'].nil? || ENV['S3_Access_Key'].nil? || ENV['S3_Access_Key'].nil?
            cfg = YAML.load_file("#{Rails.root}/config/fog_credentials.yml")
            ENV['S3_Access_Key'] = cfg['S3_Access_Key'] if ENV['S3_Access_Key'].nil?
            ENV['S3_Secret_Key'] = cfg['S3_Secret_Key'] if ENV['S3_Secret_Key'].nil?
            ENV['S3_Bucket'] = cfg['S3_Bucket'] if ENV['S3_Bucket'].nil?
        end
    end
    if Rails.env.production?
        if ENV['TWITTER_API_KEY'].nil? || ENV['TWITTER_API_SECRET'].nil? || ENV['FACEBOOK_APP_ID'].nil? || ENV['FACEBOOK_APP_SECRET'].nil?
            cfg = YAML.load_file("#{Rails.root}/config/social.yml")
            ENV['TWITTER_API_KEY'] = cfg['TWITTER_API_KEY'] if ENV['TWITTER_API_KEY'].nil?
            ENV['TWITTER_API_SECRET'] = cfg['TWITTER_API_SECRET'] if ENV['TWITTER_API_SECRET'].nil?
            ENV['FACEBOOK_APP_ID'] = cfg['FACEBOOK_APP_ID'] if ENV['FACEBOOK_APP_ID'].nil?
            ENV['FACEBOOK_APP_ID'] = cfg['FACEBOOK_APP_ID'] if ENV['FACEBOOK_APP_ID'].nil?
        end
    end

  end
end
