Rails.configuration.stripe = {
  #:publishable_key => ENV['PUBLISHABLE_KEY'],
  #:secret_key      => ENV['SECRET_KEY']
  
  #in secrets.yaml
  :publishable_key => Rails.application.secrets.publishable_key,
  :secret_key => Rails.application.secrets.secret_key
}

Stripe.api_key = Rails.configuration.stripe[:secret_key]