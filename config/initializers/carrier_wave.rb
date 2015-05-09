if Rails.env.production? 
  CarrierWave.configure do |config|
    config.fog_provider = 'fog/aws'                        # required
    config.fog_credentials = {
      provider:              'AWS',                        # required
      aws_access_key_id:     ENV['S3_Access_Key'],                       # required
      aws_secret_access_key: ENV['S3_Secret_Key']                      # required
  #    host:                  's3.example.com',             # optional, defaults to nil
   #   endpoint:              'https://s3.example.com:8080' # optional, defaults to nil
    }
    config.fog_directory  = ENV['S3_Bucket']                          # required
  #  config.fog_public     = false                                        # optional, defaults to true
  # config.fog_attributes = { 'Cache-Control' => "max-age=#{365.day.to_i}" } # optional, defaults to {}
  end
end 