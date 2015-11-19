module Shoppe
  class Role < ActiveRecord::Base
  	has_and_belongs_to_many :users, :join_table => :shoppe_roles_users
    has_and_belongs_to_many :permissions, :join_table => :shoppe_permissions_roles
    rolify :role_cname => 'User'
    belongs_to :resource, :polymorphic => true
    validates :name, :presence => true
    validates :resource_type,
            :inclusion => { :in => Rolify.resource_types },
            :allow_nil => true

    scopify
  end
end