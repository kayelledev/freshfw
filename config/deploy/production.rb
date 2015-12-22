set :deploy_to, '/home/deploy/fourwalls'

# RVM-specific config
set :application, 'fourwalls'
set :branch, "staging"
set :rails_env, :production

server '52.10.143.186',
  user: 'deploy',
  roles: %w{web app db}
