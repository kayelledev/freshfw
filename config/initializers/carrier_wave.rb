if Rails.env.production?
  CarrierWave.configure do |config|
    config.fog_provider = 'fog/aws'                        # required
    config.fog_credentials = {
      provider:              'AWS',                        # required
      aws_access_key_id:     ENV['S3_Access_Key'],         # required
      aws_secret_access_key: ENV['S3_Secret_Key']          # required
    }
    config.fog_directory  = ENV['S3_Bucket']               # required
  end
end
