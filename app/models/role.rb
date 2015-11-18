class Role < ActiveRecord::Base
  rolify :role_cname => 'User'
  has_and_belongs_to_many :users, :join_table => :users_roles
  has_and_belongs_to_many :permissions, :join_table => :permissions_roles
  belongs_to :resource, :polymorphic => true

  validates :resource_type,
            :inclusion => { :in => Rolify.resource_types },
            :allow_nil => true

  scopify
end
