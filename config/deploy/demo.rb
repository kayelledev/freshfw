set :deploy_to, '/home/fresh_fw_demo/fresh_fw_demo_app'

# RVM-specific config
set :application, 'fresh-fw-demo'
set :branch, "staging"
set :rails_env, :demo

server 'server.sloboda-studio.com',
  user: 'fresh_fw_demo',
  roles: %w{web app db},
  ssh_options: {
    port: 3333,
  }
