# config valid only for current version of Capistrano
lock '3.4.0'
set :log_level, :debug
set :repo_url, 'git@bitbucket.org:freshfourwalls/fourwalls.git'

set :stages, %w(production staging demo)

set :rvm_ruby_version, '2.2.2@freshfw'

set :keep_releases, 1

set :linked_files, %w{config/database.yml config/secrets.yml config/application.yml}
set :linked_dirs, %w{log tmp/pids public/uploads public/assets public/system public/certificate}

set :sidekiq_config, -> { File.join(current_path, 'config', 'sidekiq.yml') }

# Auto generation permissions table
namespace :custom_tasks do
  desc "Generate permission"
  task :permissions do
  	on roles(:app) do
  	  within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, "permissions:generate"
        end
      end
    end
  end
end

after 'deploy:publishing', 'deploy:restart'
after 'deploy:publishing', 'custom_tasks:permissions'

namespace :deploy do
  task :restart do
    invoke 'unicorn:legacy_restart'
  end
end


