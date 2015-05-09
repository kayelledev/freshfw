CarrierWave.configure do |config|
  config.fog_provider = 'fog/aws'                        # required
  config.fog_credentials = {
    provider:              'AWS',                        # required
    aws_access_key_id:     'AKIAINQA3XAMH7BDRHKQ',                        # required
    aws_secret_access_key: '9KdoryimJ4w8loPH/VAEWKjCCbRDAWbsQxiuk7La'                       # required
#    host:                  's3.example.com',             # optional, defaults to nil
 #   endpoint:              'https://s3.example.com:8080' # optional, defaults to nil
  }
  config.fog_directory  = 'uploads'                          # required
#  config.fog_public     = false                                        # optional, defaults to true
# config.fog_attributes = { 'Cache-Control' => "max-age=#{365.day.to_i}" } # optional, defaults to {}
end