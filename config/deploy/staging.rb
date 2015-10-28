set :deploy_to, '/home/fresh_fw_stage/fresh_fw_stage_app'

# RVM-specific config
set :application, 'fresh-fw-stage'
set :branch, "master"
set :rails_env, :staging

server 'server.sloboda-studio.com',
  user: 'fresh_fw_stage',
  roles: %w{web app db},
  ssh_options: {
    port: 3333,
  }

